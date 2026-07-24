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
//   firebase-app-compat.js, firebase-auth-compat.js, firebase-firestore-compat.js,
//   firebase-functions-compat.js
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
function functions() { return getApp().functions("asia-southeast1"); }

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
  const fn = functions().httpsCallable("startConversation");
  const { data } = await fn({ senderId, collectionIds, propertyRefs, greetingText });
  return data;
}

// Calls the sendConversationTurn Callable Function — writes the customer's
// message, calls Claude, writes the AI's reply. Returns { reply }.
export async function sendConversationTurn({ conversationId, system, messages, customerText }) {
  const fn = functions().httpsCallable("sendConversationTurn");
  const { data } = await fn({ conversationId, system, messages, customerText });
  return data;
}

// Direct client write — customer replying on the Human tab (talking to the
// real sender/owner, not the AI). Firestore rules permit the authenticated
// visitor to write role:"customer" directly (no AI call involved here).
export async function sendHumanMessage({ conversationId, text }) {
  const now = window.firebase.firestore.FieldValue.serverTimestamp();
  await db().collection("conversations").doc(conversationId).collection("messages").add({
    role: "customer", text, createdAt: now, readByOwner: false,
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
