'use strict';
/**
 * Builds the JSON behind /dashboard: resolves the requested periods, reads GA4 and
 * Search Console side by side, and shapes both into KPI cards, a daily series,
 * tables and plain-English notes.
 *
 * Honesty rules, applied here so the browser can't get them wrong:
 *  - A period Google Analytics wasn't recording shows no numbers (null), not zeros;
 *    days before recording began are null in the daily series, not 0.
 *  - A change is only claimed between two periods that were both recorded in full
 *    (GA4) or both covered by finished Search Console data (GSC).
 *  - Nothing is invented: a failed source reports why, and the other still shows.
 * The shaping functions are pure and exported for scripts/check-dashboard.mjs.
 */

const { googleConfig } = require('./config');
const { accessToken, classifyGoogleError } = require('./google');
const ga4 = require('./ga4');
const gsc = require('./gsc');
const D = require('./dates');

// ---------------------------------------------------------------------------
// Pure shaping

/**
 * One figure for both periods and the change between them.
 *   changeKind: 'pct'  → change is a fraction (0.12 = +12%)
 *               'new'  → B was 0 and A isn't: no percentage exists
 *               'none' → nothing to compare (no B, or not comparable)
 *   better: true / false when the change is good / bad news (≥ 0.5%), else null.
 * lowerIsBetter flips the reading, for average position.
 */
function kpi(a, b, { comparable = true, lowerIsBetter = false } = {}) {
  const out = { a: a == null ? null : a, b: b == null ? null : b, change: null, changeKind: 'none', better: null };
  if (out.a == null || out.b == null || !comparable) return out;
  if (out.b === 0) {
    if (out.a === 0) {
      out.change = 0;
      out.changeKind = 'pct';
    } else {
      out.changeKind = 'new';
      out.better = !lowerIsBetter;
    }
    return out;
  }
  out.change = (out.a - out.b) / out.b;
  out.changeKind = 'pct';
  if (Math.abs(out.change) >= 0.005) out.better = lowerIsBetter ? out.change < 0 : out.change > 0;
  return out;
}

/** 'YYYYMMDD' (GA4's date dimension) → 'YYYY-MM-DD'. */
const isoFromCompact = (s) => (/^\d{8}$/.test(s) ? `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}` : s);

/** Metric totals per range from a report without dimensions: { a: {…}, b: {…} }. */
function totalsByRange(rows) {
  const out = {};
  for (const r of rows) out[r.range] = r.m;
  return out;
}

/** Days with any recorded activity in the daily report. */
function recordedDates(dailyRows) {
  return dailyRows
    .filter((r) => (r.m.eventCount || 0) > 0 || (r.m.totalUsers || 0) > 0)
    .map((r) => isoFromCompact(r.key[0]));
}

/**
 * Visitors per day across `period`: 0 for a recorded day without visits (GA4
 * omits such days), null for a day GA4 wasn't recording.
 */
function dailySeries(period, coverage, dailyRows) {
  const byDate = new Map();
  for (const r of dailyRows) byDate.set(isoFromCompact(r.key[0]), r.m.totalUsers || 0);
  return D.eachDay(period).map((date) => {
    const recorded = coverage.status === 'full' || (coverage.status === 'partial' && date >= coverage.runStart);
    return { date, value: recorded ? byDate.get(date) || 0 : null };
  });
}

/**
 * Side-by-side table rows: the top `limit` keys by A's value, each with B's value
 * for the same key (0 if it had none, null if B wasn't recorded at all).
 * includeBOnly keeps keys that only B had — for short lists like channels, where
 * a source that dried up is worth seeing.
 */
function compareRows(rows, metricName, { limit = 10, bKnown = true, comparable = true, includeBOnly = false } = {}) {
  const A = new Map();
  const B = new Map();
  const keys = new Map();
  for (const r of rows) {
    const k = JSON.stringify(r.key);
    keys.set(k, r.key);
    const target = r.range === 'b' ? B : A;
    target.set(k, (target.get(k) || 0) + (r.m[metricName] || 0));
  }
  const va = (k) => A.get(k) || 0;
  const vb = (k) => B.get(k) || 0;
  return [...keys.keys()]
    .filter((k) => va(k) > 0 || (includeBOnly && bKnown && vb(k) > 0))
    .sort((x, y) => (va(y) - va(x)) || (vb(y) - vb(x)) || (x < y ? -1 : x > y ? 1 : 0))
    .slice(0, limit)
    .map((k) => ({ key: keys.get(k), ...kpi(va(k), bKnown ? vb(k) : null, { comparable }) }));
}

