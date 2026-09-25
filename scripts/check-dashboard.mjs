#!/usr/bin/env node
/**
 * Offline checks for /dashboard's server logic: passwords, sessions, the user
 * list, date presets and comparisons, the Search Console lag clamp, GA4
 * tracking-start detection, and response shaping. No network, no secrets.
 *
 *   node scripts/check-dashboard.mjs        (exit code 1 on any failure)
 */

import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const password = require('../api/_dashboard/password.js');
const config = require('../api/_dashboard/config.js');
const session = require('../api/_dashboard/session.js');
const D = require('../api/_dashboard/dates.js');
const report = require('../api/_dashboard/report.js');
const ga4 = require('../api/_dashboard/ga4.js');
const gsc = require('../api/_dashboard/gsc.js');
const http = require('../api/_dashboard/http.js');
const google = require('../api/_dashboard/google.js');
const client = require('../api/_dashboard/client.js');
const { createLimiter } = require('../api/_dashboard/ratelimit.js');
const { attemptLogin } = require('../api/_dashboard/auth.js');

let passed = 0;
let failed = 0;
async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ok    ${name}`);
  } catch (err) {
    failed++;
    console.log(`  FAIL  ${name}\n        ${String(err && err.message).split('\n').join('\n        ')}`);
  }
}
const group = (name) => console.log(`\n${name}`);
const range = (start, end) => ({ start, end });
const days = (start, end) => D.eachDay(range(start, end));

// ---------------------------------------------------------------------------
group('scrypt passwords');
const PW = 'correct horse battery staple';
const HASH = await password.hashPassword(PW);

await test('hash format is scrypt$N$r$p$salt$hash with N=2^15, r=8, p=1', () => {
  assert.match(HASH, /^scrypt\$32768\$8\$1\$[A-Za-z0-9_-]{22}\$[A-Za-z0-9_-]{43}$/);
});
await test('right password verifies, wrong ones do not', async () => {
  assert.equal(await password.verifyPassword(PW, HASH), true);
  assert.equal(await password.verifyPassword('correct horse battery stapl', HASH), false);
  assert.equal(await password.verifyPassword('', HASH), false);
  assert.equal(await password.verifyPassword(undefined, HASH), false);
  assert.equal(await password.verifyPassword('x'.repeat(2000), HASH), false);
});
await test('same password hashes differently each time (random salt), both verify', async () => {
  const again = await password.hashPassword(PW);
  assert.notEqual(again, HASH);
  assert.equal(await password.verifyPassword(PW, again), true);
});
await test('Unicode composed/decomposed forms of a password match', async () => {
  const h = await password.hashPassword('café-floors-2026');
  assert.equal(await password.verifyPassword('café-floors-2026', h), true);
});
await test('tampered or malformed stored hashes never verify (and never throw)', async () => {
  const flipped = HASH.slice(0, -1) + (HASH.endsWith('A') ? 'B' : 'A');
  assert.equal(await password.verifyPassword(PW, flipped), false);
  for (const bad of ['', 'plain', 'scrypt$32768$8$1$abc', 'bcrypt$32768$8$1$' + HASH.split('$').slice(4).join('$')]) {
    assert.equal(await password.verifyPassword(PW, bad), false, bad);
  }
});
await test('parseHash rejects out-of-bounds parameters', () => {
  const [, , , , salt, hash] = HASH.split('$');
  assert.ok(password.parseHash(HASH));
  assert.equal(password.parseHash(`scrypt$30000$8$1$${salt}$${hash}`), null, 'N not a power of two');
  assert.equal(password.parseHash(`scrypt$8192$8$1$${salt}$${hash}`), null, 'N below 2^14');
  assert.equal(password.parseHash(`scrypt$2097152$8$1$${salt}$${hash}`), null, 'N*r above 2^20');
  assert.equal(password.parseHash(`scrypt$32768$8$1$${salt.slice(0, 8)}$${hash}`), null, 'salt too short');
  assert.equal(password.parseHash(`scrypt$32768$8$1$${salt}$${hash}$extra`), null, 'extra field');
  assert.ok(password.parseHash(password.DECOY_HASH), 'decoy hash is well-formed');
});
await test('maxmem is sized for the parameters (Node\'s 32 MiB default is too small for N=2^15, r=8)', () => {
  assert.ok(password.maxmemFor(1 << 15, 8, 1) > 32 * 1024 * 1024);
});

// ---------------------------------------------------------------------------
group('DASHBOARD_USERS parsing');
await test('one entry, email lower-cased and trimmed', () => {
  const { users, invalid } = config.parseUsers(`  Jeff@LandmarkFlooringUSA.com : ${HASH} `);
  assert.equal(invalid, 0);
  assert.deepEqual(users, [{ email: 'jeff@landmarkflooringusa.com', hash: HASH }]);
});
await test('several entries, separated by commas and/or line breaks', () => {
  const { users } = config.parseUsers(`a@landmarkflooringusa.com:${HASH},\nb@landmarkflooringusa.com:${HASH}\r\nc@example.org:${HASH}`);
  assert.deepEqual(users.map((u) => u.email), ['a@landmarkflooringusa.com', 'b@landmarkflooringusa.com', 'c@example.org']);
});
await test('unreadable entries are skipped and counted, never half-accepted', () => {
  const raw = [
    `good@landmarkflooringusa.com:${HASH}`,
    'no-colon-here',
    `not-an-email:${HASH}`,
    'bad@landmarkflooringusa.com:plaintext-password',
    `good@landmarkflooringusa.com:${HASH}`, // duplicate
    `semi;colon@x.com:${HASH}`,
  ].join(',');
  const { users, invalid } = config.parseUsers(raw);
  assert.deepEqual(users.map((u) => u.email), ['good@landmarkflooringusa.com']);
  assert.equal(invalid, 5);
});
await test('empty or missing value → no users', () => {
  assert.deepEqual(config.parseUsers(undefined).users, []);
  assert.deepEqual(config.parseUsers(' , ,\n').users, []);
});
await test('authConfig fails closed without users or with a short secret', () => {
  const secret = 'x'.repeat(40);
  assert.deepEqual(config.authConfig({}).missing, ['DASHBOARD_USERS', 'DASHBOARD_SESSION_SECRET']);
  assert.deepEqual(config.authConfig({ DASHBOARD_USERS: `a@b.co:${HASH}`, DASHBOARD_SESSION_SECRET: 'short' }).missing, ['DASHBOARD_SESSION_SECRET']);
  assert.deepEqual(config.authConfig({ DASHBOARD_USERS: 'a@b.co:nope', DASHBOARD_SESSION_SECRET: secret }).missing, ['DASHBOARD_USERS']);
  const ok = config.authConfig({ DASHBOARD_USERS: `a@b.co:${HASH}`, DASHBOARD_SESSION_SECRET: secret });
  assert.equal(ok.ok, true);
});
await test('googleConfig: defaults, key normalisation, measurement-id mistake', () => {
  const g = config.googleConfig({ GSC_CLIENT_EMAIL: 'sa@p.iam.gserviceaccount.com', GSC_PRIVATE_KEY: '"-----BEGIN PRIVATE KEY-----\\nABC\\n-----END PRIVATE KEY-----\\n"' });
  assert.equal(g.propertyId, '546190207');
  assert.equal(g.siteUrl, 'sc-domain:landmarkflooringusa.com');
  assert.equal(g.privateKey, '-----BEGIN PRIVATE KEY-----\nABC\n-----END PRIVATE KEY-----\n');
  assert.equal(g.ok, true);
  assert.deepEqual(config.googleConfig({}).missing, ['GSC_CLIENT_EMAIL', 'GSC_PRIVATE_KEY']);
  assert.match(config.googleConfig({ GA4_PROPERTY_ID: 'G-KPV3BK2621' }).propertyIdError, /measurement id/);
});

// ---------------------------------------------------------------------------
group('sessions');
const SECRET = 'a-test-secret-that-is-long-enough-1234567890';
const JEFF = { email: 'jeff@landmarkflooringusa.com', hash: HASH };
const USERS = [JEFF, { email: 'brandon@landmarkflooringusa.com', hash: password.DECOY_HASH }];
const T0 = Date.UTC(2026, 8, 25, 18, 0, 0);

await test('cookie value is <expiry>.<email>.<HMAC-SHA256 base64url> and verifies', () => {
  const v = session.signSession(JEFF, SECRET, T0);
  assert.match(v, /^\d{10}\.jeff@landmarkflooringusa\.com\.[A-Za-z0-9_-]{43}$/);
  assert.equal(Number(v.split('.')[0]), T0 / 1000 + 7 * 24 * 3600);
  assert.deepEqual(session.verifySession(v, USERS, SECRET, T0 + 1000), { email: JEFF.email, expiresAt: T0 / 1000 + 604800 });
});
await test('expires after 7 days (valid one second before, invalid at expiry)', () => {
  const v = session.signSession(JEFF, SECRET, T0);
  assert.ok(session.verifySession(v, USERS, SECRET, T0 + 604799 * 1000));
  assert.equal(session.verifySession(v, USERS, SECRET, T0 + 604800 * 1000), null);
});
await test('tampering with any part invalidates it', () => {
  const v = session.signSession(JEFF, SECRET, T0);
  const [exp] = v.split('.');
  const mac = v.slice(v.lastIndexOf('.') + 1);
  assert.equal(session.verifySession(`${Number(exp) + 3600}.${JEFF.email}.${mac}`, USERS, SECRET, T0), null, 'expiry');
  assert.equal(session.verifySession(`${exp}.brandon@landmarkflooringusa.com.${mac}`, USERS, SECRET, T0), null, 'email');
  assert.equal(session.verifySession(`${exp}.${JEFF.email}.${mac.slice(0, -1)}${mac.endsWith('A') ? 'B' : 'A'}`, USERS, SECRET, T0), null, 'mac');
  assert.equal(session.verifySession(`${exp}.JEFF@landmarkflooringusa.com.${mac}`, USERS, SECRET, T0), null, 'case');
});
await test('revocation: removed from DASHBOARD_USERS, new password, or rotated secret', () => {
  const v = session.signSession(JEFF, SECRET, T0);
  assert.equal(session.verifySession(v, USERS.slice(1), SECRET, T0), null, 'removed');
  assert.equal(session.verifySession(v, [{ ...JEFF, hash: password.DECOY_HASH }], SECRET, T0), null, 'password changed');
  assert.equal(session.verifySession(v, USERS, `${SECRET}-rotated`, T0), null, 'secret rotated');
  assert.equal(session.verifySession(v, USERS, '', T0), null, 'no secret');
});
await test('a cookie claiming a longer life than we ever issue is refused', () => {
  const v = session.signSession(JEFF, SECRET, T0 + 30 * 24 * 3600 * 1000); // signed "in the future"
  assert.equal(session.verifySession(v, USERS, SECRET, T0), null);
});
await test('malformed cookie values are refused', () => {
  for (const bad of [null, undefined, '', 'abc', '1.2.3', `${T0}.x`, '9'.repeat(700), `abc.${JEFF.email}.${'A'.repeat(43)}`]) {
    assert.equal(session.verifySession(bad, USERS, SECRET, T0), null, String(bad).slice(0, 20));
  }
});
await test('cookie flags: HttpOnly, SameSite=Lax, Path=/, 7 days, Secure only on https', () => {
  const plain = session.sessionCookie('v', { secure: false });
  const tls = session.sessionCookie('v', { secure: true });
  assert.equal(plain, 'lf_dash=v; Path=/; Max-Age=604800; HttpOnly; SameSite=Lax');
  assert.equal(tls, `${plain}; Secure`);
  assert.match(session.clearedSessionCookie({ secure: true }), /^lf_dash=; Path=\/; Max-Age=0; .*HttpOnly; SameSite=Lax; Secure$/);
});
await test('readCookie picks lf_dash out of a Cookie header', () => {
  assert.equal(session.readCookie('a=1; lf_dash=123.j@x.co.sig; b=2'), '123.j@x.co.sig');
  assert.equal(session.readCookie('a=1'), null);
  assert.equal(session.readCookie(undefined), null);
});

// ---------------------------------------------------------------------------
group('sign-in attempts and throttle');
await test('unknown email and wrong password fail the same way; right password signs in', async () => {
  const auth = { users: [JEFF] };
  const limiter = createLimiter();
  const unknown = await attemptLogin(auth, { email: 'nobody@landmarkflooringusa.com', password: PW, ip: '1.1.1.1' }, { limiter });
  const wrong = await attemptLogin(auth, { email: JEFF.email, password: 'nope', ip: '1.1.1.1' }, { limiter });
  assert.deepEqual(unknown, { user: null, limited: false });
  assert.deepEqual(wrong, { user: null, limited: false });
  const good = await attemptLogin(auth, { email: ' JEFF@landmarkflooringusa.com ', password: PW, ip: '1.1.1.1' }, { limiter });
  assert.equal(good.user.email, JEFF.email);
});
await test('5 failures in 10 minutes lock the address out, even with the right password', async () => {
  const auth = { users: [JEFF] };
  const limiter = createLimiter();
  const t = T0;
  for (let i = 0; i < 5; i++) assert.equal((await attemptLogin(auth, { email: JEFF.email, password: 'x', ip: '2.2.2.2' }, { limiter, now: t + i })).limited, false);
  const locked = await attemptLogin(auth, { email: JEFF.email, password: PW, ip: '2.2.2.2' }, { limiter, now: t + 10 });
  assert.equal(locked.limited, true);
  assert.ok(locked.retryAfterSeconds > 590 && locked.retryAfterSeconds <= 600);
  assert.equal((await attemptLogin(auth, { email: JEFF.email, password: PW, ip: '3.3.3.3' }, { limiter, now: t + 10 })).user.email, JEFF.email, 'other addresses unaffected');
  const later = await attemptLogin(auth, { email: JEFF.email, password: PW, ip: '2.2.2.2' }, { limiter, now: t + 10 * 60 * 1000 + 1 });
  assert.equal(later.user.email, JEFF.email, 'window over');
});

// ---------------------------------------------------------------------------
group('dates: time zone, presets, comparisons');
await test('"today" follows the property time zone, not UTC', () => {
  assert.equal(D.todayIn('America/Los_Angeles', new Date('2026-09-25T05:30:00Z')), '2026-09-24');
  assert.equal(D.todayIn('UTC', new Date('2026-09-25T05:30:00Z')), '2026-09-25');
  assert.equal(D.todayIn('America/Los_Angeles', new Date('2026-09-25T07:30:00Z')), '2026-09-25');
  assert.equal(D.todayIn('America/New_York', new Date('2026-09-25T03:30:00Z')), '2026-09-24');
  assert.equal(D.todayIn('Pacific/Kiritimati', new Date('2026-09-25T12:00:00Z')), '2026-09-26');
});
await test('daylight-saving changeovers don\'t move the date', () => {
  assert.equal(D.todayIn('America/Los_Angeles', new Date('2026-03-08T09:59:00Z')), '2026-03-08'); // 01:59 PST
  assert.equal(D.todayIn('America/Los_Angeles', new Date('2026-03-08T10:01:00Z')), '2026-03-08'); // 03:01 PDT
  assert.equal(D.todayIn('America/Los_Angeles', new Date('2026-11-01T07:30:00Z')), '2026-11-01'); // 00:30 PDT
  assert.equal(D.todayIn('America/Los_Angeles', new Date('2026-11-02T07:30:00Z')), '2026-11-01'); // 23:30 PST
  assert.equal(D.addDays('2026-03-07', 1), '2026-03-08');
  assert.equal(D.addDays('2026-11-01', 1), '2026-11-02');
});
await test('presets on 2026-09-25', () => {
  const t = '2026-09-25';
  assert.deepEqual(D.presetRange('last7', t), range('2026-09-18', '2026-09-24'));
  assert.deepEqual(D.presetRange('last28', t), range('2026-08-28', '2026-09-24'));
  assert.deepEqual(D.presetRange('last90', t), range('2026-06-27', '2026-09-24'));
  assert.deepEqual(D.presetRange('thisMonth', t), range('2026-09-01', '2026-09-25'));
  assert.deepEqual(D.presetRange('lastMonth', t), range('2026-08-01', '2026-08-31'));
  assert.deepEqual(D.presetRange('thisYear', t), range('2026-01-01', '2026-09-25'));
  assert.deepEqual(D.presetRange('last12m', t), range('2025-09-25', '2026-09-24'));
  assert.equal(D.rangeDays(D.presetRange('last90', t)), 90);
});
await test('month boundaries: last month in Feb/Mar/Dec/Jan', () => {
  assert.deepEqual(D.presetRange('lastMonth', '2026-03-01'), range('2026-02-01', '2026-02-28'));
  assert.deepEqual(D.presetRange('lastMonth', '2028-03-15'), range('2028-02-01', '2028-02-29'));
  assert.deepEqual(D.presetRange('lastMonth', '2026-01-01'), range('2025-12-01', '2025-12-31'));
  assert.deepEqual(D.presetRange('lastMonth', '2026-05-31'), range('2026-04-01', '2026-04-30'));
  assert.deepEqual(D.presetRange('last7', '2026-03-01'), range('2026-02-22', '2026-02-28'));
  assert.deepEqual(D.presetRange('thisMonth', '2026-03-01'), range('2026-03-01', '2026-03-01'));
  assert.deepEqual(D.presetRange('thisYear', '2026-01-01'), range('2026-01-01', '2026-01-01'));
  assert.deepEqual(D.presetRange('last7', '2026-01-01'), range('2025-12-25', '2025-12-31'));
});
await test('leap years: last 12 months and month arithmetic', () => {
  assert.deepEqual(D.presetRange('last12m', '2028-03-01'), range('2027-03-01', '2028-02-29'));
  assert.equal(D.rangeDays(D.presetRange('last12m', '2028-03-01')), 366);
  assert.equal(D.rangeDays(D.presetRange('last12m', '2027-03-01')), 365);
  assert.equal(D.addMonths('2026-03-31', -1), '2026-02-28');
  assert.equal(D.addMonths('2028-03-31', -1), '2028-02-29');
  assert.equal(D.addMonths('2026-01-31', 1), '2026-02-28');
  assert.equal(D.addMonths('2026-12-15', 1), '2027-01-15');
  assert.equal(D.isIsoDate('2028-02-29'), true);
  assert.equal(D.isIsoDate('2027-02-29'), false);
});
await test('previous period = same length, immediately before', () => {
  assert.deepEqual(D.previousPeriod(range('2026-09-18', '2026-09-24')), range('2026-09-11', '2026-09-17'));
  assert.deepEqual(D.previousPeriod(range('2026-09-01', '2026-09-25')), range('2026-08-07', '2026-08-31'));
  assert.deepEqual(D.previousPeriod(range('2026-03-01', '2026-03-31')), range('2026-01-29', '2026-02-28'));
  assert.deepEqual(D.previousPeriod(range('2026-09-24', '2026-09-24')), range('2026-09-23', '2026-09-23'));
});
await test('same period last year, including Feb 29', () => {
  assert.deepEqual(D.samePeriodLastYear(range('2026-09-18', '2026-09-24')), range('2025-09-18', '2025-09-24'));
  assert.deepEqual(D.samePeriodLastYear(range('2028-02-01', '2028-02-29')), range('2027-02-01', '2027-02-28'));
  assert.deepEqual(D.samePeriodLastYear(range('2028-02-29', '2028-03-06')), range('2027-02-28', '2027-03-06'));
  assert.deepEqual(D.samePeriodLastYear(range('2029-02-28', '2029-03-01')), range('2028-02-28', '2028-03-01'));
});
await test('query → periods: defaults, compare modes, custom dates', () => {
  const t = '2026-09-25';
  const def = D.resolvePeriods({}, t);
  assert.equal(def.preset, 'last28');
  assert.equal(def.compare, 'previous');
  assert.deepEqual(def.b, range('2026-07-31', '2026-08-27'));
  assert.equal(D.resolvePeriods({ range: 'bogus', compare: 'nope' }, t).preset, 'last28');
  assert.equal(D.resolvePeriods({ compare: 'off' }, t).b, null);
  assert.deepEqual(D.resolvePeriods({ range: 'last7', compare: 'yoy' }, t).b, range('2025-09-18', '2025-09-24'));
  const custom = D.resolvePeriods({ range: 'custom', from: '2026-09-01', to: '2026-09-20', compare: 'custom', cfrom: '2026-08-01', cto: '2026-08-20' }, t);
  assert.deepEqual(custom.a, range('2026-09-01', '2026-09-20'));
  assert.deepEqual(custom.b, range('2026-08-01', '2026-08-20'));
  assert.deepEqual(D.resolvePeriods({ range: 'custom', from: '2026-09-20', to: '2026-12-31' }, t).a, range('2026-09-20', '2026-09-25'), 'future end → today');
  assert.equal(D.resolvePeriods({ range: 'thisMonth' }, t).includesToday, true);
  assert.equal(D.resolvePeriods({ range: 'last28' }, t).includesToday, false);
});
await test('unusable custom dates raise a readable RangeInputError', () => {
  const t = '2026-09-25';
  const bad = [
    { range: 'custom', from: '2026-09-20', to: '2026-09-01' },
    { range: 'custom', from: '2026-9-1', to: '2026-09-20' },
    { range: 'custom', from: '2026-10-01', to: '2026-10-05' },
    { range: 'custom', from: '2015-01-01', to: '2015-12-31' },
    { range: 'custom', from: '2020-01-01', to: '2026-09-20' },
    { range: 'last7', compare: 'custom', cfrom: '', cto: '' },
  ];
  for (const q of bad) assert.throws(() => D.resolvePeriods(q, t), D.RangeInputError, JSON.stringify(q));
});
await test('range labels', () => {
  assert.equal(D.formatRange(range('2026-09-01', '2026-09-24')), 'Sep 1 – 24, 2026');
  assert.equal(D.formatRange(range('2026-08-28', '2026-09-24')), 'Aug 28 – Sep 24, 2026');
  assert.equal(D.formatRange(range('2025-12-28', '2026-01-03')), 'Dec 28, 2025 – Jan 3, 2026');
  assert.equal(D.formatRange(range('2026-09-24', '2026-09-24')), 'Sep 24, 2026');
});

// ---------------------------------------------------------------------------
group('Search Console lag clamp');
const OLDEST = D.addMonths('2026-09-25', -16);
await test('both periods lose the same unfinished days, so the comparison stays fair', () => {
  const w = D.gscWindows(range('2026-09-18', '2026-09-24'), range('2026-09-11', '2026-09-17'), '2026-09-22', OLDEST);
  assert.deepEqual(w.a, range('2026-09-18', '2026-09-22'));
  assert.deepEqual(w.b, range('2026-09-11', '2026-09-15'));
  assert.equal(w.trimmedDays, 2);
  assert.equal(w.comparable, true);
});
await test('a period entirely inside the lag has no Search Console window', () => {
  const w = D.gscWindows(range('2026-09-01', '2026-09-02'), range('2026-08-30', '2026-08-31'), '2026-08-30', OLDEST);
  assert.equal(w.a, null);
  assert.equal(w.b, null);
  assert.equal(w.comparable, false);
});
await test('periods older than Search Console keeps are cut and not compared', () => {
  const w = D.gscWindows(range('2025-09-25', '2026-09-24'), range('2024-09-25', '2025-09-24'), '2026-09-22', OLDEST);
  assert.equal(w.a.end, '2026-09-22');
  assert.equal(w.b.start, OLDEST);
  assert.equal(w.bStartClipped, true);
  assert.equal(w.comparable, false);
});
await test('a recent custom comparison that hits the lag itself is not compared', () => {
  const w = D.gscWindows(range('2026-06-01', '2026-06-30'), range('2026-09-10', '2026-09-24'), '2026-09-22', OLDEST);
  assert.equal(w.trimmedDays, 0);
  assert.deepEqual(w.b, range('2026-09-10', '2026-09-22'));
  assert.equal(w.bEndClipped, true);
  assert.equal(w.comparable, false);
});
await test('no comparison period → nothing to compare', () => {
  const w = D.gscWindows(range('2026-09-18', '2026-09-24'), null, '2026-09-22', OLDEST);
  assert.equal(w.b, null);
  assert.equal(w.comparable, false);
});

// ---------------------------------------------------------------------------
group('GA4 tracking-start detection');
const LIVE = days('2026-09-12', '2026-09-24');
await test('years-old stray hits outside the lookback don\'t count as "recording since then"', () => {
  const recorded = ['2023-05-01', '2023-05-02', ...LIVE];
  const c = D.periodCoverage(range('2026-08-28', '2026-09-24'), recorded);
  assert.equal(c.status, 'partial');
  assert.equal(c.runStart, '2026-09-12');
  assert.equal(c.recordedDays, 13);
  assert.equal(c.totalDays, 28);
  assert.equal(c.strayDays, 0);
  assert.deepEqual(c.effective, range('2026-09-12', '2026-09-24'));
});
await test('stray hits inside the lookback, cut off by >7 silent days, are not the start either', () => {
  const recorded = ['2026-08-22', '2026-08-30', ...LIVE];
  const c = D.periodCoverage(range('2026-08-28', '2026-09-24'), recorded);
  assert.equal(c.runStart, '2026-09-12');
  assert.equal(c.strayDays, 1, 'the Aug 30 hit is inside the period and must be left out of totals');
});
await test('quiet days (up to 7 in a row) inside a run are still "recording"', () => {
  const recorded = [...days('2026-08-01', '2026-08-10'), ...days('2026-08-18', '2026-09-24')]; // 7 silent days
  assert.equal(D.periodCoverage(range('2026-08-05', '2026-09-24'), recorded).status, 'full');
  assert.equal(D.trackingRunStart(['2026-08-01', '2026-08-09']), '2026-08-01', '7 silent days (Aug 2–8) → same run');
  assert.equal(D.trackingRunStart(['2026-08-01', '2026-08-10']), '2026-08-10', '8 silent days (Aug 2–9) → recording restarted');
  assert.equal(D.trackingRunStart(['2026-08-01', '2026-08-10'], 8), '2026-08-01', 'a wider margin tolerates 8');
});
await test('recording that began in the margin week covers the whole period', () => {
  const c = D.periodCoverage(range('2026-09-15', '2026-09-24'), LIVE);
  assert.equal(c.status, 'full');
  assert.equal(c.recordedDays, 10);
});
await test('a period before recording began has no data at all (not zeros)', () => {
  const c = D.periodCoverage(range('2026-07-31', '2026-08-27'), ['2023-05-01', ...LIVE]);
  assert.equal(c.status, 'none');
  assert.equal(c.recordedDays, 0);
  assert.equal(c.effective, null);
});
await test('recording from the very first day of the period is full coverage', () => {
  assert.equal(D.periodCoverage(range('2026-09-12', '2026-09-24'), LIVE).status, 'full');
});
// The report looks at both periods through one window that runs to today.
const TODAY_LIVE = days('2026-09-12', '2026-09-25');
await test('regression: a lone stray hit inside the comparison period is not "recording began"', () => {
  // Aug 20 stray; real recording from Sep 12. The previous period (Jul 31 – Aug 27)
  // must read as not recorded — not "partly recorded from Aug 20".
  const c = D.trackingCoverage({ a: range('2026-08-28', '2026-09-24'), b: range('2026-07-31', '2026-08-27') }, ['2026-08-20', ...TODAY_LIVE]);
  assert.equal(c.runStart, '2026-09-12');
  assert.equal(c.a.status, 'partial');
  assert.equal(c.a.recordedDays, 13);
  assert.equal(c.b.status, 'none');
  assert.equal(c.b.strayDays, 1);
});
await test('a period made only of stray hits, with no comparison, is still "no data"', () => {
  const c = D.trackingCoverage({ a: range('2026-08-01', '2026-08-27'), b: null }, ['2026-08-20', ...TODAY_LIVE]);
  assert.equal(c.a.status, 'none');
  assert.equal(c.b, null);
});
await test('same period last year with recording throughout: both fully covered', () => {
  const recorded = days('2025-09-01', '2026-09-25');
  const c = D.trackingCoverage({ a: range('2026-09-18', '2026-09-24'), b: range('2025-09-18', '2025-09-24') }, recorded);
  assert.equal(c.a.status, 'full');
  assert.equal(c.b.status, 'full');
});
await test('a later comparison period (B after A) is judged by the same run', () => {
  const c = D.trackingCoverage({ a: range('2026-09-01', '2026-09-07'), b: range('2026-09-14', '2026-09-20') }, TODAY_LIVE);
  assert.equal(c.a.status, 'none');
  assert.equal(c.b.status, 'full');
});

// ---------------------------------------------------------------------------
group('response shaping');
await test('kpi(): % change, direction, lower-is-better, new, none', () => {
  assert.deepEqual(report.kpi(120, 100), { a: 120, b: 100, change: 0.2, changeKind: 'pct', better: true });
  assert.equal(report.kpi(80, 100).better, false);
  assert.equal(report.kpi(8, 10, { lowerIsBetter: true }).better, true, 'position 10 → 8 is better');
  assert.equal(report.kpi(12, 10, { lowerIsBetter: true }).better, false);
  assert.deepEqual(report.kpi(5, 0), { a: 5, b: 0, change: null, changeKind: 'new', better: true });
  assert.deepEqual(report.kpi(0, 0), { a: 0, b: 0, change: 0, changeKind: 'pct', better: null });
  assert.equal(report.kpi(5, null).changeKind, 'none');
  assert.equal(report.kpi(5, 4, { comparable: false }).changeKind, 'none');
  assert.equal(report.kpi(1000, 1001).better, null, 'under 0.5% is no news');
});
const twoRangeReport = (dimNames, rows, metricNames) => ({
  dimensionHeaders: [...dimNames, 'dateRange'].map((name) => ({ name })),
  metricHeaders: metricNames.map((name) => ({ name, type: 'TYPE_INTEGER' })),
  rows: rows.map(([keys, rangeName, values]) => ({
    dimensionValues: [...keys, rangeName].map((value) => ({ value })),
    metricValues: values.map((v) => ({ value: String(v) })),
  })),
  rowCount: rows.length,
});
await test('GA4 rows are read with and without the dateRange dimension', () => {
  const two = ga4.parseRows(twoRangeReport(['city', 'region'], [[['Reno', 'Nevada'], 'b', [4]]], ['totalUsers']));
  assert.deepEqual(two, [{ range: 'b', key: ['Reno', 'Nevada'], m: { totalUsers: 4 } }]);
  const one = ga4.parseRows({ dimensionHeaders: [{ name: 'date' }], metricHeaders: [{ name: 'totalUsers' }], rows: [{ dimensionValues: [{ value: '20260912' }], metricValues: [{ value: '7' }] }] });
  assert.deepEqual(one, [{ range: 'a', key: ['20260912'], m: { totalUsers: 7 } }]);
  assert.deepEqual(ga4.parseRows({}), []);
});
await test('side-by-side tables: top by A, B for the same keys, B-only rows when asked', () => {
  const rows = ga4.parseRows(twoRangeReport(['sessionDefaultChannelGroup'], [
    [['Organic Search'], 'a', [50]], [['Organic Search'], 'b', [40]],
    [['Direct'], 'a', [30]],
    [['Paid Search'], 'b', [12]],
    [['Referral'], 'a', [30]], [['Referral'], 'b', [45]],
  ], ['sessions']));
  const t = report.compareRows(rows, 'sessions', { includeBOnly: true });
  assert.deepEqual(t.map((r) => [r.key[0], r.a, r.b]), [['Organic Search', 50, 40], ['Referral', 30, 45], ['Direct', 30, 0], ['Paid Search', 0, 12]]);
  assert.equal(t[0].change, 0.25);
  assert.equal(t[2].changeKind, 'new');
  assert.equal(report.compareRows(rows, 'sessions').length, 3, 'B-only rows left out by default');
  assert.deepEqual(report.compareRows(rows, 'sessions', { bKnown: false }).map((r) => r.b), [null, null, null]);
  assert.equal(report.compareRows(rows, 'sessions', { limit: 1 }).length, 1);
});
await test('daily series: null before recording began, 0 for a recorded day without visits', () => {
  const period = range('2026-09-10', '2026-09-14');
  const cov = D.periodCoverage(period, days('2026-09-12', '2026-09-14'));
  const rows = [{ range: 'a', key: ['20260912'], m: { totalUsers: 9 } }, { range: 'a', key: ['20260914'], m: { totalUsers: 3 } }];
  assert.deepEqual(report.dailySeries(period, cov, rows, 'a').map((p) => p.value), [null, null, 9, 0, 3]);
  const none = D.periodCoverage(period, []);
  assert.deepEqual(report.dailySeries(period, none, rows, 'a').map((p) => p.value), [null, null, null, null, null]);
});
function ga4Fixture({ aTotals, bTotals, aLeads, bLeads }) {
  const totals = twoRangeReport([], [['a', aTotals], ...(bTotals ? [['b', bTotals]] : [])].map(([r, v]) => [[], r, v]),
    ['totalUsers', 'sessions', 'screenPageViews', 'userEngagementDuration']);
  const leads = twoRangeReport([], [['a', [aLeads]], ...(bLeads != null ? [['b', [bLeads]]] : [])].map(([r, v]) => [[], r, v]), ['eventCount']);
  return { totals, leads };
}
await test('GA4 block when recording began mid-period: no fake zeros, no fake change', () => {
  const periods = { a: range('2026-08-28', '2026-09-24'), b: range('2026-07-31', '2026-08-27') };
  const coverage = D.trackingCoverage(periods, TODAY_LIVE);
  const reports = ga4Fixture({ aTotals: [412, 530, 1300, 530 * 83], aLeads: 6 });
  const tableRows = { channels: [], leadSources: [], pages: [], cities: [], devices: [] };
  const out = report.shapeGa4({ periods, coverage, dailyRows: [], reports, tableRows });
  assert.equal(out.comparable, false);
  assert.deepEqual(out.kpis.visitors, { a: 412, b: null, change: null, changeKind: 'none', better: null });
  assert.equal(out.kpis.engagedPerVisit.a, 83);
  assert.equal(out.kpis.leads.a, 6);
  assert.ok(Math.abs(out.kpis.leadRate.a - 6 / 530) < 1e-12);
  assert.equal(out.daily.a.filter((p) => p.value === null).length, 15, 'Aug 28 – Sep 11 not recorded');
  assert.ok(out.daily.b.every((p) => p.value === null));
});
await test('GA4 block with both periods fully recorded compares them', () => {
  const periods = { a: range('2026-10-01', '2026-10-07'), b: range('2026-09-24', '2026-09-30') };
  const coverage = D.trackingCoverage(periods, days('2026-09-12', '2026-10-08'));
  const reports = ga4Fixture({ aTotals: [120, 150, 400, 150 * 60], bTotals: [100, 120, 360, 120 * 50], aLeads: 3, bLeads: 0 });
  const out = report.shapeGa4({ periods, coverage, dailyRows: [], reports, tableRows: { channels: [], leadSources: [], pages: [], cities: [], devices: [] } });
  assert.equal(out.comparable, true);
  assert.equal(out.kpis.visitors.change, 0.2);
  assert.equal(out.kpis.visits.change, 0.25);
  assert.equal(out.kpis.engagedPerVisit.change, 0.2);
  assert.equal(out.kpis.leads.changeKind, 'new');
});
await test('Search Console block: position is lower-is-better; missing B rows are 0', () => {
  const w = D.gscWindows(range('2026-09-18', '2026-09-24'), range('2026-09-11', '2026-09-17'), '2026-09-22', OLDEST);
  const tA = { clicks: 30, impressions: 1200, ctr: 0.025, position: 8.4 };
  const tB = { clicks: 20, impressions: 1000, ctr: 0.02, position: 10.5 };
  const q = { aRows: [{ keys: ['flooring carson city'], clicks: 10, impressions: 90, position: 3.1 }, { keys: ['lvp reno'], clicks: 2, impressions: 40, position: 7 }], bRows: [{ keys: ['flooring carson city'], clicks: 5, impressions: 70, position: 4 }] };
  const out = report.shapeGsc(w, tA, tB, q, { aRows: [], bRows: [] });
  assert.equal(out.kpis.position.better, true);
  assert.equal(out.kpis.clicks.change, 0.5);
  assert.deepEqual(out.tables.queries.map((r) => [r.key[0], r.a, r.b]), [['flooring carson city', 10, 5], ['lvp reno', 2, 0]]);
  const noB = report.shapeGsc(D.gscWindows(range('2026-09-18', '2026-09-24'), null, '2026-09-22', OLDEST), tA, null, q, { aRows: [], bRows: null });
  assert.equal(noB.kpis.clicks.b, null);
  assert.equal(noB.tables.queries[0].b, null);
  assert.equal(report.shapeGsc(w, { clicks: 0, impressions: 0, position: 0 }, tB, { aRows: [], bRows: [] }, { aRows: [], bRows: [] }).kpis.position.a, null, 'no impressions → no position');
});
await test('Search Console top rows sort by clicks, then impressions; regex keys are escaped', () => {
  const top = gsc.pickTop([
    { keys: ['a'], clicks: 0, impressions: 500 }, { keys: ['b'], clicks: 3, impressions: 10 },
    { keys: ['c'], clicks: 0, impressions: 900 }, { keys: ['d'], clicks: 0, impressions: 0 },
  ]);
  assert.deepEqual(top.map((r) => r.keys[0]), ['b', 'c', 'a']);
  assert.equal(gsc.reEscape('https://landmarkflooringusa.com/flooring/?a=1+2'), 'https://landmarkflooringusa\\.com/flooring/\\?a=1\\+2');
});
await test('notes: plain-English honesty notes', () => {
  const periods = { a: range('2026-08-28', '2026-09-24'), b: range('2026-07-31', '2026-08-27'), includesToday: false };
  const g = { status: 'ok', thresholded: false, coverage: D.trackingCoverage(periods, ['2026-08-20', ...TODAY_LIVE]) };
  const s = { status: 'ok', lagDays: 3, windows: D.gscWindows(periods.a, periods.b, '2026-09-22', OLDEST) };
  const notes = report.buildNotes({ periods, ga4: g, gsc: s });
  const tracking = notes.find((n) => n.kind === 'tracking').text;
  assert.match(tracking, /^Google Analytics began recording on Sep 12, 2026 — earlier days have no data\./);
  assert.match(tracking, /cover 13 of its 28 days/);
  assert.match(tracking, /The comparison period \(Jul 31 – Aug 27, 2026\) has no website figures, so no change is shown\./);
  assert.match(tracking, /stray hits/);
  assert.match(notes.find((n) => n.kind === 'search').text, /cover Aug 28 – Sep 22, 2026 vs Jul 31 – Aug 25, 2026/);
  // Only the comparison period predates recording: the note still names the start date first.
  const yoy = { a: range('2026-09-18', '2026-09-24'), b: range('2025-09-18', '2025-09-24'), includesToday: false };
  const yoyNote = report.buildNotes({ periods: yoy, ga4: { status: 'ok', coverage: D.trackingCoverage(yoy, TODAY_LIVE) }, gsc: { status: 'error' } })[0].text;
  assert.equal(yoyNote, 'Google Analytics began recording on Sep 12, 2026 — earlier days have no data. The comparison period (Sep 18 – 24, 2025) has no website figures, so no change is shown.');
  // Fully recorded periods need no tracking note at all.
  const full = { a: range('2026-09-18', '2026-09-24'), b: range('2026-09-13', '2026-09-17'), includesToday: false };
  assert.deepEqual(report.buildNotes({ periods: full, ga4: { status: 'ok', coverage: D.trackingCoverage(full, TODAY_LIVE) }, gsc: { status: 'error' } }), []);
  assert.ok(report.buildNotes({ periods: { ...periods, includesToday: true }, ga4: { status: 'error' }, gsc: { status: 'error' } }).some((n) => n.kind === 'today'));
});
await test('Google errors become the friendly "access not granted yet" states', () => {
  const cfg = { clientEmail: 'chamber-dashboard@chamber-dashboard-506621.iam.gserviceaccount.com', propertyId: '546190207', siteUrl: 'sc-domain:landmarkflooringusa.com' };
  const quiet = console.error;
  console.error = () => {};
  try {
    const ga = report.describeError(new google.GoogleError('User does not have sufficient permissions for this property.', { api: 'ga4', httpStatus: 403, status: 'PERMISSION_DENIED' }), 'ga4', cfg);
    assert.equal(ga.code, 'no-access');
    assert.equal(ga.title, 'Google Analytics access not granted yet');
    assert.match(ga.detail, /chamber-dashboard@chamber-dashboard-506621\.iam\.gserviceaccount\.com/);
    const sc = report.describeError(new google.GoogleError("User does not have sufficient permission for site 'sc-domain:landmarkflooringusa.com'.", { api: 'gsc', httpStatus: 403, reason: 'forbidden' }), 'gsc', cfg);
    assert.equal(sc.title, 'Search Console access not granted yet');
  } finally {
    console.error = quiet;
  }
  const cls = (e) => google.classifyGoogleError(e);
  assert.equal(cls(new google.GoogleError('Google Analytics Admin API has not been used in project 1 before or it is disabled.', { api: 'ga4-admin', httpStatus: 403, status: 'PERMISSION_DENIED', reason: 'SERVICE_DISABLED' })), 'api-disabled');
  assert.equal(cls(new google.GoogleError('Invalid JWT Signature.', { api: 'token', httpStatus: 400, reason: 'invalid_grant' })), 'credentials');
  assert.equal(cls(new google.GoogleError('Could not reach Google.', { api: 'ga4', kind: 'network' })), 'network');
  assert.equal(cls(new google.GoogleError('Quota', { api: 'gsc', httpStatus: 429 })), 'quota');
  assert.equal(cls(new Error('bug')), 'unknown');
});
await test('"Estimate requests" = generate_lead, minus the /text-updates/ SMS opt-in form', () => {
  const ex = ga4.LEAD_FILTER.andGroup.expressions;
  assert.equal(ex[0].filter.stringFilter.value, 'generate_lead');
  assert.equal(ex[1].notExpression.filter.fieldName, 'pagePath');
  assert.equal(ex[1].notExpression.filter.stringFilter.value, '/text-updates');
});
await test('every report asks for both periods at once (multiple dateRanges); daily is one window', () => {
  const specs = ga4.reportSpecs({ a: range('2026-09-18', '2026-09-24'), b: range('2026-09-11', '2026-09-17') }, range('2026-09-04', '2026-09-25'));
  assert.deepEqual(Object.keys(specs), ['totals', 'leads', 'channels', 'leadSources', 'pages', 'cities', 'devices', 'daily']);
  for (const [name, s] of Object.entries(specs)) {
    assert.deepEqual(s.dateRanges.map((r) => r.name), name === 'daily' ? ['window'] : ['a', 'b'], name);
  }
  assert.deepEqual(specs.daily.dateRanges[0], { startDate: '2026-09-04', endDate: '2026-09-25', name: 'window' });
});

// ---------------------------------------------------------------------------
group('request helpers');
await test('the post-sign-in redirect only ever carries a /dashboard query string', () => {
  assert.equal(http.sanitizeNext('?range=last7&compare=yoy'), '?range=last7&compare=yoy');
  assert.equal(http.sanitizeNext('?range=last7&signin=failed'), '?range=last7');
  for (const bad of ['//evil.example', 'https://evil.example', '/other', '?x=<script>', '?a=b c', 'x']) assert.equal(http.sanitizeNext(bad), '', bad);
});
await test('cross-site POSTs are recognised', () => {
  const req = (headers) => ({ headers: { host: 'landmarkflooringusa.com', ...headers } });
  assert.equal(http.isCrossSite(req({})), false, 'no Origin (curl)');
  assert.equal(http.isCrossSite(req({ origin: 'https://landmarkflooringusa.com' })), false);
  assert.equal(http.isCrossSite(req({ origin: 'https://evil.example' })), true);
  assert.equal(http.isCrossSite(req({ origin: 'null' })), true);
  assert.equal(http.isCrossSite(req({ 'sec-fetch-site': 'cross-site' })), true);
});
await test('inline scripts can\'t close their own <script> tag', () => {
  assert.ok(!/<\/script/i.test(client.appScript) && !/<\/script/i.test(client.loginScript));
  assert.ok(client.appScript.startsWith('(function dashboardApp()'));
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
