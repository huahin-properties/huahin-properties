#!/usr/bin/env node
// LISTING-E2E-01 — builds the separate LISTING TEST site (form, tracking, admin login, Staff, Approvals, public listing pages)
// from the production source WITHOUT editing any production file. Fails closed (exit 1, nothing written) on any
// missing/placeholder/production-looking value or any production string / contact channel / default credential left in the output.
//   node tools/build-listing-test.js --config <config.json> --out <dir under ./build>
// DOES NOT DEPLOY anything. The output folder is meant for `firebase deploy --only hosting --project <test project>` run by the owner.
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.resolve(__dirname, "..");
const PRODUCTION_PROJECT = "huahin-properties-5f1b5";
// The pages that make up the test (entry points). Everything they import is added automatically (closure below).
const ENTRIES = ["index.html", "Owner Submission.dc.html", "Track Submission.dc.html", "Admin Login.dc.html", "Admin Dashboard.dc.html", "Listing Approvals.dc.html",
  "Staff Workspace.dc.html", "Lister Dashboard.dc.html", "Agent Signup.dc.html", "Agent Profile.dc.html", "Leads.dc.html", "Staff Handbook.dc.html",
  "Property Details.dc.html", "Search Results.dc.html", "Home.dc.html", "About.dc.html", "Contact.dc.html"];
// Pages the built site links to but deliberately does NOT ship (a link to one of them is a 404 on the test site — by design, listed so nobody mistakes it for a bug):
//   Lister Billing (Stripe checkout/portal), Performance, Collection View, and the static SEO landing pages (baan-*.html, condo-*.html, pool-villa-*.html, thidin-*.html, ...).
const EXCLUDED_NAV = ["Lister Billing.dc.html", "Performance.dc.html", "Collection View.dc.html"];
// Admin tool pages that the Admin Dashboard links to but that are NOT part of the listing TEST site (they are other products' tools; their links 404 there, by design).
// Listed explicitly so any OTHER link that does not resolve inside the build is caught by tests/listing/hosting-build.test.js (H8).
const ADMIN_TOOLS_NOT_IN_TEST = ["Property Map.dc.html", "Owners.dc.html", "Site Content.dc.html", "Member Management.dc.html", "Team.dc.html", "Product Development Dashboard.dc.html", "CEO Dashboard.dc.html", "Mission Control.dc.html", "Developer Maintenance Center.dc.html", "AI Quick Add.dc.html"];
const EXCLUDED_NAV_RE = /^(baan-|condo-|pool-villa-|thidin-|hua-hin-|pranburi-|cha-am-)[a-z0-9-]*\.html$/;
// The Cloud Functions the listing TEST site needs — by name. NEVER `firebase deploy --only functions` (that deploys every export, including Stripe / LINE /
// e-mail / triggers and their unrelated secrets). The chat functions are optional: they need the Anthropic secret and are deployed only when the chat widget is tested.
const REQUIRED_FUNCTIONS = ["submitListingCase", "previewListingCase", "publishListingCase", "unpublishListingCase", "syncListingCase", "addCasePhotos", "reconcileListingFiles", "listMyCases", "trackListingCase"];
const OPTIONAL_CHAT_FUNCTIONS = ["receptionTurn", "getPropertyDraft", "updatePropertyDraft", "createCaseFromConversation", "claudeComplete"];
// The selector MUST carry the codebase ("listing", set in build/listing-functions/firebase.json): Firebase CLI 15.32.1 reads a bare `functions:<name>` as the DEFAULT codebase and
// answers "No function matches given --only filters". Run it from inside build/listing-functions.
const deployFunctionsCommand = (pid, names) => "firebase deploy --only " + (names || REQUIRED_FUNCTIONS).map((n) => "functions:listing:" + n).join(",") + " --project " + pid;
const REQUIRED = ["projectId", "apiKey", "appId", "messagingSenderId", "authDomain", "storageBucket", "region"];
// The same two test prefixes the Functions (listing-case.js) and the chat gate (chat-test-gate.js) already accept. Reusing huahin-chat-test-01 therefore needs no server change.
const PROJECT_ID_RE = /^huahin-(listing|chat)-test-[a-z0-9]+(-[a-z0-9]+)*$/;
const claudeCompleteUrlFor = (pid) => "https://asia-southeast1-" + pid + ".cloudfunctions.net/claudeComplete";
const MARKER = ".listing-test-output";
const FORBIDDEN = [/huahin-properties-5f1b5/i, /5f1b5/i, /auth\.huahin\.properties/i, /claudecomplete-3j4ldf4pja/i,
  /https?:\/\/([a-z0-9-]+\.)*huahin\.properties/i, /(^|[^a-z0-9.-])(www\.)?huahin\.properties/i,
  /0851785480|0805820777|doothailand|facebook\.com\/groups\/[1-9]\d|m\.me\/huahin/i,
  /(^|[^_a-zA-Z])password:\s*"(?!SYNTHETIC|")/, /(^|[^_a-zA-Z])username:\s*"(?!SYNTHETIC|")/,
  /line\.me\/(R\/)?ti\/p\//i, /lin\.ee\//i, /mailto:/i, /tel:\+66/i, /wa\.me\/66/i];

