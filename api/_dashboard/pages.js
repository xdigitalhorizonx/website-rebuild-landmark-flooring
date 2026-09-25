'use strict';
/**
 * HTML for the three dashboard pages: sign-in, "not set up yet", and the app
 * shell (the app fills itself in from /api/dashboard-data). Kept in JS modules,
 * not .html files, so Vercel bundles them with the function by plain require().
 * Every page: noindex meta (the endpoint also sends X-Robots-Tag), same-origin
 * assets only, and inline CSS/JS that run solely under the per-response nonce.
 */

const { STYLES } = require('./styles');
const { loginScript, appScript } = require('./client');
const { PRESETS, COMPARES, DEFAULT_PRESET, DEFAULT_COMPARE } = require('./dates');

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));

/** JSON safe inside a <script type="application/json"> block. */
const jsonForScript = (o) => JSON.stringify(o)
  .replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
  .replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

const SIGNIN_FAILED = 'That email and password don’t match. Please try again.';
const SIGNIN_WAIT = 'Too many sign-in attempts. Please wait a few minutes, then try again.';

const LOGO = '<img src="/assets/logo.png" alt="Landmark Flooring" width="700" height="120"';

function head(nonce, title) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="referrer" content="same-origin">
<meta name="theme-color" content="#0074D4">
<title>${esc(title)}</title>
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" as="font" type="font/woff2" crossorigin href="/assets/fonts/outfit-variable-latin.woff2">
<style nonce="${esc(nonce)}">${STYLES}</style>
</head>`;
}

function loginPage({ nonce, next = '', error = '' }) {
  return `${head(nonce, 'Sign in · Website dashboard · Landmark Flooring')}
<body class="auth">
<main class="auth-card" id="main">
  ${LOGO} class="auth-logo">
  <h1>Website dashboard</h1>
  <p class="auth-lede">Sign in to see how the website is doing.</p>
  <form id="login" method="post" action="/api/dashboard-login">
    <input type="hidden" name="next" value="${esc(next)}">
    <div class="field">
      <label for="email">Email</label>
      <input id="email" name="email" type="email" autocomplete="username" autocapitalize="none" spellcheck="false" inputmode="email" maxlength="254" required>
    </div>
    <div class="field">
      <label for="password">Password</label>
      <div class="pw">
        <input id="password" name="password" type="password" autocomplete="current-password" maxlength="1024" required>
        <button type="button" class="pw-toggle" id="pw-toggle" aria-controls="password" aria-pressed="false" aria-label="Show password" hidden>Show</button>
      </div>
    </div>
    <p class="auth-error" id="login-error" role="alert"${error ? '' : ' hidden'}>${esc(error)}</p>
    <button class="btn btn-primary auth-submit" type="submit">Sign in</button>
  </form>
  <p class="auth-foot">For Landmark Flooring staff only.</p>
</main>
<script nonce="${esc(nonce)}">${loginScript}</script>
</body>
</html>`;
}

function notConfiguredPage({ nonce, missing }) {
  return `${head(nonce, 'Website dashboard · Landmark Flooring')}
<body class="auth">
<main class="auth-card" id="main">
  ${LOGO} class="auth-logo">
  <h1>Dashboard not set up yet</h1>
  <p class="auth-lede">Sign-in stays switched off until ${missing.length === 1 ? 'this setting is' : 'these settings are'} added in Vercel (Project → Settings → Environment Variables) and the site is redeployed:</p>
  <ul class="missing">${missing.map((m) => `<li><code>${esc(m)}</code></li>`).join('')}</ul>
  <p class="auth-foot">Until then the dashboard shows nothing and accepts no sign-in.</p>