function shapeGa4({ periods, coverage, dailyRows, reports, tableRows }) {
  const { a, b } = periods;
  const aKnown = coverage.a.status !== 'none';
  const bKnown = Boolean(b) && coverage.b.status !== 'none';
  const comparable = Boolean(b) && coverage.a.status === 'full' && coverage.b.status === 'full';
  const tot = totalsByRange(ga4.parseRows(reports.totals));
  const leads = totalsByRange(ga4.parseRows(reports.leads));
  const pick = (known, bag, name) => (known ? (bag && bag[name]) || 0 : null);
  const side = (known, range) => ({
    users: pick(known, tot[range], 'totalUsers'),
    sessions: pick(known, tot[range], 'sessions'),
    views: pick(known, tot[range], 'screenPageViews'),
    engaged: pick(known, tot[range], 'userEngagementDuration'),
    leads: pick(known, leads[range], 'eventCount'),
  });
  const A = side(aKnown, 'a');
  const B = side(bKnown, 'b');
  const perVisit = (x, s) => (x == null || !s ? null : x / s);
  const opt = { comparable };
  const tableOpt = { bKnown, comparable };
  const thresholded = Object.values(reports).some((r) => r && r.metadata && r.metadata.subjectToThresholding);
  return {
    status: 'ok',
    coverage,
    comparable,
    thresholded: Boolean(thresholded),
    kpis: {
      visitors: kpi(A.users, B.users, opt),
      visits: kpi(A.sessions, B.sessions, opt),
      views: kpi(A.views, B.views, opt),
      engagedPerVisit: kpi(perVisit(A.engaged, A.sessions), perVisit(B.engaged, B.sessions), opt),
      leads: kpi(A.leads, B.leads, opt),
      leadRate: kpi(perVisit(A.leads, A.sessions), perVisit(B.leads, B.sessions), opt),
    },
    daily: {
      a: dailySeries(a, coverage.a, dailyRows),
      b: b ? dailySeries(b, coverage.b, dailyRows) : null,
    },
    tables: {
      channels: aKnown ? compareRows(tableRows.channels, 'sessions', { ...tableOpt, includeBOnly: true }) : [],
      leadSources: aKnown ? compareRows(tableRows.leadSources, 'eventCount', { ...tableOpt, includeBOnly: true }) : [],
      pages: aKnown ? compareRows(tableRows.pages, 'screenPageViews', tableOpt) : [],
      cities: aKnown ? compareRows(tableRows.cities, 'totalUsers', tableOpt) : [],
      devices: aKnown ? compareRows(tableRows.devices, 'totalUsers', { ...tableOpt, includeBOnly: true }) : [],
    },
  };
}

/** Search Console table rows: clicks side by side, plus A's impressions and position. */
function gscTable({ aRows, bRows }, bKnown, comparable) {
  const B = new Map((bRows || []).map((r) => [r.keys[0], r]));
  return aRows.map((r) => {
    const br = B.get(r.keys[0]);
    return {
      key: [r.keys[0]],
      ...kpi(r.clicks, bKnown ? (br ? br.clicks : 0) : null, { comparable }),
      impressions: r.impressions,
      position: r.impressions > 0 ? r.position : null,
    };
  });
}

function shapeGsc(w, tA, tB, queries, pages) {
  const bKnown = Boolean(w.b);
  const opt = { comparable: w.comparable };
  const pos = (t) => (t && t.impressions > 0 && t.position != null ? t.position : null);
  return {
    kpis: {
      clicks: kpi(tA.clicks || 0, bKnown ? (tB && tB.clicks) || 0 : null, opt),
      impressions: kpi(tA.impressions || 0, bKnown ? (tB && tB.impressions) || 0 : null, opt),
      position: kpi(pos(tA), bKnown ? pos(tB) : null, { ...opt, lowerIsBetter: true }),
    },
    tables: {
      queries: gscTable(queries, bKnown, w.comparable),
      pages: gscTable(pages, bKnown, w.comparable),
    },
  };
}

