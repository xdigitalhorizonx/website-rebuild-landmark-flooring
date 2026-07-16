#!/usr/bin/env node
/**
 * Build-time content injection from Sanity (SEO-safe, fail-safe).
 *
 * Every editable region of the committed HTML is wrapped in markers:
 *   body text:  <!-- sanity:KEY -->…<!-- /sanity:KEY -->
 *   attributes: <!--sanity-attr:KEY|ATTR--><tag …>   (rewrites ATTR on the next tag)
 * plus one special body key `faq`, rendered from the faqItem collection.
 *
 * At build time this script fetches published content from the "Landmark
 * Flooring" Sanity project and rewrites those regions across every .html file,
 * so content is baked into the static HTML — nothing is fetched client-side and
 * SEO is unaffected.
 *
 * Fail-safe: on ANY Sanity error/timeout, the committed HTML is left untouched
 * and the build still succeeds, so a CMS outage can never break a deploy.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { execSync } from 'node:child_process';

const PROJECT_ID = 'qjx96i9p';
const DATASET = 'production';
const API_VERSION = 'v2026-02-01';
const TIMEOUT_MS = 9000;

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

async function groq(query) {
  const url = `https://${PROJECT_ID}.apicdn.sanity.io/${API_VERSION}/data/query/${DATASET}?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`Sanity query failed: HTTP ${res.status}`);
  return (await res.json()).result;
}

const escHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function renderFaq(items) {
  return '\n' + items.map((f) =>
    `          <details>\n            <summary>${escHtml(f.question)}</summary>\n            <div class="ans">${escHtml(f.answer)}</div>\n          </details>`
  ).join('\n') + '\n          ';
}

try {
  const [home, faqItems, pages] = await Promise.all([
    groq('*[_id == "homePage"][0]{heroEyebrow, heroSub}'),
    groq('*[_type == "faqItem"] | order(orderRank asc){question, answer}'),
    groq('*[_type == "page"]{path, blocks[]{key, value}}'),
  ]);

  // key → value map. Page body blocks store source-faithful innerHTML (injected
  // raw); meta/alt blocks store decoded attribute text (escaped on injection);
  // hero fields store plain text (escaped).
  const map = new Map();
  for (const p of pages || []) for (const b of p.blocks || []) if (b && b.key) map.set(b.key, b.value ?? '');
  const HERO = new Set(['heroEyebrow', 'heroSub']);
  if (home?.heroEyebrow != null) map.set('heroEyebrow', home.heroEyebrow);
  if (home?.heroSub != null) map.set('heroSub', home.heroSub);
  const faqHtml = Array.isArray(faqItems) && faqItems.length ? renderFaq(faqItems) : null;

  const bodyRe = /(<!--\s*sanity:([\w.-]+)\s*-->)([\s\S]*?)(<!--\s*\/sanity:\2\s*-->)/g;
  const attrRe = /(<!--sanity-attr:([\w.-]+)\|([\w-]+)-->\s*)(<[^>]*?>)/g;

  const files = execSync(`find ${root} -name "*.html" -not -path "*/.git/*" -not -path "*/node_modules/*"`, { encoding: 'utf8' })
    .trim().split('\n').filter(Boolean);

  let changed = 0;
  for (const file of files) {
    const before = readFileSync(file, 'utf8');
    let html = before;

    html = html.replace(bodyRe, (m, open, key, _inner, close) => {
      if (key === 'faq') return faqHtml == null ? m : open + faqHtml + close;
      if (!map.has(key)) return m;                       // unknown key → leave committed
      const v = map.get(key);
      const injected = HERO.has(key) ? escHtml(v) : v;   // hero = plain text; page blocks = source innerHTML (raw)
      return open + injected + close;
    });

    html = html.replace(attrRe, (m, lead, key, attr, tag) => {
      if (!map.has(key)) return m;
      const re = new RegExp(`(\\s${attr}=")[^"]*(")`);
      if (!re.test(tag)) return m;
      return lead + tag.replace(re, `$1${escAttr(map.get(key))}$2`);
    });

    if (html !== before) { writeFileSync(file, html); changed++; }
  }
  console.log(`[sanity-build] injected content into ${changed} file(s) from Sanity (${map.size} keys, ${faqItems?.length || 0} FAQ)`);
} catch (err) {
  console.warn(`[sanity-build] skipped (${err.message}) — deploying committed HTML as-is`);
}
