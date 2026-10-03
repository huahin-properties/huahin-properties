// D2 (owner decision, 3 ต.ค. 2569): land size can be entered in ตร.ว. (sqwa) OR ตร.ม. (sqm); 1 ตร.ว. = 4 ตร.ม.
// MIRRORED (same behaviour) by /functions/land-area.js used by the listing functions; tests/listing/land-area.test.js runs the same vectors against both.
//
// Stored on a Case / listing:
//   landAreaValue  the number exactly as entered
//   landAreaUnit   "sqwa" | "sqm"  — the unit it was entered in (explicit, never guessed)
//   landAreaSqm    canonical value in ตร.ม. for calculation and search — ALWAYS recomputed from (landAreaValue, landAreaUnit); never converted from a previous canonical
// The OLD field `landSize` has NO unit. It is left untouched and is never labelled, converted or "upgraded" automatically: only a person who states the unit creates the three fields above.
export const SQM_PER_SQWA = 4;
export const LAND_UNITS = ["sqwa", "sqm"];
const round2 = (n) => Math.round(n * 100) / 100;
export function validLandValue(v) { return typeof v === "number" && isFinite(v) && v > 0 && v <= 1000000000; }
export function toSqm(value, unit) {
  if (!validLandValue(value) || !LAND_UNITS.includes(unit)) return null;
  return round2(unit === "sqwa" ? value * SQM_PER_SQWA : value);
}
export function fromSqm(sqm, unit) {
  if (!validLandValue(sqm) || !LAND_UNITS.includes(unit)) return null;
  return round2(unit === "sqwa" ? sqm / SQM_PER_SQWA : sqm);
}
// {landAreaValue, landAreaUnit, landAreaSqm} computed from the ENTERED value + unit, or null when either is missing/invalid (then all three must be empty).
export function landAreaFields(value, unit) {
  const v = typeof value === "string" ? Number(value) : value;
  const sqm = toSqm(v, unit);
  return sqm === null ? null : { landAreaValue: v, landAreaUnit: unit, landAreaSqm: sqm };
}
// Re-derives the canonical value of a record from what was entered (so a stale or hand-edited landAreaSqm can never reach the public page).
export function normalizeLandArea(rec) {
  const f = rec ? landAreaFields(rec.landAreaValue, rec.landAreaUnit) : null;
  return f;
}
// What a page shows: "known" (value + unit entered, plus the same area in the other unit), "legacy" (an old unitless number: show it WITHOUT any unit and say the unit is not specified) or null.
export function landAreaView(rec) {
  const f = normalizeLandArea(rec);
  if (f) { const other = f.landAreaUnit === "sqwa" ? "sqm" : "sqwa"; return { kind: "known", value: f.landAreaValue, unit: f.landAreaUnit, sqm: f.landAreaSqm, otherUnit: other, otherValue: other === "sqm" ? f.landAreaSqm : fromSqm(f.landAreaSqm, "sqwa") }; }
  const old = rec && rec.landSize;
  if (typeof old === "number" && isFinite(old) && old > 0) return { kind: "legacy", value: old };
  return null;
}
