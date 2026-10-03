// PHOTO MINIMUM STANDARD v1 (BLUEPRINT §32 item 9 — LOCKED). The single source of the numbers.
//   min    = enough photos to SUBMIT a case (customer / agent / owner)
//   target = "photo set complete" (x/y readiness). Staff's intake gate before "submit for
//            review" uses the target for the property's type — NOT a flat number — so a
//            land case with its 3 photos is not blocked, and a house is expected to have 6.
// MIRRORED by /photo-standard.js (browser); tests/listing/sync.test.js fails if they differ.
"use strict";
const PHOTO_STANDARD = {
  land: { min: 1, target: 3 }, condo: { min: 2, target: 5 }, house: { min: 2, target: 6 },
  villa: { min: 2, target: 7 }, townhouse: { min: 2, target: 5 }, commercial: { min: 2, target: 5 },
};
const DEFAULT_TYPE = "house"; // legacy records without a usable type
function photoStandardFor(type) { return PHOTO_STANDARD[type] || PHOTO_STANDARD[DEFAULT_TYPE]; }
module.exports = { PHOTO_STANDARD, photoStandardFor, DEFAULT_TYPE };
