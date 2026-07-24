// Real (not fake) conversation persistence for the AI+Human chat.
//
// SCOPE / HONEST LIMITATION: this uses localStorage as the shared store.
// localStorage is shared across every tab/window of the SAME browser on the
// SAME device (this is why two tabs open side-by-side, as in a same-device
// test, see each other's writes live via the native "storage" event with NO
// refresh needed). It does NOT sync across different devices/browsers.
// True cross-device real-time sync requires a Firestore "conversations" /
// "messages" collection + matching security rules — that is a real
// architecture + rules change and needs explicit Product Owner / CEO
// approval before being deployed (this project's Firestore rules are
// role-based deny-by-default and locked; adding a new collection means new
// rules). This module is written so swapping the storage layer for
// Firestore later (same function names/shapes) is a small, contained change.

const CONV_KEY = "hh_conversations";
const VISITOR_KEY = "hh_visitor_id";
const EVT = "hh_conversations_changed";

function slugifyOwner(name) {
  return String(name || "admin").trim().toLowerCase().replace(/[^a-z0-9ก-๙]+/gi, "-").replace(/^-+|-+$/g, "") || "admin";
}

export function getVisitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = "v" + Math.random().toString(36).slice(2, 10);
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch (e) {
    return "v" + Math.random().toString(36).slice(2, 10);
  }
}

export function getConversationId(ownerId, visitorId) {
  return slugifyOwner(ownerId) + "__" + visitorId;
}

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(CONV_KEY) || "{}");
  } catch (e) {
    return {};
  }
}

function writeAll(all) {
  try {
    localStorage.setItem(CONV_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent(EVT));
  } catch (e) {}
}

export function getConversation(ownerId, visitorId) {
  const all = readAll();
  return all[getConversationId(ownerId, visitorId)] || null;
}

export function listConversations(ownerId) {
  const all = readAll();
  const prefix = slugifyOwner(ownerId) + "__";
  return Object.values(all)
    .filter((c) => c && c.id && c.id.startsWith(prefix))
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

// Creates the conversation on first contact (or returns the existing one),
// recording who owns it (ownerId) and who the visitor is — satisfies
// "every conversation must have an owner from the moment it's created".
export function ensureConversation(ownerId, visitorId, meta) {
  const all = readAll();
  const id = getConversationId(ownerId, visitorId);
  if (!all[id]) {
    all[id] = {
      id,
      ownerId: slugifyOwner(ownerId),
      ownerLabel: (meta && meta.ownerLabel) || ownerId || "Admin",
      visitorId,
      visitorLabel: (meta && meta.visitorLabel) || ("ผู้เยี่ยมชม " + visitorId.slice(-4)),
      collectionIds: (meta && meta.collectionIds) || [],
      messages: [],
      unreadByOwner: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    writeAll(all);
  }
  return all[id];
}

// Appends one message (role: "ai" | "customer") to the conversation and
// marks it unread for the owner side — this is what makes a brand-new
// conversation show up in the Owner's "ผู้คน" list immediately, and is also
// how the AI's entire greeting + reply history stays attached to the SAME
// conversation the owner opens later (owner never starts from zero).
export function appendMessage(ownerId, visitorId, role, text) {
  const all = readAll();
  const id = getConversationId(ownerId, visitorId);
  const conv = all[id] || ensureConversation(ownerId, visitorId, {});
  conv.messages = [...(conv.messages || []), { role, text, at: Date.now() }];
  conv.lastMessage = text;
  conv.updatedAt = Date.now();
  if (role === "customer") conv.unreadByOwner = true;
  all[id] = conv;
  writeAll(all);
  return conv;
}

export function setVisitorLabel(ownerId, visitorId, label) {
  const all = readAll();
  const id = getConversationId(ownerId, visitorId);
  if (all[id]) { all[id].visitorLabel = label; all[id].updatedAt = Date.now(); writeAll(all); }
}

export function setOwnerNote(ownerId, visitorId, note) {
  const all = readAll();
  const id = getConversationId(ownerId, visitorId);
  if (all[id]) { all[id].ownerNote = note; writeAll(all); }
}

export function markReadByOwner(ownerId, visitorId) {
  const all = readAll();
  const id = getConversationId(ownerId, visitorId);
  if (all[id] && all[id].unreadByOwner) { all[id].unreadByOwner = false; writeAll(all); }
}

export function subscribe(fn) {
  const handler = () => fn();
  window.addEventListener(EVT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVT, handler);
    window.removeEventListener("storage", handler);
  };
}
