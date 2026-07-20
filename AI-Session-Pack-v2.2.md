# AI Session Pack v2.1 — huahin.properties

Generated: 17/07/2569 (v2.1.0, build 2026.07.17.02)

This file is a static snapshot for uploading into a new ChatGPT/Claude session as Project Context. For the live, always-current version, use the "🧠 AI Session Pack" button in CEO Dashboard → Command Center.

## PROJECT ROLES
See `Project-Control-Governance-v2.1.md` — 3 departments: Executive & Product Ownership (CEO), Strategy/Business/Marketing & Project Governance Office (ChatGPT), Software Engineering & Implementation (Development AI).

## CURRENT PROJECT PHASE
Foundation — Status: ACTIVE

## CURRENT SPRINT / CURRENT PRIORITY / CURRENT TASKS
Listing Approvals Responsive Testing (Pending — resumes after containment items below are cleared)

## OPEN ITEMS
1. Listing Approvals Responsive Testing — Pending
2. Firestore Index Review
3. AI Quick Add POI verification
4. QA test documents/accounts cleanup
5. Confirm Demo Listings (22 รายการ) codes
6. HH-70724 Storage orphan files verification
7. HH-58538 — awaiting direct Production Write approval to delete

## BLOCKED ITEMS
None currently blocking — all open items are pending CEO input/approval or scheduled testing.

## CRITICAL BUGS & RISKS
- P0 (fixed): global `setDoc()` used `.set()` without merge — silently wiped property documents on every partial update (approve/reject/expiry/archival sweeps). Fixed with `merge:true` + `createDoc/updateDocFields/replaceDoc` naming.
- HH-58538: real production listing corrupted by the above bug before the fix — only 8 photos survive, all other fields unrecoverable. Decision: delete. Awaiting explicit Production Write approval.
- Firestore temporary open rules expire 2026-08-08 — must be locked down before then.
- Storage orphan files possible for HH-70724 (Firestore side already cleaned).

## IMPORTANT DECISIONS
- HH-58538 is QA/Test-equivalent data (unrecoverable) — approved to delete (property document, propertyPhotos, Storage files) once Production Write is explicitly approved.
- Demo/sample listings (22) — kept for now, flagged Demo/Internal Only pending CEO confirmation of exact codes.
- ChatGPT role restructured under "Strategy, Business, Marketing & Project Governance Office" — analysis/planning/advisory only, no budget/Production Write/Deploy authority (CEO retains final approval on all of those).

## PRODUCTION STATUS
No pending Production Write executed without approval. HH-58538 delete is queued, awaiting explicit CEO Production Write approval.

## DEPLOY STATUS
Review and test latest `firestore.rules` — Deployment pending explicit CEO approval. No deploy performed this session.

## NEXT STEPS
1. Resume Listing Approvals Responsive Testing
2. CEO decision + approval to execute HH-58538 deletion (Production Write)
3. Confirm 22 demo listing codes
4. Manual Firebase Console cleanup of QA test accounts/docs
5. Firestore Index Review + AI Quick Add POI verification

## FULL PROJECT CONTROL MODULES
Use the "📋 Copy All Modules" button in CEO Dashboard → Project Control for the complete, always-current text of Modules 00–08 and 99 (too long to duplicate statically here without risking staleness).

## FULL COMMAND CENTER
Use the "📋 คัดลอกทั้งหมด · Copy All" button in CEO Dashboard → Command Center for the complete, always-current summary (health, completion %, milestones, current work, next actions, risks, decisions, development history).

---
END OF AI SESSION PACK
