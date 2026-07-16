#!/usr/bin/env node
/**
 * Build-time content injection from Sanity.
 *
 * Fetches published content from the "Landmark Flooring" Sanity project and
 * rewrites the marked regions of index.html before deploy. SEO stays intact
 * because the content is baked into the static HTML — nothing is fetched in
 * the browser.
 *
 * Markers (HTML comments, pairs must stay in the file):
 *   <!-- sanity:heroEyebrow --> … <!-- /sanity:heroEyebrow -->
 *   <!-- sanity:heroSub -->     … <!-- /sanity:heroSub -->
 *   <!-- sanity:faq -->         … <!-- /sanity:faq -->
 *
 * Fail-safe: on any fetch error, timeout, or missing content the committed
 * HTML is left untouched and the build continues (exit 0), so a Sanity outage
 * can never break a deploy — the site just ships its last committed copy.
 */

import {readFileSync, writeFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {dirname, join} from 'node:path'

const PROJECT_ID = 'qjx96i9p'
const DATASET = 'production'
const API_VERSION = 'v2026-02-01'
const TIMEOUT_MS = 8000

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const indexPath = join(root, 'index.html')

async function groq(query) {
  const url = `https://${PROJECT_ID}.apicdn.sanity.io/${API_VERSION}/data/query/${DATASET}?query=${encodeURIComponent(query)}`
  const res = await fetch(url, {signal: AbortSignal.timeout(TIMEOUT_MS)})
  if (!res.ok) throw new Error(`Sanity query failed: HTTP ${res.status}`)
  return (await res.json()).result
}

const escapeHtml = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function replaceMarked(html, name, replacement) {
  const re = new RegExp(`(<!-- sanity:${name} -->)[\\s\\S]*?(<!-- /sanity:${name} -->)`)
  if (!re.test(html)) {
    console.warn(`[sanity-build] markers for "${name}" not found — skipped`)
    return html
  }
  return html.replace(re, `$1${replacement}$2`)
}

try {
  const [home, faqItems] = await Promise.all([
    groq('*[_id == "homePage"][0]{heroEyebrow, heroSub}'),
    groq('*[_type == "faqItem"] | order(orderRank asc){question, answer}'),
  ])

  let html = readFileSync(indexPath, 'utf8')
  const before = html

  if (home?.heroEyebrow) html = replaceMarked(html, 'heroEyebrow', escapeHtml(home.heroEyebrow))
  if (home?.heroSub) html = replaceMarked(html, 'heroSub', escapeHtml(home.heroSub))

  if (Array.isArray(faqItems) && faqItems.length > 0) {
    const faqHtml =
      '\n' +
      faqItems
        .map(
          (f) => `          <details>
            <summary>${escapeHtml(f.question)}</summary>
            <div class="ans">${escapeHtml(f.answer)}</div>
          </details>`,
        )
        .join('\n') +
      '\n          '
    html = replaceMarked(html, 'faq', faqHtml)
  } else {
    console.warn('[sanity-build] no published faqItem documents — FAQ left as committed')
  }

  if (html !== before) {
    writeFileSync(indexPath, html)
    console.log('[sanity-build] index.html updated from Sanity content')
  } else {
    console.log('[sanity-build] content identical to committed HTML — no changes')
  }
} catch (err) {
  console.warn(`[sanity-build] skipped (${err.message}) — deploying committed HTML as-is`)
}
