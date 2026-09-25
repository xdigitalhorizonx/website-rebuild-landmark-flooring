'use strict';
/**
 * The sign-in decision, separate from HTTP so it can be tested directly.
 *
 * Order matters: the throttle is checked before any password work; an unknown
 * email still runs a full scrypt check (against a decoy hash) so it costs the same
 * time as a wrong password; every failure counts toward the throttle; success
 * clears it. Callers show one generic message for every credential failure.
 */

const { normalizeEmail } = require('./config');
const { verifyPassword, DECOY_HASH } = require('./password');
const { findUser } = require('./session');
const { loginLimiter } = require('./ratelimit');

/**
 * → { user } on success, { user: null } on bad credentials,
 *   { limited: true, retryAfterSeconds } when this address is throttled.
 */
async function attemptLogin(auth, { email, password, ip }, { limiter = loginLimiter, now = Date.now() } = {}) {
  const gate = limiter.check(ip, now);
  if (gate.limited) return { user: null, limited: true, retryAfterSeconds: gate.retryAfterSeconds };
  const who = normalizeEmail(typeof email === 'string' ? email : '').slice(0, 254);
  const user = who ? findUser(auth.users, who) : null;
  const ok = await verifyPassword(typeof password === 'string' ? password : '', user ? user.hash : DECOY_HASH);
  if (!user || !ok) {
    limiter.fail(ip, now);
    return { user: null, limited: false };
  }
  limiter.reset(ip);
  return { user, limited: false };
}

module.exports = { attemptLogin };
