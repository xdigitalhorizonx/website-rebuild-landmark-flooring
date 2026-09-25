'use strict';
/**
 * Date arithmetic for the dashboard: the range presets, the comparison period,
 * Search Console's reporting lag, and how much of a period Google Analytics
 * actually recorded.
 *
 * Dates are 'YYYY-MM-DD' strings throughout (what both Google APIs speak), and the
 * arithmetic runs on UTC day numbers, so no time zone or daylight-saving change can
 * move a day. The one zone-aware step is deciding what "today" is: that uses the
 * GA4 property's time zone, because that is the calendar GA4 counts days in.
 * Pure functions, no I/O — scripts/check-dashboard.mjs tests them directly.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Used when the property's own time zone can't be read (the GA4 Admin API needs the
 * service account to have access, and the API enabled on its Cloud project).
 * Landmark is in Carson City, and Search Console reports in Pacific Time anyway.
 */
const FALLBACK_TIME_ZONE = 'America/Los_Angeles';
/** Search Console dates are always Pacific Time, whatever the GA4 property uses. */
const GSC_TIME_ZONE = 'America/Los_Angeles';
/** The earliest date the GA4 Data API accepts. */
const MIN_DATE = '2015-08-14';
/** Longest range the dashboard will ask Google for (3 years). */
const MAX_SPAN_DAYS = 1096;
/** Search Console's finished data usually runs 2–3 days behind; used when it can't be measured. */
const GSC_DEFAULT_LAG_DAYS = 3;
/** Search Console keeps about 16 months of data. */
const GSC_RETENTION_MONTHS = 16;
/** Silent days tolerated inside a run of GA4 recording (see periodCoverage). */
const TRACKING_MARGIN_DAYS = 7;

const PRESETS = Object.freeze({
  last7: 'Last 7 days',
  last28: 'Last 28 days',
  last90: 'Last 90 days',
  thisMonth: 'This month',
  lastMonth: 'Last month',
  thisYear: 'This year',
  last12m: 'Last 12 months',
  custom: 'Custom',
});
const COMPARES = Object.freeze({
  off: 'Off',
  previous: 'Previous period',
  yoy: 'Same period last year',
  custom: 'Custom',
});
const DEFAULT_PRESET = 'last28';
const DEFAULT_COMPARE = 'previous';

const pad = (n, w = 2) => String(n).padStart(w, '0');
const daysInMonth = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate(); // m is 1-based

function isIsoDate(s) {
  const m = ISO_RE.exec(String(s));
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  return y >= 1970 && mo >= 1 && mo <= 12 && d >= 1 && d <= daysInMonth(y, mo);
}

const dayNumber = (iso) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) / DAY_MS;
const fromDayNumber = (n) => new Date(n * DAY_MS).toISOString().slice(0, 10);
const addDays = (iso, n) => fromDayNumber(dayNumber(iso) + n);
/** Whole days from `from` to `to`: 0 for the same day, negative when `to` is earlier. */
const daysBetween = (from, to) => dayNumber(to) - dayNumber(from);
/** Days in a range, both ends included. */
const rangeDays = (r) => daysBetween(r.start, r.end) + 1;
const minDate = (a, b) => (a < b ? a : b);
const maxDate = (a, b) => (a > b ? a : b);

function eachDay(r) {
  const n = Math.max(0, rangeDays(r));
  return Array.from({ length: n }, (_, i) => addDays(r.start, i));
}

/** Calendar months later (or earlier), clamping the day: Mar 31 − 1 month = Feb 28/29. */
function addMonths(iso, n) {
  const y = +iso.slice(0, 4);
  const m = +iso.slice(5, 7);
  const d = +iso.slice(8, 10);
  const total = y * 12 + (m - 1) + n;
  const ny = Math.floor(total / 12);
  const nm = total - ny * 12 + 1;
  return `${pad(ny, 4)}-${pad(nm)}-${pad(Math.min(d, daysInMonth(ny, nm)))}`;
}
/** Feb 29 moved to a non-leap year lands on Feb 28. */
const addYears = (iso, n) => addMonths(iso, 12 * n);
const startOfMonth = (iso) => `${iso.slice(0, 8)}01`;
const startOfYear = (iso) => `${iso.slice(0, 4)}-01-01`;

