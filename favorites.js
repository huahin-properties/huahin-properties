// favorites.js — client-side favorites + intent scoring (no login required)
//
// Everything lives in localStorage, keyed per-browser. This powers "ทาง 1"
// (commission leads): a visitor who favorites/revisits/lingers on listings
// builds an intent score; once it crosses a threshold, ContactRail's chat
// bot opens itself with a message tailored to what they've been looking at,
// instead of waiting for the visitor to start the conversation.

const FAV_KEY = "hh_favorites";       // { [propertyId]: { addedAt } }
const EVENTS_KEY = "hh_intent_events"; // [{ type, propertyId, at }]
const SCORE_KEY = "hh_intent_score";   // number
const LAST_TRIGGER_KEY = "hh_autobot_last_trigger"; // timestamp ms
const LAST_VIEW_PREFIX = "hh_last_view_"; // + propertyId -> timestamp ms

const TRIGGER_THRESHOLD = 10;
const TRIGGER_COOLDOWN_MS = 24 * 60 * 60 * 1000; // don't re-trigger within 24h

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
function writeJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
}

export function getFavorites() {
  return readJSON(FAV_KEY, {});
}

export function isFavorited(propertyId) {
  const favs = getFavorites();
  return !!favs[propertyId];
}

export function favoriteCount() {
  return Object.keys(getFavorites()).length;
}

function addScore(amount) {
  const cur = Number(localStorage.getItem(SCORE_KEY) || "0");
  const next = cur + amount;
  try { localStorage.setItem(SCORE_KEY, String(next)); } catch (e) {}
  return next;
}

export function getIntentScore() {
  return Number(localStorage.getItem(SCORE_KEY) || "0");
}

function logEvent(type, propertyId) {
  const events = readJSON(EVENTS_KEY, []);
  events.push({ type, propertyId, at: Date.now() });
  // Keep the list from growing forever — last 100 events is plenty.
  writeJSON(EVENTS_KEY, events.slice(-100));
}

// Toggles a property's favorite state. Returns the new state (true = now
// favorited). Scoring: +2 for favoriting at all; if this brings the total
// favorited count to 3+, an extra +5 "comparison shopping" bonus is added
// once (tracked via a flag so it doesn't repeat every toggle).
export function toggleFavorite(propertyId) {
  const favs = getFavorites();
  const nowFav = !favs[propertyId];
  if (nowFav) {
    favs[propertyId] = { addedAt: Date.now() };
    writeJSON(FAV_KEY, favs);
    addScore(2);
    logEvent("favorite", propertyId);
    const count = Object.keys(favs).length;
    const bonusGiven = localStorage.getItem("hh_intent_bonus_given") === "1";
    if (count >= 3 && !bonusGiven) {
      addScore(5);
      try { localStorage.setItem("hh_intent_bonus_given", "1"); } catch (e) {}
    }
  } else {
    delete favs[propertyId];
    writeJSON(FAV_KEY, favs);
  }
  try { window.dispatchEvent(new CustomEvent("hh_favorites_changed")); } catch (e) {}
  return nowFav;
}

// Call when a property detail page is viewed. Awards +3 if this is a
// return visit to the SAME property on a different calendar day than last
// time (shows sustained interest), otherwise no score for a first look.
export function recordPropertyView(propertyId) {
  const key = LAST_VIEW_PREFIX + propertyId;
  const last = Number(localStorage.getItem(key) || "0");
  const now = Date.now();
  if (last) {
    const lastDay = new Date(last).toDateString();
    const nowDay = new Date(now).toDateString();
    if (lastDay !== nowDay) {
      addScore(3);
      logEvent("return_view", propertyId);
    }
  }
  try { localStorage.setItem(key, String(now)); } catch (e) {}
}

// Call after a visitor has spent >60s on a property detail page.
export function recordLongView(propertyId) {
  const flagKey = "hh_long_view_awarded_" + propertyId + "_" + new Date().toDateString();
  if (localStorage.getItem(flagKey) === "1") return;
  addScore(1);
  logEvent("long_view", propertyId);
  try { localStorage.setItem(flagKey, "1"); } catch (e) {}
}

