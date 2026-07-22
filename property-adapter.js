// property-adapter.js — single normalization entry point for Property
// Details. Goal: UI reads ONE safe, normalized model instead of scattering
// `raw.foo && raw.foo.bar` guards across the template/logic. No Firestore
// writes, no schema changes — this only reshapes what's already in
// data.js/Firestore into a defensive shape.
//
// Scope note (Step 2.2C): core identity/price/facts/photos/seo fields are
// fully routed through this adapter. Photo-gallery index math and SEO tag
// injection in Property Details.dc.html still read `raw` directly — they
// already had solid guards from Step 2.1/2.2A and rewriting working,
// tested gallery logic wasn't worth the regression risk this pass. Flagged
// as remaining work, not silently left out.

export const DATA_STATE = Object.freeze({
  LOADING: "loading",
  LOADED: "loaded",
  EMPTY: "empty",
  ERROR: "error",
  PERMISSION_DENIED: "permission_denied",
  NOT_FOUND: "not_found",
});

/** Classify a fetch outcome into one of DATA_STATE. Callers pass the raw
 * error (if any) and whether the fetch resolved to nothing. */
export function classifyDataState({ loading, error, isEmpty }) {
  if (loading) return DATA_STATE.LOADING;
  if (error) {
    const code = error && (error.code || "");
    if (code === "permission-denied") return DATA_STATE.PERMISSION_DENIED;
    if (code === "not-found") return DATA_STATE.NOT_FOUND;
    return DATA_STATE.ERROR;
  }
  if (isEmpty) return DATA_STATE.EMPTY;
  return DATA_STATE.LOADED;
}

function safeStr(v, fallback = "") { return typeof v === "string" && v ? v : fallback; }
function safeNum(v) { return typeof v === "number" && Number.isFinite(v) ? v : null; }

/** Normalize one raw property record (data.js shape or Firestore doc) into
 * a UI-safe model. Never throws on missing/malformed fields. */
export function normalizeProperty(raw, mod, lang) {
  if (!raw) return null;
  const t = (mod && mod.I18N && mod.I18N[lang]) || {};
  const areaDef = mod && mod.AREAS ? mod.AREAS.find((a) => a.id === raw.area) : null;
  const typeDef = mod && mod.TYPES ? mod.TYPES.find((ty) => ty.id === raw.type) : null;

  const rawPhotos = Array.isArray(raw.photos) ? raw.photos : [];
  const photos = rawPhotos.map((p) => ({
    label: (p && typeof p === "object" ? p.label : p) || "photo",
    url: (p && typeof p === "object" && typeof p.url === "string") ? p.url : "",
  }));

  return {
    id: safeStr(raw.id, "UNKNOWN"),
    title: (raw.title && (raw.title[lang] || raw.title.en)) || raw.id || "Untitled",
    price: safeNum(raw.price) ?? 0,
    priceValid: safeNum(raw.price) !== null && raw.price > 0,
    currency: safeStr(raw.currency, "THB"),
    status: safeStr(raw.status, "sale"),
    areaLabel: (areaDef && areaDef.label && areaDef.label[lang]) || safeStr(raw.area, "—"),
    typeLabel: (typeDef && typeDef.label && typeDef.label[lang]) || safeStr(raw.type, "—"),
    zone: safeStr(raw.zone, ""),
    bedrooms: safeNum(raw.bedrooms),
    bathrooms: safeNum(raw.bathrooms),
    landSize: safeNum(raw.landSize),
    livingArea: safeNum(raw.livingArea),
    parking: safeNum(raw.parking),
    ownership: safeStr(raw.ownership, ""),
    photos,
    hasPhotos: photos.some((p) => p.url),
    mapLink: safeStr(raw.mapLink, ""),
    hasMapLink: !!raw.mapLink,
    seoTitle: safeStr(raw.seo && raw.seo.title, ""),
    seoDesc: safeStr(raw.seo && raw.seo.desc, ""),
    seoKeywords: safeStr(raw.seo && raw.seo.keywords, ""),
    // Future/missing fields — always present with a safe default so the UI
    // never has to guess whether a field exists upstream.
    agentSlug: safeStr(raw.agentSlug, ""),
    videoUrl: safeStr(raw.videoUrl, ""),
    virtualTourUrl: safeStr(raw.virtualTourUrl, ""),
    hasVideo: !!raw.videoUrl,
    hasVirtualTour: !!raw.virtualTourUrl,
  };
}
