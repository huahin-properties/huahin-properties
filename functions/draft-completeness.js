// ─────────────────────────────────────────────────────────────────
// C4.3 Phase 2A-1 — CUSTOMER-FACING PROPERTY DRAFT COMPLETENESS
//
// The SINGLE authoritative evaluator for the percentage the customer sees.
// Lives inside functions/ because that is the only folder Firebase deploys:
// the server computes the number and hands it to the browser, so there is
// exactly one implementation and client/server drift is structurally
// impossible. The browser must never recalculate it.
//
// WHAT THIS IS NOT. It is not staff workflow completeness. `intake-workflow.js`
// (WORKFLOW_DEFS / intake_v1) remains the only definition of that, is not
// imported, not copied and not mirrored here: it evaluates a CASE (photos,
// description, verification records, reviewStatus) while this evaluates a
// pre-submit DRAFT. Six distinct concepts exist in this codebase and must
// stay distinct:
//   1. conversation qualification  — conversationStage
//   2. customer property-information completeness  — THIS FILE
//   3. Case creation minimum gate  — receptionCaseGate()
//   4. staff workflow completeness — intake-workflow.js
//   5. verification / approval     — verification records + reviewStatus
//   6. publication readiness       — listingStatus + Listing Approvals
// Collapsing any of them into this percentage is a product-level error, not
// a refactor.
//
// WHAT 100% GUARANTEES, exactly: every applicable required customer-property
// -information field holds a usable canonical value AND none of them carries
// needsConfirmation === true. Nothing about approval, verification,
// submission, Case creation, staff acceptance, price certification or
// publication. Submission stays an explicit customer action.
// ─────────────────────────────────────────────────────────────────

// Always required, for every property type.
const BASE_REQUIRED = ["type", "area", "price"];

// Type-conditional requirements.
//
// TYPE VOCABULARY. DRAFT_FIELD_SPECS.type in index.js is the only vocabulary:
// villa · house · townhouse · condo · land · commercial. It is NOT changed here
// and no subtype is added.
//
// PRODUCT OWNER DECISION (17 ก.ย. 2569, LOCKED) - the mapping is EXPLICIT per
// type, never derived from `!isLand && !isCondo`:
//   villa / house / townhouse -> HOUSE/VILLA set
//   condo                      -> CONDO set
//   land                       -> LAND set
//   commercial                 -> BASE set ONLY
//
// WHY COMMERCIAL IS NOT HOUSE/VILLA. A commercial property may be a
// shophouse, office, retail unit, warehouse or commercial building, so
// bedrooms / bathrooms / livingArea / ownership must NOT be demanded of it
// merely because it is neither land nor condo. Requiring fields a whole class
// of property may not have would show the customer a percentage that can
// never reach 100. Until commercial requirements are explicitly designed in a
// later product decision, commercial deliberately uses the BASE set - a
// conservative fallback, not an oversight. Do not "complete" this list.
const LAND_EXTRA = ["landSize", "ownership"];
const CONDO_EXTRA = ["livingArea", "bedrooms", "bathrooms", "floor"];
const BUILDING_EXTRA = ["landSize", "livingArea", "bedrooms", "bathrooms", "ownership"];

// Explicit per-type table. An exhaustive map beats a negated condition: a
// seventh type added to DRAFT_FIELD_SPECS tomorrow falls through to the BASE
// set (see requiredFieldsFor) instead of silently inheriting residential
// requirements it may not have.
const TYPE_EXTRA = {
  villa: BUILDING_EXTRA,
  house: BUILDING_EXTRA,
  townhouse: BUILDING_EXTRA,
  condo: CONDO_EXTRA,
  land: LAND_EXTRA,
  commercial: [],
};

// NEVER counted. coordsRaw is optional by product decision (PHASE 1A.2 moved
// the pin from the customer's obligation to Staff's). The rest are simply not
// customer draft information: customerName / contact belong to the Reception
// conversation and are receptionCaseGate's job; photos / description /
// features / verification / reviewStatus / listingStatus and every staff
// workflow field belong to the Case.
const NEVER_COUNTED = ["coordsRaw"];

