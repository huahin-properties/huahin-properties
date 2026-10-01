// CHAT-TEST-01 — isolation + Anthropic stub. TEST-ONLY, synthetic.
//
// install() does three things and returns a restore() that undoes ALL of them:
//   1. Replaces global.fetch: calls to https://api.anthropic.com/ are answered by a SCRIPTED stub
//      (no network); loopback URLs pass through to the real fetch (local emulator only);
//      EVERYTHING else is blocked, recorded in `blocked`, and rejected.
//   2. Wraps http/https request()/get(): any non-loopback host is blocked and recorded.
//      (Closes external services such as credential/metadata lookups made by SDKs.)
//   3. Sets a SYNTHETIC API key and turns off cloud-credential discovery for the duration of the run.
// restore() puts back fetch, http/https functions and every environment variable it touched, so
// other test files in the same mocha process are not affected.

const http = require("http");
const https = require("https");

const FAKE_KEY = "SYNTHETIC-NOT-A-REAL-KEY";
const LOOPBACK = /^(127\.\d+\.\d+\.\d+|localhost|\[?::1\]?)$/i;

function hostOfUrl(u) {
  try { return new URL(String(u)).hostname; } catch (e) { return ""; }
}
function hostOfRequestArgs(args) {
  const a = args[0];
  if (typeof a === "string") return hostOfUrl(a);
  if (a && typeof a === "object") {
    if (typeof a.href === "string" && a.hostname) return a.hostname;
    return String(a.hostname || a.host || "localhost").replace(/:\d+$/, "");
  }
  return "";
}

function install() {
  const ENV_KEYS = TOUCHED_ENV;
  const savedEnv = {};
  for (const k of ENV_KEYS) savedEnv[k] = Object.prototype.hasOwnProperty.call(process.env, k) ? process.env[k] : undefined;
  const saved = {
    fetch: global.fetch,
    httpRequest: http.request, httpGet: http.get, httpsRequest: https.request, httpsGet: https.get,
  };

  const state = { blocked: [], anthropicCalls: [], script: [], restored: false };

  process.env.ANTHROPIC_API_KEY = FAKE_KEY;
  process.env.METADATA_SERVER_DETECTION = "none";
  delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
  delete process.env.GCE_METADATA_HOST;

  global.fetch = async function (url, opts) {
    const u = String(url && url.url ? url.url : url);
    if (u.startsWith("https://api.anthropic.com/")) {
      const headers = (opts && opts.headers) || {};
      const body = JSON.parse((opts && opts.body) || "{}");
      state.anthropicCalls.push({ apiKey: headers["x-api-key"], messageCount: (body.messages || []).length, lastUserText: lastUserText(body.messages) });
      const next = state.script.shift();
      if (next === undefined) throw new Error("stub script exhausted (test asked for more model calls than scripted)");
      if (next && next.__throw) throw new Error(next.__throw);
      return { ok: true, status: 200, json: async () => ({ content: [{ type: "tool_use", name: "reception_reply", input: next }] }) };
    }
    if (LOOPBACK.test(hostOfUrl(u))) return saved.fetch.apply(this, arguments);
    state.blocked.push({ via: "fetch", host: hostOfUrl(u) || u });
    throw new Error("CHAT-TEST-01 blocked outbound fetch: " + (hostOfUrl(u) || u));
  };

  const guard = (orig, name) => function () {
    const h = hostOfRequestArgs(arguments);
    if (!LOOPBACK.test(h)) {
      state.blocked.push({ via: name, host: h || "(unknown)" });
      throw new Error("CHAT-TEST-01 blocked outbound " + name + ": " + (h || "(unknown host)"));
    }
    return orig.apply(this, arguments);
  };
  http.request = guard(saved.httpRequest, "http.request");
  http.get = guard(saved.httpGet, "http.get");
  https.request = function () { // no HTTPS to a loopback emulator is needed; block all https
    state.blocked.push({ via: "https.request", host: hostOfRequestArgs(arguments) || "(unknown)" });
    throw new Error("CHAT-TEST-01 blocked outbound https.request");
  };
  https.get = function () {
    state.blocked.push({ via: "https.get", host: hostOfRequestArgs(arguments) || "(unknown)" });
    throw new Error("CHAT-TEST-01 blocked outbound https.get");
  };

  function restore() {
    if (state.restored) return;
    state.restored = true;
    global.fetch = saved.fetch;
    http.request = saved.httpRequest; http.get = saved.httpGet;
    https.request = saved.httpsRequest; https.get = saved.httpsGet;
    for (const k of ENV_KEYS) {
      if (savedEnv[k] === undefined) delete process.env[k]; else process.env[k] = savedEnv[k];
    }
  }

  return {
    FAKE_KEY,
    blocked: state.blocked,
    anthropicCalls: state.anthropicCalls,
    // Each entry is the tool-input object the "model" returns, or { __throw: "message" } to simulate a failed call.
    setScript(entries) { state.script.length = 0; state.script.push(...entries); },
    scriptRemaining() { return state.script.length; },
    resetCalls() { state.anthropicCalls.length = 0; },
    isRestored() { return state.restored; },
    restore,
    originals: saved,
  };
}

// ── restore verification ──────────────────────────────────────────────────────
// Everything install() touches: global.fetch, http.request/get, https.request/get and EVERY environment
// variable it sets or deletes — including whether a variable existed at all (absent !== empty string).
const TOUCHED_ENV = ["ANTHROPIC_API_KEY", "METADATA_SERVER_DETECTION", "GCE_METADATA_HOST", "GOOGLE_APPLICATION_CREDENTIALS"];

function snapshot() {
  const env = {};
  for (const k of TOUCHED_ENV) env[k] = { present: Object.prototype.hasOwnProperty.call(process.env, k), value: process.env[k] };
  return {
    fetch: global.fetch,
    httpRequest: http.request, httpGet: http.get, httpsRequest: https.request, httpsGet: https.get,
    env,
  };
}

// Returns a list of human-readable differences (empty list = identical).
function diffSnapshots(a, b) {
  const d = [];
  for (const k of ["fetch", "httpRequest", "httpGet", "httpsRequest", "httpsGet"]) if (a[k] !== b[k]) d.push(k + " differs");
  for (const k of TOUCHED_ENV) {
    const x = a.env[k], y = b.env[k];
    if (x.present !== y.present) d.push("env " + k + ": present " + x.present + " -> " + y.present);
    else if (x.present && x.value !== y.value) d.push("env " + k + ": value changed");
  }
  return d;
}

function lastUserText(messages) {
  const m = (messages || []).filter((x) => x && x.role === "user").pop();
  const c = m && m.content;
  return typeof c === "string" ? c.slice(0, 80) : "";
}

module.exports = { install, FAKE_KEY, snapshot, diffSnapshots, TOUCHED_ENV };
