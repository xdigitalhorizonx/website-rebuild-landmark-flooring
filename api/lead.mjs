/**
 * POST /api/lead — free-estimate lead handler (Vercel serverless function).
 *
 * Emails the submission to Landmark via Resend. This is the ONLY backend the
 * site has; the rest is static HTML.
 *
 * Required environment variables (set in Vercel → Project → Settings → Environment Variables):
 *   RESEND_API_KEY   Resend API key (re_...). Never hard-code it.
 *   LEAD_TO          Destination inbox, e.g. "jeff@landmarkflooringusa.com".
 *                    Comma-separate for several recipients.
 *   LEAD_FROM        Verified Resend sender, e.g. "Landmark Flooring <leads@landmarkflooringusa.com>".
 *                    The domain must be verified in Resend or the send is rejected.
 *                    Falls back to Resend's shared testing sender so a misconfigured
 *                    deploy still delivers to the account owner rather than silently failing.
 *
 * The destination is read from the environment, never from the request body, so
 * this cannot be used as an open relay.
 */

const MAX = { name: 120, phone: 40, email: 200, address: 200, project_type: 60, message: 4000 };

const PROJECT_TYPES = new Set([
  '', 'luxury-vinyl', 'carpet', 'hardwood', 'laminate',
  'hardwood-refinishing', 'custom-rugs', 'commercial', 'not-sure',
]);

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** A plain (JS-off) form POST asks for HTML; our fetch() asks for JSON. */
const wantsHtml = (req) => {
  const a = String(req.headers.accept || '');
  return a.includes('text/html') && !a.includes('application/json');
};

/** Minimal self-contained page for JS-off visitors when something goes wrong. */
const errorPage = (msg) => `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>We could not send that | Landmark Flooring</title>
<style>body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#FBF6EF;color:#1C2530;
display:grid;place-items:center;min-height:100vh;padding:24px}main{max-width:520px;background:#fff;border:1px solid #E3E9F0;
border-radius:16px;padding:32px;box-shadow:0 8px 30px rgba(16,32,56,.08)}h1{margin:0 0 10px;font-size:1.4rem}
p{color:#5B6675;line-height:1.6}a.btn{display:inline-block;margin-top:8px;background:#0074D4;color:#fff;text-decoration:none;
font-weight:700;padding:13px 22px;border-radius:10px}a.back{display:inline-block;margin-top:18px;color:#0062B4}</style></head>
<body><main><h1>We couldn&#39;t send that</h1><p>${esc(msg)}</p>
<a class="btn" href="tel:+17752973236">Call (775) 297-3236</a><br>
<a class="back" href="/free-estimate/">&larr; Back to the estimate form</a></main></body></html>`;

/** Strip CR/LF so a field can never inject extra headers, and clamp length. */
const clean = (v, max) => String(v ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);

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
  if (ct.includes('application/json')) return JSON.parse(raw);
  return Object.fromEntries(new URLSearchParams(raw));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  /** Respond as JSON for fetch, or as a page/redirect for a JS-off form POST. */
  const fail = (code, msg) => {
    if (wantsHtml(req)) {
      res.statusCode = code;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.end(errorPage(msg));
    }
    return res.status(code).json({ ok: false, error: msg });
  };
  const succeed = () => {
    if (wantsHtml(req)) {
      res.statusCode = 303;                 // POST -> GET, so refresh cannot resubmit
      res.setHeader('Location', '/thank-you/');
      return res.end();
    }
    return res.status(200).json({ ok: true });
  };

  let body;
  try {
    body = await readBody(req);
  } catch {
    return fail(400, 'Could not read submission.');
  }

  // Honeypot: a real person never fills this hidden field. Answer 200 so bots
  // cannot tell they were caught.
  if (clean(body.company, 100)) return succeed();

  const f = {
    name: clean(body.name, MAX.name),
    phone: clean(body.phone, MAX.phone),
    email: clean(body.email, MAX.email),
    address: clean(body.address, MAX.address),
    project_type: clean(body.project_type, MAX.project_type),
    message: String(body.message ?? '').trim().slice(0, MAX.message),
  };

  const missing = ['name', 'phone', 'email'].filter((k) => !f[k]);
  if (missing.length) {
    return fail(400, `Please fill in: ${missing.join(', ')}.`);
  }
  if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(f.email)) {
    return fail(400, 'That email address looks invalid.');
  }
  if (!PROJECT_TYPES.has(f.project_type)) f.project_type = '';

  const apiKey = process.env.RESEND_API_KEY;
  const to = (process.env.LEAD_TO || '').split(',').map((s) => s.trim()).filter(Boolean);
  const from = process.env.LEAD_FROM || 'Landmark Flooring <onboarding@resend.dev>';

  if (!apiKey || !to.length) {
    // Misconfiguration must be loud in the logs and honest to the visitor —
    // never a fake success that drops the lead.
    console.error('[lead] missing config:', { hasKey: !!apiKey, recipients: to.length });
    return fail(500, 'Our form is temporarily unavailable. Please call (775) 297-3236 and we will take your details.');
  }

  const label = f.project_type ? f.project_type.replace(/-/g, ' ') : 'not specified';
  const rows = [
    ['Name', f.name],
    ['Phone', f.phone],
    ['Email', f.email],
    ['Address / city', f.address || '—'],
    ['Project type', label],
  ];

  const html = `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.55;color:#1C2530">
  <h2 style="margin:0 0 4px;color:#0074D4">New free-estimate request</h2>
  <p style="margin:0 0 18px;color:#5B6675;font-size:14px">From the website form at /free-estimate/</p>
  <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:15px">
    ${rows.map(([k, v]) => `<tr>
      <td style="padding:6px 18px 6px 0;color:#5B6675;vertical-align:top;white-space:nowrap">${esc(k)}</td>
      <td style="padding:6px 0;font-weight:600">${esc(v)}</td></tr>`).join('')}
  </table>
  <h3 style="margin:22px 0 6px;font-size:15px">Project details</h3>
  <div style="white-space:pre-wrap;background:#F6F8FB;border:1px solid #E3E9F0;border-radius:8px;padding:14px;font-size:15px">${
    esc(f.message) || '<em style="color:#7A8595">(no message provided)</em>'
  }</div>
</div>`;

  const text = [
    'New free-estimate request',
    '',
    ...rows.map(([k, v]) => `${k}: ${v}`),
    '',
    'Project details:',
    f.message || '(no message provided)',
  ].join('\n');

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to,
        subject: `New estimate request — ${f.name} (${label})`,
        html,
        text,
        reply_to: f.email,
      }),
    });

    if (!r.ok) {
      // Log the provider's reason for debugging; never surface it to the visitor.
      console.error('[lead] resend error', r.status, await r.text().catch(() => ''));
      return fail(502, 'We could not send that just now. Please call (775) 297-3236 and we will take your details.');
    }

    const { id } = await r.json().catch(() => ({}));
    console.log('[lead] sent', id || '(no id)');
    return succeed();
  } catch (err) {
    console.error('[lead] exception', err);
    return fail(502, 'We could not send that just now. Please call (775) 297-3236 and we will take your details.');
  }
}
