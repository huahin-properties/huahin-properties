// Firestore-backed conversation store — the cross-device, real Source of
// Truth for the AI+Human chat tied to Shared Collection links.
//
// Same exported surface (function names/shapes) as conversation-store.js
// (the localStorage prototype) wherever practical, so ContactRail.dc.html's
// call sites read the same either way. conversation-store.js is NOT removed
// — it's still imported as an offline/same-device fallback if Firestore or
// Anonymous Auth is unreachable.
//
// REQUIRES (loaded in <helmet> before this module is imported):
//   firebase-app-compat.js, firebase-auth-compat.js, firebase-firestore-compat.js
//   (firebase-functions-compat.js is loaded on demand by this module if the
//    host page didn't include it — see loadFunctionsCompat below)
//
// IDENTITY MODEL:
//   visitorId = the customer's Firebase Anonymous Auth uid (never a
//               client-chosen string — Firestore rules enforce
//               request.auth.uid == visitorId).
//   ownerId   = resolved SERVER-SIDE (startConversation Callable Function)
//               from a real listers/{id} or adminUsers/{id} Firestore
//               record, falling back to the single "admin" identity if no
//               real member account matches — never trusted from a
//               client-editable URL string.
//   AI-authored ("role: ai") messages are NEVER written directly by this
//   module — only by the startConversation / sendConversationTurn Callable
//   Functions (Admin SDK). This module only ever writes "role: owner"
//   messages directly (the visitor's own "role: customer" messages are
//   written server-side too, as part of sendConversationTurn, so they're
//   durably saved together with the AI's reply in one call).

function getApp() {
  if (typeof window === "undefined" || !window.firebase) {
    throw new Error("Firebase SDK not loaded — add firebase-app-compat.js / firebase-auth-compat.js / firebase-firestore-compat.js / firebase-functions-compat.js <script> tags in <helmet> before importing conversation-firestore.js.");
  }
  if (!window.firebase.apps.length) {
    throw new Error("Firebase app not initialized yet — import firebase-client.js before conversation-firestore.js.");
  }
  return window.firebase.app();
}
function auth() { return getApp().auth(); }
function db() { return getApp().firestore(); }
// Firebase compat SDK, same version as every page's <helmet> tags.
const FUNCTIONS_COMPAT_SRC = "https://www.gstatic.com/firebasejs/10.12.2/firebase-functions-compat.js";
let _fnSdkPromise = null;

// Only index.html and Home.dc.html load firebase-functions-compat.js in
// <helmet>; Property Details / Search Results / Contact / About load only
// app + firestore + storage + auth. ContactRail's chat runs on ALL of them,
// so on those pages app.functions was undefined and every Callable threw
// "getApp(...).functions is not a function" BEFORE the request ever left the
// browser (which is why receptionTurn logged 0 requests while the chat kept
// working via the claudeComplete fallback). Loading the missing compat
// module here fixes every page at once, in the SAME SDK mode/version, and
// is a no-op on pages that already have the tag.
function loadFunctionsCompat() {
  if (_fnSdkPromise) return _fnSdkPromise;
  _fnSdkPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="' + FUNCTIONS_COMPAT_SRC + '"]');
    if (existing) {
      if (typeof getApp().functions === "function") { resolve(); return; }
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("firebase-functions-compat.js failed to load")));
      return;
    }
    const s = document.createElement("script");
    s.src = FUNCTIONS_COMPAT_SRC;
    s.async = false;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("firebase-functions-compat.js failed to load"));
    document.head.appendChild(s);
  });
  return _fnSdkPromise;
}

// Region is unchanged (asia-southeast1) and must keep matching the deployed
// Functions. Any failure here throws a plain Error with no Firebase `.code`,
// which ContactRail's _receptionFallbackSafe() correctly reads as "the
// callable was never invoked" — the one-AI-call invariant still holds.
async function functionsAsync() {
  if (typeof getApp().functions !== "function") await loadFunctionsCompat();
  const app = getApp();
  if (typeof app.functions !== "function") {
    throw new Error("firebase-functions-compat.js loaded but app.functions() is still unavailable");
  }
  return app.functions("asia-southeast1");
}

let _signInPromise = null;
// Signs the visitor in anonymously (once) and returns their real,
// rules-enforceable uid — this is the ONLY identity used for access
// control, never a localStorage/URL-supplied string.
export async function getVisitorId() {
  const a = auth();
  if (a.currentUser) return a.currentUser.uid;
  if (!_signInPromise) {
    _signInPromise = a.signInAnonymously().then((cred) => cred.user.uid);
  }
  return _signInPromise;
}

// Calls the startConversation Callable Function — creates the conversation
// (server resolves the real ownerId from senderId) and writes the AI's
// first greeting. Returns { conversationId, ownerId, ownerLabel }.
export async function startConversation({ senderId, collectionIds, propertyRefs, greetingText }) {
  const fn = (await functionsAsync()).httpsCallable("startConversation");
  const { data } = await fn({ senderId, collectionIds, propertyRefs, greetingText });
  return data;
}

// Calls the sendConversationTurn Callable Function — writes the customer's
// message, calls Claude, writes the AI's reply. Returns { reply }.
export async function sendConversationTurn({ conversationId, system, messages, customerText }) {
  const fn = (await functionsAsync()).httpsCallable("sendConversationTurn");
  const { data } = await fn({ conversationId, system, messages, customerText });
  return data;
}

