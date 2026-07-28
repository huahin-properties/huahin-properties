# RELEASE NOTES — Knowledge Sync RC1

**Release**: Project Knowledge & Handover Center — Step 9 (continued)
**Date**: 21 July 2026
**Files Modified**: `CEO Guide.dc.html`, `BLUEPRINT.md`

## Objective
Continue and complete Step 9 — Full Knowledge Synchronization — per Product Owner HOLD/REVISION instruction, without opening a separate Step 9b.

## What Changed

### CEO Guide.dc.html
- Added centralized semantic status-badge CSS system (`.badge`, `.status-*` classes) replacing plain-text status/confidence labels, per the required GREEN/AMBER/RED/GRAY/BLUE color+icon+text system.
- Applied badges to the Knowledge Index table (Status, Confidence, and new Coverage % column) and the Knowledge Health summary.
- Added a documented Coverage % formula (completed applicable fields ÷ total applicable fields × 100; Needs Verification fields do not count as completed) — displayed in the Health panel note.
- Added **Investigation Evidence** blocks (files searched, facts found/not found, conflicts, verification result, reason not complete, next decision needed) to all 7 previously-thin Modules: KM-04 (Translation), KM-05 (Mini Website), KM-06 (AI), KM-11 (Business), KM-15 (DMC), KM-16 (SEO), KM-17 (Cleanup/Data Safety).
- Fixed real findings during investigation: KM-15 and KM-17 now have code-verified facts (DMC Step 6-9 status from BLUEPRINT §24; expiry/photo-purge rule confirmed directly against `firebase-client.js` constants) — both upgraded from "Pending" toward "Verified".
- Copy Handover buttons (7 of them, KM-01/02/03/07/08/12/14) confirmed still functional via proper `onClick="{{ }}"` binding + logic-class clipboard handler (fixed from the prior verifier-flagged raw-`onclick` failure).

### BLUEPRINT.md
- Added new §24.5 "Project Knowledge & Handover Center" documenting the CEO Guide expansion, the Current-State Synchronization Rule, and the 4 genuine Open Decisions (KM-05 slug system, KM-06 Agent AI architecture status, KM-09 Production Rules verification, KM-14 missing Review Standard definitions).
- No other BLUEPRINT.md section rewritten this round — existing §0-24 content preserved as-is (scope-limited; see Known Limitations).

## Known Limitations
- **10 of 17 Modules are fully populated** to the full Deep Knowledge depth; **7 Modules now have Investigation Evidence** (real findings, not fabricated) but not the complete original 28-field template depth — this was a deliberate no-invention tradeoff, not an oversight.
- **Supporting documentation files** (Project-Control-Governance-v2.2.md, Blueprint Status.dc.html, older Release Notes) were searched for facts (Knowledge Recovery Rule) but not rewritten — none contained information that needed correction beyond what's now reflected in CEO Guide.dc.html and BLUEPRINT.md §24.5.
- **Coverage percentages** are honest estimates based on how many of each Module's applicable fields are actually filled in — not a precise field-count audit script (no such script exists in this project).
- **4 genuine Open Decisions remain** (see BLUEPRINT.md §24.5) — these require CEO/Product Owner input, not further investigation from this environment.

## QA Results
See `QA-CHECKLIST-KNOWLEDGE-SYNC-RC1.md`.

## GitHub Upload Instructions
1. Download `CEO Guide.dc.html` and `BLUEPRINT.md` from the export package below.
2. Upload to GitHub via the usual web UI (Add file → Upload files), overwriting the existing files with matching names.
3. Do not upload the ZIP itself into the repository.

## Rollback Instructions
See `ROLLBACK-GUIDE-KNOWLEDGE-SYNC-RC1.md`.
