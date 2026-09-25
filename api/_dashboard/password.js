'use strict';
/**
 * Dashboard passwords: scrypt (node:crypto), no dependencies.
 *
 * Stored form, one string per user inside DASHBOARD_USERS:
 *   scrypt$N$r$p$<salt base64url>$<hash base64url>
 * e.g. scrypt$32768$8$1$70F0S6PLl8t4zLLDSRz15g$KUT_v7rrXw5Wwt4lP4pTJBS_UXPZjpBxfUg8vfqLJdY
 *
 * N = 2^15, r = 8, p = 1 costs ~50 ms and 32 MiB per check — slow for a guesser, fine
 * for a sign-in. Node's default scrypt memory cap (32 MiB) is a hair too small for
 * those parameters (OpenSSL counts 128·r·(N+2) + 128·r·p bytes), so maxmem is sized
 * from the parameters every time.
 *
 * Only the hash is ever stored; the password itself never touches the repo, the
 * environment or a log. Make one with `node scripts/hash-dashboard-password.mjs`.
 */

const crypto = require('node:crypto');

const DEFAULTS = Object.freeze({ N: 1 << 15, r: 8, p: 1, keyLen: 32, saltLen: 16 });
const MAX_PASSWORD_LENGTH = 1024;
// Parameters read back from the environment are bounded, so a hand-edited hash
// can't make a sign-in allocate gigabytes.
const MAX_WORK = 1 << 20; // N * r  → 128 MiB at most

const B64URL_RE = /^[A-Za-z0-9_-]+$/;

function maxmemFor(N, r, p) {
  return 128 * r * (N + 2) + 128 * r * p + (1 << 20);
}

function scryptAsync(password, salt, keyLen, { N, r, p }) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, keyLen, { N, r, p, maxmem: maxmemFor(N, r, p) }, (err, key) =>
      err ? reject(err) : resolve(key));
  });
}

/** Unicode passwords compare the same however the keyboard composed them. */
const normalize = (password) => String(password).normalize('NFC');

/** Parses a stored hash; null for anything malformed or out of bounds. */
function parseHash(stored) {
  if (typeof stored !== 'string' || stored.length > 300) return null;
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return null;
  const [, n, r, p, saltB64, hashB64] = parts;
  if (![n, r, p].every((v) => /^[1-9]\d{0,7}$/.test(v))) return null;
  const N = Number(n);
  const R = Number(r);
  const P = Number(p);
  if (N < 1 << 14 || (N & (N - 1)) !== 0 || R < 1 || R > 32 || P < 1 || P > 16 || N * R > MAX_WORK) return null;
  if (!B64URL_RE.test(saltB64) || !B64URL_RE.test(hashB64)) return null;
  const salt = Buffer.from(saltB64, 'base64url');
  const hash = Buffer.from(hashB64, 'base64url');
  if (salt.length < 16 || salt.length > 64 || hash.length < 16 || hash.length > 64) return null;
  return { N, r: R, p: P, salt, hash };
}

/** Hashes a password into the stored form above. */
async function hashPassword(password, opts = {}) {
  const { N, r, p, keyLen, saltLen } = { ...DEFAULTS, ...opts };
  if (typeof password !== 'string' || !password.length) throw new Error('Password is empty.');
  if (password.length > MAX_PASSWORD_LENGTH) throw new Error(`Password is longer than ${MAX_PASSWORD_LENGTH} characters.`);
  const salt = crypto.randomBytes(saltLen);
  const key = await scryptAsync(normalize(password), salt, keyLen, { N, r, p });
  const out = `scrypt$${N}$${r}$${p}$${salt.toString('base64url')}$${key.toString('base64url')}`;
  if (!parseHash(out)) throw new Error('Refusing to produce a hash outside the accepted parameters.');
  return out;
}

/**
 * A hash of a random password nobody knows. Checked against when the email isn't
 * on the list, so an unknown email costs the same scrypt run as a wrong password
 * and response times don't reveal who has an account.
 */
const DECOY_HASH = 'scrypt$32768$8$1$70F0S6PLl8t4zLLDSRz15g$KUT_v7rrXw5Wwt4lP4pTJBS_UXPZjpBxfUg8vfqLJdY';

/** True only when `password` matches `stored`. Never throws for bad input. */
async function verifyPassword(password, stored) {
  const parsed = parseHash(stored) || parseHash(DECOY_HASH);
  const usable = typeof password === 'string' && password.length > 0 && password.length <= MAX_PASSWORD_LENGTH;
  let key;
  try {
    key = await scryptAsync(normalize(usable ? password : 'x'), parsed.salt, parsed.hash.length, parsed);
  } catch {
    return false;
  }
  return usable && parseHash(stored) !== null && crypto.timingSafeEqual(key, parsed.hash);
}

module.exports = { DEFAULTS, MAX_PASSWORD_LENGTH, DECOY_HASH, parseHash, hashPassword, verifyPassword, maxmemFor };
