#!/usr/bin/env node
// BROWSER-LOCAL-01 launcher: starts the local emulators (Firestore, Auth, Storage and the REAL Functions code) and runs the browser tests against the built TEST site.
// The sandbox's HTTP(S) proxy variables are removed for the child process — the Functions emulator registers its triggers over loopback and the proxy answers "request blocked".
//   node tools/browser-local/run.js [mocha args…]      (run tools/browser-local/prepare-vendor.sh once first)
"use strict";
const { spawnSync } = require("child_process");
const path = require("path");
const root = path.resolve(__dirname, "..", "..");
const env = {};
for (const [k, v] of Object.entries(process.env)) if (!/proxy/i.test(k)) env[k] = v;
env.NO_PROXY = "127.0.0.1,localhost"; env.BROWSER_LOCAL = "1";
const mochaArgs = process.argv.slice(2).length ? process.argv.slice(2).join(" ") : "tests/browser-local/scenarios.test.js";
const r = spawnSync("npx", ["--yes", "firebase-tools@15.32.1", "emulators:exec", "--config", "firebase.browser-local.json", "--project", "huahin-listing-test-bl1", "--only", "functions,firestore,auth,storage",
  "node_modules/.bin/mocha " + mochaArgs + " --timeout 240000"], { cwd: root, env, stdio: "inherit" });
process.exit(r.status === null ? 1 : r.status);
