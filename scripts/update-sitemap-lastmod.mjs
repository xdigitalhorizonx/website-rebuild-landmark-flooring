#!/usr/bin/env node
// Rewrites every <lastmod> in sitemap.xml from git: the date of the last commit that
// touched that page's index.html, or today when the file has uncommitted changes.
// Run it right before committing a change that touches pages:  node scripts/update-sitemap-lastmod.mjs
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const SITE = "https://landmarkflooringusa.com";
const today = new Date().toISOString().slice(0, 10);
const dirty = new Set(
  execSync("git status --porcelain", { encoding: "utf8" })
    .split("\n").filter(Boolean).map((l) => l.slice(3).trim().replace(/^"|"$/g, ""))
);
const fileFor = (path) => (path === "/" ? "index.html" : path.replace(/^\/|\/$/g, "") + "/index.html");
const gitDate = (file) => execSync(`git log -1 --format=%cs -- "${file}"`, { encoding: "utf8" }).trim();

let xml = readFileSync("sitemap.xml", "utf8");
let changed = 0;
xml = xml.replace(
  new RegExp(`(<loc>${SITE.replace(/[.]/g, "\.")}(/[^<]*)</loc>\s*<lastmod>)([^<]*)(</lastmod>)`, "g"),
  (m, open, path, old, close) => {
    const file = fileFor(path);
    const date = dirty.has(file) ? today : gitDate(file) || old;
    if (date !== old) changed++;
    return `${open}${date}${close}`;
  }
);
writeFileSync("sitemap.xml", xml);
console.log(`sitemap.xml: ${changed} lastmod value(s) updated`);
