/**
 * Lead capture for /free-estimate/ — Vercel serverless function.
 *
 * Sends the form submission to the shop via Resend. Works with JavaScript off
 * (normal form POST, redirects back with a status flag) and with JS on (fetch,
 * JSON response, inline status message).
 *
 * Environment variables (set in Vercel → Settings → Environment Variables):
 *   RESEND_API_KEY  (required)  — also accepts RESEND_TOKEN / RESEND_API_TOKEN
 *   LEAD_TO         (optional)  — defaults to brandon@ + jeff@landmarkflooringusa.com
 *   LEAD_FROM       (optional)  — defaults to website@landmarkflooringusa.com;
 *                                 the domain MUST be verified in Resend first.
 *
 * GET returns a config check (no secret values) so the wiring can be verified
 * without submitting a real lead.
 */

const KEY_NAMES = ['RESEND_API_KEY', 'RESEND_TOKEN', 'RESEND_API_TOKEN', 'RESEND'];

const DEFAULT_TO = 'brandon@landmarkflooringusa.com,jeff@landmarkflooringusa.com';
const DEFAULT_FROM = 'Landmark Flooring Website <website@landmarkflooringusa.com>';

function resolveKey() {
  for (const n of KEY_NAMES) {
    const v = process.env[n];
    if (v && v.trim()) return { name: n, value: v.trim() };
  }
  return null;
}

const esc = (s) =>
  String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/* Field caps and an allowlist for the one field with a fixed vocabulary. */
const MAX = { name: 120, phone: 40, email: 200, address: 200, project_type: 60, message: 4000 };
const PROJECT_TYPES = new Set([
  '', 'luxury-vinyl', 'carpet', 'hardwood', 'laminate',
  'hardwood-refinishing', 'custom-rugs', 'commercial', 'not-sure',
]);

/* Strip CR/LF and clamp. `name` is interpolated into the Subject header, so a
   raw newline there could inject additional headers. */
const clean = (v, max) => String(v == null ? '' : v).replace(/[\r\n]+/g, ' ').trim().slice(0, max);

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const raw = await new Promise((resolve, reject) => {
    let d = '';
    req.on('data', (c) => {
      d += c;
      if (d.length > 100_000) reject(new Error('payload too large'));
    });
    req.on('end', () => resolve(d));
    req.on('error', reject);
  });
  if (!raw) return {};
  const ct = String(req.headers['content-type'] || '');
  if (ct.includes('application/json')) {
    try { return JSON.parse(raw); } catch { return {}; }
  }
  if (ct.includes('multipart/form-data')) {
    // Not parsed here on purpose. The browser path sends URLSearchParams and the
    // no-JS path sends urlencoded, so multipart means a caller regressed — fail
    // loudly rather than silently reporting every field as missing.
    const e = new Error('multipart/form-data is not supported by this endpoint');
    e.code = 'UNSUPPORTED_MEDIA_TYPE';
    throw e;
  }
  return Object.fromEntries(new URLSearchParams(raw));
}

module.exports = async (req, res) => {
  const key = resolveKey();

  // --- config check -------------------------------------------------------
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: Boolean(key),
      keyEnvVar: key ? key.name : null,
      checkedNames: KEY_NAMES,
      to: process.env.LEAD_TO || DEFAULT_TO,
      from: process.env.LEAD_FROM || DEFAULT_FROM,
      note: key
        ? 'API key found. The Resend sending domain must also be verified for the From address above.'
        : 'No Resend API key found under any of the checked names.',
    });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  let body;
  try {
    body = await readBody(req);
  } catch (e) {
    if (e && e.code === 'UNSUPPORTED_MEDIA_TYPE') {
      console.error('[lead] unsupported content-type:', req.headers['content-type']);
      return res.status(415).json({ ok: false, error: 'Unsupported content type' });
    }
    return res.status(413).json({ ok: false, error: 'Request too large' });
  }

  const wantsJson = String(req.headers.accept || '').includes('application/json');
  const done = (status, payload, flag) => {
    if (wantsJson) return res.status(status).json(payload);
    // no-JS fallback. Success goes to a static page that renders the confirmation
    // without JS (the ?sent=ok message is painted by site.js, so a JS-off visitor
    // would otherwise see nothing). Failures return to the form.
    const location = flag === 'ok' ? '/thank-you/' : `/free-estimate/?sent=${flag}#estimate-form`;
    res.setHeader('Location', location);
    return res.status(303).end();
  };

  // Honeypot: real users never fill this; bots do. Accept and discard silently.
  if (String(body.company || '').trim()) return done(200, { ok: true }, 'ok');

  const name = clean(body.name, MAX.name);
  const phone = clean(body.phone, MAX.phone);
  const email = clean(body.email, MAX.email);
  const address = clean(body.address, MAX.address);
  let projectType = clean(body.project_type, MAX.project_type);
  if (!PROJECT_TYPES.has(projectType)) projectType = '';   // never echo an unexpected value
  const message = String(body.message || '').trim().slice(0, MAX.message);

  const missing = [];
  if (!name) missing.push('name');
  if (!phone) missing.push('phone');
  if (!email) missing.push('email');
  if (missing.length) {
    return done(400, { ok: false, error: `Missing required field(s): ${missing.join(', ')}` }, 'invalid');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return done(400, { ok: false, error: 'That email address does not look valid.' }, 'invalid');
  }

  if (!key) {
    console.error('[lead] no Resend API key in env; checked:', KEY_NAMES.join(', '));
    return done(500, { ok: false, error: 'The form is not configured to send yet.' }, 'error');
  }

  const to = process.env.LEAD_TO || DEFAULT_TO;
  const from = process.env.LEAD_FROM || DEFAULT_FROM;

  const rows = [
    ['Name', name], ['Phone', phone], ['Email', email],
    ['Address', address], ['Project type', projectType], ['Message', message],
  ].filter(([, v]) => v);

  const html =
    '<h2 style="font:600 18px/1.3 system-ui,sans-serif;color:#0F2742;margin:0 0 12px">' +
    'New free-estimate request</h2><table cellpadding="6" style="font:14px/1.5 system-ui,sans-serif;border-collapse:collapse">' +
    rows.map(([k, v]) =>
      `<tr><td style="color:#667085;vertical-align:top"><strong>${esc(k)}</strong></td>` +
      `<td style="white-space:pre-wrap">${esc(v)}</td></tr>`).join('') +
    '</table><p style="font:12px system-ui,sans-serif;color:#667085;margin-top:16px">' +
    'Sent from the free-estimate form on landmarkflooringusa.com. Reply directly to reach the customer.</p>';

  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n') +
    '\n\nSent from the free-estimate form on landmarkflooringusa.com.';

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: to.split(',').map((s) => s.trim()).filter(Boolean),
        reply_to: email,
        subject: `Free estimate request — ${name}${projectType ? ` (${projectType})` : ''}`,
        html,
        text,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      // Log the real reason (domain not verified, bad key, …) without echoing it
      // to the visitor.
      console.error('[lead] resend rejected:', r.status, JSON.stringify(data));
      return done(502, { ok: false, error: 'We could not send that just now. Please call (775) 297-3236.' }, 'error');
    }

    console.log('[lead] sent', data && data.id);
    return done(200, { ok: true, id: data && data.id }, 'ok');
  } catch (err) {
    console.error('[lead] send failed:', err && err.message);
    return done(502, { ok: false, error: 'We could not send that just now. Please call (775) 297-3236.' }, 'error');
  }
};
