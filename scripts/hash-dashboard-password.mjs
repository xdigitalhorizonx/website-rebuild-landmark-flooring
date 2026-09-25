#!/usr/bin/env node
/**
 * Makes a password hash for DASHBOARD_USERS (the /dashboard sign-in list).
 *
 *   node scripts/hash-dashboard-password.mjs
 *       → asks for the password twice, without echoing it, and prints the hash
 *   node scripts/hash-dashboard-password.mjs --email jeff@landmarkflooringusa.com
 *       → prints the whole entry: jeff@landmarkflooringusa.com:scrypt$32768$8$1$…
 *   printf '%s' "$PASSWORD" | node scripts/hash-dashboard-password.mjs --email …
 *       → reads the password from the pipe instead of prompting (one trailing newline is dropped)
 *
 * The password is never accepted as a command-line argument: arguments end up in
 * shell history and in process listings. In Git Bash (mintty) Node can't see a
 * terminal, so run it as `winpty node scripts/hash-dashboard-password.mjs` for the
 * hidden prompt — or pipe the password in.
 *
 * Only the hash goes into Vercel (Settings → Environment Variables → DASHBOARD_USERS,
 * comma-separated `email:hash` entries). The hash is printed alone on stdout so it
 * can be captured; everything else goes to stderr.
 */

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { hashPassword, verifyPassword, MAX_PASSWORD_LENGTH } = require('../api/_dashboard/password.js');
const { EMAIL_RE, normalizeEmail } = require('../api/_dashboard/config.js');

const MIN_LENGTH = 12;

function usage(code = 0) {
  process.stderr.write(
    'Usage: node scripts/hash-dashboard-password.mjs [--email you@example.com]\n' +
    '  Prompts for the password (hidden), or reads it from stdin when piped.\n' +
    '  Never pass the password itself as an argument.\n');
  process.exit(code);
}

function parseArgs(argv) {
  let email = null;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') usage(0);
    else if (a === '--email') email = argv[++i] ?? '';
    else if (a.startsWith('--email=')) email = a.slice('--email='.length);
    else {
      process.stderr.write('Unexpected argument. The password is never taken from the command line — run the\n' +
        'script without it and type it at the prompt, or pipe it in on stdin.\n');
      process.exit(2);
    }
  }
  if (email !== null) {
    email = normalizeEmail(email);
    if (!EMAIL_RE.test(email)) {
      process.stderr.write(`"${email}" isn't an email address the dashboard accepts.\n`);
      process.exit(2);
    }
  }
  return { email };
}

/** One line from the terminal with echo off. Backspace and Ctrl-U edit; Ctrl-C cancels. */
function promptHidden(label) {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    let value = '';
    process.stderr.write(label);
    stdin.setRawMode(true);
    stdin.setEncoding('utf8');
    stdin.resume();
    const finish = (err) => {
      stdin.removeListener('data', onData);
      stdin.setRawMode(false);
      stdin.pause();
      process.stderr.write('\n');
      if (err) reject(err);
      else resolve(value);
    };
    function onData(chunk) {
      if (chunk.startsWith('\u001b')) return; // arrow keys and other escape sequences
      for (const ch of chunk) {
        if (ch === '\r' || ch === '\n') return finish();
        if (ch === '\u0003') return finish(new Error('Cancelled.'));
        if (ch === '\u0004') { if (!value) return finish(new Error('Cancelled.')); continue; }
        if (ch === '\u007f' || ch === '\b') { value = Array.from(value).slice(0, -1).join(''); continue; }
        if (ch === '\u0015') { value = ''; continue; }
        if (ch < ' ') continue;
        value += ch;
      }
    }
    stdin.on('data', onData);
  });
}

async function readPiped() {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(Buffer.from(c));
  return Buffer.concat(chunks).toString('utf8').replace(/\r?\n$/, '');
}

async function main() {
  const { email } = parseArgs(process.argv.slice(2));
  let password;
  if (process.stdin.isTTY) {
    password = await promptHidden('Password (hidden): ');
    const again = await promptHidden('Same password again: ');
    if (password !== again) throw new Error('The two passwords didn’t match. Nothing was produced.');
  } else {
    process.stderr.write('Reading the password from stdin…\n');
    password = await readPiped();
  }
  if (Array.from(password).length < MIN_LENGTH) throw new Error(`Use at least ${MIN_LENGTH} characters.`);
  if (password.length > MAX_PASSWORD_LENGTH) throw new Error(`Use at most ${MAX_PASSWORD_LENGTH} characters.`);

  const hash = await hashPassword(password);
  if (!(await verifyPassword(password, hash))) throw new Error('Self-check failed: the new hash does not verify.');

  process.stdout.write(`${email ? `${email}:` : ''}${hash}\n`);
  process.stderr.write(email
    ? 'Add that line to DASHBOARD_USERS in Vercel (comma-separate several people), then redeploy.\n'
    : 'Add it to DASHBOARD_USERS in Vercel as  email:hash  (comma-separate several people), then redeploy.\n');
}

main().catch((err) => {
  process.stderr.write(`${err && err.message ? err.message : err}\n`);
  process.exit(1);
});
