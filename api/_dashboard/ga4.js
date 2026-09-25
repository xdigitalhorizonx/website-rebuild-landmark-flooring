'use strict';
/**
 * Google Analytics 4 reads for the dashboard (GA4 Data API v1beta).
 *
 * Property 546190207 ("Landmark Flooring", measurement id G-KPV3BK2621 — the tag has
 * been live since 2026-09-12). The service account in GSC_CLIENT_EMAIL needs Viewer
 * access on the property (GA4 → Admin → Property access management).
 *
 * Efficiency: every report asks for both periods at once (runReport's multiple
 * dateRanges, which adds a `dateRange` dimension to each row), and the reports go
 * out through batchRunReports, five per HTTP call — so a full dashboard is two
 * round trips. Identical queries are served from memory for 5 minutes.
 */

const { cached, googleJson, CACHE_TTL_MS, GoogleError } = require('./google');
const { isValidTimeZone } = require('./dates');

const DATA_API = 'https://analyticsdata.googleapis.com/v1beta';
const ADMIN_API = 'https://analyticsadmin.googleapis.com/v1beta';

/**
 * "Estimate requests" = generate_lead events, which assets/site.js fires when a
 * .lead-form submission succeeds. That script also runs the /text-updates/ SMS
 * opt-in form, which fires the same event — an SMS opt-in is not an estimate
 * request, so events fired on /text-updates… pages are left out.
 */
const LEAD_FILTER = {
  andGroup: {
    expressions: [
      { filter: { fieldName: 'eventName', stringFilter: { matchType: 'EXACT', value: 'generate_lead' } } },
      { notExpression: { filter: { fieldName: 'pagePath', stringFilter: { matchType: 'BEGINS_WITH', value: '/text-updates' } } } },
    ],
  },
};

const TABLE_LIMIT = 10;

// ---------------------------------------------------------------------------
// Property time zone. Presets ("last 7 days") are computed on the property's own
// calendar. The Admin API's properties.get is the direct source, but it needs the
// Analytics Admin API enabled on the service account's Cloud project (it is not
// on chamber-dashboard-506621, as of 2026-09-25). Every Data API response also
// carries metadata.timeZone, so the zone is learned from the first successful
// report too. Until either answers, America/Los_Angeles is used (dates.js).
const tzMemo = new Map(); // propertyId → { timeZone, source, at }
const TZ_TTL_MS = 6 * 60 * 60 * 1000;

function rememberTimeZone(propertyId, timeZone, source) {
  if (isValidTimeZone(timeZone)) tzMemo.set(propertyId, { timeZone, source, at: Date.now() });
}

/** { timeZone, source: 'ga4-admin' | 'ga4-report' } or null when neither is known yet. */
async function propertyTimeZone(cfg, getToken) {
  const memo = tzMemo.get(cfg.propertyId);
  if (memo && Date.now() - memo.at < TZ_TTL_MS) return { timeZone: memo.timeZone, source: memo.source };
  // A failure is remembered for 10 minutes (as a resolved null) so a disabled
  // Admin API doesn't cost a round trip on every load.
  const result = await cached(`ga4-tz:${cfg.propertyId}:${cfg.clientEmail}`, 10 * 60 * 1000, async () => {
    try {
      const p = await googleJson(`${ADMIN_API}/properties/${encodeURIComponent(cfg.propertyId)}`, { token: await getToken(), api: 'ga4-admin' });
      return isValidTimeZone(p.timeZone) ? p.timeZone : null;
    } catch (err) {
      console.warn('[dashboard] GA4 time zone unavailable from the Admin API:', err && err.message ? err.message.slice(0, 160) : err);
      return null;
    }
  });
  if (result) {
    rememberTimeZone(cfg.propertyId, result, 'ga4-admin');
    return { timeZone: result, source: 'ga4-admin' };
  }
  return memo ? { timeZone: memo.timeZone, source: memo.source } : null;
}

// ---------------------------------------------------------------------------

function batchRunReports(cfg, getToken, requests) {
  const body = { requests };
  const key = `ga4:${cfg.propertyId}:${cfg.clientEmail}:${JSON.stringify(body)}`;
  return cached(key, CACHE_TTL_MS, async () => {
    const json = await googleJson(`${DATA_API}/properties/${encodeURIComponent(cfg.propertyId)}:batchRunReports`, {
      method: 'POST', token: await getToken(), body, api: 'ga4',
    });
    const reports = json.reports || [];
    if (reports.length !== requests.length) {
      throw new GoogleError(`Google Analytics returned ${reports.length} of ${requests.length} reports.`, { api: 'ga4' });
    }
    for (const r of reports) {
      const tz = r && r.metadata && r.metadata.timeZone;
      if (tz) rememberTimeZone(cfg.propertyId, tz, 'ga4-report');
    }
    return reports;
  });
}

/** Runs named report requests, five to a batch, and returns the reports by name. */
async function runNamed(cfg, getToken, specs) {
  const names = Object.keys(specs);
  const chunks = [];
  for (let i = 0; i < names.length; i += 5) chunks.push(names.slice(i, i + 5));
  const results = await Promise.all(chunks.map((c) => batchRunReports(cfg, getToken, c.map((n) => specs[n]))));
  const out = {};
  chunks.forEach((c, ci) => c.forEach((n, i) => { out[n] = results[ci][i]; }));
  return out;
}