/** Plain-English notes shown above the numbers. */
function buildNotes(result) {
  const notes = [];
  const { periods, ga4: g, gsc: s } = result;
  const fr = D.formatRange;

  if (g && g.status === 'ok') {
    const { runStart, a: ca, b: cb } = g.coverage;
    const parts = [];
    const early = ca.status !== 'full' || (cb && cb.status !== 'full');
    if (!runStart) {
      parts.push('Google Analytics recorded nothing in or around these dates, so there are no website figures for them.');
    } else if (early) {
      parts.push(`Google Analytics began recording on ${D.formatDate(runStart)} — earlier days have no data.`);
      if (ca.status === 'partial') parts.push(`Website figures for ${fr(periods.a)} cover ${ca.recordedDays} of its ${ca.totalDays} days.`);
      if (ca.status === 'none') parts.push(`There are no website figures for ${fr(periods.a)}.`);
      if (cb && cb.status === 'none') parts.push(`The comparison period (${fr(periods.b)}) has no website figures, so no change is shown.`);
      if (cb && cb.status === 'partial') parts.push(`The comparison period (${fr(periods.b)}) has only ${cb.recordedDays} of its ${cb.totalDays} days, so no change is shown.`);
      if (ca.strayDays || (cb && cb.strayDays)) parts.push('A few stray hits from before then are left out.');
    }
    if (parts.length) notes.push({ kind: 'tracking', text: parts.join(' ') });
    if (g.thresholded) {
      notes.push({ kind: 'privacy', text: 'Google Analytics withholds some very small numbers to protect visitors’ privacy, so a few low counts may be missing.' });
    }
  }

  if (s && s.status === 'ok') {
    const w = s.windows;
    const behind = `Search Console runs about ${s.lagDays} day${s.lagDays === 1 ? '' : 's'} behind`;
    if (!w.a) {
      notes.push({ kind: 'search', text: `Google search figures for these dates aren’t in yet — ${behind} (latest finished day: ${D.formatDate(w.lastAvailable)}).` });
    } else {
      const parts = [];
      if (w.trimmedDays > 0) {
        parts.push(periods.b && w.b && !w.bEndClipped
          ? `${behind}, so Google search figures cover ${fr(w.a)} vs ${fr(w.b)} — both periods drop the same number of days, so the comparison stays fair.`
          : `${behind}, so Google search figures cover ${fr(w.a)}.`);
      }
      if (w.aStartClipped || w.bStartClipped) {
        parts.push(`Google keeps about 16 months of search data, so older days are missing${periods.b ? ' and no change is shown for search' : ''}.`);
      }
      if (periods.b && !w.b && !w.bStartClipped) parts.push('There is no finished Search Console data for the comparison period yet.');
      if (periods.b && w.bEndClipped) parts.push('The comparison period is too recent for Search Console to have finished it, so no change is shown for search.');
      if (parts.length) notes.push({ kind: 'search', text: parts.join(' ') });
    }
  }

  if (periods.includesToday) notes.push({ kind: 'today', text: 'Today is included, so its numbers are still coming in.' });
  return notes;
}

// ---------------------------------------------------------------------------
// Errors, in words the owner can act on.

function describeError(err, source, cfg) {
  const code = classifyGoogleError(err);
  const sa = cfg.clientEmail;
  const ga = source === 'ga4';
  const name = ga ? 'Google Analytics' : 'Search Console';
  const text = {
    'no-access': ga
      ? ['Google Analytics access not granted yet',
        `Add ${sa} as a Viewer on the Landmark Flooring property (${cfg.propertyId}) in Google Analytics → Admin → Property access management. The numbers appear here as soon as it’s added.`]
      : ['Search Console access not granted yet',
        `Add ${sa} as a user on ${cfg.siteUrl} in Search Console → Settings → Users and permissions (“Restricted” is enough). The numbers appear here as soon as it’s added.`],
    'api-disabled': [`The ${ga ? 'Google Analytics Data' : 'Search Console'} API is switched off`,
      `It needs turning on in the Google Cloud project that owns ${sa} (APIs & Services → Library).`],
    credentials: ['Google rejected the dashboard’s key',
      'Check GSC_CLIENT_EMAIL and GSC_PRIVATE_KEY in Vercel — the key may have been deleted, or pasted incompletely.'],
    quota: [`${name} is limiting requests right now`, 'Try again in a few minutes.'],
    network: [`Couldn’t reach ${name}`, 'Google didn’t answer in time. Try again in a moment.'],
    'google-down': [`${name} had a problem answering`, 'That’s on Google’s side. Try again in a few minutes.'],
    'bad-request': [`${name} refused the request`, 'Google didn’t accept what the dashboard asked for; its reason is below.'],
    unknown: [`${name} couldn’t be read`, 'The reason Google gave is below.'],
  };
  const [title, detail] = text[code] || text.unknown;
  console.error(`[dashboard] ${source} failed (${code}):`, err && err.message ? String(err.message).slice(0, 300) : err);
  return { code, title, detail, google: err && err.message ? String(err.message).slice(0, 300) : null };
}

// ---------------------------------------------------------------------------
// Fetching

const TABLES = ['channels', 'leadSources', 'pages', 'cities', 'devices'];

