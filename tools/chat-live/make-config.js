#!/usr/bin/env node
// CHAT-LIVE-01 — turns the output of `firebase apps:sdkconfig WEB <appId>` (read from stdin, JS-object or JSON form)
// into the test-site build config. Only the three web-app identifiers are taken from the input; everything else is
// derived from the project id. Prints nothing but a short OK/refusal line (no values).
//   node tools/chat-live/make-config.js <projectId> <out.json> < sdkconfig.txt
"use strict";
const fs = require("fs");
const pick = (t, k) => { const m = new RegExp("[\"']?" + k + "[\"']?\\s*:\\s*[\"']([^\"']+)[\"']").exec(t); return m ? m[1] : ""; };
function makeConfig(projectId, text) {
  const cfg = { projectId, apiKey: pick(text, "apiKey"), appId: pick(text, "appId"), messagingSenderId: pick(text, "messagingSenderId"),
    authDomain: projectId + ".firebaseapp.com", storageBucket: projectId + ".firebasestorage.app", region: "asia-southeast1" };
  const inProject = pick(text, "projectId"); if (inProject && inProject !== projectId) throw new Error("sdkconfig belongs to a different project");
  for (const k of ["apiKey", "appId", "messagingSenderId"]) if (!cfg[k]) throw new Error("sdkconfig output has no " + k);
  const bucket = pick(text, "storageBucket"); if (bucket && bucket.startsWith(projectId + ".")) cfg.storageBucket = bucket;
  return cfg;
}
module.exports = { makeConfig };
if (require.main === module) {
  try {
    const [pid, out] = process.argv.slice(2); if (!pid || !out) throw new Error("usage: make-config.js <projectId> <out.json>");
    fs.writeFileSync(out, JSON.stringify(makeConfig(pid, fs.readFileSync(0, "utf8")), null, 2) + "\n");
    console.log("config written (values not shown)");
  } catch (e) { console.error("CONFIG REFUSED: " + e.message); process.exit(1); }
}
