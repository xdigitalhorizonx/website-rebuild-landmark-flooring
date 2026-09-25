'use strict';
/**
 * The dashboard's stylesheet, inlined into each page under the CSP nonce.
 * Tokens mirror styles.css (brand blue #0074D4, ink #16202B, Outfit self-hosted
 * from /assets/fonts — no third-party font request, as the privacy policy says).
 * No `style=""` attributes anywhere: the CSP only admits this nonce'd sheet.
 */

const STYLES = String.raw`
@font-face{font-family:'Outfit';font-style:normal;font-weight:400 800;font-display:swap;src:url(/assets/fonts/outfit-variable-latin.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:'Outfit Fallback';src:local('Arial');ascent-override:100.84%;descent-override:26.22%;line-gap-override:0%;size-adjust:99.17%}
:root{
  --blue:#0074D4;--blue-deep:#005CA8;--blue-ink:#005CA8;--pale:#E6F4FF;
  --ink:#16202B;--ink-soft:#3C4654;--ink-mute:#5A6472;
  --line:#E5E9F0;--line-blue:#D7E9FA;--field:#C5D0DD;--bg:#F5F8FC;--card:#FFFFFF;
  --b-line:#8391A5;
  --good:#137A43;--good-bg:#E6F5EC;--bad:#B42318;--bad-bg:#FDECEA;--flat:#5A6472;--flat-bg:#EEF1F5;
  --wait:#B45309;
  --radius:16px;
  --shadow-1:0 1px 2px rgba(20,30,45,.05),0 3px 10px rgba(20,30,45,.05);
  --shadow-2:0 8px 24px rgba(20,30,45,.08),0 22px 50px rgba(20,30,45,.08);
  --ease:cubic-bezier(.22,.61,.36,1);
  --font:"Outfit","Outfit Fallback",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
}
*,*::before,*::after{box-sizing:border-box}
[hidden]{display:none!important}
html{-webkit-text-size-adjust:100%}
body{margin:0;font-family:var(--font);color:var(--ink);background:var(--bg);font-size:16px;line-height:1.5;-webkit-font-smoothing:antialiased;overflow-x:hidden}
img{max-width:100%;display:block}
a{color:var(--blue-ink)}
h1,h2,h3{margin:0;line-height:1.15;letter-spacing:-.015em;font-weight:700}
p{margin:0}
button,input,select{font:inherit;color:inherit}
:focus-visible{outline:3px solid var(--blue);outline-offset:2px}
.sr-only{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.skip{position:absolute;left:8px;top:-60px;z-index:50;background:var(--blue);color:#fff;padding:10px 16px;border-radius:8px;font-weight:600;text-decoration:none}
.skip:focus{top:8px}
.wrap{width:min(100% - 32px,1200px);margin-inline:auto}

/* Buttons (after styles.css .btn) */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1.5px solid transparent;border-radius:999px;padding:12px 22px;font-weight:600;font-size:1rem;line-height:1.2;cursor:pointer;text-decoration:none;transition:transform .15s var(--ease),box-shadow .15s var(--ease),border-color .15s}
.btn-primary{background:linear-gradient(135deg,#0A78D6,#005CA8);color:#fff;box-shadow:0 6px 18px rgba(0,116,212,.28)}
.btn-primary:hover{transform:translateY(-1px);box-shadow:0 10px 24px rgba(0,116,212,.36)}
.btn-primary:disabled{opacity:.75;cursor:progress;transform:none}
.btn-quiet{background:#fff;color:var(--blue-ink);border-color:var(--line-blue)}
.btn-quiet:hover{border-color:var(--blue)}
.btn-sm{padding:9px 16px;font-size:.92rem;min-height:40px}

/* ---------- Sign-in and "not set up" pages ---------- */
body.auth{min-height:100vh;min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:32px 16px;
  background-color:#EEF4FB;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='360' height='88'%3E%3Cpath d='M0 43.5H360M0 87.5H360M.5 0V44M180.5 44V88' stroke='%230074D4' stroke-opacity='.09' fill='none'/%3E%3C/svg%3E"),radial-gradient(900px 520px at 50% 0,#FFFFFF 0,rgba(255,255,255,0) 72%)}
.auth-card{width:100%;max-width:420px;background:#fff;border:1px solid var(--line);border-radius:20px;box-shadow:var(--shadow-2);padding:32px 28px 26px}
.auth-logo{width:176px;height:auto;margin:0 0 24px}
.auth-card h1{font-size:1.55rem}
.auth-lede{color:var(--ink-soft);margin:6px 0 22px}
.field{display:grid;gap:6px;margin-bottom:16px}
.field label{font-weight:600;font-size:.92rem}
.field input{width:100%;min-height:48px;padding:12px 14px;border:1.5px solid var(--field);border-radius:12px;background:#fff;font-size:1rem;transition:border-color .15s,box-shadow .15s}
.field input:focus{outline:none;border-color:var(--blue);box-shadow:0 0 0 4px rgba(0,116,212,.16)}
.pw{position:relative}
.pw input{padding-right:76px}
.pw-toggle{position:absolute;right:6px;top:50%;transform:translateY(-50%);border:0;background:transparent;color:var(--blue-ink);font-weight:600;font-size:.88rem;padding:8px 10px;border-radius:8px;cursor:pointer}
.auth-error{background:var(--bad-bg);color:var(--bad);border-radius:12px;padding:10px 14px;font-size:.94rem;margin:0 0 16px}
.auth-submit{width:100%;min-height:50px}
.auth-foot{margin-top:18px;color:var(--ink-mute);font-size:.86rem;text-align:center}
.missing{margin:4px 0 18px;padding:0;list-style:none;display:grid;gap:8px}
.missing code{display:inline-block;background:var(--pale);color:var(--blue-deep);border-radius:8px;padding:4px 10px;font-size:.92rem;font-family:ui-monospace,SFMono-Regular,Consolas,monospace}

/* ---------- App header ---------- */
.topbar{background:#fff;border-bottom:1px solid var(--line)}
.topbar-in{display:flex;flex-wrap:wrap;align-items:center;gap:10px 18px;padding:14px 0}
.brand{flex:none;display:block;border-radius:6px}
.brand img{height:28px;width:auto;max-width:none}
.topbar-title{flex:1 1 auto;font-weight:700;font-size:1.05rem;padding-left:18px;border-left:1px solid var(--line);white-space:nowrap}
.topbar-user{display:flex;align-items:center;gap:8px 14px;flex-wrap:wrap;font-size:.92rem;color:var(--ink-soft);min-width:0}
.topbar-user .who{min-width:0;overflow-wrap:anywhere}
.topbar-user strong{color:var(--ink);font-weight:600}
.topbar-user form{margin:0;flex:none}
@media (max-width:640px){
  .brand img{height:22px}
  .topbar-title{padding-left:12px;font-size:.98rem}
  .topbar-user{flex:1 1 100%;justify-content:space-between}
  .topbar-user .who{flex:1 1 160px}
}

/* ---------- Controls ---------- */
.controls{display:flex;flex-wrap:wrap;align-items:flex-end;gap:12px 16px;margin-top:24px}
.ctl{display:grid;gap:5px;min-width:0}
.ctl>label,.ctl-label{font-size:.76rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-mute)}
.ctl select{appearance:none;-webkit-appearance:none;min-height:46px;min-width:210px;background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1.5l5 5 5-5' stroke='%23005CA8' stroke-width='1.8' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat right 14px center;border:1.5px solid var(--field);border-radius:12px;padding:10px 40px 10px 14px;font-size:1rem;font-weight:600;cursor:pointer}
.ctl input[type=date]{min-height:46px;border:1.5px solid var(--field);border-radius:12px;padding:9px 10px;background:#fff;font-size:.98rem;min-width:0}
.ctl select:focus,.ctl input:focus{outline:none;border-color:var(--blue);box-shadow:0 0 0 4px rgba(0,116,212,.16)}
.dates{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.controls-msg{margin-top:10px;color:var(--bad);font-weight:600;font-size:.94rem}
.range-line{margin-top:14px;display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px;color:var(--ink-soft);font-size:.95rem}
.range-line b{color:var(--ink);font-weight:600}
.range-line .vs{color:var(--ink-mute)}
.swatch{display:inline-block;width:18px;height:3px;border-radius:2px;vertical-align:middle;margin-right:6px;background:var(--blue)}
.swatch.b{background:repeating-linear-gradient(90deg,var(--b-line) 0 5px,transparent 5px 8px)}
@media (max-width:640px){
  .ctl{flex:1 1 100%}
  .ctl select{width:100%;min-width:0}
  .dates input{flex:1 1 130px}
  .controls .btn{width:100%}
}

/* ---------- Notes ---------- */
.notes{display:grid;gap:8px;margin-top:14px}
.notes:empty{display:none}
.note{display:flex;gap:10px;align-items:flex-start;background:#fff;border:1px solid var(--line-blue);border-left:4px solid var(--blue);border-radius:12px;padding:10px 14px;color:var(--ink-soft);font-size:.93rem;line-height:1.45}
.note svg{flex:none;margin-top:2px;color:var(--blue)}

/* ---------- Sections & cards ---------- */
.section{margin-top:30px}
.section-head{margin-bottom:12px}
.section-head h2{font-size:1.28rem}
.section-head p{color:var(--ink-mute);font-size:.92rem;margin-top:2px}
.card{position:relative;background:var(--card);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow-1);min-width:0}

.overview{display:grid;gap:16px;grid-template-columns:minmax(0,1fr);margin-top:22px}
@media (min-width:960px){.overview:not(.solo){grid-template-columns:minmax(0,1.3fr) minmax(0,1fr)}}
.overview>*{min-width:0}
.summary{position:relative;overflow:hidden;padding:24px 26px;color:#fff;border:0;
  background:linear-gradient(135deg,#0068BE,#004C8C)}
.summary::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:.5;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='360' height='88'%3E%3Cpath d='M0 43.5H360M0 87.5H360M.5 0V44M180.5 44V88' stroke='%23FFFFFF' stroke-opacity='.10' fill='none'/%3E%3C/svg%3E")}
.summary>*{position:relative;z-index:1}
.eyebrow{font-size:.74rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase}
.summary .eyebrow{color:#CFE6FF}
.summary .big{margin-top:8px;font-size:clamp(1.12rem,1rem + .55vw,1.42rem);line-height:1.45;font-weight:500}
.summary strong{font-weight:700}

.kpis{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(min(100%,168px),1fr))}
.kpis>*{min-width:0}
.kpi{padding:16px 18px 15px;display:flex;flex-direction:column}
.kpi-label{font-size:.98rem;font-weight:700}
.kpi-help{font-size:.84rem;color:var(--ink-mute);line-height:1.35;margin-top:3px}
.kpi-main{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;margin-top:auto;padding-top:12px}
.kpi-value{font-size:clamp(1.55rem,1.3rem + .9vw,2.05rem);font-weight:700;letter-spacing:-.02em;line-height:1.1;font-variant-numeric:tabular-nums}
.kpi-vs{font-size:.86rem;color:var(--ink-mute);margin-top:6px}
.kpi-vs .kpi-note{color:var(--wait)}
.kpis-hero .kpi{border-top:4px solid var(--blue)}
.kpis-hero .kpi-value{font-size:clamp(2rem,1.6rem + 1.4vw,2.7rem);color:var(--blue-deep)}

.chg{display:inline-flex;align-items:center;gap:4px;font-weight:700;font-size:.8rem;padding:3px 9px;border-radius:999px;white-space:nowrap;font-variant-numeric:tabular-nums}
.chg .ar{font-size:.72em}
.chg.good{color:var(--good);background:var(--good-bg)}
.chg.bad{color:var(--bad);background:var(--bad-bg)}
.chg.neutral{color:var(--flat);background:var(--flat-bg)}

/* ---------- Chart ---------- */
.chart-card{padding:18px 18px 10px;margin-top:16px}
.chart-top{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:8px 18px;margin-bottom:8px}
.chart-top h3{font-size:1.08rem}
.chart-top .help{color:var(--ink-mute);font-size:.88rem;margin-top:2px}
.legend{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:.86rem;color:var(--ink-soft);align-items:center}
.legend .hatch{display:inline-block;width:14px;height:12px;border:1px solid var(--line);border-radius:2px;margin-right:6px;vertical-align:middle;background:repeating-linear-gradient(135deg,#DCE3EC 0 2px,#fff 2px 5px)}
.chart{position:relative;touch-action:pan-y;border-radius:8px;min-height:220px;cursor:crosshair}
.chart:focus-visible{outline-offset:4px}
.chart svg{display:block;max-width:100%;height:auto;overflow:hidden}
.chart .gl{stroke:#EDF1F6;stroke-width:1}
.chart .gl.base{stroke:#DCE3EC}
.chart text{font-family:var(--font);font-size:11px;fill:var(--ink-mute)}
.chart .nr-label{font-size:11px;fill:#6B7686;font-weight:600}
.chart-empty{padding:40px 0;text-align:center}
.tt{position:absolute;top:0;left:0;pointer-events:none;background:#fff;border:1px solid var(--line);box-shadow:var(--shadow-2);border-radius:12px;padding:8px 12px;font-size:.84rem;opacity:0;transition:opacity .12s;z-index:2;white-space:nowrap}
.tt.on{opacity:1}
.tt-row{display:flex;align-items:center;gap:8px}
.tt-row+.tt-row{margin-top:4px}
.tt b{font-weight:600}
.tt .v{margin-left:auto;padding-left:14px;font-weight:700;font-variant-numeric:tabular-nums}
.tt .muted{color:var(--ink-mute);font-weight:500}
.sw{display:inline-block;width:12px;height:3px;border-radius:2px;background:var(--blue);flex:none}
.sw.b{background:repeating-linear-gradient(90deg,var(--b-line) 0 4px,transparent 4px 6px)}

/* ---------- Tables ---------- */
.grid2{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(min(100%,440px),1fr));margin-top:16px}
.grid2>*{min-width:0}
.tcard{padding:18px 18px 6px}
.tcard.wide{grid-column:1/-1}
.card-head h3{font-size:1.08rem}
.card-head .help{color:var(--ink-mute);font-size:.88rem;margin-top:2px}
/* position:relative matters: it makes the scroller the containing block of the
   absolutely-positioned .sr-only text inside the table, which otherwise escapes the
   clip and widens the whole page on phones. */
.tscroll{position:relative;overflow-x:auto;margin:10px -18px 0;padding:0 18px;-webkit-overflow-scrolling:touch}
table.t{width:100%;border-collapse:collapse;font-size:.93rem}
.t th,.t td{padding:10px 6px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}
.t th:first-child,.t td:first-child{padding-left:0}
.t th:last-child,.t td:last-child{padding-right:0}
.t thead th{font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-mute);font-weight:700;border-bottom:1.5px solid var(--line);padding-top:0;vertical-align:bottom}
.t tbody tr:last-child>*{border-bottom:0}
.t .num{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
.t thead th.num{white-space:normal}
.t tbody th{font-weight:500;overflow-wrap:anywhere;min-width:118px}
.t .none{color:var(--ink-mute)}
@media (max-width:480px){
  .t th,.t td{padding:9px 4px}
  .t tbody th{min-width:96px}
  .t thead th{font-size:.66rem;letter-spacing:.04em}
  .chg{padding:3px 7px}
}
.t .sub{display:block;font-size:.8rem;color:var(--ink-mute);font-weight:400;margin-top:1px}
.pill{display:inline-block;font-size:.7rem;font-weight:700;color:var(--blue-deep);background:var(--pale);border-radius:999px;padding:1px 8px;margin-left:6px;vertical-align:1px;white-space:nowrap}
.empty{color:var(--ink-mute);padding:12px 0 16px;font-size:.94rem}

/* ---------- Notices ---------- */
.notice{padding:20px 22px;border-left:5px solid var(--wait)}
.notice h3{font-size:1.1rem;margin-bottom:6px}
.notice p{color:var(--ink-soft)}
.notice .google{margin-top:10px;font-size:.82rem;color:var(--ink-mute);overflow-wrap:anywhere}
.notice .btn{margin-top:14px}
.notice.fatal{border-left-color:var(--bad)}

/* ---------- Loading ---------- */
.sk{display:block;border-radius:8px;background:linear-gradient(90deg,#E8EDF3 25%,#F3F6F9 45%,#E8EDF3 65%);background-size:300% 100%;animation:sk 1.3s ease-in-out infinite}
@keyframes sk{0%{background-position:100% 0}100%{background-position:0 0}}
.sk-line{height:12px;margin:8px 0}
.sk-line.short{width:55%}
.sk-val{height:32px;width:62%;margin:14px 0 6px}
.sk-chart{height:230px;margin-top:10px}
.sk-row{height:14px;margin:14px 0}
.summary .sk{background:linear-gradient(90deg,rgba(255,255,255,.14) 25%,rgba(255,255,255,.26) 45%,rgba(255,255,255,.14) 65%);background-size:300% 100%}

.foot{margin:40px auto 44px;color:var(--ink-mute);font-size:.85rem;line-height:1.6}
.foot p+p{margin-top:4px}

@media (prefers-reduced-motion:reduce){
  .sk{animation:none}
  .btn,.tt,.field input{transition:none}
}
`;

module.exports = { STYLES };