async function ga4Section(cfg, getToken, periods) {
  if (!cfg.ok) return { status: 'unconfigured', missing: cfg.missing };
  if (cfg.propertyIdError) {
    return { status: 'error', error: { code: 'bad-config', title: 'The Google Analytics property id is wrong', detail: cfg.propertyIdError, google: null } };
  }
  const { a, b } = periods;
  // One continuous window, a week before the earlier period through today
  // (see dates.trackingCoverage for why it has to reach today).
  const earliest = b && b.start < a.start ? b.start : a.start;
  const lookback = { start: D.addDays(earliest, -D.TRACKING_MARGIN_DAYS), end: periods.today };
  try {
    const first = await ga4.runNamed(cfg, getToken, ga4.reportSpecs({ a, b }, lookback));
    const dailyRows = ga4.parseRows(first.daily);
    const coverage = D.trackingCoverage({ a, b }, recordedDates(dailyRows));
    // Stray hits inside a period, before recording properly began, would leak
    // into its totals; ask again for just the recorded part.
    let reports = first;
    let ranges = { a, b };
    if (coverage.a.strayDays > 0 || (coverage.b && coverage.b.strayDays > 0)) {
      ranges = { a: coverage.a.effective || a, b: b ? coverage.b.effective || b : null };
      reports = await ga4.runNamed(cfg, getToken, ga4.reportSpecs(ranges, null));
    }
    const specs = ga4.reportSpecs(ranges, null);
    const tableRows = {};
    await Promise.all(TABLES.map(async (name) => {
      tableRows[name] = ga4.isTruncated(reports[name])
        ? await ga4.topRowsExact(cfg, getToken, specs[name], ranges)
        : ga4.parseRows(reports[name]);
    }));
    return shapeGa4({ periods, coverage, dailyRows, reports, tableRows });
  } catch (err) {
    return { status: 'error', error: describeError(err, 'ga4', cfg) };
  }
}

async function gscSection(cfg, getToken, periods, lastAvailablePromise, todayPT) {
  if (!cfg.ok) return { status: 'unconfigured', missing: cfg.missing };
  try {
    const measured = await lastAvailablePromise;
    const lastAvailable = measured && measured < todayPT ? measured : D.addDays(todayPT, -D.GSC_DEFAULT_LAG_DAYS);
    const oldest = D.addMonths(todayPT, -D.GSC_RETENTION_MONTHS);
    const w = D.gscWindows(periods.a, periods.b, lastAvailable, oldest);
    const base = { status: 'ok', windows: w, lagDays: D.daysBetween(lastAvailable, todayPT), lagMeasured: Boolean(measured) };
    if (!w.a) return { ...base, kpis: null, tables: null };
    const [tA, tB, queries, pages] = await Promise.all([
      gsc.totals(cfg, getToken, w.a),
      w.b ? gsc.totals(cfg, getToken, w.b) : null,
      gsc.topWithCompare(cfg, getToken, 'query', w.a, w.b),
      gsc.topWithCompare(cfg, getToken, 'page', w.a, w.b),
    ]);
    return { ...base, ...shapeGsc(w, tA, tB, queries, pages) };
  } catch (err) {
    return { status: 'error', error: describeError(err, 'gsc', cfg) };
  }
}

/**
 * The whole dashboard payload for a query string. Throws dates.RangeInputError
 * for unusable custom dates (the endpoint answers 400 with its message).
 */
async function buildReport(query, { env = process.env, now = new Date() } = {}) {
  const cfg = googleConfig(env);
  const getToken = () => accessToken(cfg);
  const todayPT = D.todayIn(D.GSC_TIME_ZONE, now);

  // Neither of these depends on the chosen dates, so they start together. Each
  // gets a no-op catch at once: a rejection must never go unhandled while the
  // other is awaited (the real handling happens where they're awaited).
  const tzPromise = cfg.ok && !cfg.propertyIdError ? ga4.propertyTimeZone(cfg, getToken) : Promise.resolve(null);
  const lastPromise = cfg.ok ? gsc.lastAvailableDate(cfg, getToken, todayPT) : Promise.resolve(null);
  tzPromise.catch(() => {});
  lastPromise.catch(() => {});

  const tz = await tzPromise.catch(() => null);
  const timeZone = tz ? tz.timeZone : D.FALLBACK_TIME_ZONE;
  const today = D.todayIn(timeZone, now);
  const periods = D.resolvePeriods(query, today);

  const [ga4Part, gscPart] = await Promise.all([
    ga4Section(cfg, getToken, periods),
    gscSection(cfg, getToken, periods, lastPromise, todayPT),
  ]);

  const result = {
    ok: true,
    generatedAt: now.toISOString(),
    timeZone,
    timeZoneSource: tz ? tz.source : 'fallback',
    today,
    preset: periods.preset,
    compare: periods.compare,
    periods: { a: periods.a, b: periods.b },
    includesToday: periods.includesToday,
    sources: { ga4Property: cfg.propertyId, gscSite: cfg.siteUrl, serviceAccount: cfg.clientEmail || null },
    ga4: ga4Part,
    gsc: gscPart,
  };
  result.notes = buildNotes({ ...result, periods });
  return result;
}

module.exports = {
  kpi,
  isoFromCompact,
  totalsByRange,
  recordedDates,
  dailySeries,
  compareRows,
  shapeGa4,
  gscTable,
  shapeGsc,
  buildNotes,
  describeError,
  buildReport,
};
