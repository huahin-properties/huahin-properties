# CHAT-FIX-01 — PD-16 Thai guard: fixed female fallback (receptionTurn only)

PR in sequence after SEC-TEST-01 (PR #2) and CHAT-TEST-01 (PR #3). Branch `claude/chat-fix-01`, based on `claude/chat-test-01` head `0956c88`. **Tested commit: `e3430ac`** (clean working tree, 1 Oct 2026).

> **Not a production PASS.** Stub model + Firestore emulator + synthetic data. The change is **not deployed**; it only takes effect after the owner deploys `functions:receptionTurn` (a later, separate step). Real-model behaviour, the real browser and the fallback route `claudeComplete` are **not tested**.

## 1. What changed (only `receptionTurn`)

`functions/index.js`:
- New constant `PD16_FALLBACK_REPLY` = `ขออภัยค่ะ ตอนนี้ยังเรียบเรียงคำตอบได้ไม่สมบูรณ์ รบกวนส่งข้อความล่าสุดอีกครั้งนะคะ`
- `callClaudeReception`: when the first reply has a male Thai voice and the retry cannot be used, the **whole reply string** is replaced by the fallback (previously the first, male reply was released). Three reasons, fixed codes: `retry_failed` (retry call threw), `retry_still_male`, `retry_unsafe` (empty retry, or a safeguard failed: number, property code, `[[CONTACT]]`/`[[LIST_PROPERTY]]` token or quoted span changed).
- `receptionTurn`: logs `{event:"pd16_fallback", reason}` — the fixed code only.
- Unchanged: `pd16Violation`, `pd16ReplyIsSafe`, the retry prompt, the one-retry limit, the first-call-failure behaviour, everything after the model call (draft/conversation writes, case creation), `claudeComplete`, rules, pages.

Only `reply` is replaced. stage, intents, customer name/contact, propertyBasics, draft fields and the rest of the classification come from the **first** call; **nothing from the retry is ever stored** on any path (tests give the retry a deliberately different classification to prove it).

## 2. Limits of this fix (read before relying on it)

1. **The first reply's content is withheld for that turn.** "No number / code in the fallback" means the original answer is not shown, not that its content is preserved. The customer is asked to resend the message; the original answer, question, price or code the model wanted to give is lost for that turn.
2. **Buttons do not appear on a fallback turn.** A `[[CONTACT]]` or `[[LIST_PROPERTY]]` token in the first reply is not carried over, so the matching button is not shown that turn (it is safe-by-default under PD-15).
3. **Only `receptionTurn`.** The ordinary chat route `claudeComplete` (`ContactRail.dc.html` ~line 1922, used when `receptionTurn` is not executed) has **no PD-16 guard** — recorded as the **next job**, not fixed here. Thai female voice is **not** certified for the whole path.
4. **The detector is unchanged.** A Thai word that contains "ผม" (for example "ผมสีดำ") is still counted as a male voice (C7l). A good female reply that contains such a word is retried, and replaced by the fallback if the retry keeps the word. **Not fixed, not claimed as fixed.**
5. **Thai script only.** The guard (and therefore the fallback) applies to replies that contain Thai script; the other 7 languages never reach it. Their female voice / answer quality is **not tested**, and the absence of a gender guard there is not counted as a vulnerability.
6. **Stub only.** How often the real model writes ครับ/ผม, and what the customer experiences after a fallback, is untested.
7. **Deployment:** not deployed. The deployed `receptionTurn` is unchanged until the owner deploys it.

## 3. Results — reported separately (`npm run test:chat`, clean tree, exit 0)

| | |
|---|---|
| Tested commit | **`e3430ac`** (this document is a later, documentation-only commit) |
| mocha passing | **28** |
| pending (NOT-TESTED) | **4** |
| failing | **0** |
| Probe labels (55) | **6 GAP-CONFIRMED · 0 GAP-NOT-REPRODUCED · 45 CONTROL · 4 NOT-TESTED** |
| All suites in one mocha process (chat + SEC-TEST-01) | **123 passing / 9 pending** (= 95 + 28 / 5 + 4) |
| Negative control | The same new tests run against the **pre-fix** `functions/index.js` (`0956c88`): **11 failing** (C7b, C7c1–c8, C7d, C7k), 17 passing. After the fix: 0 failing. So the tests do detect the original gap |

Before → after for the three guard gaps: C7b, C7c, C7d were `GAP-CONFIRMED` in CHAT-TEST-01 (male reply released); they are now `CONTROL` (fallback used). Gaps from CHAT-TEST-01 that remain **open and unchanged**: draft → case fields not copied (C5e), no draft ↔ case link (C5f), chat and form create two separate cases (C6b/C6c/C6d). New recorded limit: C7l. The 6 GAP-CONFIRMED = C5e, C5f, C6b, C6c, C6d, C7l.

## 4. What the tests check (synthetic, stub)

For each of: retry still male (C7b) · retry changes the **price** (C7c1) · drops the **property code** (C7c2) · drops / adds a **`[[CONTACT]]`** token (C7c3/C7c4) · drops / adds a **`[[LIST_PROPERTY]]`** token (C7c5/C7c6) · changes a **quoted span** (C7c7) · empty retry (C7c8) · retry call fails (C7d):
- the returned reply is exactly the fixed fallback, has no ครับ/ผม and no token; reason code is the expected one; exactly 2 stub calls (first + one retry, no second retry);
- conversation (name, contact, stage, intent, summary, propertyBasics) and draft fields equal the **first** call, none equal the retry's different values;
- **no case is created automatically**; the stored AI message is the fallback only.

Also: C7a clean retry still released (no fallback) · C7e quoted words allowed · C7f clean reply untouched (1 call) · C7g the other 7 languages unchanged (1 call, no fallback) · C7j fallback text (female particles, no digits/codes/tokens/quotes, claims nothing) · C7k log lines for the three reasons contain only the fixed reason code — scanned for customer text, first/retry reply text, token, property code, error detail, fallback text and the key · C7m first-call failure still throws, no retry · C7l the ผมสีดำ limit.

## 5. Per-probe results (run at `e3430ac`)

### GAP-CONFIRMED (6)

| ID | Probe | Observed |
|---|---|---|
| C5e | draft -> case: draft fields NOT copied into the case (by same key and value) | draft fields not in case: [area="หัวหิน", bedrooms=3, price=5000000]; draft fields in case: []; case instead carries (from conversation, not draft): [aiPropertyKind, aiPropertyArea, aiPropertyScale, description, contactName, ownerContact] |
| C5f | draft <-> case link (draft.caseId / case.draftId) | draft.status=draft; draft.caseId=undefined; case.draftId=undefined |
| C6b | same contact via chat and via form => TWO separate cases, no link between them (policy 'one draft/one path/no duplicate case' NOT implemented) | cases=2 ids=own-1790841843158-a487a,own-SYN-FORM-1 chatCase=own-1790841843158-a487a formCase.conversationId=undefined |
| C6c | source: Owner Submission form does not read the chat draft or conversation id | form references draft/conversation: false |
| C6d | source: chat 'List property' button opens the form with NO draft/conversation parameter | plain navigate: true |
| C7l | KNOWN LIMIT, NOT FIXED: a female reply containing the word ผมสีดำ is counted as a male voice -> retry; if the retry keeps the word the good reply is replaced by the fallback | (a) retry keeps the word: replaced by fallback=true · (b) retry rephrases: retry released=true · detector unchanged in this change; NOT claimed as fixed |

### CONTROL (45)

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
| C5d | case carries conversationId/receptionVisitorId; conversation links back (linkedCaseIds) | caseSource=ai_assistant linked=["own-1790841842887-c5c84"] |
| C6a | form-style anonymous create is accepted by rules (current intended path) | allowed |
| C8a | every stubbed model call carried only the SYNTHETIC key | calls=2 |
| C8b | no outbound call to any non-loopback host was attempted | 0 blocked |
| C8d | emulator-only guard (project demo-*, loopback hosts) | assertEmulatorOnly() passed at load |
| C7a | guard rewrites a male Thai reply when the retry is clean (unchanged behaviour; no fallback used) | calls=2 reply=ได้ค่ะ ขอทราบพื้นที่เพิ่มเติมได้ไหมคะ |
| C7b | retry STILL male (ครับ/ผม) => fixed female fallback; draft/contact/stage = FIRST call; retry classification never used; no case created | reason=retry_still_male · 2 stub calls · reply=fallback · first-call data intact · cases=0 |
| C7c1 | retry CHANGES THE PRICE (5,000,000 -> 6,000,000) => fixed female fallback; draft/contact/stage = FIRST call; retry classification never used; no case created | reason=retry_unsafe · 2 stub calls · reply=fallback · first-call data intact · cases=0 |
| C7c2 | retry DROPS the property code (HH-109) => fixed female fallback; draft/contact/stage = FIRST call; retry classification never used; no case created | reason=retry_unsafe · 2 stub calls · reply=fallback · first-call data intact · cases=0 |
| C7c3 | retry DROPS the [[CONTACT]] token => fixed female fallback; draft/contact/stage = FIRST call; retry classification never used; no case created | reason=retry_unsafe · 2 stub calls · reply=fallback · first-call data intact · cases=0 |
| C7c4 | retry ADDS a [[CONTACT]] token => fixed female fallback; draft/contact/stage = FIRST call; retry classification never used; no case created | reason=retry_unsafe · 2 stub calls · reply=fallback · first-call data intact · cases=0 |
| C7c5 | retry DROPS the [[LIST_PROPERTY]] token => fixed female fallback; draft/contact/stage = FIRST call; retry classification never used; no case created | reason=retry_unsafe · 2 stub calls · reply=fallback · first-call data intact · cases=0 |
| C7c6 | retry ADDS a [[LIST_PROPERTY]] token => fixed female fallback; draft/contact/stage = FIRST call; retry classification never used; no case created | reason=retry_unsafe · 2 stub calls · reply=fallback · first-call data intact · cases=0 |
| C7c7 | retry CHANGES a quoted span => fixed female fallback; draft/contact/stage = FIRST call; retry classification never used; no case created | reason=retry_unsafe · 2 stub calls · reply=fallback · first-call data intact · cases=0 |
| C7c8 | retry is EMPTY => fixed female fallback; draft/contact/stage = FIRST call; retry classification never used; no case created | reason=retry_unsafe · 2 stub calls · reply=fallback · first-call data intact · cases=0 |
| C7d | retry CALL FAILS => fixed female fallback; draft/contact/stage = FIRST call; retry classification never used; no case created | reason=retry_failed · 2 stub calls · reply=fallback · first-call data intact · cases=0 |
| C7e | quoted ครับ/ผม does not trigger the guard (by design, unchanged) | calls=1 |
| C7f | clean Thai reply: no retry, no fallback (unchanged) | calls=1 |
| C7g | non-Thai replies pass through the server unchanged: 1 call, no fallback (no gender check exists for en/ru/zh/de/no/fr/it) | unchanged 7/7 · not counted as a vulnerability: no requirement text for these languages was found |
| C7j | fallback text: female particles, no ครับ/ผม, no digits/codes/tokens/quotes, claims nothing (not submitted, not saved) | ขออภัยค่ะ ตอนนี้ยังเรียบเรียงคำตอบได้ไม่สมบูรณ์ รบกวนส่งข้อความล่าสุดอีกครั้งนะคะ |
| C7k | pd16_fallback log = fixed reason code only; no customer text, model text, token, property code, error detail, key | reasons=retry_still_male,retry_unsafe,retry_failed · 15 log lines scanned |
| C7m | the FIRST model call failing still throws to the client (unchanged), 1 call, no retry | threw=true calls=1 |
| C8c | after the run fetch, http/https request+get and every touched env var equal their pre-install state | identical to pre-install snapshot (ANTHROPIC_API_KEY, METADATA_SERVER_DETECTION, GCE_METADATA_HOST, GOOGLE_APPLICATION_CREDENTIALS) |

### NOT-TESTED (4)

| ID | Probe | Observed |
|---|---|---|
| C3-refresh | browser refresh / localStorage / IndexedDB auth restore | needs a real browser session; this file only calls the server again with the same uid |
| C7h | female persona + real answer quality in the other 7 languages (en/ru/zh/de/no/fr/it) | needs the real model; this stub cannot say anything about it. Absence of a gender guard there is NOT treated as a vulnerability |
| C7i | real-model behaviour for Thai (how often it writes ครับ/ผม) | needs the real model on a test environment |
| C9 | real Anthropic model, deployed Functions/rules, production | out of scope: stub + emulator only; this run is not a production PASS |

## 6. Next (not done here)
- Add the same guard to the fallback route `claudeComplete` (separate package) before claiming Thai female voice for the whole chat path.
- Decide how to handle detector false positives such as "ผมสีดำ" (separate decision).
- Owner deploys `functions:receptionTurn` only after this PR is approved; then test on a separate test project with the real model (still pending).
- Owner steps O-1/O-2/O-3 remain **pending** and cannot be counted as passed from an emulator run.

Compensation, quota and subscription work remain paused.