/** Today's date on the calendar of `timeZone` (an IANA name). */
function todayIn(timeZone, now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const get = (t) => parts.find((p) => p.type === t).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function isValidTimeZone(tz) {
  if (typeof tz !== 'string' || !tz) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * A preset's dates for `today`. The rolling presets end yesterday, the last whole
 * day; "This month" and "This year" run to today, so their last day is still
 * filling in (the dashboard says so).
 */
function presetRange(preset, today) {
  const yesterday = addDays(today, -1);
  switch (preset) {
    case 'last7': return { start: addDays(yesterday, -6), end: yesterday };
    case 'last28': return { start: addDays(yesterday, -27), end: yesterday };
    case 'last90': return { start: addDays(yesterday, -89), end: yesterday };
    case 'thisMonth': return { start: startOfMonth(today), end: today };
    case 'lastMonth': {
      const end = addDays(startOfMonth(today), -1);
      return { start: startOfMonth(end), end };
    }
    case 'thisYear': return { start: startOfYear(today), end: today };
    // The rolling year ending yesterday: the day after the same date a year earlier.
    case 'last12m': return { start: addDays(addMonths(yesterday, -12), 1), end: yesterday };
    default: return null;
  }
}

/** Same length, immediately before. */
function previousPeriod(a) {
  const n = rangeDays(a);
  return { start: addDays(a.start, -n), end: addDays(a.start, -1) };
}

/** The same calendar dates a year earlier (Feb 29 → Feb 28). */
function samePeriodLastYear(a) {
  return { start: addYears(a.start, -1), end: addYears(a.end, -1) };
}

class RangeInputError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'RangeInputError';
    this.field = field;
  }
}

function customRange(from, to, today, field) {
  const which = field === 'compare' ? ' for the comparison' : '';
  if (!isIsoDate(from) || !isIsoDate(to)) throw new RangeInputError(`Pick a start and an end date${which}.`, field);
  if (from > to) throw new RangeInputError(`The start date${which} is after its end date.`, field);
  if (from > today) throw new RangeInputError(`Those dates${which} are in the future.`, field);
  if (from < MIN_DATE) throw new RangeInputError('Google Analytics has nothing before Aug 14, 2015 — pick a later start date.', field);
  const r = { start: from, end: minDate(to, today) }; // an end after today is read as today
  if (rangeDays(r) > MAX_SPAN_DAYS) throw new RangeInputError('Pick a range of 3 years or less.', field);
  return r;
}

/**
 * The query string (?range=&from=&to=&compare=&cfrom=&cto=) → the two periods.
 * Unknown preset/compare names fall back to the defaults; bad custom dates throw a
 * RangeInputError whose message is shown to the user as-is.
 */
function resolvePeriods(query, today) {
  const q = query || {};
  const preset = Object.prototype.hasOwnProperty.call(PRESETS, q.range) ? q.range : DEFAULT_PRESET;
  const compare = Object.prototype.hasOwnProperty.call(COMPARES, q.compare) ? q.compare : DEFAULT_COMPARE;
  const a = preset === 'custom' ? customRange(q.from, q.to, today, 'range') : presetRange(preset, today);
  let b = null;
  if (compare === 'previous') b = previousPeriod(a);
  else if (compare === 'yoy') b = samePeriodLastYear(a);
  else if (compare === 'custom') b = customRange(q.cfrom, q.cto, today, 'compare');
  if (b && b.end < MIN_DATE) throw new RangeInputError('The comparison period is before Google Analytics existed — pick a later one.', 'compare');
  if (b && b.start < MIN_DATE) b = { start: MIN_DATE, end: b.end };
  return { preset, compare, a, b, today, includesToday: a.end === today || (b ? b.end === today : false) };
}

