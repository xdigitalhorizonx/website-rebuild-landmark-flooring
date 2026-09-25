'use strict';
/**
 * Browser code for /dashboard. Written as ordinary functions so `node --check`
 * and editors treat it as code; pages.js inlines their source text
 * (Function#toString) under the page's CSP nonce. Each function must stay
 * self-contained — no references to anything outside its own body.
 * Plain DOM + fetch + a hand-drawn SVG chart; no libraries, no CDNs.
 */

/* eslint-disable no-var */

function loginApp() {
  'use strict';
  var form = document.getElementById('login');
  if (!form) return;
  var err = document.getElementById('login-error');
  var btn = form.querySelector('button[type="submit"]');
  var next = form.querySelector('input[name="next"]');
  var pw = document.getElementById('password');
  var toggle = document.getElementById('pw-toggle');
  if (next && !next.value && location.search) next.value = location.search;

  if (toggle && pw) {
    toggle.hidden = false;
    toggle.addEventListener('click', function () {
      var show = pw.type === 'password';
      pw.type = show ? 'text' : 'password';
      toggle.textContent = show ? 'Hide' : 'Show';
      toggle.setAttribute('aria-pressed', show ? 'true' : 'false');
      toggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      pw.focus();
    });
  }

  function fail(message) {
    err.textContent = message;
    err.hidden = false;
    btn.disabled = false;
    btn.textContent = 'Sign in';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    err.hidden = true;
    btn.disabled = true;
    btn.textContent = 'Signing in…';
    fetch(form.action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ email: form.elements.email.value, password: pw.value, next: next ? next.value : '' }),
    })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (d) { return { r: r, d: d }; });
      })
      .then(function (x) {
        if (x.r.ok && x.d && x.d.ok) {
          location.replace(x.d.redirect || '/dashboard');
          return;
        }
        pw.value = '';
        pw.focus();
        fail((x.d && x.d.error) || 'Sign-in didn’t work. Please try again.');
      })
      .catch(function () {
        fail('Couldn’t reach the server. Check your connection and try again.');
      });
  });
}

