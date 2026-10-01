# CHAT-FIX-02 — PD-16 guard on the ContactRail fallback chat route (`claudeComplete`, chat mode)

PR in sequence after SEC-TEST-01 (#2), CHAT-TEST-01 (#3), CHAT-FIX-01 (#4). Branch `claude/chat-fix-02`, based on `claude/chat-fix-01` head `d6990d1`. **Tested commit: `afa0d8b`** (clean working tree, 1 Oct 2026).

> **Target of this change: the fallback chat of ContactRail only.** That route **does not save central data** (no conversation, draft or case is written). The real model, a real browser, and Thai female voice on **Home** and **AI Concierge** are **not tested / not certified**. Stub + emulator + loopback only. **Not a production PASS. Not deployed.**

## 1. What changed

- `functions/index.js`, `claudeComplete` **chat mode only**: when the request body carries **exactly** `guard === "pd16"` (strict string equality), a male-voiced Thai reply gets **one** retry. If the retry is still male, empty, fails, or breaks a safeguard (number, property code, `[[CONTACT]]` / `[[LIST_PROPERTY]]` token, quoted span), the **same fixed female fallback** as CHAT-FIX-01 replaces the reply: `ขออภัยค่ะ ตอนนี้ยังเรียบเรียงคำตอบได้ไม่สมบูรณ์ รบกวนส่งข้อความล่าสุดอีกครั้งนะคะ`. Reuses `pd16Violation` and `pd16ReplyIsSafe` (they work on plain strings); **not** `callClaudeReception` (tool-use contract with structured classification — different contract).
- The response stays **`{ completion }`** — no classification, no draft, no extra field. Log: `{component:"claudeComplete", event:"pd16_fallback", reason}` with a fixed code (`retry_failed` / `retry_still_male` / `retry_unsafe`) only.
- `ContactRail.dc.html`: the legacy `fetch(CLOUD_FN.claudeComplete …)` body gains `guard: "pd16"` (1 field). The `window.claude.complete` preview path is unchanged.
- Not changed: `pd16Violation`/`pd16ReplyIsSafe`, the "ผมสีดำ" limit, `receptionTurn`, draft ↔ form, rules, other pages, `firebase.json`, lockfile.

**Unchanged behaviour (tested):** requests without the exact opt-in — no `guard`, other values, translation tools, single-turn `content`/`tool` mode, any prompt (even a Thai-female prompt), any `max_tokens` — behave as before. The guard is never inferred from the prompt or `max_tokens`. If the **first** model call fails, the original error answer (status/body) is kept — never turned into the fallback, no retry.

## 2. Limits (read before relying on it)

1. **Only the ContactRail fallback route** is covered. **Home** (`Home.dc.html` welcome chat) and **AI Concierge** call `claudeComplete` **without** the guard: **Thai female voice on those two pages is NOT certified.** Home's prompt has no female-voice rule and a recorded owner decision (22 Sep) against gender/pronoun replacement; AI Concierge has the rule in its prompt only. Out of scope here (S4).
2. **The first reply's content is withheld on a fallback turn**; `[[CONTACT]]` / `[[LIST_PROPERTY]]` buttons from that reply do not appear. The fallback text contains none of the button triggers of the three customer pages (source check S3).
3. **This route saves nothing** to Firestore — a customer's text on the fallback route is not stored as a draft or conversation (existing gap, unchanged).
4. **Which errors let ContactRail fall back is existing policy, unchanged here.** The existing code lets `not-found`, `unavailable`, `unauthenticated`, `invalid-argument`, `permission-denied`, or "no code" fall back (S2). This is reported as *"codes the existing code allows to fall back"* — not as "safe".
5. The "receptionTurn unusable → fallback" tests (R1/R2) prove **only the server-side order this test simulates** (receptionTurn refused before any model call and nothing written, then the guarded route answers). They do **not** prove that the ContactRail **browser** code switches routes; that is read from source (S1/S2) and the real browser run is **NOT-TESTED** (B1).
6. Cost: one extra model call per male-voiced reply of a caller that opts in (prices unverified). Stub only: how often the real model writes ครับ/ผม on this route is untested.
7. The "ผมสีดำ" detector limit is unchanged and still applies here.

## 3. Deploy order (nothing deployed in this round)

The guard works **only when both** parts are live: the deployed `claudeComplete` supports `guard`, **and** the deployed ContactRail sends `guard:"pd16"`. Merging the page before the Function is deployed does **not** make the guard active (the old Function ignores the extra field). Deploying the Function without the page changes nothing (no caller opts in). It may be called working only after the Function (`functions:claudeComplete`) is deployed, the page is merged, and the two are tested together on a separate test project with the real model (B3, not done). The existing production `claudeComplete` and pages are unchanged until then.

## 4. Results — reported separately (`npm run test:chat`, clean tree, exit 0)

| | |
|---|---|
| Tested commit | **`afa0d8b`** (this report is a later, documentation-only commit) |
| mocha passing | **55** = 28 (CHAT-TEST-01/FIX-01 file, unchanged) + 27 (new file) |
| pending (NOT-TESTED) | **8** = 4 + 4 |
| failing | **0** |
| Probe labels (87) | **7 GAP-CONFIRMED · 0 GAP-NOT-REPRODUCED · 72 CONTROL · 8 NOT-TESTED** |
| New file only (32 probes) | 27 CONTROL · 1 GAP-CONFIRMED (S4) · 4 NOT-TESTED (B1–B4) |
| All suites in one mocha process (chat + SEC-TEST-01) | **150 passing / 13 pending** (= 95 + 55 / 5 + 8) |
| Negative control — Function | Same new tests against the **pre-change** `functions/index.js`: **16 failing** (G1, G2, G3a–h, G4a–b, G7, G8, R1, R2 — the guard does nothing without the change); G5, G6 and all U1–U5 still pass (unguarded behaviour identical). With the change: 0 failing |
| Negative control — page | Against the **pre-change** `ContactRail.dc.html`: **1 failing** (S1: no opt-in sent) |

Open gaps (7 GAP-CONFIRMED): draft→case fields not copied (C5e), no draft↔case link (C5f), chat and form create two cases (C6b/c/d), "ผมสีดำ" detector limit (C7l), **Home and AI Concierge not protected (S4, new)**. Not changed by this PR except as stated.

## 5. What the new tests check (synthetic, loopback HTTP, stub)

The real `claudeComplete` handler is mounted on a local express server bound to 127.0.0.1 and called with real HTTP requests; its Anthropic call goes to the stub; all other outbound calls are blocked; the environment (fetch, http/https, env vars) is restored and compared with the pre-install snapshot (X8).

- **G** (`guard:"pd16"`): clean retry released (G1); retry still male (G2); retry changes price / drops property code / drops or adds `[[CONTACT]]` / drops or adds `[[LIST_PROPERTY]]` / changes a quote / empty (G3a–h); retry throws or answers HTTP 500 (G4a–b) → fixed fallback, ≤ 2 stub calls, response only `{completion}`, no male voice, no token, **nothing written to Firestore**; first-call failure unchanged vs the same request without guard (G5); clean Thai, quoted words and the 7 other languages unchanged (G6); first-call request identical with/without guard, `max_tokens` forwarded and never used to decide (G7); log lines = fixed reason code only (G8).
- **U** (no exact opt-in): male text unchanged incl. a translation-like request with `max_tokens` 4000 (U1); 11 other `guard` values ignored (U2); a ContactRail-style Thai-female prompt or `max_tokens` 500/600/4000 do not enable the guard (U3); `content`/`tool` mode ignores `guard` (U4); GET → 405 (U5).
- **R** (server-side sequence only): `receptionTurn` with no auth / invalid arguments is refused before any model call, writes nothing; then the guarded route answers (R1, R2).
- **S** (source read, no browser): opt-in only on ContactRail's fallback fetch and nowhere else (S1); the fallback-allowed code list (S2, "allowed by the existing code"); the fallback text triggers no button pattern of ContactRail / AI Concierge / Home (S3); Home and AI Concierge not covered (S4).

## 6. Per-probe results (run at `afa0d8b`)

### GAP-CONFIRMED (7)

| ID | Probe | Observed |
|---|---|---|
| C5e | draft -> case: draft fields NOT copied into the case (by same key and value) | draft fields not in case: [area="หัวหิน", bedrooms=3, price=5000000]; draft fields in case: []; case instead carries (from conversation, not draft): [aiPropertyKind, aiPropertyArea, aiPropertyScale, description, contactName, ownerContact] |
| C5f | draft <-> case link (draft.caseId / case.draftId) | draft.status=draft; draft.caseId=undefined; case.draftId=undefined |
| C6b | same contact via chat and via form => TWO separate cases, no link between them (policy 'one draft/one path/no duplicate case' NOT implemented) | cases=2 ids=own-1790842667698-db19f,own-SYN-FORM-1 chatCase=own-1790842667698-db19f formCase.conversationId=undefined |
| C6c | source: Owner Submission form does not read the chat draft or conversation id | form references draft/conversation: false |
| C6d | source: chat 'List property' button opens the form with NO draft/conversation parameter | plain navigate: true |
| C7l | KNOWN LIMIT, NOT FIXED: a female reply containing the word ผมสีดำ is counted as a male voice -> retry; if the retry keeps the word the good reply is replaced by the fallback | (a) retry keeps the word: replaced by fallback=true · (b) retry rephrases: retry released=true · detector unchanged in this change; NOT claimed as fixed |
| S4 | Home and AI Concierge call claudeComplete WITHOUT the guard: no server-side Thai female-voice protection; Home's prompt has no female-voice rule and a recorded owner decision (22 Sep) against gender/pronoun replacement; AI Concierge has the rule in its prompt only. Female voice for BOTH pages is NOT certified (out of scope here) | Home prompt has female rule=false, records no-replacement decision=true · AI Concierge prompt has female rule=true · neither sends guard |

### CONTROL (72)

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
| C5d | case carries conversationId/receptionVisitorId; conversation links back (linkedCaseIds) | caseSource=ai_assistant linked=["own-1790842667287-3a9f8"] |
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
| G1 | guard:'pd16': male reply rewritten by a clean retry; response shape stays { completion } | status=200 keys=completion calls=2 |
| G2 | guard:'pd16': retry STILL male => fixed female fallback; { completion } only; max 2 calls; no Firestore write | reason=retry_still_male · 2 stub calls · nothing stored |
| G3a | guard:'pd16': retry CHANGES THE PRICE => fixed female fallback; { completion } only; max 2 calls; no Firestore write | reason=retry_unsafe · 2 stub calls · nothing stored |
| G3b | guard:'pd16': retry DROPS the property code => fixed female fallback; { completion } only; max 2 calls; no Firestore write | reason=retry_unsafe · 2 stub calls · nothing stored |
| G3c | guard:'pd16': retry DROPS the [[CONTACT]] token => fixed female fallback; { completion } only; max 2 calls; no Firestore write | reason=retry_unsafe · 2 stub calls · nothing stored |
| G3d | guard:'pd16': retry ADDS a [[CONTACT]] token => fixed female fallback; { completion } only; max 2 calls; no Firestore write | reason=retry_unsafe · 2 stub calls · nothing stored |
| G3e | guard:'pd16': retry DROPS the [[LIST_PROPERTY]] token => fixed female fallback; { completion } only; max 2 calls; no Firestore write | reason=retry_unsafe · 2 stub calls · nothing stored |
| G3f | guard:'pd16': retry ADDS a [[LIST_PROPERTY]] token => fixed female fallback; { completion } only; max 2 calls; no Firestore write | reason=retry_unsafe · 2 stub calls · nothing stored |
| G3g | guard:'pd16': retry CHANGES a quoted span => fixed female fallback; { completion } only; max 2 calls; no Firestore write | reason=retry_unsafe · 2 stub calls · nothing stored |
| G3h | guard:'pd16': retry is EMPTY => fixed female fallback; { completion } only; max 2 calls; no Firestore write | reason=retry_unsafe · 2 stub calls · nothing stored |
| G4a | guard:'pd16': retry call THROWS => fixed female fallback; { completion } only; max 2 calls; no Firestore write | reason=retry_failed · 2 stub calls · nothing stored |
| G4b | guard:'pd16': retry call answers HTTP 500 => fixed female fallback; { completion } only; max 2 calls; no Firestore write | reason=retry_failed · 2 stub calls · nothing stored |
| G5 | first model call fails: same status/body as without guard, 1 call, never the fallback | throw → 500 · http429 → 429 (identical to unguarded) |
| G6 | guard:'pd16': clean Thai, quoted ครับ/ผม and the 7 other languages pass through unchanged (1 call each) | unchanged 9/9 |
| G7 | guard does not alter the first model request; retry only appends the assistant reply + rewrite note (max_tokens passes through, never used to decide the guard) | max_tokens=777 forwarded to both calls |
| G8 | pd16_fallback log = fixed reason code only | reasons=retry_still_male,retry_unsafe,retry_failed · 3 log lines scanned |
| U1 | no guard: male-voiced text (e.g. translating a customer's words) is returned unchanged; no retry | calls=2 |
| U2 | guard values other than the exact string 'pd16' are ignored (11 variants) | unchanged 11/11 |
| U3 | without guard, a ContactRail-style Thai-female prompt or max_tokens 500/600/4000 does NOT enable the guard | unchanged 5/5 |
| U4 | single-turn content (and tool) mode: guard:'pd16' has no effect (male text returned unchanged, 1 call) | content-mode completion unchanged=true · tool-mode result passed through=true |
| U5 | GET is still rejected with 405 | status=405 |
| R1 | receptionTurn(no auth) -> 'unauthenticated', 0 model calls, nothing written; then the fallback route is guarded (simulated server-side sequence — NOT a browser verification) | code=unauthenticated modelCallsBeforeFallback=0 fallbackReply=fixed fallback |
| R2 | receptionTurn(invalid-argument) -> 0 model calls, nothing written; then the guarded fallback route rewrites a male reply (simulated server-side sequence — NOT a browser verification) | code=invalid-argument |
| S1 | SOURCE CHECK: opt-in only on ContactRail's fallback fetch; Home, AI Concierge, AI Quick Add, Agent Profile and firebase-client tools do NOT send it | 1 opt-in in ContactRail; 0 elsewhere (source read, not a browser run) |
| S2 | SOURCE CHECK: codes the existing code allows to fall back = not-found, unavailable, unauthenticated, invalid-argument, permission-denied, or no code. Reported as 'allowed by the existing code' — NOT called safe; this change does not alter that policy | codes=invalid-argument,not-found,permission-denied,unauthenticated,unavailable noCode=true |
| S3 | SOURCE CHECK: fallback text has no contact/list-property trigger phrase, token or property code used by ContactRail, AI Concierge or Home (so no button comes from it) | no trigger found (source phrases read from the three pages) |
| X8 | after the run fetch, http/https request+get and every touched env var equal their pre-install state | identical to pre-install snapshot |

### NOT-TESTED (8)

| ID | Probe | Observed |
|---|---|---|
| C3-refresh | browser refresh / localStorage / IndexedDB auth restore | needs a real browser session; this file only calls the server again with the same uid |
| C7h | female persona + real answer quality in the other 7 languages (en/ru/zh/de/no/fr/it) | needs the real model; this stub cannot say anything about it. Absence of a gender guard there is NOT treated as a vulnerability |
| C7i | real-model behaviour for Thai (how often it writes ครับ/ผม) | needs the real model on a test environment |
| C9 | real Anthropic model, deployed Functions/rules, production | out of scope: stub + emulator only; this run is not a production PASS |
| B1 | real browser: ContactRail actually switching to this route when receptionTurn is unusable, and showing the fallback bubble | needs a real browser session on a test page; R1/R2 only simulate the server-side order and S2 only reads the code list from source |
| B2 | real Anthropic model on this route (how often Thai replies are male-voiced; quality of the fallback turn) | stub only |
| B3 | combined deploy order: Function with guard support + page that sends the opt-in, together | not deployed; the guard is effective only when BOTH the deployed Function supports it AND the deployed page sends it. A page merged before the Function is deployed changes nothing (the old Function ignores the field); a Function deployed without the page changes nothing (no caller opts in) |
| B4 | Thai female voice on Home and AI Concierge | not covered by this change; not certified |

## 7. Next (not done here)
- Decide separately for **Home** (owner decision of 22 Sep; no female-voice rule in its prompt) and **AI Concierge** (rule in prompt only; could opt in).
- Test on a separate test project with the real model and a real browser (B1–B3); owner deploys `functions:claudeComplete` and merges the page only after approval.
- "ผมสีดำ" detector decision, draft ↔ form unification and draft → case copy remain separate packages.
- Owner steps O-1/O-2/O-3 remain **pending**.

Compensation, quota and subscription work remain paused.
