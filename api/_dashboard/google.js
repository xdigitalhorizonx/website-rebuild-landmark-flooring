'use strict';
/**
 * Google access for the dashboard: a service-account token signed with
 * node:crypto (no googleapis dependency — tens of MB for a handful of calls), a
 * small in-memory cache, and plain-English error classification.
 *
 * One service account (GSC_CLIENT_EMAIL / GSC_PRIVATE_KEY) reads both Google
 * Analytics and Search Console. Nobody has to stay signed in to Google and there's
 * no refresh token to expire: the account's read access on each property is the
 * whole permission model. Both scopes are read-only.
 */

const crypto = require('node:crypto');

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPES = [
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/webmasters.readonly',
].join(' ');
/** Identical Google queries are answered from memory for 5 minutes. */
const CACHE_TTL_MS = 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 9000;
const MAX_CACHE_ENTRIES = 300;

class GoogleError extends Error {
  constructor(message, { api = '', httpStatus = 0, status = '', reason = '', kind = 'http' } = {}) {
    super(message);
    this.name = 'GoogleError';
    this.api = api; // 'token' | 'ga4' | 'ga4-admin' | 'gsc'
    this.httpStatus = httpStatus;
    this.status = status; // Google's canonical status, e.g. PERMISSION_DENIED
    this.reason = reason; // e.g. SERVICE_DISABLED, forbidden, invalid_grant
    this.kind = kind; // 'http' | 'network' | 'key'
  }
}

// ---------------------------------------------------------------------------
// Cache: promise-valued, so concurrent identical requests share one call.
// Failures are dropped at once — only answers are kept.
const store = new Map();

function cached(key, ttlMs, fn) {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.expires > now) return hit.promise;
  const promise = Promise.resolve().then(fn);
  store.set(key, { expires: now + ttlMs, promise });
  promise.catch(() => {
    if (store.get(key) && store.get(key).promise === promise) store.delete(key);
  });
  while (store.size > MAX_CACHE_ENTRIES) store.delete(store.keys().next().value);
  return promise;
}

function clearCache() {
  store.clear();
}

// ---------------------------------------------------------------------------
// Service-account token (RFC 7523 JWT bearer grant).

function signedAssertion(clientEmail, privateKey, nowSec) {
  const enc = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const unsigned = `${enc({ alg: 'RS256', typ: 'JWT' })}.${enc({
    iss: clientEmail,
    scope: SCOPES,
    aud: TOKEN_URL,
    iat: nowSec,
    exp: nowSec + 3600,
  })}`;
  let signature;
  try {
    signature = crypto.createSign('RSA-SHA256').update(unsigned).sign(privateKey, 'base64url');
  } catch {
    // A truncated or mangled key fails here, before Google is asked anything.
    throw new GoogleError('GSC_PRIVATE_KEY is not a usable private key.', { api: 'token', kind: 'key' });
  }
  return `${unsigned}.${signature}`;
}

/** An access token for both read-only scopes; reused until ~10 minutes before it lapses. */
function accessToken(cfg) {
  const id = crypto.createHash('sha256').update(`${cfg.clientEmail}\n${cfg.privateKey}`).digest('base64url');
  return cached(`token:${id}`, 50 * 60 * 1000, async () => {
    const body = new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: signedAssertion(cfg.clientEmail, cfg.privateKey, Math.floor(Date.now() / 1000)),
    });
    const json = await googleJson(TOKEN_URL, { method: 'POST', form: body, api: 'token' });
    if (!json.access_token) throw new GoogleError('Google returned no access token.', { api: 'token' });
    return json.access_token;
  });
}

// ---------------------------------------------------------------------------

/** One Google API call; resolves to parsed JSON or throws a GoogleError. */
async function googleJson(url, { method = 'GET', token, body, form, api }) {
  const headers = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    payload = form.toString();
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  let res;
  try {
    res = await fetch(url, { method, headers, body: payload, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  } catch (err) {
    const timedOut = err && (err.name === 'TimeoutError' || err.name === 'AbortError');
    const cause = err && err.cause && err.cause.code ? ` (${err.cause.code})` : '';
    throw new GoogleError(timedOut ? 'Google did not answer in time.' : `Could not reach Google${cause}.`, { api, kind: 'network' });
  }
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = null;
  }
  if (!res.ok) {
    const e = json && json.error;
    if (typeof e === 'string') {
      // OAuth token endpoint shape: { error: "invalid_grant", error_description: "..." }
      throw new GoogleError(json.error_description || e, { api, httpStatus: res.status, reason: e });
    }
    const details = (e && Array.isArray(e.details)) ? e.details : [];
    const info = details.find((x) => x && String(x['@type'] || '').endsWith('google.rpc.ErrorInfo'));
    const legacy = e && Array.isArray(e.errors) && e.errors[0] ? e.errors[0].reason : '';
    throw new GoogleError((e && e.message) || `Google answered HTTP ${res.status}.`, {
      api,
      httpStatus: res.status,
      status: (e && e.status) || '',
      reason: (info && info.reason) || legacy || '',
    });
  }
  if (json === null) throw new GoogleError('Google sent a response that was not JSON.', { api, httpStatus: res.status });
  return json;
}

/**
 * What went wrong, as one of a few codes the UI can explain:
 *   no-access     the service account hasn't been added to the property yet
 *   api-disabled  the API is switched off in the account's Cloud project
 *   credentials   the key is wrong, deleted or mangled
 *   quota         Google is rate-limiting
 *   network       Google couldn't be reached / timed out
 *   google-down   Google had a server error
 *   bad-request   Google refused the query itself
 *   unknown
 */
function classifyGoogleError(err) {
  if (!(err instanceof GoogleError)) return 'unknown';
  if (err.kind === 'network') return 'network';
  if (err.kind === 'key' || err.api === 'token') {
    return err.httpStatus >= 500 ? 'google-down' : err.httpStatus === 429 ? 'quota' : 'credentials';
  }
  const msg = String(err.message || '').toLowerCase();
  if (err.reason === 'SERVICE_DISABLED' || err.reason === 'accessNotConfigured' ||
      /has not been used in project|it is disabled|api has not been used/.test(msg)) return 'api-disabled';
  if (err.httpStatus === 401 || err.status === 'UNAUTHENTICATED') return 'credentials';
  if (err.httpStatus === 403 || err.status === 'PERMISSION_DENIED') return 'no-access';
  if (err.httpStatus === 429 || err.status === 'RESOURCE_EXHAUSTED') return 'quota';
  if (err.httpStatus >= 500) return 'google-down';
  if (err.httpStatus === 400 || err.status === 'INVALID_ARGUMENT') return 'bad-request';
  if (err.httpStatus === 404) return 'no-access';
  return 'unknown';
}

module.exports = {
  CACHE_TTL_MS,
  GoogleError,
  cached,
  clearCache,
  accessToken,
  googleJson,
  classifyGoogleError,
};