function dashboardApp() {
  'use strict';
  var CFG = JSON.parse(document.getElementById('dash-config').textContent);
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var form = document.getElementById('controls');
  var sel = { range: form.elements.range, compare: form.elements.compare };
  var boxes = { range: document.getElementById('range-dates'), compare: document.getElementById('compare-dates') };
  var inp = { from: form.elements.from, to: form.elements.to, cfrom: form.elements.cfrom, cto: form.elements.cto };
  var applyBtn = document.getElementById('apply');
  var msg = document.getElementById('controls-msg');
  var rangeLine = document.getElementById('range-line');
  var notesEl = document.getElementById('notes');
  var content = document.getElementById('content');
  var foot = document.getElementById('foot');
  var live = document.getElementById('live');
  var inflight = null;
  var lastData = null;
  var chart = null;
  var state = readUrl();

  // ------------------------------------------------------------ formatting
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function num(n) { return n == null ? '—' : Math.round(n).toLocaleString('en-US'); }
  function dur(s) {
    if (s == null) return '—';
    s = Math.round(s);
    if (s < 60) return s + 's';
    if (s < 3600) return Math.floor(s / 60) + 'm ' + (s % 60) + 's';
    return Math.floor(s / 3600) + 'h ' + Math.floor((s % 3600) / 60) + 'm';
  }
  function rate(r) {
    if (r == null) return '—';
    var p = r * 100;
    return (p === 0 ? '0' : p < 10 ? p.toFixed(1) : Math.round(p).toString()) + '%';
  }
  function posn(v) { return v == null ? '—' : (Math.round(v * 10) / 10).toFixed(1); }
  function plural(n, one, many) { return Math.round(n) === 1 ? one : many; }
  function pctText(v) {
    var p = Math.abs(v) * 100;
    return (p >= 10 ? Math.round(p).toLocaleString('en-US') : p.toFixed(1).replace(/\.0$/, '')) + '%';
  }
  function ymd(iso) { return { y: +iso.slice(0, 4), m: +iso.slice(5, 7), d: +iso.slice(8, 10) }; }
  function fmtDate(iso, withYear) {
    var p = ymd(iso);
    return MONTHS[p.m - 1] + ' ' + p.d + (withYear === false ? '' : ', ' + p.y);
  }
  function fmtDay(iso, withYear) {
    var p = ymd(iso);
    return DOW[new Date(Date.UTC(p.y, p.m - 1, p.d)).getUTCDay()] + ', ' + fmtDate(iso, withYear);
  }
  function fmtRange(r) {
    if (!r) return '';
    var s = ymd(r.start);
    var e = ymd(r.end);
    if (r.start === r.end) return fmtDate(r.start);
    if (s.y !== e.y) return fmtDate(r.start) + ' – ' + fmtDate(r.end);
    if (s.m !== e.m) return MONTHS[s.m - 1] + ' ' + s.d + ' – ' + MONTHS[e.m - 1] + ' ' + e.d + ', ' + e.y;
    return MONTHS[s.m - 1] + ' ' + s.d + ' – ' + e.d + ', ' + e.y;
  }
  function daysIn(r) {
    var s = ymd(r.start);
    var e = ymd(r.end);
    return Math.round((Date.UTC(e.y, e.m - 1, e.d) - Date.UTC(s.y, s.m - 1, s.d)) / 864e5) + 1;
  }
  function has(obj, k) { return Object.prototype.hasOwnProperty.call(obj, k); }

  // ------------------------------------------------------------ URL state
  function readUrl() {
    var p = new URLSearchParams(location.search);
    var s = {
      range: p.get('range') || CFG.defaults.range, from: p.get('from') || '', to: p.get('to') || '',
      compare: p.get('compare') || CFG.defaults.compare, cfrom: p.get('cfrom') || '', cto: p.get('cto') || '',
    };
    if (!has(CFG.presets, s.range)) s.range = CFG.defaults.range;
    if (!has(CFG.compares, s.compare)) s.compare = CFG.defaults.compare;
    return s;
  }
  function toQuery(s) {
    var p = new URLSearchParams();
    if (s.range !== CFG.defaults.range) p.set('range', s.range);
    if (s.range === 'custom') { p.set('from', s.from); p.set('to', s.to); }
    if (s.compare !== CFG.defaults.compare) p.set('compare', s.compare);
    if (s.compare === 'custom') { p.set('cfrom', s.cfrom); p.set('cto', s.cto); }
    var q = p.toString();
    return q ? '?' + q : '';
  }
  function syncControls() {
    sel.range.value = state.range;
    sel.compare.value = state.compare;
    inp.from.value = state.from;
    inp.to.value = state.to;
    inp.cfrom.value = state.cfrom;
    inp.cto.value = state.cto;
    showDateBoxes();
  }
  function showDateBoxes() {
    var rc = sel.range.value === 'custom';
    var cc = sel.compare.value === 'custom';
    boxes.range.hidden = !rc;
    boxes.compare.hidden = !cc;
    applyBtn.hidden = !(rc || cc);
  }
  function prefill(which) {
    var p = lastData && lastData.periods;
    var r = p ? (which === 'range' ? p.a : (p.b || p.a)) : null;
    var f = which === 'range' ? inp.from : inp.cfrom;
    var t = which === 'range' ? inp.to : inp.cto;
    if (r && !f.value) f.value = r.start;
    if (r && !t.value) t.value = r.end;
  }
  function showMsg(text) {
    msg.textContent = text;
    msg.hidden = !text;
  }
  function onSelect() {
    showMsg('');
    if (sel.range.value === 'custom') prefill('range');
    if (sel.compare.value === 'custom') prefill('compare');
    showDateBoxes();
    // A custom choice waits for Apply; two presets take effect at once.
    if (sel.range.value === 'custom' || sel.compare.value === 'custom') return;
    state = { range: sel.range.value, from: '', to: '', compare: sel.compare.value, cfrom: '', cto: '' };
    navigate();
  }
  sel.range.addEventListener('change', onSelect);
  sel.compare.addEventListener('change', onSelect);
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var next = { range: sel.range.value, from: '', to: '', compare: sel.compare.value, cfrom: '', cto: '' };
    if (next.range === 'custom') {
      next.from = inp.from.value;
      next.to = inp.to.value;
      if (!next.from || !next.to || next.from > next.to) { showMsg('Pick a start and an end date for the range, start first.'); inp.from.focus(); return; }
    }
    if (next.compare === 'custom') {
      next.cfrom = inp.cfrom.value;
      next.cto = inp.cto.value;
      if (!next.cfrom || !next.cto || next.cfrom > next.cto) { showMsg('Pick a start and an end date to compare with, start first.'); inp.cfrom.focus(); return; }
    }
    showMsg('');
    state = next;
    navigate();
  });
  function navigate() {
    var q = toQuery(state);
    if (q !== location.search) history.pushState(null, '', location.pathname + q);
    load();
  }
  window.addEventListener('popstate', function () {
    state = readUrl();
    syncControls();
    load();
  });

  // ------------------------------------------------------------ loading
  function load() {
    if (inflight) inflight.abort();
    var ctrl = new AbortController();
    inflight = ctrl;
    renderLoading();
    fetch('/api/dashboard-data' + toQuery(state), {
      headers: { Accept: 'application/json' }, credentials: 'same-origin', cache: 'no-store', signal: ctrl.signal,
    })
      .then(function (r) {
        if (r.status === 401) { location.reload(); return null; }
        return r.json().catch(function () { return null; }).then(function (d) { return { status: r.status, d: d }; });
      })
      .then(function (x) {
        if (!x || inflight !== ctrl) return;
        inflight = null;
        if (x.status === 400 && x.d && x.d.error) {
          renderFatal('Those dates didn’t work', x.d.error.message || 'Pick different dates.', false);
          showMsg(x.d.error.message || '');
          return;
        }
        if (!x.d || !x.d.ok) {
          renderFatal('The dashboard couldn’t load', (x.d && x.d.error && x.d.error.message) || 'The server had a problem building the report. Try again in a moment.', true);
          return;
        }
        lastData = x.d;
        render(x.d);
      })
      .catch(function (e) {
        if (e && e.name === 'AbortError') return;
        if (inflight === ctrl) inflight = null;
        renderFatal('Couldn’t reach the dashboard', 'The connection dropped or the server didn’t answer. Check your connection and try again.', true);
      });
  }

  // ------------------------------------------------------------ copy
  var KPI = {
    visitors: { label: 'Visitors', help: 'Different people who visited the website.', fmt: num },
    visits: { label: 'Visits', help: 'Separate visits — one person can come back several times.', fmt: num },
    views: { label: 'Pages viewed', help: 'Pages opened across all visits.', fmt: num },
    engagedPerVisit: { label: 'Avg. engaged time per visit', help: 'How long the site was actually on screen, per visit.', fmt: dur },
    leads: { label: 'Estimate requests', help: 'Free-estimate forms sent from the website.', fmt: num },
    leadRate: { label: 'Estimate rate', help: 'Share of visits that sent an estimate request.', fmt: rate },
    clicks: { label: 'Google search clicks', help: 'Times someone clicked through to the site from Google search.', fmt: num },
    impressions: { label: 'Google search impressions', help: 'Times the site showed up in Google search results.', fmt: num },
    position: { label: 'Average position', help: 'Where the site usually ranks in Google — lower is better (1 is the top).', fmt: posn },
  };
  var CHANNEL_HELP = {
    'Organic Search': 'Found the site in Google or Bing results',
    Direct: 'Typed the address, used a bookmark, or the source was hidden',
    Referral: 'Clicked a link on another website',
    'Organic Social': 'Came from Facebook, Instagram or other social posts',
    'Paid Search': 'Clicked a search ad',
    'Paid Social': 'Clicked a social media ad',
    'Cross-network': 'Came from a Google Ads campaign that runs across networks',
    Display: 'Clicked a banner or display ad',
    Email: 'Clicked a link in an email',
    SMS: 'Clicked a link in a text message',
    'Organic Video': 'Came from YouTube or another video site',
    'Organic Shopping': 'Came from free shopping listings',
    Unassigned: 'Google couldn’t tell where they came from',
  };
  var DEVICES = { desktop: 'Computer', mobile: 'Phone', tablet: 'Tablet', 'smart tv': 'Smart TV' };
  // Landmark's service area (CLAUDE.md): the named towns plus the Nevada side of Lake Tahoe.
  var SERVICE_AREA = ['Carson City', 'Reno', 'Sparks', 'Minden', 'Gardnerville', 'Dayton', 'Virginia City', 'Fallon',
    'Stateline', 'Incline Village', 'Zephyr Cove', 'Crystal Bay', 'Glenbrook'];
  var PERIOD_PHRASE = {
    last7: 'In the last 7 days', last28: 'In the last 28 days', last90: 'In the last 90 days',
    thisMonth: 'So far this month', lastMonth: 'Last month', thisYear: 'So far this year', last12m: 'In the last 12 months',
  };
  var INFO_ICON = '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 7v4.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="8" cy="4.6" r="1" fill="currentColor"/></svg>';

  function labelsFor(d) {
    var aLabel = d.preset === 'custom' ? 'Selected dates' : CFG.presets[d.preset];
    var bLabel = d.compare === 'yoy' ? 'Last year' : d.compare === 'custom' ? 'Compared dates' : 'Previous period';
    var bShort = d.compare === 'yoy' ? 'same dates last year' : d.compare === 'custom' ? 'compared dates' : 'previous period';
    return { a: aLabel, b: bLabel, bShort: bShort, hasB: !!d.periods.b };
  }
  function periodPhrase(d) {
    if (has(PERIOD_PHRASE, d.preset)) return PERIOD_PHRASE[d.preset];
    var a = d.periods.a;
    if (a.start === a.end) return 'On ' + fmtDate(a.start);
    return 'From ' + fmtDate(a.start, a.start.slice(0, 4) !== a.end.slice(0, 4)) + ' to ' + fmtDate(a.end);
  }
  function comparePhrase(d) {
    if (d.compare === 'yoy') return 'the same dates last year';
    if (d.compare === 'custom') return fmtRange(d.periods.b);
    var n = daysIn(d.periods.a);
    return n === 1 ? 'the day before' : 'the ' + n + ' days before';
  }

  // ------------------------------------------------------------ pieces
  function chg(k) {
    if (!k || k.changeKind === 'none') {
      return '<span class="none" title="No fair comparison for these dates">—<span class="sr-only"> no comparison</span></span>';
    }
    if (k.changeKind === 'new') return '<span class="chg good">New</span>';
    if (Math.abs(k.change) < 0.005) return '<span class="chg neutral">No change</span>';
    var up = k.change > 0;
    var cls = k.better === true ? 'good' : k.better === false ? 'bad' : 'neutral';
    return '<span class="chg ' + cls + '"><span class="ar" aria-hidden="true">' + (up ? '▲' : '▼') + '</span>' +
      '<span class="sr-only">' + (up ? 'up ' : 'down ') + '</span>' + pctText(k.change) + '</span>';
  }

  function kpiCard(id, k, ctx) {
    var def = KPI[id];
    var vs = '';
    if (ctx.hasB) {
      vs = k.b == null
        ? '<p class="kpi-vs">' + esc(ctx.bShort.charAt(0).toUpperCase() + ctx.bShort.slice(1)) + ': <span class="kpi-note">' + esc(ctx.bNote || 'no data') + '</span></p>'
        : '<p class="kpi-vs">vs ' + esc(def.fmt(k.b)) + ' · ' + esc(ctx.bShort) +
          (ctx.bNote ? ' <span class="kpi-note">(' + esc(ctx.bNote) + ')</span>' : '') + '</p>';
    }
    return '<article class="card kpi"><h3 class="kpi-label">' + esc(def.label) + '</h3>' +
      '<p class="kpi-help">' + esc(def.help) + '</p>' +
      // No pill when there's nothing fair to compare — the line below says why.
      '<div class="kpi-main"><span class="kpi-value">' + esc(def.fmt(k.a)) + '</span>' + (ctx.hasB && k.changeKind !== 'none' ? chg(k) : '') + '</div>' +
      vs + '</article>';
  }

  function section(title, sub, inner, id) {
    return '<section class="section"' + (id ? ' id="' + id + '"' : '') + '><div class="section-head"><h2>' + esc(title) + '</h2>' +
      (sub ? '<p>' + esc(sub) + '</p>' : '') + '</div>' + inner + '</section>';
  }

  function sourceNotice(part, which) {
    var name = which === 'ga4' ? 'Google Analytics' : 'Search Console';
    if (part.status === 'unconfigured') {
      return '<div class="card notice"><h3>' + esc(name) + ' isn’t connected yet</h3><p>Missing setting' +
        (part.missing.length === 1 ? '' : 's') + ' in Vercel: ' + esc(part.missing.join(', ')) + '.</p></div>';
    }
    var e = part.error || {};
    return '<div class="card notice' + (e.code === 'no-access' ? '' : ' fatal') + '"><h3>' + esc(e.title || (name + ' couldn’t be read')) + '</h3>' +
      '<p>' + esc(e.detail || '') + '</p>' +
      (e.google ? '<p class="google">Google said: “' + esc(e.google) + '”</p>' : '') + '</div>';
  }

  function tableCard(o) {
    var head = '<div class="card-head"><h3>' + esc(o.title) + '</h3><p class="help">' + esc(o.help) + '</p></div>';
    var cls = 'card tcard' + (o.wide ? ' wide' : '');
    if (!o.rows || !o.rows.length) return '<section class="' + cls + '">' + head + '<p class="empty">' + esc(o.empty) + '</p></section>';
    // A comparison period with no data at all gets no columns (the note above explains).
    var showB = o.L.hasB && o.rows.some(function (r) { return r.b != null; });
    var th = '<tr><th scope="col">' + esc(o.keyHead) + '</th><th scope="col" class="num">' + esc(o.L.a) + '</th>' +
      (showB ? '<th scope="col" class="num">' + esc(o.L.b) + '</th><th scope="col" class="num">Change</th>' : '') + '</tr>';
    var body = o.rows.map(function (r) {
      var sub = o.sub ? o.sub(r) : '';
      return '<tr><th scope="row">' + esc(o.label(r)) + (sub ? '<span class="sub">' + sub + '</span>' : '') + '</th>' +
        '<td class="num">' + esc(num(r.a)) + '</td>' +
        (showB ? '<td class="num">' + (r.b == null ? '<span class="none">—</span>' : esc(num(r.b))) + '</td><td class="num">' + chg(r) + '</td>' : '') + '</tr>';
    }).join('');
    return '<section class="' + cls + '">' + head + '<div class="tscroll"><table class="t"><thead>' + th + '</thead><tbody>' + body +
      '</tbody></table></div></section>';
  }

  function shortUrl(u) {
    var m = /^https?:\/\/(www\.)?landmarkflooringusa\.com(\/.*)?$/i.exec(u);
    if (m && !m[1] && /^https:/i.test(u)) return m[2] || '/';
    return u.replace(/^https?:\/\//i, '');
  }
  function pageLabel(path) { return path === '/' ? 'Home page' : path; }

  // ------------------------------------------------------------ render
  function summarySentence(d) {
    var g = d.ga4;
    var s = d.gsc;
    var bits = [];
    if (g.status === 'ok' && g.coverage.a.status !== 'none') {
      var k = g.kpis;
      var lead = periodPhrase(d);
      if (g.coverage.a.status === 'partial') lead += ' (recorded since ' + fmtDate(g.coverage.a.runStart, false) + ')';
      var t = esc(lead) + ', <strong>' + num(k.visitors.a) + ' ' + plural(k.visitors.a, 'person', 'people') + '</strong> visited the website';
      if (k.visits.a) t += ' <strong>' + num(k.visits.a) + ' ' + plural(k.visits.a, 'time', 'times') + '</strong>';
      t += k.leads.a ? ', and <strong>' + num(k.leads.a) + ' estimate ' + plural(k.leads.a, 'request', 'requests') + '</strong> came in.' : ', with no estimate requests.';
      bits.push(t);
      if (d.periods.b && k.visitors.changeKind === 'pct') {
        var c = k.visitors.change;
        bits.push(Math.abs(c) < 0.005
          ? 'That’s about the same number of visitors as ' + esc(comparePhrase(d)) + '.'
          : 'That’s <strong>' + pctText(c) + ' ' + (c > 0 ? 'more' : 'fewer') + ' visitors</strong> than ' + esc(comparePhrase(d)) + '.');
      }
    } else if (g.status === 'ok') {
      bits.push('Google Analytics recorded nothing for ' + esc(fmtRange(d.periods.a)) + '.');
    }
    if (s.status === 'ok' && s.kpis) {
      var sk = s.kpis;
      bits.push('Google search sent <strong>' + num(sk.clicks.a) + ' ' + plural(sk.clicks.a, 'click', 'clicks') + '</strong> from ' +
        num(sk.impressions.a) + ' ' + plural(sk.impressions.a, 'appearance', 'appearances') + ' in results' +
        (s.windows.trimmedDays ? ' (through ' + esc(fmtDate(s.windows.a.end, false)) + ')' : '') + '.');
    }
    return bits.join(' ');
  }

  function gaCtx(d, L) {
    var cb = d.ga4.coverage.b;
    return { hasB: L.hasB, bShort: L.bShort, bNote: cb ? (cb.status === 'none' ? 'not recorded' : cb.status === 'partial' ? 'partly recorded' : '') : '' };
  }
  function gscCtx(d, L) {
    var w = d.gsc.windows;
    var note = '';
    if (L.hasB && !w.b) note = 'not available';
    else if (L.hasB && (w.bStartClipped || w.bEndClipped)) note = 'partly available';
    return { hasB: L.hasB, bShort: L.bShort, bNote: note };
  }

  function render(d) {
    var L = labelsFor(d);
    var g = d.ga4;
    var s = d.gsc;
    var html = '';

    // At a glance + the two numbers that pay the bills.
    var hero;
    if (g.status === 'ok') {
      var ctx = gaCtx(d, L);
      hero = '<div class="kpis kpis-hero">' + kpiCard('leads', g.kpis.leads, ctx) + kpiCard('leadRate', g.kpis.leadRate, ctx) + '</div>';
    } else {
      hero = sourceNotice(g, 'ga4');
    }
    // No figures from either source → no summary card, just the reason, full width.
    var sum = summarySentence(d);
    html += '<div class="overview' + (sum ? '' : ' solo') + '">' +
      (sum ? '<section class="card summary" aria-labelledby="sum-h"><p class="eyebrow" id="sum-h">At a glance</p><p class="big">' + sum + '</p></section>' : '') +
      hero + '</div>';

    if (g.status === 'ok') {
      var gctx = gaCtx(d, L);
      html += section('Website visits', 'From Google Analytics — everyone who came to the site, however they found it.',
        '<div class="kpis">' + ['visitors', 'visits', 'views', 'engagedPerVisit'].map(function (id) { return kpiCard(id, g.kpis[id], gctx); }).join('') + '</div>' +
        '<section class="card chart-card" aria-labelledby="chart-h"><div class="chart-top"><div><h3 id="chart-h">Visitors per day</h3>' +
        '<p class="help">' + (L.hasB ? 'This period, with the compared period laid over it day by day.' : 'Each day in this period.') + ' Hover or tap for the numbers.</p></div>' +
        '<div class="legend"><span><span class="swatch"></span>' + esc(L.a) + '</span>' +
        (L.hasB ? '<span id="legend-b"><span class="swatch b"></span>' + esc(L.b) + '</span>' : '') +
        '<span id="legend-nr" hidden><span class="hatch"></span>Not recorded</span></div></div>' +
        '<div class="chart" id="chart" tabindex="0" role="group" aria-roledescription="chart" aria-label="Visitors per day. Use the left and right arrow keys to read each day." aria-describedby="chart-live"></div>' +
        '<p class="sr-only" id="chart-live" aria-live="polite"></p></section>' +
        '<div class="grid2">' +
        tableCard({ title: 'Where visitors came from', help: 'How people reached the site. Counted in visits.', keyHead: 'Source', L: L,
          rows: g.tables.channels, label: function (r) { return r.key[0]; },
          sub: function (r) { return esc(CHANNEL_HELP[r.key[0]] || ''); }, empty: 'No visits recorded for these dates.' }) +
        tableCard({ title: 'Estimate requests by source', help: 'Where the people who asked for an estimate came from.', keyHead: 'Source', L: L,
          rows: g.tables.leadSources, label: function (r) { return r.key[0]; },
          sub: function (r) { return esc(CHANNEL_HELP[r.key[0]] || ''); }, empty: 'No estimate requests in this period.' }) +
        tableCard({ title: 'Top cities', help: 'Where visitors were, judged from their internet connection, so approximate. Counted in visitors.', keyHead: 'City', L: L,
          rows: g.tables.cities,
          label: function (r) { return r.key[0] === '(not set)' ? 'Unknown' : r.key[0]; },
          sub: function (r) {
            var region = r.key[1] && r.key[1] !== '(not set)' ? esc(r.key[1]) : '';
            var local = r.key[1] === 'Nevada' && SERVICE_AREA.indexOf(r.key[0]) >= 0;
            return region + (local ? '<span class="pill">Service area</span>' : '');
          },
          empty: 'No visitors recorded for these dates.' }) +
        tableCard({ title: 'Devices', help: 'What people visited on. Counted in visitors.', keyHead: 'Device', L: L,
          rows: g.tables.devices, label: function (r) { return DEVICES[r.key[0]] || r.key[0]; }, empty: 'No visitors recorded for these dates.' }) +
        tableCard({ title: 'Top pages', help: 'The pages people looked at most. Counted in page views.', keyHead: 'Page', L: L, wide: true,
          rows: g.tables.pages, label: function (r) { return pageLabel(r.key[0]); },
          sub: function (r) { return r.key[0] === '/' ? '/' : ''; }, empty: 'No page views recorded for these dates.' }) +
        '</div>');
    }

    var searchSub = 'From Google Search Console — how the site shows up in Google’s results.';
    if (s.status !== 'ok') {
      html += section('Google search', searchSub, sourceNotice(s, 'gsc'));
    } else if (!s.kpis) {
      html += section('Google search', searchSub, '<div class="card notice"><h3>Not in yet</h3><p>Search Console hasn’t finished these days — it runs about ' +
        esc(String(s.lagDays)) + ' days behind. The latest finished day is ' + esc(fmtDate(s.windows.lastAvailable)) + '.</p></div>');
    } else {
      var sctx = gscCtx(d, L);
      var w = s.windows;
      var covers = w.trimmedDays || w.aStartClipped ? ' These figures cover ' + fmtRange(w.a) + (w.b ? ' vs ' + fmtRange(w.b) : '') + '.' : '';
      html += section('Google search', searchSub + covers,
        '<div class="kpis">' + ['clicks', 'impressions', 'position'].map(function (id) { return kpiCard(id, s.kpis[id], sctx); }).join('') + '</div>' +
        '<div class="grid2">' +
        tableCard({ title: 'Top Google searches', help: 'What people searched for before clicking through. Google hides rare searches for privacy. Counted in clicks.', keyHead: 'Search', L: L,
          rows: s.tables.queries, label: function (r) { return r.key[0]; },
          sub: function (r) { return esc(num(r.impressions) + ' ' + plural(r.impressions, 'impression', 'impressions') + ' · position ' + posn(r.position)); },
          empty: 'No Google searches recorded for these dates.' }) +
        tableCard({ title: 'Top pages in Google search', help: 'Which pages Google search sent people to. Counted in clicks.', keyHead: 'Page', L: L,
          rows: s.tables.pages, label: function (r) { return shortUrl(r.key[0]); },
          sub: function (r) { return esc(num(r.impressions) + ' ' + plural(r.impressions, 'impression', 'impressions') + ' · position ' + posn(r.position)); },
          empty: 'No pages recorded in Google search for these dates.' }) +
        '</div>');
    }

    renderRangeLine(d, L);
    notesEl.innerHTML = (d.notes || []).map(function (n) {
      return '<p class="note note-' + esc(n.kind) + '">' + INFO_ICON + '<span>' + esc(n.text) + '</span></p>';
    }).join('');
    content.innerHTML = html;
    content.setAttribute('aria-busy', 'false');
    mountChart(d, L);
    renderFoot(d);
    setDateLimits(d.today);
    live.textContent = 'Dashboard updated: ' + L.a + ', ' + fmtRange(d.periods.a) + '.';
  }

  function renderRangeLine(d, L) {
    var a = d.periods.a;
    var b = d.periods.b;
    rangeLine.innerHTML = '<span><span class="swatch"></span><b>' + esc(L.a) + '</b> ' + esc(fmtRange(a)) + '</span>' +
      (b ? '<span class="vs">vs</span><span><span class="swatch b"></span><b>' + esc(L.b) + '</b> ' + esc(fmtRange(b)) + '</span>' : '');
  }

  function renderFoot(d) {
    var updated = new Date(d.generatedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    var tz = d.timeZone === 'America/Los_Angeles' ? 'Pacific Time (' + d.timeZone + ')' : d.timeZone;
    foot.innerHTML = '<p>Sources: Google Analytics property ' + esc(d.sources.ga4Property) + ' and Google Search Console (' + esc(d.sources.gscSite) +
      '), read with a read-only Google service account.</p>' +
      '<p>Days follow ' + esc(tz) + (d.timeZoneSource === 'fallback' ? ', assumed — the property’s own time zone couldn’t be read yet' : ', the Google Analytics property’s time zone') +
      '. Google figures are re-used for up to 5 minutes. Updated ' + esc(updated) + '.</p>';
  }

  function setDateLimits(today) {
    ['from', 'to', 'cfrom', 'cto'].forEach(function (k) {
      inp[k].min = '2015-08-14';
      if (today) inp[k].max = today;
    });
  }

  function skeletonKpis(n) {
    var one = '<div class="card kpi"><span class="sk sk-line short"></span><span class="sk sk-line"></span><span class="sk sk-val"></span></div>';
    return '<div class="kpis">' + new Array(n + 1).join(one) + '</div>';
  }
  function skeletonTable() {
    return '<div class="card tcard"><span class="sk sk-line short"></span><span class="sk sk-line"></span>' + new Array(6).join('<span class="sk sk-row"></span>') + '</div>';
  }
  function renderLoading() {
    content.setAttribute('aria-busy', 'true');
    notesEl.innerHTML = '';
    rangeLine.textContent = 'Loading…';
    chart = null;
    content.innerHTML = '<div class="overview"><section class="card summary"><p class="eyebrow">At a glance</p><span class="sk sk-line"></span><span class="sk sk-line"></span><span class="sk sk-line short"></span></section>' +
      skeletonKpis(2).replace('class="kpis"', 'class="kpis kpis-hero"') + '</div>' +
      '<section class="section"><div class="section-head"><h2>Website visits</h2></div>' + skeletonKpis(4) +
      '<div class="card chart-card"><span class="sk sk-line short"></span><span class="sk sk-chart"></span></div>' +
      '<div class="grid2">' + skeletonTable() + skeletonTable() + '</div></section>' +
      '<section class="section"><div class="section-head"><h2>Google search</h2></div>' + skeletonKpis(3) + '</section>';
  }
  function renderFatal(title, detail, retry) {
    content.setAttribute('aria-busy', 'false');
    rangeLine.textContent = '';
    notesEl.innerHTML = '';
    chart = null;
    content.innerHTML = '<div class="card notice fatal"><h3>' + esc(title) + '</h3><p>' + esc(detail) + '</p>' +
      (retry ? '<button class="btn btn-quiet btn-sm" type="button" id="retry">Try again</button>' : '') + '</div>';
    var b = document.getElementById('retry');
    if (b) b.addEventListener('click', load);
    live.textContent = title;
  }

  // ------------------------------------------------------------ chart
  function niceScale(maxVal) {
    var target = Math.max(1, maxVal);
    var rough = target / 4;
    var pow = Math.pow(10, Math.floor(Math.log10(rough)));
    var mults = [1, 2, 2.5, 5, 10];
    var step = pow;
    for (var i = 0; i < mults.length; i++) { step = mults[i] * pow; if (step >= rough) break; }
    step = Math.max(1, Math.ceil(step));
    var top = Math.ceil(target / step) * step;
    var ticks = [];
    for (var t = 0; t <= top; t += step) ticks.push(t);
    return { max: top, ticks: ticks };
  }

  function mountChart(d, L) {
    var host = document.getElementById('chart');
    if (!host || d.ga4.status !== 'ok') { chart = null; return; }
    var a = d.ga4.daily.a;
    var b = d.ga4.daily.b;
    var years = {};
    a.concat(b || []).forEach(function (p) { years[p.date.slice(0, 4)] = 1; });
    chart = { host: host, a: a, b: b, idx: -1, L: L, showYear: Object.keys(years).length > 1, width: 0 };
    // The hatching marks this period's unrecorded days; the compared period's show in the tooltip.
    document.getElementById('legend-nr').hidden = !a.some(function (p) { return p.value == null; });
    var legendB = document.getElementById('legend-b');
    if (legendB) legendB.hidden = !(b && b.some(function (p) { return p.value != null; }));
    drawChart();
    function pick(e) {
      var c = chart;
      if (!c || !c.geom) return;
      var rect = host.getBoundingClientRect();
      var px = (e.clientX - rect.left) * (c.geom.W / rect.width);
      showPoint(Math.round((px - c.geom.P.l) / c.geom.step));
    }
    host.addEventListener('pointermove', pick);
    host.addEventListener('pointerdown', pick);
    host.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') hidePoint(); });
    host.addEventListener('focus', function () { if (chart && chart.geom && chart.idx < 0) showPoint(chart.geom.n - 1); });
    host.addEventListener('blur', hidePoint);
    host.addEventListener('keydown', function (e) {
      var c = chart;
      if (!c || !c.geom) return;
      var i = c.idx < 0 ? c.geom.n - 1 : c.idx;
      if (e.key === 'ArrowLeft') i -= 1;
      else if (e.key === 'ArrowRight') i += 1;
      else if (e.key === 'Home') i = 0;
      else if (e.key === 'End') i = c.geom.n - 1;
      else if (e.key === 'Escape') { hidePoint(); return; }
      else return;
      e.preventDefault();
      showPoint(i);
    });
  }

  function drawChart() {
    var c = chart;
    if (!c) return;
    var host = c.host;
    var W = Math.max(260, Math.floor(host.clientWidth));
    c.width = host.clientWidth;
    var H = W < 520 ? 220 : 280;
    var P = { l: 38, r: 12, t: 14, b: 28 };
    var n = Math.max(c.a.length, c.b ? c.b.length : 0);
    var vals = [];
    c.a.concat(c.b || []).forEach(function (p) { if (p.value != null) vals.push(p.value); });
    if (!vals.length) {
      host.innerHTML = '<p class="empty chart-empty">No visitor numbers were recorded for these dates.</p>';
      c.geom = null;
      return;
    }
    var scale = niceScale(Math.max.apply(null, vals));
    // Room for the widest y-axis label (≈6.6px per character at 11px).
    P.l = Math.max(30, Math.ceil(num(scale.max).length * 6.6) + 14);
    var iw = W - P.l - P.r;
    var ih = H - P.t - P.b;
    var step = n <= 1 ? iw : iw / (n - 1);
    function x(i) { return n <= 1 ? P.l + iw / 2 : P.l + i * step; }
    function y(v) { return P.t + ih - (v / scale.max) * ih; }
    function f(v) { return Math.round(v * 10) / 10; }

    var s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true" focusable="false">' +
      '<defs><pattern id="nr-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="2.2" height="6" fill="#DCE3EC"></rect></pattern>' +
      '<linearGradient id="a-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0074D4" stop-opacity=".16"></stop><stop offset="1" stop-color="#0074D4" stop-opacity="0"></stop></linearGradient></defs>';

    // Days Google Analytics wasn't recording: hatched, labelled — never drawn as zero.
    for (var i = 0; i < c.a.length; i++) {
      if (c.a[i].value != null) continue;
      var j = i;
      while (j + 1 < c.a.length && c.a[j + 1].value == null) j++;
      var x0 = Math.max(P.l, x(i) - step / 2);
      var x1 = Math.min(P.l + iw, x(j) + step / 2);
      if (n <= 1) { x0 = P.l; x1 = P.l + iw; }
      s += '<rect x="' + f(x0) + '" y="' + P.t + '" width="' + f(Math.max(1, x1 - x0)) + '" height="' + ih + '" fill="url(#nr-hatch)"></rect>';
      if (x1 - x0 > 96) s += '<text class="nr-label" x="' + f((x0 + x1) / 2) + '" y="' + (P.t + 18) + '" text-anchor="middle">Not recorded</text>';
      i = j;
    }

    scale.ticks.forEach(function (t) {
      s += '<line class="gl' + (t === 0 ? ' base' : '') + '" x1="' + P.l + '" x2="' + (P.l + iw) + '" y1="' + f(y(t)) + '" y2="' + f(y(t)) + '"></line>' +
        '<text x="' + (P.l - 8) + '" y="' + f(y(t) + 4) + '" text-anchor="end">' + esc(num(t)) + '</text>';
    });

    // Evenly spaced date labels that always include the first and last day.
    var labelW = c.showYear ? 74 : 44; // rough rendered width of one date label
    var count = Math.min(c.a.length, Math.max(2, Math.floor(iw / (labelW + 36)) + 1));
    var seen = {};
    for (var li = 0; li < count; li++) {
      var k = count === 1 ? 0 : Math.round((li * (c.a.length - 1)) / (count - 1));
      if (seen[k]) continue;
      seen[k] = 1;
      var lx = x(k);
      // Keep every label inside the drawing: pin the outermost ones to the edges.
      var anchor = lx - labelW / 2 < 2 ? 'start' : lx + labelW / 2 > W - 2 ? 'end' : 'middle';
      s += '<text x="' + f(lx) + '" y="' + (H - 8) + '" text-anchor="' + anchor + '">' + esc(fmtDate(c.a[k].date, c.showYear)) + '</text>';
    }

    function line(series) {
      var dPath = '';
      var pen = false;
      series.forEach(function (p, idx) {
        if (p.value == null) { pen = false; return; }
        dPath += (pen ? 'L' : 'M') + f(x(idx)) + ',' + f(y(p.value));
        pen = true;
      });
      return dPath;
    }
    function area(series) {
      var dPath = '';
      var run = [];
      function flush() {
        if (run.length > 1) {
          dPath += 'M' + f(x(run[0])) + ',' + f(y(0));
          run.forEach(function (idx) { dPath += 'L' + f(x(idx)) + ',' + f(y(series[idx].value)); });
          dPath += 'L' + f(x(run[run.length - 1])) + ',' + f(y(0)) + 'Z';
        }
        run = [];
      }
      series.forEach(function (p, idx) { if (p.value == null) flush(); else run.push(idx); });
      flush();
      return dPath;
    }
    function lonePoints(series, cls, color) {
      var out = '';
      series.forEach(function (p, idx) {
        var prev = idx > 0 ? series[idx - 1].value : null;
        var next = idx < series.length - 1 ? series[idx + 1].value : null;
        if (p.value != null && prev == null && next == null) {
          out += '<circle class="' + cls + '" cx="' + f(x(idx)) + '" cy="' + f(y(p.value)) + '" r="2.6" fill="' + color + '"></circle>';
        }
      });
      return out;
    }

    if (c.b) {
      s += '<path d="' + line(c.b) + '" fill="none" stroke="#8391A5" stroke-width="2" stroke-dasharray="5 4" stroke-linejoin="round" stroke-linecap="round"></path>' +
        lonePoints(c.b, 'pt-b', '#8391A5');
    }
    s += '<path d="' + area(c.a) + '" fill="url(#a-fill)"></path>' +
      '<path d="' + line(c.a) + '" fill="none" stroke="#0074D4" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"></path>' +
      lonePoints(c.a, 'pt-a', '#0074D4');
    s += '<line class="guide" x1="0" x2="0" y1="' + P.t + '" y2="' + (P.t + ih) + '" stroke="#94A3B8" stroke-width="1" visibility="hidden"></line>' +
      '<circle class="dot-b" r="4" fill="#fff" stroke="#8391A5" stroke-width="2" visibility="hidden"></circle>' +
      '<circle class="dot-a" r="4.5" fill="#0074D4" stroke="#fff" stroke-width="2" visibility="hidden"></circle>' +
      '</svg><div class="tt" aria-hidden="true"></div>';
    host.innerHTML = s;
    c.geom = { x: x, y: y, n: n, P: P, iw: iw, ih: ih, W: W, H: H, step: n <= 1 ? iw : step };
    if (c.idx >= 0) showPoint(c.idx);
  }

  function ttRow(which, p, showYear) {
    if (!p) return '';
    return '<div class="tt-row"><span class="sw' + (which === 'b' ? ' b' : '') + '"></span><b>' + esc(fmtDay(p.date, showYear)) + '</b>' +
      '<span class="v">' + (p.value == null ? '<span class="muted">Not recorded</span>' : esc(num(p.value)) + ' ' + plural(p.value, 'visitor', 'visitors')) + '</span></div>';
  }
  function speak(p) {
    if (!p) return '';
    return fmtDay(p.date, true) + ': ' + (p.value == null ? 'not recorded' : num(p.value) + ' ' + plural(p.value, 'visitor', 'visitors'));
  }

  function showPoint(i) {
    var c = chart;
    if (!c || !c.geom) return;
    var g = c.geom;
    i = Math.max(0, Math.min(g.n - 1, i));
    c.idx = i;
    var svg = c.host.querySelector('svg');
    var tt = c.host.querySelector('.tt');
    if (!svg || !tt) return;
    var X = g.x(i);
    var guide = svg.querySelector('.guide');
    guide.setAttribute('x1', X);
    guide.setAttribute('x2', X);
    guide.setAttribute('visibility', 'visible');
    var pa = c.a[i] || null;
    var pb = c.b ? c.b[i] || null : null;
    [['.dot-a', pa], ['.dot-b', pb]].forEach(function (pair) {
      var dot = svg.querySelector(pair[0]);
      if (pair[1] && pair[1].value != null) {
        dot.setAttribute('cx', X);
        dot.setAttribute('cy', g.y(pair[1].value));
        dot.setAttribute('visibility', 'visible');
      } else {
        dot.setAttribute('visibility', 'hidden');
      }
    });
    tt.innerHTML = ttRow('a', pa, c.showYear) + ttRow('b', pb, c.showYear);
    tt.classList.add('on');
    // Beside the guide line, on whichever side has room, scaled to the drawn size.
    var ratio = c.host.clientWidth / g.W;
    var px = X * ratio;
    var w = tt.offsetWidth;
    var left = px > c.host.clientWidth / 2 ? px - w - 12 : px + 12;
    left = Math.max(0, Math.min(c.host.clientWidth - w, left));
    tt.style.transform = 'translate(' + Math.round(left) + 'px,' + Math.round(g.P.t * ratio + 4) + 'px)';
    var liveEl = document.getElementById('chart-live');
    if (liveEl) liveEl.textContent = speak(pa) + (pb ? '. ' + c.L.b + ': ' + speak(pb) : '');
  }

  function hidePoint() {
    var c = chart;
    if (!c) return;
    c.idx = -1;
    var svg = c.host.querySelector('svg');
    var tt = c.host.querySelector('.tt');
    if (svg) ['.guide', '.dot-a', '.dot-b'].forEach(function (q) { var el = svg.querySelector(q); if (el) el.setAttribute('visibility', 'hidden'); });
    if (tt) tt.classList.remove('on');
  }

  var resizeQueued = false;
  window.addEventListener('resize', function () {
    if (resizeQueued) return;
    resizeQueued = true;
    requestAnimationFrame(function () {
      resizeQueued = false;
      if (chart && chart.host.isConnected && chart.host.clientWidth !== chart.width) drawChart();
    });
  });

  syncControls();
  load();
}

/** Inline-able source for each script, checked so it can never close its <script> early. */
function scriptSource(fn) {
  const src = `(${fn.toString()})();`;
  if (/<\/script/i.test(src) || src.includes('<!--')) throw new Error(`${fn.name} contains text that would break out of <script>.`);
  return src;
}

module.exports = {
  loginScript: scriptSource(loginApp),
  appScript: scriptSource(dashboardApp),
  loginApp,
  dashboardApp,
};
