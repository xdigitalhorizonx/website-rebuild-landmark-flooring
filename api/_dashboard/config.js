'use strict';
/**
 * Dashboard configuration — everything /dashboard needs from the environment.
 *
 * Files under api/_dashboard/ are shared helpers, not endpoints: Vercel does not
 * turn anything in an underscore-prefixed folder into a function.
 *
 * Vercel → Project → Settings → Environment Variables:
 *
 *   DASHBOARD_USERS           REQUIRED. Who may sign in, as comma-separated
 *                             `email:hash` pairs (line breaks also separate):
 *                               jeff@landmarkflooringusa.com:scrypt$32768$8$1$<salt>$<hash>
 *                             Make a hash with `node scripts/hash-dashboard-password.mjs`
 *                             (it prompts; the password never goes on the command line).
 *                             Taking an entry out signs that person out on their next
 *                             request; giving them a new hash (new password) does too.
 *   DASHBOARD_SESSION_SECRET  REQUIRED. Signs the session cookie. A long random string,
 *                             at least 32 characters (e.g. `openssl rand -base64 48`).
 *                             Changing it signs everyone out.
 *   GSC_CLIENT_EMAIL          The Google service account the dashboard reads Google
 *                             Analytics AND Search Console with.
 *   GSC_PRIVATE_KEY           That account's private key, BEGIN/END lines included.
 *                             Vercel's editor may keep it on one line with literal \n
 *                             sequences; both forms work.
 *   GA4_PROPERTY_ID           Optional. Numeric GA4 property id; defaults to 546190207
 *                             (Landmark Flooring, measurement id G-KPV3BK2621).
 *   GSC_SITE_URL              Optional. The Search Console property exactly as Search
 *                             Console lists it; defaults to sc-domain:landmarkflooringusa.com.
 *
 * Without DASHBOARD_USERS and DASHBOARD_SESSION_SECRET the dashboard fails closed: it
 * shows a "not set up yet" page and refuses every sign-in. Without the Google settings
 * it still signs people in, and each report says which setting is missing.
 */

const { parseHash } = require('./password');

const DEFAULT_GA4_PROPERTY_ID = '546190207';
const DEFAULT_GSC_SITE_URL = 'sc-domain:landmarkflooringusa.com';
const MIN_SECRET_LENGTH = 32;

// Deliberately narrower than RFC 5321: the email travels inside the session cookie
// (<expiry>.<email>.<mac>), so it must only hold cookie-safe characters.
const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/;

const normalizeEmail = (email) => String(email == null ? '' : email).trim().toLowerCase();

/**
 * DASHBOARD_USERS → [{ email, hash }]. Entries that don't parse are skipped and
 * counted, never half-accepted: a typo locks that one person out rather than
 * letting anyone in. The first entry for an email wins; repeats count as invalid.
 */
function parseUsers(raw) {
  const users = [];
  const seen = new Set();
  let invalid = 0;
  for (const part of String(raw == null ? '' : raw).split(/[,\r\n]+/)) {
    const entry = part.trim();
    if (!entry) continue;
    const colon = entry.indexOf(':');
    if (colon < 1) { invalid++; continue; }
    const email = normalizeEmail(entry.slice(0, colon));
    const hash = entry.slice(colon + 1).trim();
    if (!EMAIL_RE.test(email) || email.length > 254 || !parseHash(hash) || seen.has(email)) { invalid++; continue; }
    seen.add(email);
    users.push({ email, hash });
  }
  return { users, invalid };
}

/** Sign-in settings. `ok` is false — and the dashboard closed — unless both are usable. */
function authConfig(env = process.env) {
  const { users, invalid } = parseUsers(env.DASHBOARD_USERS);
  const secret = String(env.DASHBOARD_SESSION_SECRET || '');
  const missing = [];
  if (!users.length) missing.push('DASHBOARD_USERS');
  if (secret.length < MIN_SECRET_LENGTH) missing.push('DASHBOARD_SESSION_SECRET');
  return { ok: missing.length === 0, missing, users, invalidUsers: invalid, secret };
}

/**
 * The service-account key, normalised. Vercel's editor keeps a pasted key on one
 * line with literal "\n" sequences, and a value pasted with its JSON quotes still
 * attached is easy to do; both still have to sign.
 */
function normalizePrivateKey(key) {
  if (!key) return '';
  let k = String(key).trim();
  if ((k.startsWith('"') && k.endsWith('"')) || (k.startsWith("'") && k.endsWith("'"))) k = k.slice(1, -1);
  return k.replace(/\\r/g, '').replace(/\\n/g, '\n').replace(/\r\n/g, '\n');
}

/** Google settings shared by the Analytics and Search Console reports. */
function googleConfig(env = process.env) {
  const clientEmail = String(env.GSC_CLIENT_EMAIL || '').trim();
  const privateKey = normalizePrivateKey(env.GSC_PRIVATE_KEY);
  const propertyId = String(env.GA4_PROPERTY_ID || '').trim() || DEFAULT_GA4_PROPERTY_ID;
  const siteUrl = String(env.GSC_SITE_URL || '').trim() || DEFAULT_GSC_SITE_URL;
  const missing = [];
  if (!clientEmail) missing.push('GSC_CLIENT_EMAIL');
  if (!privateKey) missing.push('GSC_PRIVATE_KEY');
  // The "G-" measurement id and the stream id are both easy to paste here by
  // mistake and neither works with the Data API; say which one it was.
  let propertyIdError = null;
  if (!/^\d+$/.test(propertyId)) {
    propertyIdError = propertyId.startsWith('G-')
      ? `GA4_PROPERTY_ID is the measurement id (${propertyId}); it needs the numeric property id from GA4 → Admin → Property details.`
      : 'GA4_PROPERTY_ID must be the numeric GA4 property id.';
  }
  return { ok: missing.length === 0, missing, clientEmail, privateKey, propertyId, propertyIdError, siteUrl };
}

module.exports = {
  DEFAULT_GA4_PROPERTY_ID,
  DEFAULT_GSC_SITE_URL,
  MIN_SECRET_LENGTH,
  EMAIL_RE,
  normalizeEmail,
  parseUsers,
  authConfig,
  normalizePrivateKey,
  googleConfig,
};