/**
 * Search Console windows for the two periods.
 *
 * Search Console's finished data stops at `lastAvailable` (2–3 days back), and it
 * keeps roughly 16 months (`oldestAvailable`). Period A is cut to what exists. To
 * keep the comparison fair, B loses the same number of days from its end that A
 * lost to the lag — otherwise every "last 7 days vs the 7 before" would show search
 * down ~40% purely because the newest days haven't arrived. When either period
 * still loses days on top of that (it reaches past what Google keeps, or a custom
 * B is recent enough to hit the lag itself), no change is claimed.
 */
function gscWindows(a, b, lastAvailable, oldestAvailable) {
  const aEnd = minDate(a.end, lastAvailable);
  const trimmedDays = Math.max(0, daysBetween(aEnd, a.end));
  const aStart = maxDate(a.start, oldestAvailable);
  const aw = aStart <= aEnd ? { start: aStart, end: aEnd } : null;
  const aStartClipped = aStart > a.start;
  let bw = null;
  let bStartClipped = false; // B reaches back past what Google keeps
  let bEndClipped = false; // a custom B recent enough to hit the lag itself
  if (b && aw) {
    const wantedEnd = addDays(b.end, -trimmedDays);
    const bEnd = minDate(wantedEnd, lastAvailable);
    const bStart = maxDate(b.start, oldestAvailable);
    bStartClipped = bStart > b.start;
    bEndClipped = bEnd < wantedEnd;
    bw = bStart <= bEnd ? { start: bStart, end: bEnd } : null;
  }
  return {
    a: aw,
    b: bw,
    trimmedDays,
    lastAvailable,
    oldestAvailable,
    aStartClipped,
    bStartClipped,
    bEndClipped,
    comparable: Boolean(aw && bw && !aStartClipped && !bStartClipped && !bEndClipped),
  };
}

/**
 * The first day of the run of GA4 recording that ends at the latest recorded day:
 * walk back through the recorded days and stop at the first silence longer than
 * `marginDays`. Stray hits separated from the run by more than that are not part
 * of it.
 */
function trackingRunStart(recordedDates, marginDays = TRACKING_MARGIN_DAYS) {
  const dates = [...new Set(recordedDates)].sort();
  if (!dates.length) return null;
  let start = dates[dates.length - 1];
  for (let i = dates.length - 2; i >= 0; i--) {
    if (daysBetween(dates[i], start) - 1 > marginDays) break;
    start = dates[i];
  }
  return start;
}

/**
 * How much of `period` falls inside the run of recording that began on `runStart`.
 *
 *   full    — recording covers the whole period (it began on or before day one)
 *   partial — recording began partway through; days before `runStart` have no data
 *   none    — the period ends before recording began (or nothing was recorded)
 *
 * `effective` is the recorded part of the period. `strayDays` counts days inside
 * the period, before `runStart`, that nonetheless have hits (strays) — their
 * numbers must be left out of the totals.
 */
function coverageFromRun(period, runStart, recordedDates = []) {
  const totalDays = rangeDays(period);
  const strays = () => recordedDates.filter((d) => d >= period.start && d <= period.end && d < runStart).length;
  if (!runStart || runStart > period.end) {
    return { status: 'none', runStart: runStart || null, recordedDays: 0, totalDays, effective: null, strayDays: runStart ? strays() : 0 };
  }
  if (runStart <= period.start) {
    return { status: 'full', runStart, recordedDays: totalDays, totalDays, effective: { start: period.start, end: period.end }, strayDays: 0 };
  }
  return {
    status: 'partial',
    runStart,
    recordedDays: daysBetween(runStart, period.end) + 1,
    totalDays,
    effective: { start: runStart, end: period.end },
    strayDays: strays(),
  };
}

