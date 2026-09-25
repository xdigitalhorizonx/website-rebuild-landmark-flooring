'use strict';
/**
 * Dashboard sessions: one signed cookie, no session store.
 *
 *   lf_dash=<expiry>.<email>.<HMAC-SHA256, base64url>
 *
 * <expiry> is Unix seconds, 7 days after sign-in. The MAC is keyed by
 * DASHBOARD_SESSION_SECRET and covers the expiry, the email and a fingerprint of
 * that user's current password hash. So a session only holds while:
 *   - the signature checks out (rotate the secret → everyone is signed out),
 *   - it hasn't expired,
 *   - the email is still in DASHBOARD_USERS (remove it → out on the next request),
 *   - the user's hash is unchanged (new password → their old sessions end).
 * Every comparison is timing-safe, and an unknown email costs the same work as a
 * known one.
 *
 * Cookie flags: HttpOnly, SameSite=Lax, Path=/, and Secure whenever the request
 * came in over https (x-forwarded-proto), which is every deployed request.
 */

const crypto = require('node:crypto');

const COOKIE_NAME = 'lf_dash';
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
const CLOCK_SKEW_SECONDS = 5 * 60;

const sha256 = (s) => crypto.createHash('sha256').update(String(s)).digest();

function macFor(secret, expiry, email, userHash) {
  const fingerprint = sha256(userHash).toString('base64url');
  return crypto.createHmac('sha256', String(secret))
    .update(`lf_dash/v1\n${expiry}\n${email}\n${fingerprint}`)
    .digest();
}

/** The user entry for `email`, found without an early exit. */
function findUser(users, email) {
  const target = sha256(email);
  let found = null;
  for (const u of users || []) {
    const match = crypto.timingSafeEqual(sha256(u.email), target);
    if (match && !found) found = u;
  }
  return found;
}

/** A fresh cookie value for `user` ({ email, hash }). */
function signSession(user, secret, nowMs = Date.now()) {
  if (!user || !user.email || !user.hash) throw new Error('signSession needs a user entry.');
  if (!secret) throw new Error('signSession needs DASHBOARD_SESSION_SECRET.');
  const expiry = Math.floor(nowMs / 1000) + MAX_AGE_SECONDS;
  return `${expiry}.${user.email}.${macFor(secret, String(expiry), user.email, user.hash).toString('base64url')}`;
}

/**
 * { email, expiresAt } for a valid cookie value, otherwise null. `users` is the
 * parsed DASHBOARD_USERS list, read on every request.
 */
function verifySession(value, users, secret, nowMs = Date.now()) {
  if (typeof value !== 'string' || value.length > 600 || !secret) return null;
  const first = value.indexOf('.');
  const last = value.lastIndexOf('.');
  if (first < 1 || last <= first + 1) return null;
  const expiry = value.slice(0, first);
  const email = value.slice(first + 1, last); // an email has dots of its own: split on the first and last only
  const mac = value.slice(last + 1);
  if (!/^\d{1,12}$/.test(expiry) || !/^[A-Za-z0-9_-]{43}$/.test(mac)) return null;

  const user = findUser(users, email);
  const expected = macFor(secret, expiry, email, user ? user.hash : 'no such user');
  const given = Buffer.from(mac, 'base64url');
  const macOk = given.length === expected.length && crypto.timingSafeEqual(given, expected);
  if (!macOk || !user) return null;

  const now = Math.floor(nowMs / 1000);
  const exp = Number(expiry);
  if (exp <= now) return null; // expired
  if (exp > now + MAX_AGE_SECONDS + CLOCK_SKEW_SECONDS) return null; // longer than we ever issue
  return { email: user.email, expiresAt: exp };
}

function sessionCookie(value, { secure }) {
  return `${COOKIE_NAME}=${value}; Path=/; Max-Age=${MAX_AGE_SECONDS}; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`;
}

function clearedSessionCookie({ secure }) {
  return `${COOKIE_NAME}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`;
}

/** One cookie's value from a Cookie header (the first, if it appears twice). */
function readCookie(cookieHeader, name = COOKIE_NAME) {
  for (const part of String(cookieHeader || '').split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim();
  }
  return null;
}

module.exports = {
  COOKIE_NAME,
  MAX_AGE_SECONDS,
  signSession,
  verifySession,
  sessionCookie,
  clearedSessionCookie,
  readCookie,
  findUser,
};
