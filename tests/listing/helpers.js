// LISTING-E2E-01 — shared helpers for the emulator tests. SYNTHETIC data only; Firestore + Storage + Auth
// EMULATORS only (project demo-sec-test-01, loopback). No credentials, no real services.
"use strict";
const fs = require("fs");
const path = require("path");
const { PROJECT_ID, assertEmulatorOnly } = require("../helpers/synthetic");

assertEmulatorOnly();
for (const k of ["FIREBASE_STORAGE_EMULATOR_HOST"]) {
  if (!process.env[k] || !/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(process.env[k])) throw new Error("listing tests refuse to run: " + k + " missing or not loopback");
}
const ROOT = path.join(__dirname, "..", "..");
const FUNCTIONS_DIR = path.join(ROOT, "functions");
const BUCKET_NAME = PROJECT_ID + ".appspot.com";
process.env.LISTING_STORAGE_BUCKET = BUCKET_NAME;

const OWNER_UID = "n7TZKSBscPXE1kRU8WzYpsqJh2g2"; // the hard-coded Owner uid in firestore.rules / storage.rules
const tok = (provider, email) => ({ firebase: { sign_in_provider: provider }, email: email || undefined });
const ACTORS = {
  owner: { uid: OWNER_UID, role: "owner", token: tok("password", "owner@example.test") },
  staff: { uid: "syn-staff-uid", role: "staff", token: tok("password", "staff@example.test") },
  agent: { uid: "syn-agent-uid", role: "agent", token: tok("password", "agent@example.test") },
  agent2: { uid: "syn-agent2-uid", role: "agent", token: tok("password", "agent2@example.test") },
  extA: { uid: "syn-ext-a-uid", role: "external", token: tok("anonymous") },
  extB: { uid: "syn-ext-b-uid", role: "external", token: tok("anonymous") },
  google: { uid: "syn-google-uid", role: "external", token: tok("google.com", "g@example.test") }, // signed in, but no listers/ record
};
const FIX = { name: "Synthetic Person", phone: "0800000000", owner: "Synthetic Owner" };

let admin = null, fns = null;
function load() {
  if (!fns) {
    admin = require(require.resolve("firebase-admin", { paths: [FUNCTIONS_DIR] }));
    fns = require(path.join(FUNCTIONS_DIR, "index.js"));
  }
  return { admin, fns };
}
const call = (name, actor, data) => load().fns[name].run({ auth: actor ? { uid: actor.uid, token: actor.token } : undefined, data: data || {}, rawRequest: {} });
async function errCode(p) { try { await p; return "OK"; } catch (e) { return e && e.code ? String(e.code).replace(/^functions\//, "") : "ERR:" + (e && e.message); } }
async function errReason(p) { try { await p; return null; } catch (e) { return (e && e.details && e.details.reason) || (e && e.code) || String(e && e.message); } }

const newKey = (() => { let n = 0; return (p) => (p || "k") + "-" + Date.now().toString(36) + "-" + (++n).toString().padStart(4, "0") + "-synthetic-key"; })();
const IMG = (n) => Buffer.alloc(n || 64, 7);

// puts staging photos exactly where the browser would (the browser upload itself is covered by the Storage-rules tests)
async function putStaging(actor, key, names, opts) {
  const { admin: a } = load();
  const bucket = a.storage().bucket(BUCKET_NAME);
  const out = [];
  for (const n of names) {
    const p = "caseUploads/" + actor.uid + "/" + key + "/" + n + ".webp";
    await bucket.file(p).save((opts && opts.buf) || IMG(), { contentType: (opts && opts.contentType) || "image/webp", resumable: false });
    out.push({ path: p });
  }
  return out;
}
const payload = (key, type, photos, extra) => Object.assign({
  submissionKey: key, txnType: "sale", type: type || "house", condition: "resale", price: 7500000, area: "hua-hin",
  description: "Synthetic description for a synthetic property.", coordsRaw: "12.558940,99.909039",
  submitter: { name: FIX.name, phone: FIX.phone, email: "" }, propertyOwner: { relation: "self", name: FIX.owner, contact: "0811111111" },
  language: "th", photos,
}, extra || {});

async function seedRoles() {
  const { admin: a } = load();
  const db = a.firestore();
  await db.doc("adminUsers/" + ACTORS.staff.uid).set({ role: "staff", email: "staff@example.test", displayName: "Synthetic Staff" });
  await db.doc("listers/" + ACTORS.agent.uid).set({ displayName: "Synthetic Agent", status: "active" });
  await db.doc("listers/" + ACTORS.agent2.uid).set({ displayName: "Synthetic Agent 2", status: "active" });
}
async function wipe(testEnv) {
  const { admin: a } = load();
  const base = "http://" + process.env.FIRESTORE_EMULATOR_HOST + "/emulator/v1/projects/" + PROJECT_ID + "/databases/(default)/documents";
  await fetch(base, { method: "DELETE" });
  await fetch("http://" + process.env.FIREBASE_STORAGE_EMULATOR_HOST + "/emulator/v1/projects/" + PROJECT_ID + "/buckets/" + BUCKET_NAME + "/o", { method: "DELETE" }).catch(() => {});
  try { const [files] = await a.storage().bucket(BUCKET_NAME).getFiles(); await Promise.all(files.map((f) => f.delete().catch(() => {}))); } catch (e) { /* empty bucket */ }
  if (testEnv) { await testEnv.clearFirestore(); }
}
async function fileExists(p) { const { admin: a } = load(); const [x] = await a.storage().bucket(BUCKET_NAME).file(p).exists(); return x; }
async function listFiles(prefix) { const { admin: a } = load(); const [fs_] = await a.storage().bucket(BUCKET_NAME).getFiles({ prefix }); return fs_.map((f) => f.name).sort(); }
async function fileMeta(p) { const { admin: a } = load(); const [m] = await a.storage().bucket(BUCKET_NAME).file(p).getMetadata(); return m; }
const { PRIVATE_FIELDS } = require(path.join(FUNCTIONS_DIR, "case-fields.js"));

module.exports = { ROOT, FUNCTIONS_DIR, PROJECT_ID, BUCKET_NAME, OWNER_UID, ACTORS, FIX, load, call, errCode, errReason, newKey, putStaging, payload, seedRoles, wipe, fileExists, listFiles, fileMeta, PRIVATE_FIELDS, IMG };
