// Resumable, idempotent translation-completion runner for the PKG-UX-001
// demo batch. Reuses the real production pipeline (firebase-client.js
// translateDescriptionAll) — this is NOT a second translation mechanism,
// just a controlled driver around it so long-running AI calls survive
// this sandbox's per-call execution cap without duplicate spend or
// unbounded retries.
//
// Tracking fields written directly onto each properties/{id} doc (no new
// collection, matches existing schema conventions):
//   translationStatus       "pending" | "processing" | "completed" | "failed"
//   translationAttemptCount number
//   translationLastError    string
//   translationCompletedAt  epoch ms
//   translationSourceHash   simple hash of the EN source text, so a future
//                           edit to the source can be detected and re-queued
//   translationPipelineVersion  "v1-fullDesc-only" (matches AI Quick Add's
//                           actual scope: production only translates the
//                           long description at save time — title/SEO
//                           fields are authored directly by AI Quick Add's
//                           own draft step in the source language, not
//                           re-translated by this function — so this
//                           runner intentionally does NOT invent translation
//                           for title/SEO fields the real pipeline doesn't
//                           touch either.)
const REQUIRED_LANGS = ["th", "en", "ru", "zh", "de", "no", "fr", "it"];
const MAX_ATTEMPTS = 3;

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; }
  return String(h);
}

function isComplete(fullDesc) {
  if (!fullDesc) return false;
  return REQUIRED_LANGS.every((l) => typeof fullDesc[l] === "string" && fullDesc[l].trim().length > 0);
}

// Processes exactly ONE pending/failed(retryable) record per call — safe to
// invoke repeatedly (e.g. once per turn) until it reports queueEmpty:true.
export async function processNextOne(fb, testBatchId) {
  const props = (await fb.fetchCollection("properties")).filter((p) => p.testBatchId === testBatchId);
  const srcHashOf = (p) => hash(p.fullDesc && p.fullDesc.en || "");

  // Backfill: records translated manually before this runner existed (all 8
  // langs already present) count as done — mark them so future scans skip
  // them without re-spending an AI call.
  for (const p of props) {
    if (isComplete(p.fullDesc) && p.translationStatus !== "completed") {
      await fb.updateDocFields("properties", p.id, {
        translationStatus: "completed", translationCompletedAt: p.translationCompletedAt || Date.now(),
        translationSourceHash: srcHashOf(p), translationPipelineVersion: "v1-fullDesc-only",
      });
      p.translationStatus = "completed"; p.translationSourceHash = srcHashOf(p);
    }
  }

  const candidate = props.find((p) => {
    if (isComplete(p.fullDesc) && p.translationStatus === "completed") return false; // already done
    if (p.translationStatus === "failed" && (p.translationAttemptCount || 0) >= MAX_ATTEMPTS) return false; // exhausted retries
    return true;
  });

  if (!candidate) {
    const completed = props.filter((p) => isComplete(p.fullDesc) && p.translationStatus === "completed");
    const failed = props.filter((p) => p.translationStatus === "failed" && (p.translationAttemptCount || 0) >= MAX_ATTEMPTS);
    return { queueEmpty: true, total: props.length, completed: completed.length, failed: failed.map((p) => p.id) };
  }

  // Owner validation: Firestore Rules only allow a lister to write their
  // OWN properties (or Admin, who bypasses this check). Confirm the
  // signed-in caller actually owns this record before spending an AI call
  // and attempting a write that would just be rejected anyway.
  const currentUid = (typeof window !== "undefined" && window.firebase && window.firebase.auth().currentUser) ? window.firebase.auth().currentUser.uid : null;
  const isAdminCaller = fb.isAdminAuthed ? fb.isAdminAuthed() : false;
  if (!isAdminCaller && currentUid && candidate.listerId && currentUid !== candidate.listerId) {
    return { id: candidate.id, ok: false, skipped: true, reason: `signed in as ${currentUid}, record owned by ${candidate.listerId} — sign in as the correct owner (or Admin) and retry` };
  }

  const attempt = (candidate.translationAttemptCount || 0) + 1;
  await fb.updateDocFields("properties", candidate.id, { translationStatus: "processing", translationAttemptCount: attempt });

  try {
    const sourceText = candidate.fullDesc && candidate.fullDesc.en;
    if (!sourceText) throw new Error("no English source text to translate");
    const translations = await fb.translateDescriptionAll(sourceText);
    if (!translations || !isComplete(translations)) throw new Error("translation response incomplete: got " + Object.keys(translations || {}).join(","));
    await fb.updateDocFields("properties", candidate.id, {
      fullDesc: translations,
      translationStatus: "completed",
      translationCompletedAt: Date.now(),
      translationSourceHash: hash(sourceText),
      translationPipelineVersion: "v1-fullDesc-only",
      translationLastError: null,
    });
    return { id: candidate.id, ok: true, attempt, langs: Object.keys(translations) };
  } catch (e) {
    await fb.updateDocFields("properties", candidate.id, {
      translationStatus: attempt >= MAX_ATTEMPTS ? "failed" : "pending",
      translationLastError: String(e.message || e),
    });
    return { id: candidate.id, ok: false, attempt, error: String(e.message || e) };
  }
}