// Whether the auto-bot should proactively open right now: score is over
// threshold AND we haven't already triggered within the cooldown window.
export function shouldAutoTrigger() {
  const score = getIntentScore();
  if (score < TRIGGER_THRESHOLD) return false;
  const last = Number(localStorage.getItem(LAST_TRIGGER_KEY) || "0");
  return Date.now() - last > TRIGGER_COOLDOWN_MS;
}

export function markAutoTriggered() {
  try { localStorage.setItem(LAST_TRIGGER_KEY, String(Date.now())); } catch (e) {}
}

// Returns the list of favorited property IDs, most recently added first —
// used to build the auto-bot's tailored opening message and to attach
// "properties of interest" to a lead when the visitor engages.
export function getFavoritedIds() {
  const favs = getFavorites();
  return Object.entries(favs)
    .sort((a, b) => b[1].addedAt - a[1].addedAt)
    .map(([id]) => id);
}

// ── Named Collections (client-side, no login) ────────────────────────────
// Any visitor can group their favorites into named sets ("Collection A",
// "คุณเจน", etc) to keep buyers' shortlists separate — same idea as the
// agent-side Firestore collections in Lister Dashboard, but local-only
// here since an anonymous visitor has no account to sync to.
const COLLECTIONS_KEY = "hh_fav_collections";        // [{ id, name, createdAt }]
const COLLECTION_MEMBERS_KEY = "hh_fav_collection_members"; // { [collectionId]: [propertyId,...] }

export function getCollections() {
  return readJSON(COLLECTIONS_KEY, []);
}

function getCollectionMembers() {
  return readJSON(COLLECTION_MEMBERS_KEY, {});
}

export function getCollectionPropertyIds(collectionId) {
  const members = getCollectionMembers();
  return members[collectionId] || [];
}

export function createCollection(name) {
  const id = "c" + Date.now() + Math.random().toString(36).slice(2, 6);
  const cols = getCollections();
  cols.push({ id, name: name || "Collection " + (cols.length + 1), createdAt: Date.now() });
  writeJSON(COLLECTIONS_KEY, cols);
  try { window.dispatchEvent(new CustomEvent("hh_favorites_changed")); } catch (e) {}
  return id;
}

export function renameCollection(id, name) {
  const cols = getCollections().map((c) => (c.id === id ? { ...c, name } : c));
  writeJSON(COLLECTIONS_KEY, cols);
  try { window.dispatchEvent(new CustomEvent("hh_favorites_changed")); } catch (e) {}
}

export function deleteCollection(id) {
  writeJSON(COLLECTIONS_KEY, getCollections().filter((c) => c.id !== id));
  const members = getCollectionMembers();
  delete members[id];
  writeJSON(COLLECTION_MEMBERS_KEY, members);
  try { window.dispatchEvent(new CustomEvent("hh_favorites_changed")); } catch (e) {}
}

export function addToCollection(collectionId, propertyId) {
  const members = getCollectionMembers();
  const list = members[collectionId] || [];
  if (!list.includes(propertyId)) {
    members[collectionId] = [...list, propertyId];
    writeJSON(COLLECTION_MEMBERS_KEY, members);
  }
  // Being in any collection implies favorited, so it also shows in "All".
  if (!isFavorited(propertyId)) toggleFavorite(propertyId);
  try { window.dispatchEvent(new CustomEvent("hh_favorites_changed")); } catch (e) {}
}

// Overwrites a collection's full membership list at once — used when
// saving a draft selection (Save button), since the draft already holds
// the complete desired set rather than an incremental add/remove.
export function setCollectionMembers(collectionId, propertyIds) {
  const members = getCollectionMembers();
  members[collectionId] = [...propertyIds];
  writeJSON(COLLECTION_MEMBERS_KEY, members);
  try { window.dispatchEvent(new CustomEvent("hh_favorites_changed")); } catch (e) {}
}

export function removeFromCollection(collectionId, propertyId) {
  const members = getCollectionMembers();
  members[collectionId] = (members[collectionId] || []).filter((x) => x !== propertyId);
  writeJSON(COLLECTION_MEMBERS_KEY, members);
  try { window.dispatchEvent(new CustomEvent("hh_favorites_changed")); } catch (e) {}
}
