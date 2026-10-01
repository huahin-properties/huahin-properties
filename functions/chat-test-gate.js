// CHAT-LIVE-01 — access gate + AI-call cap for the chat TEST project only.
//
// Which behaviour applies is decided from the project id the platform gives the
// running Function (environment set by the runtime, never from a request):
//   huahin-properties-5f1b5          -> "off"     : production keeps its existing behaviour; this module reads nothing
//   demo-*  AND runtime evidence of a local emulator -> "off" : FIRESTORE_EMULATOR_HOST is set and loopback, and every other emulator
//            endpoint variable that is set is loopback too. The name alone never switches the gate off: demo-* without that evidence,
//            or with any external endpoint, is "deny".
//   huahin-chat-test-<suffix> | huahin-listing-test-<suffix> -> "enforce" : allow-listed anonymous UID + (HTTP) verified ID token + atomic AI-call cap
//   anything else, or ids that disagree, or none -> "deny": every gated handler refuses (an unknown project is NEVER treated as production)
"use strict";

const PRODUCTION_PROJECT = "huahin-properties-5f1b5";
// The chat TEST project and the LISTING TEST project (LISTING-E2E-01: the hosted form/Staff/Approvals site also carries the chat widget and
// calls receptionTurn / getPropertyDraft / updatePropertyDraft / createCaseFromConversation / claudeComplete) are BOTH strict test projects with the SAME
// allow-list, ID token and atomic cap. Nothing else is recognised.
const TEST_RE = /^huahin-(chat|listing)-test-[a-z0-9]+(-[a-z0-9]+)*$/;
const EMULATOR_RE = /^demo-[a-z0-9]+(-[a-z0-9]+)*$/;
const UID_RE = /^[A-Za-z0-9_.:-]{1,128}$/;
const MAX_CAP = 10000; // upper bound for any configured cap

function runtimeProjectId(env) {
  env = env || process.env;
  const found = [];
  if (env.FIREBASE_CONFIG) { try { const c = JSON.parse(env.FIREBASE_CONFIG); if (c && c.projectId) found.push(String(c.projectId)); } catch (e) { found.push("\u0000unparseable"); } }
  for (const k of ["GCLOUD_PROJECT", "GOOGLE_CLOUD_PROJECT"]) if (env[k]) found.push(String(env[k]));
  if (!found.length || found.some((x) => x !== found[0])) return null; // none, or disagreeing sources -> unknown
  return found[0];
}

const LOOPBACK_RE = /^(127(\.\d{1,3}){3}|localhost|\[::1\])(:\d{1,5})?$/;
const EMULATOR_HOST_VARS = ["FIRESTORE_EMULATOR_HOST", "FIREBASE_AUTH_EMULATOR_HOST", "FIREBASE_STORAGE_EMULATOR_HOST", "FIREBASE_DATABASE_EMULATOR_HOST", "PUBSUB_EMULATOR_HOST"];
// Runtime proof that this process talks to a LOCAL emulator: the Firestore emulator flag must be present, and every emulator endpoint that is set must be loopback.
function emulatorEvidence(env) {
  env = env || process.env;
  const fs = env.FIRESTORE_EMULATOR_HOST;
  if (typeof fs !== "string" || !LOOPBACK_RE.test(fs)) return false;
  return EMULATOR_HOST_VARS.every((k) => env[k] === undefined || (typeof env[k] === "string" && LOOPBACK_RE.test(env[k])));
}

function stateFor(projectId, env) {
  if (typeof projectId !== "string") return "deny";
  if (projectId === PRODUCTION_PROJECT) return "off";
  if (EMULATOR_RE.test(projectId)) return emulatorEvidence(env) ? "off" : "deny";
  if (projectId.length <= 30 && TEST_RE.test(projectId)) return "enforce";
  return "deny";
}

const isCap = (v) => typeof v === "number" && Number.isSafeInteger(v) && v >= 1 && v <= MAX_CAP; // rejects NaN, Infinity, negatives, decimals, strings
const isUsed = (v) => typeof v === "number" && Number.isSafeInteger(v) && v >= 0;