const dr = (r, name) => ({ startDate: r.start, endDate: r.end, name });
const metric = (name) => ({ name });
const dim = (name) => ({ name });
const byMetricDesc = (name) => [{ metric: { metricName: name }, desc: true }];

/**
 * The dashboard's reports for periods a and b (b may be null). `lookback` is one
 * continuous window, from a week before the earlier period to today: the daily
 * report over it feeds both the chart and the search for where recording began
 * (dates.trackingCoverage). Tables ask for generous limits so B's value can be
 * read for A's top rows without a second query; if a property ever outgrows that,
 * topRowsExact() takes over.
 */
function reportSpecs({ a, b }, lookback) {
  const ranges = b ? [dr(a, 'a'), dr(b, 'b')] : [dr(a, 'a')];
  const specs = {
    totals: {
      dateRanges: ranges,
      metrics: ['totalUsers', 'sessions', 'screenPageViews', 'userEngagementDuration'].map(metric),
    },
    leads: { dateRanges: ranges, metrics: [metric('eventCount')], dimensionFilter: LEAD_FILTER },
    channels: {
      dateRanges: ranges, dimensions: [dim('sessionDefaultChannelGroup')], metrics: [metric('sessions')],
      orderBys: byMetricDesc('sessions'), limit: 250,
    },
    leadSources: {
      dateRanges: ranges, dimensions: [dim('sessionDefaultChannelGroup')], metrics: [metric('eventCount')],
      dimensionFilter: LEAD_FILTER, orderBys: byMetricDesc('eventCount'), limit: 250,
    },
    pages: {
      dateRanges: ranges, dimensions: [dim('pagePath')], metrics: [metric('screenPageViews')],
      orderBys: byMetricDesc('screenPageViews'), limit: 10000,
    },
    cities: {
      dateRanges: ranges, dimensions: [dim('city'), dim('region')], metrics: [metric('totalUsers')],
      orderBys: byMetricDesc('totalUsers'), limit: 10000,
    },
    devices: {
      dateRanges: ranges, dimensions: [dim('deviceCategory')], metrics: [metric('totalUsers')],
      orderBys: byMetricDesc('totalUsers'), limit: 50,
    },
  };
  if (lookback) {
    specs.daily = {
      dateRanges: [dr(lookback, 'window')],
      dimensions: [dim('date')],
      // eventCount: any activity at all marks a day as recorded.
      metrics: [metric('totalUsers'), metric('eventCount')],
      orderBys: [{ dimension: { dimensionName: 'date' } }],
      limit: 10000,
    };
  }
  return specs;
}

/**
 * A report's rows as { range: 'a'|'b', key: [dimension values…], m: { metric: number } }.
 * With several date ranges GA4 appends a `dateRange` dimension holding each
 * range's name; with one it doesn't, and every row belongs to 'a'.
 */
function parseRows(report, defaultRange = 'a') {
  const dims = ((report && report.dimensionHeaders) || []).map((h) => h.name);
  const mets = ((report && report.metricHeaders) || []).map((h) => h.name);
  const di = dims.indexOf('dateRange');
  return ((report && report.rows) || []).map((row) => {
    const dv = (row.dimensionValues || []).map((v) => (v && v.value != null ? String(v.value) : ''));
    const m = {};
    mets.forEach((name, i) => {
      const v = Number(row.metricValues && row.metricValues[i] && row.metricValues[i].value);
      m[name] = Number.isFinite(v) ? v : 0;
    });
    return { range: di >= 0 ? dv[di] : defaultRange, key: dv.filter((_, i) => i !== di), m };
  });
}

const isTruncated = (report) => Number((report && report.rowCount) || 0) > ((report && report.rows) || []).length;

/**
 * Exact fallback for a table whose combined report was cut off by its limit: A's
 * top rows on their own, then B's values for exactly those rows.
 */
async function topRowsExact(cfg, getToken, spec, { a, b }) {
  const [aRep] = await batchRunReports(cfg, getToken, [{ ...spec, dateRanges: [dr(a, 'a')], limit: TABLE_LIMIT }]);
  const aRows = parseRows(aRep, 'a');
  if (!b || !aRows.length) return aRows;
  const names = spec.dimensions.map((d) => d.name);
  const match = {
    orGroup: {
      expressions: aRows.map((r) => ({
        andGroup: {
          expressions: names.map((fieldName, i) => ({ filter: { fieldName, stringFilter: { matchType: 'EXACT', value: r.key[i] } } })),
        },
      })),
    },
  };
  const filter = spec.dimensionFilter ? { andGroup: { expressions: [spec.dimensionFilter, match] } } : match;
  const [bRep] = await batchRunReports(cfg, getToken, [{ ...spec, dateRanges: [dr(b, 'b')], dimensionFilter: filter, limit: TABLE_LIMIT * 4 }]);
  return aRows.concat(parseRows(bRep, 'b').map((r) => ({ ...r, range: 'b' })));
}

module.exports = {
  LEAD_FILTER,
  TABLE_LIMIT,
  propertyTimeZone,
  rememberTimeZone,
  batchRunReports,
  runNamed,
  reportSpecs,
  parseRows,
  isTruncated,
  topRowsExact,
};