</main>
</body>
</html>`;
}

function options(map, selected) {
  return Object.entries(map)
    .map(([value, label]) => `<option value="${esc(value)}"${value === selected ? ' selected' : ''}>${esc(label)}</option>`)
    .join('');
}

function skeleton() {
  const kpi = '<div class="card kpi"><span class="sk sk-line short"></span><span class="sk sk-line"></span><span class="sk sk-val"></span></div>';
  const kpis = (n, cls = 'kpis') => `<div class="${cls}">${kpi.repeat(n)}</div>`;
  const table = `<div class="card tcard"><span class="sk sk-line short"></span><span class="sk sk-line"></span>${'<span class="sk sk-row"></span>'.repeat(5)}</div>`;
  return '<div class="overview"><section class="card summary"><p class="eyebrow">At a glance</p><span class="sk sk-line"></span><span class="sk sk-line"></span><span class="sk sk-line short"></span></section>' +
    kpis(2, 'kpis kpis-hero') + '</div>' +
    `<section class="section"><div class="section-head"><h2>Website visits</h2></div>${kpis(4)}` +
    '<div class="card chart-card"><span class="sk sk-line short"></span><span class="sk sk-chart"></span></div>' +
    `<div class="grid2">${table}${table}</div></section>` +
    `<section class="section"><div class="section-head"><h2>Google search</h2></div>${kpis(3)}</section>`;
}

function appPage({ nonce, email }) {
  const config = { presets: PRESETS, compares: COMPARES, defaults: { range: DEFAULT_PRESET, compare: DEFAULT_COMPARE } };
  return `${head(nonce, 'Website dashboard · Landmark Flooring')}
<body class="app">
<a class="skip" href="#main">Skip to the numbers</a>
<header class="topbar">
  <div class="wrap topbar-in">
    <a class="brand" href="/" title="Open landmarkflooringusa.com">${LOGO}></a>
    <span class="topbar-title">Website dashboard</span>
    <div class="topbar-user">
      <span class="who">Signed in as <strong>${esc(email)}</strong></span>
      <form method="post" action="/api/dashboard-logout"><button class="btn btn-quiet btn-sm" type="submit">Sign out</button></form>
    </div>
  </div>
</header>
<main id="main" class="wrap">
  <h1 class="sr-only">Landmark Flooring website dashboard</h1>
  <form class="controls" id="controls" aria-label="Choose the dates to show">
    <div class="ctl">
      <label for="range">Showing</label>
      <select id="range" name="range">${options(PRESETS, DEFAULT_PRESET)}</select>
    </div>
    <div class="ctl" id="range-dates" hidden>
      <span class="ctl-label">Dates</span>
      <div class="dates">
        <input type="date" name="from" aria-label="Start date">
        <span aria-hidden="true">–</span>
        <input type="date" name="to" aria-label="End date">
      </div>
    </div>
    <div class="ctl">
      <label for="compare">Compared with</label>
      <select id="compare" name="compare">${options(COMPARES, DEFAULT_COMPARE)}</select>
    </div>
    <div class="ctl" id="compare-dates" hidden>
      <span class="ctl-label">Compare dates</span>
      <div class="dates">
        <input type="date" name="cfrom" aria-label="Comparison start date">
        <span aria-hidden="true">–</span>
        <input type="date" name="cto" aria-label="Comparison end date">
      </div>
    </div>
    <button class="btn btn-primary btn-sm" id="apply" type="submit" hidden>Apply</button>
  </form>
  <p class="controls-msg" id="controls-msg" role="alert" hidden></p>
  <p class="range-line" id="range-line">Loading…</p>
  <div class="notes" id="notes"></div>
  <div id="content" aria-busy="true">${skeleton()}</div>
  <noscript><div class="card notice fatal"><h3>JavaScript is switched off</h3><p>The dashboard needs JavaScript to load its numbers.</p></div></noscript>
</main>
<footer class="wrap foot" id="foot"></footer>
<p class="sr-only" id="live" aria-live="polite"></p>
<script type="application/json" id="dash-config">${jsonForScript(config)}</script>
<script nonce="${esc(nonce)}">${appScript}</script>
</body>
</html>`;
}

module.exports = { SIGNIN_FAILED, SIGNIN_WAIT, loginPage, notConfiguredPage, appPage, esc, jsonForScript };
