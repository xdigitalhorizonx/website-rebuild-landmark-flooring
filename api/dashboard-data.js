/**
 * GET /api/dashboard-data — the numbers behind /dashboard, as JSON.
 *
 * 401 without a valid lf_dash session; 503 while sign-in isn't configured;
 * 400 { error: { code: 'bad-range', message } } for unusable custom dates.
 * Query: ?range=last7|last28|last90|thisMonth|lastMonth|thisYear|last12m|custom
 *        &from=YYYY-MM-DD&to=YYYY-MM-DD
 *        &compare=off|previous|yoy|custom&cfrom=YYYY-MM-DD&cto=YYYY-MM-DD
 * Presets resolve on the GA4 property's calendar. A Google failure doesn't fail
 * the request: that source's block says what went wrong (see _dashboard/report.js).
 */

const { authConfig } = require('./_dashboard/config');
const { verifySession, readCookie } = require('./_dashboard/session');
const { sendJson, methodNotAllowed, queryOf } = require('./_dashboard/http');
const { buildReport } = require('./_dashboard/report');
const { RangeInputError } = require('./_dashboard/dates');

module.exports = async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return methodNotAllowed(res, 'GET, HEAD');

  const auth = authConfig();
  if (!auth.ok) return sendJson(res, 503, { ok: false, error: { code: 'not-configured', message: 'The dashboard isn’t set up yet.' } });

  const session = verifySession(readCookie(req.headers.cookie), auth.users, auth.secret);
  if (!session) return sendJson(res, 401, { ok: false, error: { code: 'signed-out', message: 'Please sign in again.' } });

  try {
    return sendJson(res, 200, await buildReport(queryOf(req)));
  } catch (err) {
    if (err instanceof RangeInputError) {
      return sendJson(res, 400, { ok: false, error: { code: 'bad-range', field: err.field, message: err.message } });
    }
    console.error('[dashboard-data] failed:', err && err.stack ? err.stack : err);
    return sendJson(res, 500, { ok: false, error: { code: 'internal', message: 'The report couldn’t be built. Try again in a moment.' } });
  }
};
