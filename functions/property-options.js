// ─────────────────────────────────────────────────────────────────
// C4.3 Phase 2A-3 — CANONICAL PROPERTY OPTIONS
//
// The SINGLE definition of every allowed value in the property schema.
// Customer (Phase 2B), AI extraction, Staff form and Admin editor all read
// from here, which is the mechanism that satisfies the locked principle
// ONE CANONICAL OPTION DEFINITION (BLUEPRINT §32.1).
//
// RULES FOR THIS FILE
//   1. Values are machine ids, never display text. Human labels (8 languages)
//      live in data.js — never duplicate a label here.
//   2. Existing ids are FROZEN. Renaming one would orphan every stored
//      document. New meaning = new id appended to the list.
//   3. Nothing here computes completeness. Phase 2A-4 owns that; this file
//      must stay free of scoring so one standard can be swapped without
//      touching the option sets.
//   4. Pure module: no I/O, no Firestore, no admin SDK. Directly testable.
// ─────────────────────────────────────────────────────────────────

// ── Option sets ──────────────────────────────────────────────────

// Customer intent. SELL/RENT_OUT reuse the existing reception intents;
// BUY/RENT are deliberately NOT here — they are a demand profile belonging
// to a later phase (BLUEPRINT §32, Intent First).
const INTENT = ["sale", "rent"];

// Terminal listing states the staff form already writes. Kept in the same
// set as INTENT's ids because `status` is one stored field.
const LISTING_STATUS = ["sale", "rent", "sold", "reserved", "rented"];

// FROZEN — 6 ids, exactly as in data.js TYPES. `villa` is labelled
// "Pool Villa / พูลวิลล่า" in all 8 languages, so it carries pool intent.
const PROPERTY_TYPE = ["villa", "house", "townhouse", "condo", "land", "commercial"];

// NEW (OD approved). Commercial had no subtype at all, which is why
// type+area+price could read as a complete commercial record.
const COMMERCIAL_SUBTYPE = ["shophouse", "retail", "office", "warehouse", "hotel_resort", "other"];

// NEW (OD-A). `condition` below bundles new/resale WITH in/outside project,
// so "outside project" could not be answered independently. projectStatus
// separates the two concepts; old documents derive it (see deriveProjectStatus).
const PROJECT_STATUS = ["in_project", "outside_project", "unknown"];

// FROZEN — the staff form's existing 4 values. Do NOT rename: stored
// documents and the Facebook-post generator both read these ids.
const CONDITION = ["new_in_project", "new_outside_project", "resale_in_project", "resale_outside_project"];

// 5 existing ids + 3 approved in OD-B. leasehold/company are real Hua Hin
// foreign-ownership structures that previously collapsed into "other".
const TITLE_DEED = [
  "chanote", "nor_sor_3_gor", "nor_sor_3", "por_bor_tor_5",
  "leasehold", "company", "other", "unknown",
];

// NEW. Pool presence was previously inferred from the `private_pool` feature
// or the existence of poolSize — an inference, never an answer.
const POOL_STATUS = ["has_pool", "no_pool", "unknown"];

// NEW.
const FURNISHING = ["fully", "partly", "unfurnished", "unknown"];

// 2 existing ids + 2 approved in OD-C. "no_separate_kitchen" is what makes
// "ไม่มี = answered" possible for a studio; without it a studio could not
// complete the kitchen concept.
const KITCHEN = ["thai_kitchen", "european_kitchen", "no_separate_kitchen", "unknown"];

const UTILITIES = ["available", "partial", "none", "unknown"];
const LAND_CONDITION = ["filled", "not_filled", "unknown"];
const ELECTRICAL_PHASE = ["1phase", "3phase", "unknown"];

// FROZEN — 3 existing values. `none` is how a customer declines to expose an
// exact location while still ANSWERING the location concept.
const MAP_DISPLAY = ["exact", "area", "none"];

const PURCHASE_OPTION = ["cash", "developer_installment", "bank_mortgage", "company_transfer"];

// NEW — enrichment only, no UI in this phase, never counted in any percentage.
const VIEW = ["sea_view", "mountain_view", "golf_view", "lake_view", "garden_view", "city_view", "none", "unknown"];
const FACILITIES = [
  "communal_pool", "gym", "security_24h", "gated_community", "parking_building",
  "elevator", "garden", "playground", "clubhouse", "none", "unknown",
];

