#!/usr/bin/env node
// CHAT-LIVE-01 — builds the separate chat TEST site from the production source
// WITHOUT editing any production file. Fails closed (exit 1, nothing written)
// on any missing/placeholder/production-looking value or any leftover
// production string/contact channel in the output.
//   node tools/build-chat-live.js --config <config.json> --out <dir>
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.resolve(__dirname, "..");
const PRODUCTION_PROJECT = "huahin-properties-5f1b5";
// Closure computed from index.html's dc-imports/imports (CHAT-LIVE-01 scope doc §2).
const FILES = ["index.html", "support.js", "image-slot.js", "data.js", "favorites.js", "firebase-client.js",
  "conversation-firestore.js", "conversation-store.js", "case-fields.js", "ContactRail.dc.html", "PropertyCard.dc.html", "LanguageSwitcher.dc.html", "logo.png"];
const REQUIRED = ["projectId", "apiKey", "appId", "messagingSenderId", "authDomain", "storageBucket", "region"];
const PROJECT_ID_RE = /^huahin-chat-test-[a-z0-9]+(-[a-z0-9]+)*$/; // same rule the Function gate uses (functions/chat-test-gate.js)
// The claudeComplete endpoint is DERIVED from the test project id, never accepted from the config:
// a URL of another project can therefore never pass just because its domain looks right.
const claudeCompleteUrlFor = (pid) => "https://asia-southeast1-" + pid + ".cloudfunctions.net/claudeComplete";
const MARKER = ".chat-live-output";
const FORBIDDEN = [/huahin-properties-5f1b5/i, /5f1b5/i, /auth\.huahin\.properties/i, /claudecomplete-3j4ldf4pja/i,
  /https?:\/\/([a-z0-9-]+\.)*huahin\.properties/i,
  /0851785480|0805820777|doothailand|facebook\.com\/groups\/\d|m\.me\/huahin/i,
  /(^|[^_a-zA-Z])password:\s*"(?!SYNTHETIC)/,
  /line\.me\/(R\/)?ti\/p\//i, /lin\.ee\//i, /mailto:/i, /tel:\+66/i, /wa\.me\/66/i];

function fail(msg) { const e = new Error(msg); e.chatLive = true; throw e; }

function validate(c) {
  if (!c || typeof c !== "object") fail("config is not an object");
  for (const k of REQUIRED) {
    const v = c[k];
    if (typeof v !== "string" || !v.trim() || /REPLACE_ME/i.test(v)) fail("config missing or placeholder: " + k);
  }
  const blob = JSON.stringify(c);
  if (/5f1b5|huahin-properties-5f1b5|auth\.huahin\.properties|claudecomplete-3j4ldf4pja/i.test(blob)) fail("config contains a production value");
  if (c.projectId === PRODUCTION_PROJECT) fail("projectId is production");
  if (c.projectId.length > 30 || !PROJECT_ID_RE.test(c.projectId)) fail("projectId must look like huahin-chat-test-<suffix> (max 30 chars) so a real project is never used by mistake");
  if (c.authDomain !== c.projectId + ".firebaseapp.com") fail("authDomain must be <projectId>.firebaseapp.com");
  if (!c.storageBucket.startsWith(c.projectId + ".")) fail("storageBucket must belong to the test project");
  if (c.region !== "asia-southeast1") fail("region must stay asia-southeast1 (matches the Functions region)");
  if (c.claudeCompleteUrl !== undefined && c.claudeCompleteUrl !== claudeCompleteUrlFor(c.projectId)) fail("claudeCompleteUrl must be exactly " + claudeCompleteUrlFor(c.projectId) + " (derived from projectId; run.app URLs are not accepted without separate evidence)");
}

function replaceExact(text, from, to, file, label) {
  const parts = text.split(from);
  if (parts.length < 2) fail("patch target not found (" + label + ") in " + file + " — source changed, rebuild refused");
  return parts.join(to);
}

// ── output-folder safety ────────────────────────────────────────────────
// build() deletes the output folder before rewriting it, so the target is
// restricted BEFORE anything is read, built or removed: it must be strictly
// inside an allowed base (default <repo>/build), contain no symlink on the way,
// not be/contain/sit above the repo or any source folder, and — if it already
// exists — be empty or carry the marker file written by an earlier build.
function realpathLoose(p) { // realpath of the deepest existing ancestor + the not-yet-existing remainder
  let cur = path.resolve(p), rest = [];
  while (!fs.existsSync(cur)) { rest.unshift(path.basename(cur)); const up = path.dirname(cur); if (up === cur) break; cur = up; }
  return path.join(fs.realpathSync(cur), ...rest);
}
function within(child, parent) { const r = path.relative(parent, child); return r !== "" && !r.startsWith("..") && !path.isAbsolute(r); }
function checkOutDir(outDir, root, bases) {
  if (typeof outDir !== "string" || !outDir.trim() || outDir.indexOf("\0") !== -1) fail("output folder is empty/invalid");
  const abs = path.resolve(outDir);
  if (abs === path.parse(abs).root) fail("output folder is the filesystem root");
  const real = realpathLoose(abs);
  const realRoot = fs.realpathSync(root);
  if (real === realRoot || within(realRoot, real)) fail("output folder is, or contains, the repo/source root");
  for (const f of FILES) { const sp = path.join(realRoot, f); if (real === sp || within(sp, real)) fail("output folder would contain a source file: " + f); }
  // lexical position first (so a symlink is seen as a symlink, not silently resolved), then the real position
  const lexBase = bases.map((b) => path.resolve(b)).find((b) => within(abs, b));
  if (!lexBase) fail("output folder must be strictly inside the designated output area (" + bases.join(", ") + ")");
  let cur = lexBase;
  if (fs.existsSync(cur) && fs.lstatSync(cur).isSymbolicLink()) fail("output area is a symlink: " + cur);
  for (const part of path.relative(lexBase, abs).split(path.sep)) { cur = path.join(cur, part); if (fs.existsSync(cur) && fs.lstatSync(cur).isSymbolicLink()) fail("output path contains a symlink: " + cur); }
  const realBase = realpathLoose(lexBase);
  if (!within(real, realBase)) fail("output folder resolves outside the designated output area");
  if (fs.existsSync(real)) {
    if (!fs.statSync(real).isDirectory()) fail("output path exists and is not a directory");
    const entries = fs.readdirSync(real);
    if (entries.length && !entries.includes(MARKER)) fail("output folder is not empty and was not created by this build (no " + MARKER + " marker) — refusing to delete it");
  }
  return real;
}

function build(config, outDir, root, opts) {
  root = root || ROOT;
  const bases = (opts && opts.outputBases) || [path.join(root, "build")];
  validate(config);
  outDir = checkOutDir(outDir, root, bases);
  const pid = config.projectId;
  const ccUrl = claudeCompleteUrlFor(pid);
  const fnHost = "asia-southeast1-" + pid + ".cloudfunctions.net";
  const out = {};
  for (const f of FILES) {
    const p = path.join(root, f);
    if (!fs.existsSync(p)) fail("required source file missing: " + f);
    out[f] = fs.readFileSync(p);
  }
  const txt = (f) => out[f].toString("utf8");

  // firebase-client.js — config block + every Function host.
  let fc = txt("firebase-client.js");
  const cfgRe = /const firebaseConfig = \{[\s\S]*?\n\};/;
  if (!cfgRe.test(fc)) fail("firebaseConfig block not found in firebase-client.js");
  fc = fc.replace(cfgRe, () => "const firebaseConfig = " + JSON.stringify({
    apiKey: config.apiKey, authDomain: config.authDomain, projectId: pid,
    storageBucket: config.storageBucket, messagingSenderId: config.messagingSenderId, appId: config.appId }, null, 2) + ";");
  fc = replaceExact(fc, "asia-southeast1-" + PRODUCTION_PROJECT + ".cloudfunctions.net", fnHost, "firebase-client.js", "function host");
  fc = replaceExact(fc, "https://claudecomplete-3j4ldf4pja-as.a.run.app", ccUrl, "firebase-client.js", "claudeComplete");
  // Comments in the production file that name production hosts are harmless text but would trip the scan.
  fc = fc.replace(/auth\.huahin\.properties/g, "<custom-auth-domain>").replace(/huahin-properties-5f1b5/g, "<production-project>");
  // Admin-only Facebook-post default footer holds real phone numbers / e-mail / LINE / group links: replace with synthetic text.
  const fbRe = /const DEFAULT_FB_FOOTER = `[\s\S]*?`;/;
  if (!fbRe.test(fc)) fail("DEFAULT_FB_FOOTER not found in firebase-client.js");
  fc = fc.replace(fbRe, () => "const DEFAULT_FB_FOOTER = `TEST SITE - synthetic footer, no real contact details`;");
  // Shipped default admin credentials (plaintext) + real recovery contact: replace with synthetic values.
  const admRe = /const DEFAULT_ADMIN_CREDENTIALS = \{[\s\S]*?\n\};/;
  if (!admRe.test(fc)) fail("DEFAULT_ADMIN_CREDENTIALS not found in firebase-client.js");
  fc = fc.replace(admRe, () => 'const DEFAULT_ADMIN_CREDENTIALS = { username: "SYNTHETIC", password: "SYNTHETIC-DISABLED", recoveryEmail: "none@invalid.example", recoveryPhone: "0000000000" };');
  out["firebase-client.js"] = Buffer.from(fc);

  // ContactRail — claudeComplete URL, LINE default, and the Firebase ID token the
  // test-project claudeComplete will require (header added ONLY in this build).
  let cr = txt("ContactRail.dc.html");
  cr = replaceExact(cr, "https://claudecomplete-3j4ldf4pja-as.a.run.app", ccUrl, "ContactRail.dc.html", "claudeComplete");
  cr = replaceExact(cr, "https://line.me/ti/p/huahinproperties", "#chat-live-line-disabled", "ContactRail.dc.html", "LINE default");
  const hdrFrom = 'const res = await fetch(CLOUD_FN.claudeComplete, {\n          method: "POST",\n          headers: { "content-type": "application/json" },';
  const hdrTo = 'const __tok = await window.firebase.auth().currentUser.getIdToken();\n        const res = await fetch(CLOUD_FN.claudeComplete, {\n          method: "POST",\n          headers: { "content-type": "application/json", "authorization": "Bearer " + __tok },';
  cr = replaceExact(cr, hdrFrom, hdrTo, "ContactRail.dc.html", "fallback fetch headers");
  out["ContactRail.dc.html"] = Buffer.from(cr);

  // index.html — entry page: guard first, noindex, no canonical/OG/JSON-LD/Search-Console tags, real contact channels disabled.
  let ix = txt("index.html");
  ix = replaceExact(ix, '<script src="./support.js"></script>', '<script src="./chat-live-config.js"></script><script src="./chat-live-guard.js"></script>', "index.html", "entry script");
  ix = ix.replace(/<meta name="google-site-verification"[^>]*>\s*/g, "")
    .replace(/<link rel="canonical"[^>]*>\s*/g, "")
    .replace(/<meta property="og:url"[^>]*>\s*/g, "")
    .replace(/<meta property="og:image"[^>]*>\s*/g, "")
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/g, "");
  ix = ix.replace("<meta charset=\"utf-8\">", '<meta charset="utf-8">\n<meta name="robots" content="noindex,nofollow">');
  ix = replaceExact(ix, "https://line.me/R/ti/p/@huahinproperties", "#chat-live-disabled", "index.html", "LINE");
  ix = replaceExact(ix, "https://wa.me/66000000000", "#chat-live-disabled", "index.html", "WhatsApp");
  ix = replaceExact(ix, "tel:+66000000000", "#chat-live-disabled", "index.html", "tel");
  ix = replaceExact(ix, 'const email = "doothailand@gmail.com";', 'const email = "gate-disabled@invalid.example";', "index.html", "gate email");
  ix = replaceExact(ix, "mailto:hello@huahin.properties", "#chat-live-disabled", "index.html", "mailto");
  // Make the page inert until the guard passes (see tools/chat-live/guard.js).
  if (!/<body>/.test(ix) || ix.lastIndexOf("</body>") < 0) fail("<body> markers not found in index.html");
  ix = ix.replace("<body>", '<body>\n<template id="chat-live-app">');
  const bi = ix.lastIndexOf("</body>");
  ix = ix.slice(0, bi) + '</template>\n<script>window.__chatLiveStart && window.__chatLiveStart();</script>\n' + ix.slice(bi);
  out["index.html"] = Buffer.from(ix);

  out["chat-live-config.js"] = Buffer.from("window.__CHAT_LIVE__ = " + JSON.stringify({
    projectId: pid, apiKey: config.apiKey, appId: config.appId, messagingSenderId: config.messagingSenderId,
    authDomain: config.authDomain, storageBucket: config.storageBucket, region: config.region,
    claudeCompleteUrl: ccUrl, allowedHosts: [pid + ".web.app", pid + ".firebaseapp.com"] }, null, 2) + ";\n");
  out["chat-live-guard.js"] = fs.readFileSync(path.join(__dirname, "chat-live", "guard.js"));
  // Hosting config for the TEST project only: serves this folder, adds noindex header, no rewrites.
  out["firebase.json"] = Buffer.from(JSON.stringify({ hosting: { public: ".", ignore: ["firebase.json", "MANIFEST.json", "**/.*"],
    headers: [{ source: "**", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }] } }, null, 2) + "\n");

  // Final scan of everything that will be written (text files only).
  const bad = [];
  for (const [f, buf] of Object.entries(out)) {
    if (f.endsWith(".png")) continue;
    const t = buf.toString("utf8");
    if (f === "chat-live-guard.js") continue; // contains the marker list on purpose
    for (const re of FORBIDDEN) if (re.test(t)) bad.push(f + " :: " + re);
  }
  if (bad.length) fail("production string/contact channel left in output:\n  " + bad.join("\n  "));

  // Re-check right before deleting (the folder could have changed while the page was being built).
  outDir = checkOutDir(outDir, root, bases);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, MARKER), "created by tools/build-chat-live.js — safe to delete and rebuild\n");
  const manifest = {};
  for (const [f, buf] of Object.entries(out)) {
    fs.writeFileSync(path.join(outDir, f), buf);
    manifest[f] = crypto.createHash("sha256").update(buf).digest("hex");
  }
  fs.writeFileSync(path.join(outDir, "MANIFEST.json"), JSON.stringify({ projectId: pid, files: manifest }, null, 2) + "\n");
  return manifest;
}

module.exports = { build, validate, FILES, PRODUCTION_PROJECT, claudeCompleteUrlFor, MARKER };

if (require.main === module) {
  const a = process.argv.slice(2);
  const get = (k) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
  try {
    const cfgPath = get("--config"), outDir = get("--out");
    if (!cfgPath || !outDir) fail("usage: build-chat-live.js --config <file> --out <dir>");
    const m = build(JSON.parse(fs.readFileSync(cfgPath, "utf8")), path.resolve(outDir)); // output restricted to <repo>/build/*
    console.log("OK — wrote " + Object.keys(m).length + " files to " + outDir);
  } catch (e) {
    console.error("BUILD REFUSED: " + e.message);
    process.exit(1);
  }
}
