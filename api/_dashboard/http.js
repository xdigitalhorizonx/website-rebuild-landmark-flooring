'use strict';
/**
 * Request/response plumbing shared by the dashboard endpoints.
 *
 * Written against plain Node (statusCode / setHeader / end) rather than Vercel's
 * res.status().json() helpers, so the same handlers run unchanged on Vercel and
 * in a bare local http server.
 */

const crypto = require('node:crypto');

/** Every dashboard response: never indexed, never cached by anyone but the browser tab. */
function commonHeaders(res) {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('Vary', 'Cookie');
}

function send(res, status, body, headers = {}) {
  commonHeaders(res);
  for (const [k, v] of Object.entries(headers)) if (v != null) res.setHeader(k, v);
  res.statusCode = status;
  res.end(body);
}

const sendJson = (res, status, obj, headers = {}) =>
  send(res, status, JSON.stringify(obj), { 'Content-Type': 'application/json; charset=utf-8', ...headers });

const sendHtml = (res, status, html, headers = {}) =>
  send(res, status, html, { 'Content-Type': 'text/html; charset=utf-8', ...headers });

/** 303 See Other — the right answer to a form POST. */
const redirect = (res, location, headers = {}) => send(res, 303, '', { Location: location, ...headers });

function methodNotAllowed(res, allow) {
  sendJson(res, 405, { ok: false, error: 'Method not allowed' }, { Allow: allow });
}

function bodyError(code, message) {
  const e = new Error(message);
  e.code = code;
  return e;
}

/**
 * The request body as an object, from JSON or a urlencoded form. Uses Vercel's
 * pre-parsed req.body when there is one (its getter throws on malformed JSON,
 * hence the try) and reads the stream otherwise.
 */
async function readBody(req, limit = 16 * 1024) {
  let pre;
  try {
    pre = req.body;
  } catch {
    throw bodyError('BAD_BODY', 'Malformed request body');
  }
  if (pre && typeof pre === 'object' && !Buffer.isBuffer(pre)) return pre;

  let raw;
  if (typeof pre === 'string') raw = pre;
  else if (Buffer.isBuffer(pre)) raw = pre.toString('utf8');
  else {
    raw = await new Promise((resolve, reject) => {
      const chunks = [];
      let size = 0;
      req.on('data', (c) => {
        size += c.length;
        if (size > limit) reject(bodyError('TOO_LARGE', 'Request body too large'));
        else chunks.push(c);
      });
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      req.on('error', reject);
    });
  }
  if (raw.length > limit) throw bodyError('TOO_LARGE', 'Request body too large');
  if (!raw) return {};
  const ct = String(req.headers['content-type'] || '').toLowerCase();
  if (ct.includes('application/json')) {
    try {
      const v = JSON.parse(raw);
      return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
    } catch {
      throw bodyError('BAD_BODY', 'Malformed JSON');
    }
  }
  if (!ct || ct.includes('application/x-www-form-urlencoded')) return Object.fromEntries(new URLSearchParams(raw));
  throw bodyError('UNSUPPORTED', 'Unsupported content type');
}

/** The query string as a flat object of strings (Vercel may hand repeated keys over as arrays). */
function queryOf(req) {
  let q = req.query;
  if (!q || typeof q !== 'object') {
    try {
      q = Object.fromEntries(new URL(req.url || '/', 'http://localhost').searchParams);
    } catch {
      q = {};
    }
  }
  const out = {};
  for (const [k, v] of Object.entries(q)) out[k] = Array.isArray(v) ? String(v[0] ?? '') : String(v ?? '');
  return out;
}

/** The client's address. On Vercel x-forwarded-for is set by the platform, not the client. */
function clientIp(req) {
  const xf = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const ip = xf || String(req.headers['x-real-ip'] || '').trim() || (req.socket && req.socket.remoteAddress) || 'unknown';
  return ip.replace(/^::ffff:/, '');
}

/** Whether the request reached the site over https — decides the cookie's Secure flag. */
function isHttps(req) {
  return String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim().toLowerCase() === 'https';
}

/**
 * True for a POST another site made the browser send. Browsers attach Origin (and
 * Sec-Fetch-Site) to every form POST and fetch; a request with neither — curl, a
 * script — has no victim browser to abuse and is let through to the normal checks.
 */
function isCrossSite(req) {
  const site = String(req.headers['sec-fetch-site'] || '').toLowerCase();
  if (site === 'cross-site') return true;
  const origin = req.headers.origin;
  if (!origin) return false;
  if (origin === 'null') return true;
  let host;
  try {
    host = new URL(origin).host.toLowerCase();
  } catch {
    return true;
  }
  const expected = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim().toLowerCase();
  return host !== expected;
}

const wantsJson = (req) => String(req.headers.accept || '').toLowerCase().includes('application/json');

const newNonce = () => crypto.randomBytes(18).toString('base64');

/**
 * Content-Security-Policy for the dashboard pages. Scripts and the stylesheet are
 * inline and carry a per-response nonce; everything else is same-origin only (the
 * self-hosted Outfit font and the logo). No third-party request is possible.
 */
function pageCsp(nonce) {
  return [
    "default-src 'none'",
    `script-src 'nonce-${nonce}'`,
    `style-src 'nonce-${nonce}'`,
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "form-action 'self'",
    "base-uri 'none'",
    "frame-ancestors 'none'",
  ].join('; ');
}

/**
 * A `?query` safe to append to /dashboard after sign-in, or ''. Only the query
 * string is ever carried (never a path or host), and only characters a
 * date-range query uses, so it can't become an open redirect.
 */
function sanitizeNext(raw) {
  const s = typeof raw === 'string' ? raw.trim() : '';
  if (!s || s === '?') return '';
  if (s.length > 400 || !/^\?[A-Za-z0-9_.=&%-]*$/.test(s)) return '';
  const params = new URLSearchParams(s.slice(1));
  params.delete('signin');
  const out = params.toString();
  return out ? `?${out}` : '';
}

module.exports = {
  commonHeaders,
  send,
  sendJson,
  sendHtml,
  redirect,
  methodNotAllowed,
  readBody,
  queryOf,
  clientIp,
  isHttps,
  isCrossSite,
  wantsJson,
  newNonce,
  pageCsp,
  sanitizeNext,
};