// ── Answer states ────────────────────────────────────────────────
//
// The five meanings locked in BLUEPRINT §32.1 item 4, defined here so that
// Phase 2A-4 (completeness) and Phase 2B (Workspace UI) use ONE vocabulary
// instead of inventing two. THIS FILE ONLY NAMES THEM — it does not decide
// which ones count toward a percentage.
//
//   answered            a real value is present
//   no                  the customer knows there is none ("no pool")
//   not_applicable      the concept does not apply to this property type
//   unknown             the customer does not know (yet) — followable
//   missing             not answered at all
//   needs_confirmation  a value exists but is ambiguous/unconfirmed
const VALUE_STATE = ["answered", "no", "not_applicable", "unknown", "missing", "needs_confirmation"];

// States that mean "this concept HAS been answered". `no` and
// `not_applicable` belong here; `unknown` deliberately does not.
const ANSWERED_STATES = ["answered", "no", "not_applicable"];

// ── Field-level metadata used by later phases ────────────────────
//
// Declared here (not in the evaluator) so 2A-4 reads a description rather
// than re-deciding policy. `followUpOwner: "staff"` implements OD-D.
const FIELD_META = {
  zoningColor: { followUpOwner: "staff", note: "OD-D — staff follow-up core; never required of the customer." },
  poolSize: { parent: "poolStatus", parentAnswer: "has_pool", optionalDetail: true },
  projectName: { parent: "projectStatus", parentAnswer: "in_project", optionalDetail: true },
  commercialSubtype: { appliesToTypes: ["commercial"] },
};

// ── Validation helpers ───────────────────────────────────────────

const OPTION_SETS = {
  INTENT, LISTING_STATUS, PROPERTY_TYPE, COMMERCIAL_SUBTYPE, PROJECT_STATUS,
  CONDITION, TITLE_DEED, POOL_STATUS, FURNISHING, KITCHEN, UTILITIES,
  LAND_CONDITION, ELECTRICAL_PHASE, MAP_DISPLAY, PURCHASE_OPTION, VIEW,
  FACILITIES, VALUE_STATE,
};

// Case-insensitive, whitespace-tolerant membership test. Returns the
// canonical id or undefined — never a coerced guess.
function canonical(setName, raw) {
  const set = OPTION_SETS[setName];
  if (!set || raw === null || raw === undefined) return undefined;
  const v = String(raw).trim().toLowerCase();
  return set.includes(v) ? v : undefined;
}

// ── Derive-on-read (OD-A / backward compatibility) ───────────────
//
// NOTHING in this section writes. Old documents are never rewritten: the
// missing concept is COMPUTED when read, which is why Phase 2A-3 carries no
// destructive migration and nothing to roll back.

// condition -> projectStatus. An explicitly stored projectStatus always
// wins: once a human answers the concept directly, the derivation steps
// aside.
function deriveProjectStatus(doc) {
  const d = doc || {};
  const explicit = canonical("PROJECT_STATUS", d.projectStatus);
  if (explicit) return explicit;
  const c = canonical("CONDITION", d.condition);
  if (!c) return "unknown";
  if (c.endsWith("_in_project")) return "in_project";
  if (c.endsWith("_outside_project")) return "outside_project";
  return "unknown";
}

// poolStatus from the legacy signals. Land and condo get not_applicable
// rather than a guess. "No evidence of a pool" is NOT evidence of no pool —
// it stays `unknown` so the concept remains followable.
function derivePoolStatus(doc) {
  const d = doc || {};
  const explicit = canonical("POOL_STATUS", d.poolStatus);
  if (explicit) return explicit;
  const type = canonical("PROPERTY_TYPE", d.type);
  if (type === "land" || type === "condo") return "not_applicable";
  // data.js FEATURES uses the id `pool` for a private pool; some documents
  // and earlier docs say `private_pool`. Accept BOTH - an id mismatch must
  // not silently lose a pool that the record clearly has.
  const features = Array.isArray(d.features) ? d.features : [];
  if (features.includes("pool") || features.includes("private_pool")) return "has_pool";
  if (d.poolSize !== null && d.poolSize !== undefined && String(d.poolSize).trim() !== "") return "has_pool";
  return "unknown";
}

