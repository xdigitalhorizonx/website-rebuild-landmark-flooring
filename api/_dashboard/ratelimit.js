'use strict';
/**
 * Best-effort sign-in throttle: 5 failed attempts per IP address per 10 minutes.
 *
 * In memory, so it is per function instance and resets on a cold start — a brake
 * on password guessing, not a guarantee. scrypt already makes every attempt cost
 * ~50 ms. A successful sign-in clears that address's count.
 */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_FAILURES = 5;
const MAX_TRACKED = 5000;

function createLimiter({ windowMs = WINDOW_MS, maxFailures = MAX_FAILURES } = {}) {
  const buckets = new Map(); // ip → { count, first }

  function prune(now) {
    for (const [ip, b] of buckets) if (now - b.first >= windowMs) buckets.delete(ip);
    // Still full of live entries (a flood of addresses)? Drop the oldest.
    while (buckets.size > MAX_TRACKED) buckets.delete(buckets.keys().next().value);
  }

  return {
    /** { limited, retryAfterSeconds } — checked before the password is. */
    check(ip, now = Date.now()) {
      const b = buckets.get(ip);
      if (!b || now - b.first >= windowMs) return { limited: false, retryAfterSeconds: 0 };
      if (b.count < maxFailures) return { limited: false, retryAfterSeconds: 0 };
      return { limited: true, retryAfterSeconds: Math.max(1, Math.ceil((b.first + windowMs - now) / 1000)) };
    },
    fail(ip, now = Date.now()) {
      const b = buckets.get(ip);
      if (!b || now - b.first >= windowMs) buckets.set(ip, { count: 1, first: now });
      else b.count++;
      if (buckets.size > MAX_TRACKED) prune(now);
    },
    reset(ip) {
      buckets.delete(ip);
    },
    size() {
      return buckets.size;
    },
  };
}

module.exports = { createLimiter, WINDOW_MS, MAX_FAILURES, loginLimiter: createLimiter() };