// ── C4.1 Reception conversation (ก.ย. 2569) ─────────────────────────────
//
// Reception = the ordinary site-wide AI chat (NOT a share-link
// conversation). It lives in the SAME `conversations` collection but is a
// different KIND of document, distinguished additively:
//     id      = "reception__<visitorUid>"   (deterministic)
//     ownerId = "reception"
//     kind    = "reception"
// Agent-share docs keep id "<ownerId>__<visitorId>", a real ownerId and NO
// `kind` field, so every legacy document and every existing query
// (listenOwnerInbox is always scoped `where("ownerId","==",myUid)`) behaves
// exactly as before — a Reception doc simply never matches them.
//
// Idempotency: because the id is derived from the visitor's Anonymous Auth
// uid, a refresh (or ten refreshes) can only ever resolve to the SAME
// document. There is no create-if-missing race and no way to end up with
// two Reception docs for one visitor.
//
// Persistence threshold: NOTHING is written while the exchange is still a
// general question. The server (receptionTurn) decides — it classifies and
// replies in ONE model call and only writes once the visitor reaches
// advisory/qualified (their own property, their own real search/sale).
export function receptionConversationId(visitorId) {
  return "reception__" + visitorId;
}

// The whole turn — Claude call AND both message writes — happens inside the
// receptionTurn Callable (Admin SDK). The browser never writes a role:"ai"
// message and never supplies the reply text it renders, so an AI message
// cannot be spoofed client-side (firestore.rules also denies it outright).
//
// seedMessages is only consulted by the server on the turn that FIRST
// crosses the threshold: a bounded slice (≤8) of the recent raw exchange,
// never the full casual transcript.
//
// Returns { reply, meta, persisted, conversationId, stage }.
// `persisted:false, conversationId:null` means the turn stayed general and
// zero Firestore writes happened.
export async function receptionTurn({ system, messages, customerText, seedMessages, propertyRefs, collectionIds }) {
  await getVisitorId(); // callable requires an authenticated caller
  const fn = (await functionsAsync()).httpsCallable("receptionTurn");
  const { data } = await fn({ system, messages, customerText, seedMessages, propertyRefs, collectionIds });
  return data;
}

// Idempotent resume: returns the visitor's existing Reception conversation
// or null. A single doc `get` by deterministic id — never a collection
// query/scan. Returns null (rather than throwing) when the doc does not
// exist OR is unreadable, so a first-time visitor and an offline visitor
// both simply continue in local/lightweight mode.
export async function findExistingReception() {
  try {
    const uid = await getVisitorId();
    const snap = await db().collection("conversations").doc(receptionConversationId(uid)).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() };
  } catch (e) {
    return null;
  }
}

// Direct client write — customer replying on the Human tab (talking to the
// real sender/owner, not the AI). Firestore rules permit the authenticated
// visitor to write role:"customer" directly (no AI call involved here).
export async function sendHumanMessage({ conversationId, text }) {
  const now = window.firebase.firestore.FieldValue.serverTimestamp();
  const uid = auth().currentUser && auth().currentUser.uid;
  await db().collection("conversations").doc(conversationId).collection("messages").add({
    role: "customer", senderId: uid, text, createdAt: now, readByOwner: false,
  });
  await db().collection("conversations").doc(conversationId).set({
    lastMessage: text, lastMessageRole: "customer", lastMessageAt: now, updatedAt: now, unreadByOwner: true,
  }, { merge: true });
}

// Direct client write — ONLY for role "owner" (the Owner replying).
export async function appendOwnerMessage(conversationId, ownerId, text) {
  const now = window.firebase.firestore.FieldValue.serverTimestamp();
  await db().collection("conversations").doc(conversationId).collection("messages").add({
    role: "owner", senderId: ownerId, senderLabel: "", text,
    createdAt: now, readByOwner: true, readByCustomer: false,
  });
  await db().collection("conversations").doc(conversationId).set({
    lastMessage: text, lastMessageAt: now, updatedAt: now, status: "active",
  }, { merge: true });
}

export function setVisitorLabel(conversationId, label) {
  return db().collection("conversations").doc(conversationId).set({ visitorLabel: label, updatedAt: window.firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
}

export function markReadByOwner(conversationId) {
  return db().collection("conversations").doc(conversationId).set({
    unreadByOwner: false, updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
}

// ── Realtime listeners ──────────────────────────────────────────────────

// Owner inbox: every conversation this owner owns, newest first — ALWAYS
// scoped by ownerId (never an unscoped query), matching the Firestore rule
// that denies unscoped `list` queries on this collection.
export function listenOwnerInbox(ownerId, cb) {
  return db().collection("conversations")
    .where("ownerId", "==", ownerId)
    .orderBy("lastMessageAt", "desc")
    .onSnapshot(
      (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })), null),
      (err) => cb(null, err)
    );
}

// One conversation's message thread, oldest first — used by BOTH the
// customer's own chat window and the owner's open-conversation pane (same
// listener shape, same Firestore path — AI / customer / owner messages
// live in a single thread, never split).
export function listenMessages(conversationId, cb) {
  return db().collection("conversations").doc(conversationId).collection("messages")
    .orderBy("createdAt", "asc")
    .onSnapshot(
      (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })), null),
      (err) => cb(null, err)
    );
}
