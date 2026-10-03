// LISTING-E2E-01 — the ONE "sufficient to submit" checklist (BLUEPRINT §30.1 / §31.1 / §32.1: a CHECKLIST, never a percentage; submit
// does not wait for 100%; contactability lives here; photos follow PHOTO MINIMUM STANDARD v1). Used by submitListingCase (the authority)
// and mirrored by /submission-checklist.js for the form (tests/listing/sync.test.js compares them).
// Property COMPLETENESS (the percentage) is a different thing and is NOT computed here.
"use strict";

const { photoStandardFor } = require("./photo-standard");

const TYPES = ["villa", "house", "townhouse", "condo", "land", "commercial"];
const AREAS = ["hua-hin", "pranburi", "cha-am"];
const COMMERCIAL_SUBTYPES = ["shophouse", "retail", "office", "warehouse", "hotel_resort", "other"];
const COORDS_RE = /^\s*-?\d{1,3}(\.\d+)?\s*,\s*-?\d{1,3}(\.\d+)?\s*$/;

function usableContact(raw) {
  const s = typeof raw === "string" ? raw.trim().slice(0, 160) : "";
  if (s.length < 5) return false;
  if (s.replace(/[^0-9]/g, "").length >= 8) return true;
  if (/[^\s@]+@[^\s@]+\.[^\s@]+/.test(s)) return true;
  return /(line|ไลน์)\s*[:：]?\s*\S{3,}/i.test(s);
}

// f: { txnType, type, price, priceMode ("fixed"|"appraisal"), area, coords, commercialSubtype, name, phone, email }
// returns the list of missing items (empty = sufficient to submit). Keys are stable ids the form maps to messages.
function missingForSubmit(f, photoCount) {
  const m = [];
  const x = f || {};
  if (x.txnType !== "sale" && x.txnType !== "rent") m.push("intent");
  if (!TYPES.includes(x.type)) m.push("type");
  if (x.type === "commercial" && !COMMERCIAL_SUBTYPES.includes(x.commercialSubtype)) m.push("commercialSubtype");
  // price: a number — OR an explicit request for appraisal (the owner does not know the price yet). Publishing still needs a price.
  if (x.priceMode !== "appraisal") { const p = Number(x.price); if (!Number.isFinite(p) || p <= 0 || p > 100000000000) m.push("price"); }
  // location: at least the MAIN location — the area (district) or a map pin. Finer location is a Core/Conditional item, not a submit blocker.
  const hasArea = AREAS.includes(x.area), hasPin = typeof x.coords === "string" && COORDS_RE.test(x.coords);
  if (!hasArea && !hasPin) m.push("location");
  // contactability
  if (!(typeof x.name === "string" && x.name.trim().length >= 2)) m.push("contactName");
  if (!usableContact(x.phone) && !usableContact(x.email)) m.push("contact");
  // photos: PHOTO MINIMUM STANDARD v1 (min, not target)
  if ((Number(photoCount) || 0) < photoStandardFor(x.type).min) m.push("photos");
  return m;
}

module.exports = { missingForSubmit, usableContact, TYPES, AREAS, COMMERCIAL_SUBTYPES, COORDS_RE };
