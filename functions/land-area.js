// D2 (owner decision, 3 ต.ค. 2569): land size can be entered in ตร.ว. (sqwa) OR ตร.ม. (sqm); 1 ตร.ว. = 4 ตร.ม.
// MIRRORED (same behaviour) by /land-area.js used by the browser pages; tests/listing/land-area.test.js runs the same vectors against both.
// The OLD field `landSize` has NO unit and is never labelled, converted or upgraded automatically (see /land-area.js).
"use strict";
const SQM_PER_SQWA = 4;
const LAND_UNITS = ["sqwa", "sqm"];
const round2 = (n) => Math.round(n * 100) / 100;
function validLandValue(v) { return typeof v === "number" && isFinite(v) && v > 0 && v <= 1000000000; }
function toSqm(value, unit) {
  if (!validLandValue(value) || !LAND_UNITS.includes(unit)) return null;
  return round2(unit === "sqwa" ? value * SQM_PER_SQWA : value);
}
function fromSqm(sqm, unit) {
  if (!validLandValue(sqm) || !LAND_UNITS.includes(unit)) return null;
  return round2(unit === "sqwa" ? sqm / SQM_PER_SQWA : sqm);
}
function landAreaFields(value, unit) {
  const v = typeof value === "string" ? Number(value) : value;
  const sqm = toSqm(v, unit);
  return sqm === null ? null : { landAreaValue: v, landAreaUnit: unit, landAreaSqm: sqm };
}
function normalizeLandArea(rec) { return rec ? landAreaFields(rec.landAreaValue, rec.landAreaUnit) : null; }
function landAreaView(rec) {
  const f = normalizeLandArea(rec);
  if (f) { const other = f.landAreaUnit === "sqwa" ? "sqm" : "sqwa"; return { kind: "known", value: f.landAreaValue, unit: f.landAreaUnit, sqm: f.landAreaSqm, otherUnit: other, otherValue: other === "sqm" ? f.landAreaSqm : fromSqm(f.landAreaSqm, "sqwa") }; }
  const old = rec && rec.landSize;
  if (typeof old === "number" && isFinite(old) && old > 0) return { kind: "legacy", value: old };
  return null;
}
module.exports = { SQM_PER_SQWA, LAND_UNITS, validLandValue, toSqm, fromSqm, landAreaFields, normalizeLandArea, landAreaView };
