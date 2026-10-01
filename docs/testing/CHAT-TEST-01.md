# CHAT-TEST-01 — chat + draft path (synthetic data, emulator only, stubbed model)

PR-in-sequence after SEC-TEST-01 (PR #2). Branch `claude/chat-test-01`, based on `claude/sec-test-01` head `17e928c`. **Tested commit: `bbb68f8`** (clean working tree, 1 Oct 2026; the first version `ba3f1ac` was run earlier and then extended after Work's review). No Functions, rules, pages, `firebase.json` or lockfile were changed; `package.json` only gains the `test:chat` script.

> **Not a production PASS.** The "model" is a scripted stub, the database is the local Firestore emulator, and nothing external is contacted. Same-uid calls check **server-side continuity**, not a browser refresh. A GAP row is an open weakness, never a pass.

## 1. What was run

| Item | Value |
|---|---|
| Command | `npm run test:chat` (uses `firebase-tools@15.32.1` via `npx`, project `demo-sec-test-01`, Firestore emulator, config `tests/firebase.sec-test.json`) — exit 0 |
| Code under test | the CURRENT `functions/index.js`: `receptionTurn`, `getPropertyDraft`, `createCaseFromConversation`, called in-process via `.run()` (Admin SDK → emulator) + `firestore.rules` through the client SDK |
| Model | scripted stub of `https://api.anthropic.com/` (tool-use reply). It checks server **logic and the PD-16 guard**; it says nothing about what the real model writes |
| Isolation | `tests/chat/stub-anthropic.js`: `fetch` → stub for api.anthropic.com, loopback only for the emulator, everything else blocked and recorded; `http`/`https` request/get wrapped (non-loopback blocked, https blocked); SYNTHETIC key only; cloud-credential discovery disabled. **Restore check (C8c):** after the run, a snapshot of `global.fetch`, `http.request/get`, `https.request/get` and each touched environment variable (`ANTHROPIC_API_KEY`, `METADATA_SERVER_DETECTION`, `GCE_METADATA_HOST`, `GOOGLE_APPLICATION_CREDENTIALS` — presence **and** value) must equal the snapshot taken before the stub was installed; a sanity check proves the snapshot would detect the stub. **C8e round trip:** install→restore with variables that did exist (value must come back) and one that did not exist (must be absent again). The run fails if anything differs or any outbound attempt was blocked |
| Other suites | Verified not to disturb them: all suites in ONE mocha process → **112 passing / 9 pending** (= 95 + 17 / 5 + 4) |
| Reported separately | **mocha: 17 passing, 4 pending (the NOT-TESTED items), 0 failing** · **probe labels (44): 8 GAP-CONFIRMED · 0 GAP-NOT-REPRODUCED · 32 CONTROL · 4 NOT-TESTED** · tested commit `bbb68f8` |
| Counting note | 17 passing = 17 mocha tests (16 in the chat describe + 1 isolation self-test); each test records several probes, so probes ≠ tests. The 4 pending tests = the 4 NOT-TESTED probes. C8c is recorded by the `after` hook (an assertion there fails the run) |

## 2. Gaps found (recorded as gaps — nothing was fixed or merged by this test)

1. **Draft → case (C5e):** the case does **not** receive the draft fields. In the synthetic run the draft held `area="หัวหิน"`, `bedrooms=3`, `price=5000000`; **none of the three** appears in the case document under the same key and value. The case instead carries values taken from the *conversation* (not from the draft): `aiPropertyKind`, `aiPropertyArea`, `aiPropertyScale`, `description` (requirementsSummary), `contactName`, `ownerContact`. So Staff receive the three "basics" but not the structured draft (bedrooms, price, and every other draft field).
2. **No draft ↔ case link (C5f):** `draft.caseId` and `case.draftId` are both absent; the draft stays `status: "draft"` after the case exists.
3. **Chat and form are two paths (C6b/C6c/C6d):** with the same contact, chat + form produce **two separate cases** with no link (`conversationId` absent on the form case). Source checks: `Owner Submission.dc.html` does not read the draft/conversation/receptionTurn; the chat "List property" button navigates to the form with **no parameter**. The confirmed policy ("chat and form use the same draft and the same submit path; no duplicate case") is **not implemented**. This test only records the gap; it created no merge logic.
4. **PD-16 Thai guard releases male-voice replies (C7b/C7c/C7d):** the guard retries once, and then returns the **original male reply** when (b) the retry still contains ครับ/ผม, (c) the retry changes a number (safety check rejects it), or (d) the retry call fails. These are gaps — **the Thai female persona is NOT passed** by this suite. C7a (clean retry) and C7e/C7f (quoted words allowed, clean reply untouched) behave as designed.

## 3. What behaved as designed (CONTROL)

Casual first turn writes nothing (C1) · SELL turn creates `conversations/reception__<uid>` (stage, intent, basics, messages) and `propertyDrafts/draft__<uid>` with `ownerUid`, `conversationId` and per-field `source` + `updatedAt` (C2a/b; source is `customer_stated` for stated fields) · client SET/UPDATE/DELETE of the draft denied, owner and Staff can read it (C2c–g) · same-uid later turns accumulate, do not downgrade SELL, keep basics (C3) · **C3b:** name and contact were first stored (`Synthetic Seller`, `+00 000 000 0007`), then the stub returned EMPTY name/contact/summary/basics/fields — all stored values and the draft were unchanged (empty never overwrites) · **C3c:** qualified → a `general` reply stays qualified, advisory → `general` stays advisory (stage never goes backwards) · another uid gets no draft from `getPropertyDraft`, unauthenticated is rejected, and Firestore rules deny another uid / anonymous reads of the draft, conversation, messages and conversation list (C4a–g) · no case without name/contact or without user confirmation; one case and one track link when confirmed twice; case ↔ conversation linked (C5a–d) · non-Thai replies pass the server unchanged (C7g — an observation, **not** counted as a vulnerability: no requirement text exists for those languages and the real voice/quality is untested).

## 4. Not tested (pending)

C3-refresh (real browser refresh / localStorage / IndexedDB Auth restore) · C7h (female persona and real answer quality in en/ru/zh/de/no/fr/it) · C7i (how often the real model writes ครับ/ผม in Thai) · C9 (real model, deployed Functions/rules, production).

## 5. Per-probe results (from the run at `bbb68f8`)

### GAP-CONFIRMED (8)

| ID | Probe | Observed |
|---|---|---|
| C5e | draft -> case: draft fields NOT copied into the case (by same key and value) | draft fields not in case: [area="หัวหิน", bedrooms=3, price=5000000]; draft fields in case: []; case instead carries (from conversation, not draft): [aiPropertyKind, aiPropertyArea, aiPropertyScale, description, contactName, ownerContact] |
| C5f | draft <-> case link (draft.caseId / case.draftId) | draft.status=draft; draft.caseId=undefined; case.draftId=undefined |
| C6b | same contact via chat and via form => TWO separate cases, no link between them (policy 'one draft/one path/no duplicate case' NOT implemented) | cases=2 ids=own-1790841152138-f22fc,own-SYN-FORM-1 chatCase=own-1790841152138-f22fc formCase.conversationId=undefined |
| C6c | source: Owner Submission form does not read the chat draft or conversation id | form references draft/conversation: false |
| C6d | source: chat 'List property' button opens the form with NO draft/conversation parameter | plain navigate: true |
| C7b | retry still has ครับ/ผม => guard releases a male-voice reply (persona NOT passed) | calls=2 released=ได้ครับ ขอทราบพื้นที่เพิ่มเติมได้ไหมครับ |
| C7c | retry rejected because a number changed => original male reply released (persona NOT passed) | released=ราคา 5,000,000 บาทครับ |
| C7d | retry call fails => original male reply released (persona NOT passed) | released=ได้ครับ ขอทราบพื้นที่เพิ่มเติมได้ไหมครับ |

### CONTROL (32)

| ID | Probe | Observed |
|---|---|---|
| C8e | isolation self-test: install→restore returns fetch, http/https and env (incl. a variable that did not exist) to the pre-install state | round trip identical |
| C1 | casual first turn: no conversation, no draft, no case | persisted=false conv=false draft=false cases=0 |
| C2a | SELL turn: conversation reception__<uid> with stage/intent/basics + messages | stage=advisory intent=SELL messages=2 |
| C2b | SELL turn: draft draft__<uid> with ownerUid, conversationId, per-field source + updatedAt | per-field source=customer_stated (stated by customer in the stub) · draft fields=area,bedrooms applied=["area","bedrooms"] |
| C2c | owner uid can read own draft | allowed |
| C2d | Staff (adminUsers) can read the draft | allowed |
| C2e | owner uid cannot SET its own draft from the client | denied with permission-denied |
| C2f | owner uid cannot UPDATE its own draft from the client | denied with permission-denied |
| C2g | owner uid cannot DELETE its own draft from the client | denied with permission-denied |
| C3 | same-uid continuity on the SERVER: accumulate, never erase, never downgrade (not a browser-refresh test) | all 7 checks |
| C3b | name+contact stored, then empty model values => stored data NOT overwritten (name, contact, summary, basics, draft) | before: name=Synthetic Seller contact=+00 000 000 0007 · after the empty turn: unchanged |
| C3c | stage does not go backwards when the next model reply proposes 'general' (qualified stays qualified; advisory stays advisory) | qualified→general: qualified→qualified · advisory→general: advisory→advisory |
| C4a | getPropertyDraft as ANOTHER uid returns no draft (exists:false, no fields) | exists=false fields= |
| C4b | getPropertyDraft without auth is rejected with unauthenticated | result=unauthenticated |
| C4c | rules: another uid cannot read A's draft | denied with permission-denied |
| C4d | rules: anonymous cannot read A's draft | denied with permission-denied |
| C4e | rules: another uid cannot read A's conversation | denied with permission-denied |
| C4f | rules: another uid cannot read A's conversation messages | denied with permission-denied |
| C4g | rules: another uid cannot list conversations | denied with permission-denied |
| C5a | name/contact missing => no case (confirmed:true still refused) | reason=missing_name cases=0 |
| C5b | no user confirmation (confirmed !== true) => no case | reason=not_confirmed |
| C5c | confirmed twice => ONE case, same id + same track link (dedupe by server-side conversation link) | cases=1 sameId=true |
| C5d | case carries conversationId/receptionVisitorId; conversation links back (linkedCaseIds) | caseSource=ai_assistant linked=["own-1790841151888-59def"] |
| C6a | form-style anonymous create is accepted by rules (current intended path) | allowed |
| C8a | every stubbed model call carried only the SYNTHETIC key | calls=2 |
| C8b | no outbound call to any non-loopback host was attempted | 0 blocked |
| C8d | emulator-only guard (project demo-*, loopback hosts) | assertEmulatorOnly() passed at load |
| C7a | guard rewrites a male Thai reply when the retry is clean | calls=2 reply=ได้ค่ะ ขอทราบพื้นที่เพิ่มเติมได้ไหมคะ |
| C7e | quoted ครับ/ผม does not trigger the guard (by design) | calls=1 |
| C7f | clean Thai reply: no retry | calls=1 |
| C7g | non-Thai replies pass through the server unchanged (no gender check exists for en/ru/zh/de/no/fr/it) | unchanged 7/7 · not counted as a vulnerability: no requirement text for these languages was found |
| C8c | after the run fetch, http/https request+get and every touched env var equal their pre-install state | identical to pre-install snapshot (ANTHROPIC_API_KEY, METADATA_SERVER_DETECTION, GCE_METADATA_HOST, GOOGLE_APPLICATION_CREDENTIALS) |

### NOT-TESTED (4)

| ID | Probe | Observed |
|---|---|---|
| C3-refresh | browser refresh / localStorage / IndexedDB auth restore | needs a real browser session; this file only calls the server again with the same uid |
| C7h | female persona + real answer quality in the other 7 languages (en/ru/zh/de/no/fr/it) | needs the real model; this stub cannot say anything about it. Absence of a gender guard there is NOT treated as a vulnerability |
| C7i | real-model behaviour for Thai (how often it writes ครับ/ผม) | needs the real model on a test environment |
| C9 | real Anthropic model, deployed Functions/rules, production | out of scope: stub + emulator only; this run is not a production PASS |

## 6. Minimum to prepare so the owner can open a test page and talk to the REAL AI (not built in this round; no service created, nothing deployed)

This suite cannot give the owner a page. The owner steps O-1/O-2/O-3 stay **pending** until all of this exists. Items are from source reading; costs and plan requirements are **unverified**.

1. **A separate Firebase test project** (not `huahin-properties-5f1b5`) with Firestore, Authentication (Anonymous + e-mail/password for test Staff/Owner), Storage, Functions (`asia-southeast1`) and Hosting. Cloud Functions normally require a billing plan; the price is unverified.
2. **A test build of the site that points at that project.** The client has the production Firebase config and URLs hard-coded (`firebase-client.js:14–27`, `:555–556`, `:1102–1104`, `:1117`, `:1151`; `claudecomplete` run.app URLs in `firebase-client.js`, `Home.dc.html:756`, `AI Concierge.dc.html:300`, `AI Quick Add.dc.html:827`, `ContactRail.dc.html:447`, `Agent Profile.dc.html:263/664`, `Agent Signup.dc.html:467`; absolute `https://huahin.properties` URLs in `functions/index.js`). A config swap is a **code change** → its own package (STG-01 in STG-PLAN, still unapproved). It must not be merged to `main`.
3. **Deploy to the test project only, by the owner, scoped** (owner-run from a Codespace, one command at a time): the reception/draft/case Functions, `firestore.rules`, `storage.rules`. Deployed Functions/rules versions are currently unknown, so the test project must be deployed from the branch under test.
4. **A separate Anthropic key for the test project**, stored as a Firebase secret named `ANTHROPIC_API_KEY` in the test project, never pasted into chat or files. **Spending limit: not yet verified.** It still has to be checked which controls the Anthropic Console actually offers (per key, per workspace/project, per organization), whether a hard cap or only an alert exists, and how to set it. Until that is checked, treat the cost of real-model testing as **uncapped** — the code has no cost ceiling, and function `maxInstances` or a cloud budget alert is not an AI-cost cap.
5. **Synthetic seed data:** a few fake listings with test photos, an Owner test account and a Staff test account (`adminUsers` documents / invite), no real customer data.
6. **Access control for the test site — mechanism NOT chosen, capability NOT verified.** A `.web.app` URL that only the owner knows, or a `noindex` tag, is **not** access control (anyone with the URL can open it; `noindex` only asks search engines not to list it). The test site may only be called "closed" once a real mechanism is chosen and checked, for example: (a) require Firebase Authentication sign-in and allow only named test accounts, enforced in the rules/Functions of the test project; or (b) put the site behind an access-control layer in front of Hosting. Which of these is available, how it is set up and what it costs has **not** been checked. Until then the test project must hold **only synthetic data**, and nothing in it can be treated as private.
7. **Prerequisites for O-3:** the self-publish path found in SEC-TEST-01 (lister can set `live`, approval fields writable) must be fixed first, otherwise "Owner approves before publish" cannot be shown as passing. For O-1 the chat↔form unification policy is not needed, but the owner will see two separate paths until it is implemented.
8. **Unknowns that block a cost/time estimate:** Firebase/GCP prices, Node 20 deadline for Functions, parity between repo and deployed Functions.

Compensation, quota and subscription work remain paused.