// isLand / isCondo, read straight off the draft. Same field and same two
// literal values intake-workflow.js compares against ("land" / "condo"), so
// one vocabulary governs both engines. Kept for readability at the call sites
// that reason about the two structural special cases; the required-field
// decision itself goes through TYPE_EXTRA, not through these.
function isLandType(t) { return t === "land"; }
function isCondoType(t) { return t === "condo"; }

// Which fields are required for THIS draft.
//
// An unknown type yields the base three only. That is deliberate and honest:
// until the customer has told us what kind of property it is, the system does
// not know what else to ask for. The denominator therefore GROWS when `type`
// first arrives, and the percentage can fall as a result - a truthful
// consequence of learning more, not a bug to smooth over. A type that is not
// in TYPE_EXTRA falls through to the same base three, by design.
function requiredFieldsFor(fields) {
  const entry = fields && fields.type;
  const type = entry && typeof entry === "object" ? entry.value : undefined;
  const t = typeof type === "string" ? type : "";
  if (!t) return BASE_REQUIRED.slice();
  const extra = TYPE_EXTRA[t] || [];
  return BASE_REQUIRED.concat(extra);
}

// Presence fallback, used only when no validator is injected. Deliberately
// conservative: it never accepts an empty string or a non-finite number, so a
// caller without the specs can still not be told a blank field is complete.
function defaultUsable(key, value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "number") return Number.isFinite(value) && value > 0;
  if (typeof value === "string") return value.trim().length > 0;
  return false;
}

// Evaluate one draft's `fields` map.
//
// `opts.validate(key, value)` — pass validateDraftField from index.js. That
// keeps the canonical value rules (DRAFT_FIELD_SPECS, bounds, placeholder
// rejection, coords format) in their ONE existing home; this file owns which
// fields are counted, never what a valid value is.
//
// A field counts COMPLETE only when it has a usable canonical value AND
// needsConfirmation !== true. So:
//   value + confirmed            → complete
//   value + needsConfirmation    → incomplete, listed in confirmationFields
//   no value                     → incomplete, listed in missingFields
// A value-less entry that carries needsConfirmation is a question the AI
// raised, not a value: it is reported as MISSING, not as awaiting
// confirmation, because there is nothing yet to confirm.
//
// ROUNDING — one documented deterministic rule:
//   percent = Math.round(complete / required * 100), with two guards:
//   • all required complete  → exactly 100
//   • any required incomplete → at most 99 (so 7/8 = 87.5 → 88, and no
//     rounding path can ever display 100 while a field is still missing or
//     awaiting confirmation)
// No partial credit, equal weight per applicable required field.
function evaluateDraftCompleteness(fields, opts) {
  const f = fields && typeof fields === "object" ? fields : {};
  const validate = (opts && typeof opts.validate === "function") ? opts.validate : null;
  const usable = (key, value) => {
    if (validate) return validate(key, value) !== undefined;
    return defaultUsable(key, value);
  };

  const requiredFields = requiredFieldsFor(f);
  const completeFields = [];
  const missingFields = [];
  const confirmationFields = [];

  for (const key of requiredFields) {
    const e = f[key];
    const entry = e && typeof e === "object" ? e : null;
    const hasValue = !!entry && usable(key, entry.value);
    if (!hasValue) { missingFields.push(key); continue; }
    if (entry.needsConfirmation === true) { confirmationFields.push(key); continue; }
    completeFields.push(key);
  }

  const total = requiredFields.length;
  const done = completeFields.length;
  let percent;
  if (!total) percent = 0;
  else if (done >= total) percent = 100;
  else percent = Math.min(99, Math.round((done / total) * 100));

  return {
    percent,
    requiredFields,
    completeFields,
    missingFields,
    confirmationFields,
    // Informational only. NOT an approval, submission or publication signal;
    // no server path may branch on it to create anything.
    complete: done >= total && total > 0,
    standard: DRAFT_COMPLETENESS_STANDARD,
  };
}

// Version marker so a future change to the counted set is visible in stored
// logs and in the client payload instead of being an unexplained percentage
// shift.
const DRAFT_COMPLETENESS_STANDARD = "customer_draft_v1";

module.exports = {
  DRAFT_COMPLETENESS_STANDARD,
  BASE_REQUIRED,
  LAND_EXTRA,
  CONDO_EXTRA,
  BUILDING_EXTRA,
  TYPE_EXTRA,
  NEVER_COUNTED,
  requiredFieldsFor,
  evaluateDraftCompleteness,
};
