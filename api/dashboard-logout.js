/**
 * POST /api/dashboard-logout — clears the lf_dash cookie.
 * JSON callers get { ok: true }; the header's plain form gets a 303 back to
 * /dashboard (the sign-in page). Cross-site posts are refused.
 */

const { clearedSessionCookie } = require('./_dashboard/session');
const { sendJson, redirect, methodNotAllowed, isHttps, isCrossSite, wantsJson } = require('./_dashboard/http');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return methodNotAllowed(res, 'POST');
  if (isCrossSite(req)) return sendJson(res, 403, { ok: false, error: 'Cross-site request refused.' });
  const cookie = clearedSessionCookie({ secure: isHttps(req) });
  if (wantsJson(req)) return sendJson(res, 200, { ok: true }, { 'Set-Cookie': cookie });
  return redirect(res, '/dashboard', { 'Set-Cookie': cookie });
};
