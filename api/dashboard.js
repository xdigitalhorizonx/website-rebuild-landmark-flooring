/**
 * GET /dashboard and /dashboard/ — vercel.json rewrites both to this function.
 *
 *   signed in          → the dashboard (it loads its numbers from /api/dashboard-data)
 *   not signed in      → the sign-in page (email + password)
 *   sign-in not set up → a "not set up yet" page, 503 — the dashboard fails closed
 *
 * Settings: see api/_dashboard/config.js (DASHBOARD_USERS, DASHBOARD_SESSION_SECRET,
 * GSC_CLIENT_EMAIL, GSC_PRIVATE_KEY, GA4_PROPERTY_ID, GSC_SITE_URL).
 * Every response is noindex (header + meta), private/no-store, and carries a
 * nonce-based Content-Security-Policy. /dashboard is not in sitemap.xml.
 */

const { authConfig } = require('./_dashboard/config');
const { verifySession, readCookie } = require('./_dashboard/session');
const { sendHtml, methodNotAllowed, queryOf, newNonce, pageCsp, sanitizeNext } = require('./_dashboard/http');
const pages = require('./_dashboard/pages');

module.exports = async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return methodNotAllowed(res, 'GET, HEAD');

  const nonce = newNonce();
  const headers = { 'Content-Security-Policy': pageCsp(nonce) };
  const auth = authConfig();
  if (!auth.ok) {
    console.error('[dashboard] not configured; missing:', auth.missing.join(', '), auth.invalidUsers ? `(${auth.invalidUsers} unreadable DASHBOARD_USERS entr${auth.invalidUsers === 1 ? 'y' : 'ies'})` : '');
    return sendHtml(res, 503, pages.notConfiguredPage({ nonce, missing: auth.missing }), headers);
  }

  const session = verifySession(readCookie(req.headers.cookie), auth.users, auth.secret);
  if (session) return sendHtml(res, 200, pages.appPage({ nonce, email: session.email }), headers);

  const q = queryOf(req);
  const error = q.signin === 'failed' ? pages.SIGNIN_FAILED : q.signin === 'wait' ? pages.SIGNIN_WAIT : '';
  const search = new URLSearchParams(q).toString();
  return sendHtml(res, 200, pages.loginPage({ nonce, next: sanitizeNext(search ? `?${search}` : ''), error }), headers);
};
