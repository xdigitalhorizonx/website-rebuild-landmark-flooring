/**
 * POST /api/dashboard-login — email + password → the lf_dash session cookie.
 *
 * Accepts JSON ({ email, password, next }) from the sign-in page's script, or a
 * plain urlencoded form post when JavaScript is off.
 *   JSON: 200 { ok, redirect } | 401/429/503 { ok:false, error }
 *   form: 303 to /dashboard (signed in) or back to /dashboard?signin=failed|wait
 * One generic message for every credential failure (unknown email and wrong
 * password look identical, in wording and in timing). Throttled per IP address:
 * 5 failures per 10 minutes. Cross-site posts are refused. Fails closed when
 * DASHBOARD_USERS / DASHBOARD_SESSION_SECRET aren't set.
 */

const { authConfig } = require('./_dashboard/config');
const { signSession, sessionCookie } = require('./_dashboard/session');
const { attemptLogin } = require('./_dashboard/auth');
const { sendJson, redirect, methodNotAllowed, readBody, clientIp, isHttps, isCrossSite, wantsJson, sanitizeNext } = require('./_dashboard/http');
const { SIGNIN_FAILED, SIGNIN_WAIT } = require('./_dashboard/pages');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return methodNotAllowed(res, 'POST');
  const json = wantsJson(req);

  let body = {};
  let bodyError = null;
  try {
    body = await readBody(req);
  } catch (e) {
    bodyError = e;
  }
  const next = sanitizeNext(typeof body.next === 'string' ? body.next : '');
  const back = (flag) => `/dashboard${next ? `${next}&` : '?'}signin=${flag}`;
  const refuse = (status, code, message, flag, headers = {}) =>
    (json ? sendJson(res, status, { ok: false, code, error: message }, headers) : redirect(res, back(flag), headers));

  if (isCrossSite(req)) return refuse(403, 'cross-site', 'Sign in from the dashboard page itself.', 'failed');

  const auth = authConfig();
  if (!auth.ok) {
    return json
      ? sendJson(res, 503, { ok: false, code: 'not-configured', error: 'The dashboard isn’t set up yet.' })
      : redirect(res, '/dashboard');
  }
  if (bodyError) {
    const status = bodyError.code === 'TOO_LARGE' ? 413 : bodyError.code === 'UNSUPPORTED' ? 415 : 400;
    return refuse(status, 'bad-request', SIGNIN_FAILED, 'failed');
  }

  const result = await attemptLogin(auth, { email: body.email, password: body.password, ip: clientIp(req) });
  if (result.limited) {
    return refuse(429, 'rate-limited', SIGNIN_WAIT, 'wait', { 'Retry-After': String(result.retryAfterSeconds) });
  }
  if (!result.user) {
    console.warn('[dashboard-login] failed sign-in attempt');
    return refuse(401, 'invalid', SIGNIN_FAILED, 'failed');
  }

  const cookie = sessionCookie(signSession(result.user, auth.secret), { secure: isHttps(req) });
  const location = `/dashboard${next}`;
  console.log('[dashboard-login] signed in:', result.user.email);
  if (json) return sendJson(res, 200, { ok: true, redirect: location }, { 'Set-Cookie': cookie });
  return redirect(res, location, { 'Set-Cookie': cookie });
};