/**
 * Which days of each period Google Analytics was recording.
 *
 * `recordedDates` are the days GA4 returned any activity for, over ONE continuous
 * window: from `marginDays` before the earlier period's start up to today. That is a
 * short lookback around the requested ranges — never "the earliest date ever". A
 * property can hold stray hits from years before its tag went live (the Chamber's
 * did); searching from the beginning of time finds those, concludes the property has
 * been recording ever since, and turns every unrecorded day into a fake "zero
 * visitors".
 *
 * The current run of recording is found once, for both periods: walk back from the
 * newest recorded day and stop at the first silence longer than `marginDays` (GA4
 * leaves out days with no activity at all, so a quiet site can have a few silent
 * days). Because the window reaches today, a stray hit inside a period — a preview
 * load weeks before go-live — is seen for what it is: activity cut off from the real
 * run by a long silence. Looking only inside each period's own window would mistake
 * a lone stray for the day recording began.
 *
 * Deliberately not attempted: telling a tag outage from a quiet spell once a run is
 * under way — a gap longer than the margin reads as recording (re)starting after it.
 */
function trackingCoverage({ a, b }, recordedDates, marginDays = TRACKING_MARGIN_DAYS) {
  const dates = recordedDates || [];
  const runStart = trackingRunStart(dates, marginDays);
  return {
    runStart,
    a: coverageFromRun(a, runStart, dates),
    b: b ? coverageFromRun(b, runStart, dates) : null,
  };
}

/** Single-period form: the run is searched for from `marginDays` before the period to its end. */
function periodCoverage(period, recordedDates, marginDays = TRACKING_MARGIN_DAYS) {
  const from = addDays(period.start, -marginDays);
  const inWindow = (recordedDates || []).filter((d) => d >= from && d <= period.end);
  return coverageFromRun(period, trackingRunStart(inWindow, marginDays), inWindow);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** 'Sep 12, 2026' */
function formatDate(iso) {
  return `${MONTHS[+iso.slice(5, 7) - 1]} ${+iso.slice(8, 10)}, ${iso.slice(0, 4)}`;
}

/** 'Sep 1 – 24, 2026', 'Aug 28 – Sep 24, 2026', 'Dec 28, 2025 – Jan 3, 2026', 'Sep 24, 2026' */
function formatRange(r) {
  if (!r) return '';
  const [sy, sm, sd] = [r.start.slice(0, 4), +r.start.slice(5, 7), +r.start.slice(8, 10)];
  const [ey, em, ed] = [r.end.slice(0, 4), +r.end.slice(5, 7), +r.end.slice(8, 10)];
  if (r.start === r.end) return formatDate(r.start);
  if (sy !== ey) return `${formatDate(r.start)} – ${formatDate(r.end)}`;
  if (sm !== em) return `${MONTHS[sm - 1]} ${sd} – ${MONTHS[em - 1]} ${ed}, ${ey}`;
  return `${MONTHS[sm - 1]} ${sd} – ${ed}, ${ey}`;
}

module.exports = {
  FALLBACK_TIME_ZONE,
  GSC_TIME_ZONE,
  MIN_DATE,
  MAX_SPAN_DAYS,
  GSC_DEFAULT_LAG_DAYS,
  GSC_RETENTION_MONTHS,
  TRACKING_MARGIN_DAYS,
  PRESETS,
  COMPARES,
  DEFAULT_PRESET,
  DEFAULT_COMPARE,
  RangeInputError,
  isIsoDate,
  addDays,
  daysBetween,
  rangeDays,
  eachDay,
  addMonths,
  addYears,
  minDate,
  maxDate,
  todayIn,
  isValidTimeZone,
  presetRange,
  previousPeriod,
  samePeriodLastYear,
  customRange,
  resolvePeriods,
  gscWindows,
  trackingRunStart,
  coverageFromRun,
  trackingCoverage,
  periodCoverage,
  formatDate,
  formatRange,
};