function createGate({ admin, HttpsError, getProjectId }) {
  const initialProvider = getProjectId || (() => runtimeProjectId());
  let provider = initialProvider;
  const db = () => admin.firestore();
  const authApi = () => admin.auth();
  const state = () => stateFor(provider());
  const refuse = () => new HttpsError("permission-denied", "Not available.");

  async function requireAllowed(uid) {
    if (typeof uid !== "string" || !UID_RE.test(uid)) throw refuse();
    const snap = await db().collection("chatTestAllow").doc(uid).get();
    const d = snap.exists ? snap.data() : null;
    if (!d || d.enabled !== true) throw refuse();
  }

  // Callable handlers. "off" -> returns null and touches nothing.
  async function enforceCallable(request) {
    const st = state();
    if (st === "off") return null;
    if (st === "deny") throw refuse();
    const uid = request && request.auth && request.auth.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Sign-in required.");
    await requireAllowed(uid);
    return uid;
  }

  // HTTP handler. Returns null ("off"), a verified uid, or false after it has already answered 401/403.
  async function enforceHttp(req, res) {
    const st = state();
    if (st === "off") return null;
    if (st === "deny") { res.status(403).json({ error: "forbidden" }); return false; }
    const m = /^Bearer (\S+)$/.exec(String((req.headers && (req.headers.authorization || req.headers.Authorization)) || ""));
    if (!m) { res.status(401).json({ error: "unauthorized" }); return false; }
    let uid;
    try { const decoded = await authApi().verifyIdToken(m[1]); uid = decoded && decoded.uid; } catch (e) { res.status(401).json({ error: "unauthorized" }); return false; }
    if (!uid) { res.status(401).json({ error: "unauthorized" }); return false; }
    try { await requireAllowed(uid); } catch (e) { res.status(403).json({ error: "forbidden" }); return false; }
    return uid;
  }

  // Atomic reservation of n model calls (n = 1 per call; a retry reserves again). Counted even if the call later fails.
  async function reserve(uid, n) {
    if (!Number.isInteger(n) || n < 1 || n > 2) throw new HttpsError("invalid-argument", "bad reservation");
    if (typeof uid !== "string" || !UID_RE.test(uid)) throw refuse();
    const d = db();
    const cfgRef = d.collection("chatTestConfig").doc("limits");
    const gRef = d.collection("chatTestQuota").doc("global");
    const uRef = d.collection("chatTestQuota").doc("uid__" + uid);
    await d.runTransaction(async (tx) => {
      const [cfg, g, u] = await Promise.all([tx.get(cfgRef), tx.get(gRef), tx.get(uRef)]);
      const c = cfg.exists ? cfg.data() : null;
      if (!c || !isCap(c.globalCap) || !isCap(c.perUidCap)) throw new HttpsError("failed-precondition", "Test limits are not configured.");
      const gUsed = g.exists ? g.data().used : 0, uUsed = u.exists ? u.data().used : 0;
      if (!isUsed(gUsed) || !isUsed(uUsed)) throw new HttpsError("failed-precondition", "Test counters are invalid.");
      if (gUsed + n > c.globalCap || uUsed + n > c.perUidCap) throw new HttpsError("resource-exhausted", "Test limit reached.");
      const at = admin.firestore.FieldValue.serverTimestamp();
      tx.set(gRef, { used: gUsed + n, updatedAt: at });
      tx.set(uRef, { used: uUsed + n, updatedAt: at });
    }, { maxAttempts: 30 });
  }

  // For callClaudeReception: undefined when "off" (the existing code path is then byte-for-byte what it was).
  function reserveHook(uid) { return state() === "off" ? undefined : () => reserve(uid, 1); }
  // For claudeComplete: true = proceed to the model; false = already answered 429/503.
  async function reserveHttp(uid, res) {
    if (uid === null) return true;
    try { await reserve(uid, 1); return true; } catch (e) {
      res.status(e && e.code === "resource-exhausted" ? 429 : 503).json({ error: "limit" });
      return false;
    }
  }

  return { state, enforceCallable, enforceHttp, reserve, reserveHook, reserveHttp,
    // Test-only (not a Cloud Function export): swap the project-id provider, and put the ORIGINAL runtime provider back.
    __testOnly: { setProjectIdProvider(fn) { if (typeof fn !== "function") throw new Error("provider must be a function; use reset() to restore the runtime provider"); provider = fn; },
      reset() { provider = initialProvider; }, isRuntimeProvider() { return provider === initialProvider; } } };
}

// One shared instance per process: functions/index.js creates it at load; the gate tests fetch the SAME
// instance (after loading index.js) to set the project id provider. It is not a Cloud Function export.
let shared = null;
function sharedGate(deps) { if (!shared) shared = createGate(deps || {}); return shared; }

module.exports = { createGate, sharedGate, runtimeProjectId, stateFor, emulatorEvidence, PRODUCTION_PROJECT, MAX_CAP };