function fail(msg) { const e = new Error(msg); e.listingTest = true; throw e; }

function validate(c) {
  if (!c || typeof c !== "object") fail("config is not an object");
  for (const k of REQUIRED) { const v = c[k]; if (typeof v !== "string" || !v.trim() || /REPLACE_ME/i.test(v)) fail("config missing or placeholder: " + k); }
  if (/5f1b5|huahin-properties-5f1b5|auth\.huahin\.properties|claudecomplete-3j4ldf4pja/i.test(JSON.stringify(c))) fail("config contains a production value");
  if (c.projectId === PRODUCTION_PROJECT) fail("projectId is production");
  if (c.projectId.length > 30 || !PROJECT_ID_RE.test(c.projectId)) fail("projectId must look like huahin-listing-test-<suffix> or huahin-chat-test-<suffix> (max 30 chars) so a real project is never used by mistake");
  if (c.authDomain !== c.projectId + ".firebaseapp.com") fail("authDomain must be <projectId>.firebaseapp.com");
  if (!c.storageBucket.startsWith(c.projectId + ".")) fail("storageBucket must belong to the test project");
  if (c.region !== "asia-southeast1") fail("region must stay asia-southeast1 (matches the Functions region)");
}

// ── the closure of files the entry pages need (dc-import components, JS imports, local scripts / images) ──
function closure(root) {
  const seen = new Set(), missing = [];
  const q = ENTRIES.slice();
  while (q.length) {
    const f = q.pop();
    if (seen.has(f)) continue;
    const p = path.join(root, f);
    if (!fs.existsSync(p)) { missing.push(f); seen.add(f); continue; }
    seen.add(f);
    if (!/\.(html|js)$/.test(f)) continue;
    const t = fs.readFileSync(p, "utf8");
    for (const m of t.matchAll(/<dc-import\s+name="([^"]+)"/g)) q.push(m[1] + ".dc.html");
    for (const m of t.matchAll(/(?:from\s+|import\s*\(\s*|src=|href=)["']\.\/([A-Za-z0-9_.\- %]+\.(?:js|png|jpg|webp|svg))["']/g)) q.push(decodeURIComponent(m[1]));
  }
  if (missing.length) fail("required source file missing: " + missing.join(", "));
  return Array.from(seen).sort();
}

function replaceExact(text, from, to, file, label) {
  const parts = text.split(from);
  if (parts.length < 2) fail("patch target not found (" + label + ") in " + file + " — source changed, rebuild refused");
  return parts.join(to);
}
// production contact channels / hosts that appear in page text and links: neutralised everywhere, then the scan proves none is left
function scrub(t) {
  return t
    .replace(/https?:\/\/(?:www\.)?huahin\.properties/gi, "https://listing-test.invalid")
    .replace(/(^|[^a-z0-9.\/-])(?:www\.)?huahin\.properties/gi, "$1huahin properties [TEST]")
    .replace(/0851785480|0805820777/g, "0000000000")
    .replace(/doothailand@gmail\.com/gi, "test@invalid.example")
    .replace(/facebook\.com\/groups\/\d+/gi, "facebook.com/groups/0")
    .replace(/m\.me\/huahin[^"'\s)<]*/gi, "m.me/disabled")
    .replace(/https?:\/\/line\.me\/(?:R\/)?ti\/p\/[^"'\s)<`]*/gi, "#test-disabled")
    .replace(/https?:\/\/lin\.ee\/[^"'\s)<`]*/gi, "#test-disabled")
    .replace(/mailto:[^"'\s)<`]*/gi, "#test-disabled")
    .replace(/tel:\+66[0-9]*/g, "#test-disabled")
    .replace(/https?:\/\/wa\.me\/66[0-9]*/gi, "#test-disabled");
}

function realpathLoose(p) { let cur = path.resolve(p), rest = []; while (!fs.existsSync(cur)) { rest.unshift(path.basename(cur)); const up = path.dirname(cur); if (up === cur) break; cur = up; } return path.join(fs.realpathSync(cur), ...rest); }
function within(child, parent) { const r = path.relative(parent, child); return r !== "" && !r.startsWith("..") && !path.isAbsolute(r); }
function checkOutDir(outDir, root, bases, files) {
  if (typeof outDir !== "string" || !outDir.trim() || outDir.indexOf("\0") !== -1) fail("output folder is empty/invalid");
  const abs = path.resolve(outDir);
  if (abs === path.parse(abs).root) fail("output folder is the filesystem root");
  const real = realpathLoose(abs), realRoot = fs.realpathSync(root);
  if (real === realRoot || within(realRoot, real)) fail("output folder is, or contains, the repo/source root");
  for (const f of files) { const sp = path.join(realRoot, f); if (real === sp || within(sp, real)) fail("output folder would contain a source file: " + f); }
  const lexBase = bases.map((b) => path.resolve(b)).find((b) => within(abs, b));
  if (!lexBase) fail("output folder must be strictly inside the designated output area (" + bases.join(", ") + ")");
  let cur = lexBase;
  if (fs.existsSync(cur) && fs.lstatSync(cur).isSymbolicLink()) fail("output area is a symlink: " + cur);
  for (const part of path.relative(lexBase, abs).split(path.sep)) { cur = path.join(cur, part); if (fs.existsSync(cur) && fs.lstatSync(cur).isSymbolicLink()) fail("output path contains a symlink: " + cur); }
  if (!within(real, realpathLoose(lexBase))) fail("output folder resolves outside the designated output area");
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
  const files = closure(root);
  outDir = checkOutDir(outDir, root, bases, files);
  const pid = config.projectId, ccUrl = claudeCompleteUrlFor(pid), fnHost = "asia-southeast1-" + pid + ".cloudfunctions.net";
  const out = {};
  for (const f of files) out[f] = fs.readFileSync(path.join(root, f));
  const txt = (f) => out[f].toString("utf8");

  // data.js — in the TEST build a backend failure / SDK delay shows an error state, never the bundled sample catalogue as if it were real listings
  out["data.js"] = Buffer.from(replaceExact(txt("data.js"), "const SAMPLE_FALLBACK_ON_ERROR = true;", "const SAMPLE_FALLBACK_ON_ERROR = false;", "data.js", "sample fallback switch"));

  // firebase-client.js — config block + every Function host + production-only defaults
  let fc = txt("firebase-client.js");
  const cfgRe = /const firebaseConfig = \{[\s\S]*?\n\};/;
  if (!cfgRe.test(fc)) fail("firebaseConfig block not found in firebase-client.js");
  fc = fc.replace(cfgRe, () => "const firebaseConfig = " + JSON.stringify({ apiKey: config.apiKey, authDomain: config.authDomain, projectId: pid, storageBucket: config.storageBucket, messagingSenderId: config.messagingSenderId, appId: config.appId }, null, 2) + ";");
  fc = replaceExact(fc, "asia-southeast1-" + PRODUCTION_PROJECT + ".cloudfunctions.net", fnHost, "firebase-client.js", "function host");
  fc = replaceExact(fc, "https://claudecomplete-3j4ldf4pja-as.a.run.app", ccUrl, "firebase-client.js", "claudeComplete");
  fc = fc.replace(/auth\.huahin\.properties/g, "<custom-auth-domain>").replace(/huahin-properties-5f1b5/g, "<production-project>");
  const fbRe = /const DEFAULT_FB_FOOTER = `[\s\S]*?`;/;
  if (!fbRe.test(fc)) fail("DEFAULT_FB_FOOTER not found in firebase-client.js");
  fc = fc.replace(fbRe, () => "const DEFAULT_FB_FOOTER = `TEST SITE - synthetic footer, no real contact details`;");
  const admRe = /const DEFAULT_ADMIN_CREDENTIALS = \{[\s\S]*?\n\};/;
  if (!admRe.test(fc)) fail("DEFAULT_ADMIN_CREDENTIALS not found in firebase-client.js");
  fc = fc.replace(admRe, () => 'const DEFAULT_ADMIN_CREDENTIALS = { username: "SYNTHETIC", password: "SYNTHETIC-DISABLED", recoveryEmail: "none@invalid.example", recoveryPhone: "0000000000" };');
  out["firebase-client.js"] = Buffer.from(fc);

  // ContactRail — chat endpoint of the TEST project + the ID token the test claudeComplete requires, LINE default off
  if (out["ContactRail.dc.html"]) {
    let cr = txt("ContactRail.dc.html");
    cr = replaceExact(cr, "https://claudecomplete-3j4ldf4pja-as.a.run.app", ccUrl, "ContactRail.dc.html", "claudeComplete");
    cr = replaceExact(cr, "https://line.me/ti/p/huahinproperties", "#test-disabled", "ContactRail.dc.html", "LINE default");
    const hdrFrom = 'const res = await fetch(CLOUD_FN.claudeComplete, {\n          method: "POST",\n          headers: { "content-type": "application/json" },';
    const hdrTo = 'const __tok = await window.firebase.auth().currentUser.getIdToken();\n        const res = await fetch(CLOUD_FN.claudeComplete, {\n          method: "POST",\n          headers: { "content-type": "application/json", "authorization": "Bearer " + __tok },';
    cr = replaceExact(cr, hdrFrom, hdrTo, "ContactRail.dc.html", "fallback fetch headers");
    out["ContactRail.dc.html"] = Buffer.from(cr);
  }

  // every HTML page: noindex, no canonical/OG/JSON-LD/Search-Console tags, the TEST guard first, body inert until the guard passes
  for (const f of Object.keys(out)) {
    if (!f.endsWith(".html")) continue;
    let h = txt(f);
    if (!h.includes('<script src="./support.js"></script>')) fail("entry script not found in " + f);
    h = h.replace('<script src="./support.js"></script>', '<script src="./listing-test-config.js"></script><script src="./listing-test-guard.js"></script>');
    h = h.replace(/<meta name="google-site-verification"[^>]*>\s*/g, "").replace(/<link rel="canonical"[^>]*>\s*/g, "").replace(/<meta property="og:(?:url|image)"[^>]*>\s*/g, "").replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/g, "");
    h = h.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<meta name="robots" content="noindex,nofollow">');
    if (!/<body>/.test(h) || h.lastIndexOf("</body>") < 0) fail("<body> markers not found in " + f);
    h = h.replace("<body>", '<body>\n<template id="chat-live-app">');
    const bi = h.lastIndexOf("</body>");
    h = h.slice(0, bi) + '</template>\n<script>window.__chatLiveStart && window.__chatLiveStart();</script>\n' + h.slice(bi);
    out[f] = Buffer.from(h);
  }
  // production contact channels / hosts in text → neutral (the scan below proves nothing is left)
  // any remaining mention of the production chat endpoint (e.g. Home's welcome assistant) points at the TEST project, which answers 401 unless allow-listed
  for (const f of Object.keys(out)) { if (/\.(html|js)$/.test(f)) out[f] = Buffer.from(scrub(out[f].toString("utf8")).replace(/https:\/\/claudecomplete-3j4ldf4pja-as\.a\.run\.app/g, ccUrl)
    .replace(/asia-southeast1-huahin-properties-5f1b5\.cloudfunctions\.net/g, fnHost) // other pages' production Function hosts (LINE login, share cards…) point at the TEST project, where they do not exist
    .replace(/https:\/\/huahin-properties-5f1b5\.(web\.app|firebaseapp\.com)/g, "https://" + pid + ".$1")); }

  out["listing-test-config.js"] = Buffer.from("window.__CHAT_LIVE__ = " + JSON.stringify({ projectId: pid, apiKey: config.apiKey, appId: config.appId, messagingSenderId: config.messagingSenderId,
    authDomain: config.authDomain, storageBucket: config.storageBucket, region: config.region, claudeCompleteUrl: ccUrl, allowedHosts: [pid + ".web.app", pid + ".firebaseapp.com"] }, null, 2) + ";\n");
  out["listing-test-guard.js"] = fs.readFileSync(path.join(__dirname, "listing-test", "guard.js"));
  out["firebase.json"] = Buffer.from(JSON.stringify({ hosting: { public: ".", ignore: ["firebase.json", "MANIFEST.json", "**/.*"], headers: [{ source: "**", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }] } }, null, 2) + "\n");

  const bad = [];
  for (const [f, buf] of Object.entries(out)) {
    if (/\.(png|jpg|webp)$/.test(f) || f === "listing-test-guard.js") continue;
    const t = buf.toString("utf8");
    for (const re of FORBIDDEN) if (re.test(t)) bad.push(f + " :: " + re);
  }
  if (bad.length) fail("production string / contact channel / default credential left in output:\n  " + bad.join("\n  "));

  outDir = checkOutDir(outDir, root, bases, files);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, MARKER), "created by tools/build-listing-test.js — safe to delete and rebuild\n");
  const manifest = {};
  for (const [f, buf] of Object.entries(out)) { fs.writeFileSync(path.join(outDir, f), buf); manifest[f] = crypto.createHash("sha256").update(buf).digest("hex"); }
  fs.writeFileSync(path.join(outDir, "MANIFEST.json"), JSON.stringify({ projectId: pid, files: manifest }, null, 2) + "\n");
  return manifest;
}

module.exports = { build, validate, closure, ENTRIES, EXCLUDED_NAV, ADMIN_TOOLS_NOT_IN_TEST, EXCLUDED_NAV_RE, REQUIRED_FUNCTIONS, OPTIONAL_CHAT_FUNCTIONS, deployFunctionsCommand, FORBIDDEN, PRODUCTION_PROJECT, MARKER };

if (require.main === module) {
  const a = process.argv.slice(2);
  const get = (k) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
  try {
    const cfgPath = get("--config"), outDir = get("--out");
    if (!cfgPath || !outDir) fail("usage: build-listing-test.js --config <file> --out <dir>");
    const m = build(JSON.parse(fs.readFileSync(cfgPath, "utf8")), path.resolve(outDir));
    console.log("OK — wrote " + Object.keys(m).length + " files to " + outDir);
  } catch (e) { console.error("BUILD REFUSED: " + e.message); process.exit(1); }
}
