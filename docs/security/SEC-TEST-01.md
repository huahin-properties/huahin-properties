# SEC-TEST-01 — Security probes with synthetic data (emulator only)

Branch `claude/sec-test-01`, base `origin/main` = `4e358a5`. **Tested commit: `9cd456e`** (run on a clean working tree on 1 Oct 2026; the first version of this PR, `90926c7`, was run earlier with the same label counts). No rules, Function or client file was modified.

> **A passing run is NOT a security certification.** Mocha "passing" only means a probe or inventory check ran and produced an answer (for GAP probes the answer *is* the finding). NOT-TESTED items are reported by mocha as **pending**, never as passing. A `GAP-CONFIRMED` row is an open weakness. `GAP-NOT-REPRODUCED` covers only the single case tested. Nothing here was run against production; no real customer data was read or written.

## 1. What was run

| Item | Value |
|---|---|
| Command | `npm ci` (root, lockfile unchanged) and `npm ci` inside `functions/` (not committed), then `npm run test:sec` |
| Emulators | Firestore + Storage, project `demo-sec-test-01`, ports 8181 / 9299, config `tests/firebase.sec-test.json` (the real `firebase.json` is untouched) |
| Tool versions | `firebase-tools@15.32.1` via `npx` (pinned in the npm script, not added as a dependency), `@firebase/rules-unit-testing` and `mocha` already in `package.json`, Node 22 locally (`functions/` declares Node 20) |
| Safety | `tests/helpers/synthetic.js: assertEmulatorOnly()` aborts unless the project id starts with `demo-` and the Firestore/Storage hosts are loopback |
| Result (run on `9cd456e`, `npm run test:sec`, exit 0) | **95 passing, 5 pending, 0 failing** · the 95 passing = 74 probes that ran + 10 source-inventory checks + 11 helper self-tests · the 5 pending = the 5 **NOT-TESTED** items (F1, F2, F3, S5c, S6c), listed separately below · probe labels (79 probes): **25 GAP-CONFIRMED · 0 GAP-NOT-REPRODUCED · 49 CONTROL · 5 NOT-TESTED** |
| Denial detection | `isAllowed()` / `attempt()` accept only Firestore `permission-denied` and Storage `storage/unauthorized` as "the rules said no". Message text (403, "unauthorized", "PERMISSION_DENIED" in a message) is never used. Any other error (network, emulator down, SDK/runtime, failed Function load) is re-thrown and fails the test. Proven by `tests/sec-helpers.selftest.test.js` (no emulator) |
| Review fixes (PR #2 review, 1 Oct 2026) | G1, G2, G11 (rules) and B1 (Function) no longer swallow errors: only a rules denial can become GAP-NOT-REPRODUCED. B-tests now fail (not NOT-TESTED) if `functions/index.js` cannot be loaded. NOT-TESTED probes are skipped so they count as pending |
| Noted side effect | The Admin SDK attempted a cloud metadata lookup for credentials (`MetadataLookupWarning ... 403`) while loading `functions/index.js`; data calls went to the emulator (loopback host asserted). The existing `npm run test:rules` (conversations only) was **not** re-run. |

Files: `tests/sec-gaps.rules.test.js` (A: Firestore rules), `tests/sec-gaps.storage.test.js` (A2: Storage rules), `tests/functions/create-case.characterization.test.js` (B: current Function, Admin SDK bypasses rules), `tests/sec-callsite-guard.test.js` (C: source inventory), `tests/sec-helpers.selftest.test.js` (helper self-test), `tests/helpers/synthetic.js`, `tests/firebase.sec-test.json`.

## 2. Labels

- `GAP-CONFIRMED` — the risky operation was **allowed** by the current rules/Function.
- `GAP-NOT-REPRODUCED` — hypothesis tested and denied, for the exact case only.
- `CONTROL` — behaviour that should be denied (or is intentionally allowed) and matched; a mismatch fails the run.
- `NOT-TESTED` — specified but not executed, with the reason.

## 3. Results

### GAP-CONFIRMED (25)

| ID | Probe | Note |
|---|---|---|
| G1 | anonymous reads unpublished case (pending) document | fields visible: contactName, ownerContact, trackToken, internalNotes |
| G2 | anonymous lists all properties | statuses returned: {"pending":3,"live":2,"offline":1} |
| G3a | anonymous reads owners |  |
| G3b | anonymous reads tenants |  |
| G3c | anonymous reads listers (profile incl. internal fields) | listers doc also holds tier/subscription/email-type fields in this synthetic shape; real shape unknown |
| G3d | anonymous reads a staffInvites document by e-mail key | get is public by design for Staff Signup; combined with G9 it matters |
| G4a | any signed-in user (no role) reads another agent's buyerRegistration |  |
| G4b | any signed-in user lists all buyerRegistrations |  |
| G5 | anonymous creates a pending owner_submission case with arbitrary extra fields (vipTier, listerId, approvedBy) | rules only check source + listingStatus, no allowed-field list |
| G6 | signed-in lister creates own listing directly as live (no Owner approval) | rules comment says live is admin-only; code allows it (Aug 2026 auto-publish) |
| G7a | signed-in lister moves own pending listing to live |  |
| G7b | signed-in lister writes approval fields (approvedBy/publishedAt) on own listing |  |
| G8 | signed-in lister edits own listers doc: tier/subscriptionStatus/status | any field of own doc is writable; client-side gating relies on these fields |
| G9 | signed-up user with an INVITED e-mail but email_verified=false creates own adminUsers doc as staff | rules do not check email_verified; invite doc is publicly readable (G3d) |
| G9b | after self-promotion to staff: reads leads / internal case messages | leads=true, internal caseMessage=true |
| G10a | anonymous reads propertyPhotos doc belonging to an unpublished case |  |
| G10b | anonymous creates a propertyPhotos doc attached to ANOTHER party's LIVE listing | create rule needs only a non-empty propertyId string |
| G10c | any signed-in user overwrites someone else's profilePhotos doc |  |
| G11 | token learned from public doc => read customer messages / post / write reply | read=true, post=true, infoReply=true |
| S1a | anonymous reads a photo of an unpublished owner-submission case (by name) | propertyPhotos is public-read for ALL objects, published or not |
| S1b | anonymous LISTS the propertyPhotos folder (enumerates names) | read rule also covers list |
| S3a | any signed-in user (no role) overwrites another lister's listing photo | rule is isSignedIn() only; filename ownership is not checkable (documented in storage.rules) |
| S3b | any signed-in user deletes another lister's listing photo |  |
| S3c | any signed-in user uploads a non-image, >8 MB object into propertyPhotos (public bucket path) | type/size limits apply only to the anonymous own-* rule |
| B1 | chat-created Case: contact/trackToken stored on the properties doc and readable by anonymous | stored fields: contactName,ownerContact,trackToken,conversationId,receptionVisitorId; anonymously readable: contactName,ownerContact,trackToken,conversationId,receptionVisitorId; listingStatus=pending, source=owner_submission |

### CONTROL (49)

| ID | Probe | Note |
|---|---|---|
| G3e | anonymous cannot LIST staffInvites | expected DENIED |
| G5b | anonymous cannot create a listing as live | expected DENIED |
| G7c | lister cannot move an admin-offlined listing back to live | expected DENIED |
| G7d | lister cannot edit another lister's listing | expected DENIED |
| G7e | Staff cannot set a listing live (update) | expected DENIED |
| G7f | Staff cannot create a listing as live | expected DENIED |
| G7g | Owner can set a listing live | expected ALLOWED |
| G8b | lister cannot edit another lister's doc | expected DENIED |
| G9c | invited e-mail user cannot self-assign role owner | expected DENIED |
| G9d | user WITHOUT an invite cannot create adminUsers doc | expected DENIED |
| G9e | Staff cannot change own role to owner | expected DENIED |
| G9f | lister cannot create an adminUsers doc without invite | expected DENIED |
| T1a | WRONG token cannot read customer messages | expected DENIED |
| T1b | EMPTY/short token cannot read customer messages | expected DENIED |
| T1c | token of another case cannot post on this case | expected DENIED |
| T1d | token holder cannot read INTERNAL messages | expected DENIED |
| T1e | wrong token cannot write the reply fields | expected DENIED |
| T1f | caseMessages history is immutable even for Owner (update) | expected DENIED |
| T1g | caseMessages history is immutable even for Owner (delete) | expected DENIED |
| T1h | anonymous cannot change price of a case | expected DENIED |
| T1i | anonymous may bump viewCount only (intended) | expected ALLOWED |
| C1 | anonymous cannot write owners | expected DENIED |
| C2 | anonymous cannot read leads | expected DENIED |
| C3 | anonymous can create a lead (public contact form, intended) | expected ALLOWED |
| C4 | signed-in stranger cannot read leads | expected DENIED |
| C5 | anonymous cannot read adminUsers | expected DENIED |
| C6 | anonymous cannot read internal project dashboard | expected DENIED |
| C7 | Staff can read owners (admin tools) | expected ALLOWED |
| C8 | stranger cannot write owners | expected DENIED |
| C9 | stranger cannot write properties of another lister | expected DENIED |
| S2a | anonymous may create a small own-*.webp image (intended submission channel) | expected ALLOWED |
| S2b | anonymous cannot upload a PDF under own-*.webp name | expected DENIED |
| S2c | anonymous cannot upload over 8 MB | expected DENIED |
| S2d | anonymous cannot upload with a non-own- name | expected DENIED |
| S2e | anonymous cannot overwrite an existing photo | expected DENIED |
| S2f | anonymous cannot delete a photo | expected DENIED |
| S4a | signed-in user cannot write ANOTHER user's profile photo slot | expected DENIED |
| S4b | signed-in user may write own profile photo slot | expected ALLOWED |
| S5a | anonymous cannot write siteContent images | expected DENIED |
| S5b | signed-in non-team user cannot write siteContent images | expected DENIED |
| S5d | hard-coded Owner uid path (taken from storage.rules text) may write siteContent images | expected ALLOWED; proves the harness can evaluate the team rule when no cross-service lookup is needed |
| S6a | anonymous cannot read caseAttachments | expected DENIED |
| S6b | signed-in non-team user cannot read caseAttachments | expected DENIED |
| S7 | anonymous cannot read an unnamed path (default deny) | expected DENIED |
| B2 | provenance caseMessage is internal and has no caseToken | messages=1, non-internal/with-token=0 |
| B3 | repeat confirm => same case id, no duplicate | cases for conversation=1 |
| B4 | other uid (with forged conversationId in payload) gets no case | reason=not_qualified |
| B5 | no auth => rejected; confirmed!==true => no case | rejected=true, reason=not_confirmed, cases=0 |
| B6 | gate rejects a conversation without a usable contact | reason=missing_contact |

### NOT-TESTED (5)

| ID | Probe | Note |
|---|---|---|
| F1 | Cloud Function token check / issue / revoke | Function does not exist yet (target of a later package) |
| F2 | server-side approval record + chat/form link by evidence | Function does not exist yet (target of a later package) |
| F3 | publicListings collection with allowlist fields | collection does not exist yet (target of a later package) |
| S5c | team member (Staff via adminUsers doc) may write siteContent images | inconclusive: cross-service adminUsers lookup did not resolve in the Storage emulator here; NOT a verdict on storage.rules |
| S6c | team member (Staff via adminUsers doc) may read caseAttachments | inconclusive: cross-service adminUsers lookup did not resolve in the Storage emulator here; NOT a verdict on storage.rules |

## 4. What the confirmed gaps mean for the agreed first-phase path

Path: AI chat → deposit / central record → Staff takes the job → Owner approves → listing published with photos.

| Step of the path | Blocked or endangered by | Probes |
|---|---|---|
| Owner (website owner) approves before publishing | A signed-in lister can create or move their own listing to `live` with no approval and can write approval fields (`approvedBy`, `publishedAt`). The comment in `firestore.rules` says live is admin-only; the rule text allows it (Aug 2026 auto-publish). | G6, G7a, G7b |
| Deposit by chat/form without login, privately | The Case document holds contact + `trackToken` + internal notes and the whole `properties` collection is publicly listable. The chat Function itself writes contact and token into that document. | G1, G2, B1 |
| Customer tracking / messages | The token is readable from the public document, so anyone can read customer-visible messages, post as the customer and write the reply fields. | G11 (and T1 controls show wrong/short/foreign tokens ARE refused) |
| Staff role boundary | A sign-up whose e-mail matches a publicly readable invite becomes Staff without `email_verified`, then reads leads and internal case messages. | G3d, G9, G9b |
| Photos | Unpublished-case photos are public by name and listable; any signed-in user can overwrite/delete another lister's photo and upload non-images >8 MB; an anonymous user can attach a photo document to someone else's live listing. | S1a, S1b, S3a–c, G10a, G10b |
| Agents / collaborators | Any signed-in user can read all buyer registrations; a lister can edit own tier/subscription/status; any signed-in user can overwrite someone's profile-photo document; owners/tenants/listers are publicly readable. | G3a–c, G4a/b, G8, G10c |
| Anonymous deposit form | Creating a case accepts any extra fields (no allowed-field list). | G5 |

Controls that held (for the exact cases tested): wrong / short / other-case tokens are refused for reading and posting; customers cannot read internal messages; case history is immutable; Staff cannot set live; Staff cannot make themselves Owner; strangers cannot write owners/other listers' listings; Storage anonymous upload is limited to small `own-*.webp` images; `caseAttachments` is closed to non-team users; repeat chat confirmation returns the same case (no duplicate) and a different visitor cannot obtain it (B3, B4).

## 5. Source inventory (checked by `tests/sec-callsite-guard.test.js`)

- **owners**: read by AI Quick Add, Admin Dashboard, Member Management, Owners (all admin pages). **tenants**: Admin Dashboard, Member Management, Owners. Each gates on `requireAdminAuth()` / `isAdminAuthed()`, which means **any team member (Owner or Staff)**; there is no Owner-only split in these pages. Admin Dashboard and AI Quick Add also write. `Developer Maintenance Center` only counts documents.
- **buyerRegistrations**: Member Management reads all; `registerBuyer()` in `firebase-client.js` reads every registration of a property to detect duplicates, called from Lister Dashboard — closing the read for non-admins breaks that check unless it moves server-side.
- **properties**: whole-collection reads in `data.js getEffectiveProperties()` (unfiltered — no `where`), used by the public pages (Home, Search Results, Property Details, AI Concierge, ContactRail, Site Content, 17 landing pages, `index.html`); admin pages read it too. `Track Submission.dc.html` downloads all properties and compares `trackToken` in the browser. Any rule that stops public reads of non-live documents will break these pages until they read a filtered/separate source.
- `createCaseFromConversation` stores `conversationId` and `receptionVisitorId` on the Case (answers an earlier "unknown"): a chat Case can be linked to its conversation by server-side evidence, not by name/phone.

## 6. Not proven / unknown

- Behaviour of the **deployed** rules and Functions (this tested the repo files at `4e358a5`).
- Storage rules that depend on `firestore.exists(adminUsers/...)` (team allow-paths): the cross-service lookup did not resolve in this emulator setup (hard-coded Owner uid path allowed; `adminUsers` document path denied). Recorded NOT-TESTED (S5c, S6c) — **not** a verdict on `storage.rules`.
- Real field shapes of `listers` and real data (synthetic documents were used). Whether `siteContent`/`aiNotes` (public read) hold anything internal was **not** examined.
- Whether anyone has actually read exposed data on production — unknown.
- Function behaviour for approval, token issue/revoke, chat↔form linking and `publicListings` — these do not exist yet (F1–F3 NOT-TESTED).
- Rules/Function interaction under load or abuse (rate limits, App Check absent) — not tested.

## 7. Proposed fix order (PROPOSAL ONLY — not approved; each needs its own package and owner approval)

Requirement: both the main path and data safety must pass before real data is accepted.

1. **Close self-publish and forged approval** (G6, G7a, G7b; plus G5 allowed-field list): rules + client, so only Owner can set `live`; record approver server-side. Blocks the "Owner approves" step if left.
2. **Staff boundary** (G9): require `email_verified` and stop exposing invites to anonymous reads. Small, no data migration.
3. **Quick closes without data migration**: `buyerRegistrations` read (needs `registerBuyer` duplicate check moved server-side first), `owners`/`tenants` read → `isAdmin()` (same population that can already write; all four readers are admin pages), `profilePhotos` doc write, `propertyPhotos` doc create/Storage signed-in write limits (G10b, G10c, S3a–c).
4. **Separate public from private case data**: new public collection written server-side from an allowlist, private document for contact/token/internal notes, server-side token check (replaces the browser comparison), revoke and re-issue existing tracking links, then stop public reads of `properties`. Needs the order and rollback rules agreed in SEC-PLAN-01 (public documents must be clean before they are opened; rollback must never reopen private data; RED hides the front end only and does not close backend access).
5. Re-run this suite after each package; flip the matching probes from GAP to CONTROL and add function tests for the new Functions (F1–F3).

Compensation, deal-code, quota and subscription work remains out of scope.
