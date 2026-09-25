'use strict';
/**
 * Google Search Console reads for the dashboard (Search Analytics API).
 *
 * Property sc-domain:landmarkflooringusa.com (a Domain property: every protocol and
 * subdomain). The service account in GSC_CLIENT_EMAIL has to be added as a user
 * (Search Console → Settings → Users and permissions; "Restricted" is enough).
 *
 * Search Console answers one date range per query, reports in Pacific Time, and
 * its finished ("final") data runs 2–3 days behind — dates.gscWindows decides
 * which days each period can honestly cover.
 */

const { cached, googleJson, CACHE_TTL_MS } = require('./google');
const { addDays, isIsoDate } = require('./dates');

const GSC_API = 'https://searchconsole.googleapis.com/webmasters/v3/sites';
const TABLE_LIMIT = 10;

function gscQuery(cfg, getToken, body) {
  const key = `gsc:${cfg.siteUrl}:${cfg.clientEmail}:${JSON.stringify(body)}`;
  return cached(key, CACHE_TTL_MS, async () => {
    const json = await googleJson(`${GSC_API}/${encodeURIComponent(cfg.siteUrl)}/searchAnalytics/query`, {
      method: 'POST', token: await getToken(), body, api: 'gsc',
    });
    return Array.isArray(json.rows) ? json.rows : [];
  });
}

/**
 * The newest day Search Console has finished data for, measured rather than
 * assumed: the latest date with any row in the last 10 days. Null when there are
 * no rows at all (the caller then assumes the usual 3-day lag).
 */
async function lastAvailableDate(cfg, getToken, todayPT) {
  const rows = await gscQuery(cfg, getToken, {
    startDate: addDays(todayPT, -10), endDate: todayPT, dimensions: ['date'], rowLimit: 25,
  });
  const dates = rows.map((r) => r.keys && r.keys[0]).filter(isIsoDate).sort();
  return dates.length ? dates[dates.length - 1] : null;
}

/** RE2-safe literal, for Search Console's includingRegex filter. */
const reEscape = (s) => String(s).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');

/** Top rows by clicks, then impressions — Search Console's own order is clicks only. */
function pickTop(rows, limit = TABLE_LIMIT) {
  return rows
    .filter((r) => r && Array.isArray(r.keys) && (r.impressions > 0 || r.clicks > 0))
    .sort((x, y) => (y.clicks - x.clicks) || (y.impressions - x.impressions) || (x.keys[0] < y.keys[0] ? -1 : 1))
    .slice(0, limit);
}

/**
 * One period's top rows for a dimension, and B's figures for exactly those rows
 * (an anchored regex of the keys), so B's value is never missing just because it
 * ranked lower in B.
 */
async function topWithCompare(cfg, getToken, dimension, wa, wb) {
  const aRows = pickTop(await gscQuery(cfg, getToken, {
    startDate: wa.start, endDate: wa.end, dimensions: [dimension], rowLimit: 1000,
  }));
  if (!wb || !aRows.length) return { aRows, bRows: wb ? [] : null };
  const expression = `^(?:${aRows.map((r) => reEscape(r.keys[0])).join('|')})$`;
  const bRows = await gscQuery(cfg, getToken, {
    startDate: wb.start, endDate: wb.end, dimensions: [dimension], rowLimit: 100,
    dimensionFilterGroups: [{ filters: [{ dimension, operator: 'includingRegex', expression }] }],
  });
  return { aRows, bRows };
}

async function totals(cfg, getToken, w) {
  const rows = await gscQuery(cfg, getToken, { startDate: w.start, endDate: w.end });
  return rows[0] || { clicks: 0, impressions: 0, ctr: 0, position: null };
}

module.exports = { TABLE_LIMIT, gscQuery, lastAvailableDate, reEscape, pickTop, topWithCompare, totals };