// The free-text `ownership` the AI has always collected -> the enum the forms
// use. This is the concrete fix for the one place the audit found two
// different option universes for the same concept.
//
// Returns { titleDeed } on a confident match, or { needsConfirmation: true }
// when the text is real but unrecognised. NEVER guesses a deed type: an
// unrecognised phrase becomes a question, not a fact.
const TITLE_DEED_PATTERNS = [
  [/(นส\.?\s*4|น\.?ส\.?\s*4|โฉนด|ครุฑแดง|chanote|chanod|title\s*deed)/i, "chanote"],
  [/(นส\.?\s*3\s*ก|น\.?ส\.?\s*3\s*ก|nor\s*sor\s*3\s*gor|ns3k)/i, "nor_sor_3_gor"],
  [/(นส\.?\s*3|น\.?ส\.?\s*3|nor\s*sor\s*3|ns3)/i, "nor_sor_3"],
  [/(ภบท|ภ\.?บ\.?ท\.?|por\s*bor\s*tor)/i, "por_bor_tor_5"],
  [/(เช่าระยะยาว|สัญญาเช่า|leasehold|lease\s*hold|30\s*ปี)/i, "leasehold"],
  [/(ถือผ่านบริษัท|ในนามบริษัท|บริษัทไทย|company|thai\s*co)/i, "company"],
];

function normaliseOwnershipText(raw) {
  if (raw === null || raw === undefined) return {};
  const text = String(raw).trim();
  if (!text) return {};
  // Already a canonical id (e.g. a staff form value round-tripping).
  const direct = canonical("TITLE_DEED", text);
  if (direct) return { titleDeed: direct };
  // NS3K before NS3: the more specific pattern must win.
  for (const [re, id] of TITLE_DEED_PATTERNS) {
    if (re.test(text)) return { titleDeed: id };
  }
  return { needsConfirmation: true };
}

// Parking: 0 is an ANSWER ("no parking"), null/absent is NOT. Keeping these
// apart is what stops an empty field being read as a confident "none".
function normaliseParking(raw) {
  if (raw === null || raw === undefined || String(raw).trim() === "") return { state: "missing" };
  const v = String(raw).trim().toLowerCase();
  if (v === "unknown" || v === "ไม่ทราบ") return { state: "unknown" };
  if (v === "none" || v === "ไม่มี") return { state: "no", value: 0 };
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > 200) return { state: "missing" };
  const int = Math.round(n);
  return int === 0 ? { state: "no", value: 0 } : { state: "answered", value: int };
}

// Bedrooms: 0 = studio = a KNOWN value (OD approved). Only null/absent is
// missing. This function documents the intent; the draft validator enforces
// the bound.
function normaliseBedrooms(raw) {
  if (raw === null || raw === undefined || String(raw).trim() === "") return { state: "missing" };
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0 || n > 50) return { state: "missing" };
  return { state: "answered", value: Math.round(n) };
}

// One call that adds every derived concept to a read model without mutating
// the source document.
function withDerivedConcepts(doc) {
  const d = doc && typeof doc === "object" ? doc : {};
  const out = Object.assign({}, d);
  out.projectStatus = deriveProjectStatus(d);
  out.poolStatus = derivePoolStatus(d);
  if (!out.titleDeed && d.ownership) {
    const mapped = normaliseOwnershipText(d.ownership);
    if (mapped.titleDeed) out.titleDeed = mapped.titleDeed;
  }
  return out;
}

module.exports = {
  INTENT, LISTING_STATUS, PROPERTY_TYPE, COMMERCIAL_SUBTYPE, PROJECT_STATUS,
  CONDITION, TITLE_DEED, POOL_STATUS, FURNISHING, KITCHEN, UTILITIES,
  LAND_CONDITION, ELECTRICAL_PHASE, MAP_DISPLAY, PURCHASE_OPTION, VIEW,
  FACILITIES, VALUE_STATE, ANSWERED_STATES,
  OPTION_SETS, FIELD_META,
  canonical, deriveProjectStatus, derivePoolStatus, normaliseOwnershipText,
  normaliseParking, normaliseBedrooms, withDerivedConcepts,
};
