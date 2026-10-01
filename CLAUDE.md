> 🔄 **อัปเดต 1 ต.ค. 2569 (ชุดงาน DOC-01)** — ข้อความ "PHS-CLOSE-1 (8 ส.ค. 2569)" เดิมที่อ้างว่าไฟล์นี้ไม่มีเนื้อหาล้าสมัยหรือขัดแย้ง **ใช้ไม่ได้แล้ว** ตรวจพบหลายข้อที่ล้าสมัยและแก้ตามหลักฐานในไฟล์นี้แล้ว · ข้อที่ยังไม่ยืนยันถูกระบุว่า "ไม่ทราบ" ชัดเจน

---

> ⚠️ **เริ่มแชท/เซสชันใหม่: อ่าน `HANDOFF-NEXT-CHAT.md` (บล็อกบนสุด) ก่อนเสมอ**
> ลำดับความน่าเชื่อถือ: **BLUEPRINT.md > HANDOFF-NEXT-CHAT.md > CLAUDE.md** · ถ้าขัดกัน ให้ตรวจโค้ดและ `origin/main` จริงก่อนสรุป
> **เว็บสาธารณะ:** บันทึกล่าสุด = 🔴 RED / Public Hidden (โหมดปิดปรับปรุง · ปิดแดงล่าสุดที่มีบันทึกคือ 23 ก.ย. 2569 · **สถานะปัจจุบันไม่ทราบ**) · เปิดเขียวเฉพาะตอนทดสอบและต้องปิดแดงทันที (BLUEPRINT §29.4)
> **วิธีทำงาน = WORKFLOW v2 (BLUEPRINT §29.0)** ดูหัวข้อ "Working workflow" ด้านล่าง

---

# huahin.properties — Project Blueprint

Real-estate marketplace + admin CMS for a Hua Hin / Pranburi / Cha-am property
agency. Built as Design Components (.dc.html), data lives in Firebase
(Firestore), published from the GitHub `main` branch (GitHub Pages) with
Cloud Functions/rules deployed by the owner (non-technical). Owner cannot
code — every change ships as a branch + Pull Request (see "Working workflow"
below) with plain-language, step-by-step instructions for anything the owner
must do themselves (merge, deploy, testing on the live domain).

## Brand
- Name: huahin.properties (styled "huahin . properties")
- Logo: logo.png (house icon, warm maroon/burgundy on cream)
- Palette: warm neutrals (oklch cream/sand backgrounds) + deep maroon/burgundy
  accent (derived from logo), dark charcoal-brown text. Serif display font
  (Playfair Display) for headings, clean sans body.
- Tone: luxury editorial, warm, resort feel (sea, pool villas, Hua Hin
  railway station motifs referenced in earlier concepting).

## Languages
8 total, fully translated across ALL pages/forms/chat/admin: Thai (default),
English, Russian, Chinese, German, Norwegian, French, Italian. Flag-icon
switcher. `data.js` holds the i18n dictionary + per-property translated
fields; each page's logic class reads `this.state.lang`.

## Pages (all `.dc.html`, Design Components)
- `Home.dc.html` — homepage, hero, search box, featured listings
- `Search Results.dc.html` — grid/list, filters (area/zone/price/type/beds/
  baths/land/living area/status/features), sort
- `Property Details.dc.html` — gallery, full details, nearby POIs/distances,
  similar listings, WhatsApp/LINE/phone/email contact, inquiry form, Compare,
  Favorite, Share, Schedule Viewing, Mortgage Calculator, Reviews (mock,
  property-aware) — now routed through `property-adapter.js` (normalized
  read model) and `property-repositories.js` (reviews/media/viewing-request
  seams, still mock-backed, no Firestore writes yet)
- `Sell.dc.html` — **not present in the repo** (no such file at `4e358a5`);
  the "list your property / consign" entry points are `Agent Signup.dc.html`
  (self-serve listers) and `Owner Submission.dc.html` (see below)
- `About.dc.html` — agency story; area cards (Hua Hin/Pranburi/Cha-am) pull
  photos uploaded via admin (same card component reused across site)
- `Contact.dc.html` — general contact page
- `Admin Login.dc.html` — hardcoded-initially credentials, now editable by
  admin (Site Content page has a change-password/email flow). The password
  field is `type="text"` (line 40; plaintext on screen) — recorded as a
  deliberate design; the owner has not decided whether to keep it.
- `Admin Dashboard.dc.html` — KPI counts (total/for sale/for rent/sold/
  reserved/new/rented), rental-expiry tracker sorted soonest-first
  (MM/DD/YYYY numeric format), links out to sub-tools
- `Owners.dc.html` — unified directory: owners / tenants / buyers in one
  page, cross-linked to property codes, each owner can have 2 reference
  photos + Google Maps link per property, click a name to see all their
  properties (handles owners with multiple listings)
- `Property Map.dc.html` — Google Maps–based zone map (real Google Maps JS
  API, pins colored by status/type, click pin → property popup → edit)
- `AI Quick Add.dc.html` — voice/photo-driven listing intake: admin uploads
  multiple photos (multi-select fixed), optional PDF/image project docs,
  optional Google Maps coordinate pin (decimal lat,lng format e.g.
  12.558940,99.909039 — NOT the Google share-link format), hold-to-talk
  voice dictation (mic button, live transcript, editable, can keep adding),
  then Claude API drafts the full bilingual (EN first, then all 8 langs)
  listing — description, nearby-landmarks-with-drive-times (10+ POIs,
  one per line, EN + TH), SEO-optimized photo captions/alt-text-ready copy
  and keyword list, and a ready-to-copy Facebook post (fixed contact block
  + 10 hashtags, editable in Site Content) — admin reviews/edits draft, can
  voice-correct iteratively, then confirms → saves owner contact info →
  then the Facebook-post copy prompt appears last. NOTE: AI already
  generates SEO-optimized per-photo captions meant to double as alt text —
  these are NOT yet wired into any real `<img alt>` attribute on the public
  site (tracked as a real gap in BLUEPRINT.md §24.8, not yet fixed).
- `Site Content.dc.html` — admin-editable global text/settings:
  - Facebook post fixed footer + hashtags (editable)
  - 🧠 AI Notes: free-text knowledge snippets fed into the chatbot (add/
    edit/delete), e.g. promotions, temporary announcements
  - 🎭 AI Persona: name + role fields for the chatbot's character (default
    "Anna" / friendly AI assistant) — fully admin-editable, no code change
    needed to rename or re-cast the assistant
  - 🚫 AI Restrictions: free-text list of topics the chatbot must refuse to
    discuss (e.g. total listing count, commission rates, owner identities)
  - Admin account recovery (change username/password/email)
  - Stripe price IDs, Featured Listing pricing, banner pricing (all live —
    see Stripe section below)
- `Listing Approvals.dc.html` — admin queue for self-serve listings
  (pending/live/expired/rejected), approve/reject with reason, plus a
  duplicate-trial-signup alert (phone-number matching) at the top. Part of
  the membership v2 system (see below) — LIVE, Firestore rules deployed.
- `Lister Dashboard.dc.html` — self-serve workspace for listers (owners/
  agents, no separate "Agent" role): own property list, add/edit with up to
  10-20 photos (tier-gated), draft/publish toggle, AI-generated post-text
  quota (tier-gated), social links (tier-gated), share popup.
- `Lister Billing.dc.html` — Stripe subscription management: view/upgrade
  tier (Trial/1/2/3), Stripe Customer Portal link. LIVE, not a stub.
- `Agent Signup.dc.html` — signup/login for listers: email+password, Google
  Sign-In, Facebook Sign-In, Phone/OTP — all implemented and wired to
  Firebase Auth (not just email+password as previously documented here).
  Password fields (signup and login): the code now uses
  `type="{{ signupPasswordType }}"` / `type="{{ loginPasswordType }}"` that
  default to `"password"` with an eye toggle (lines 149, 171, 552–557) — the
  older "type=text plaintext" note is outdated. Verified from source only;
  the rendered page was NOT re-tested (e.g. whether the field briefly shows
  as text while the template loads).
- `Agent Profile.dc.html` — public lister mini-site (`?id=` a lister uid):
  bio, social icons, property list, Share modal (Facebook/LINE/copy link).
- `Agent Approvals.dc.html` — admin view of signed-up listers (approval is
  now automatic on email verification per membership v2; this page is
  mainly account listing/suspension, not a signup approval queue anymore).
- `Advertise.dc.html` — public self-serve banner purchase (Stripe Checkout
  one-time payment, dynamic pricing from Site Content).
- `Staff Signup.dc.html` — Staff self-signup restricted to an
  Owner-issued email invite (`staffInvites` collection).
- `Mission Control.dc.html` / `CEO Guide.dc.html` / `Launch Readiness
  Dashboard.dc.html` / `Developer Maintenance Center.dc.html` — internal
  project-management/admin-only tooling (status tracking, knowledge base,
  release readiness, diagnostics) — not part of the public site. Their data
  can be stale (e.g. Launch Readiness Dashboard has an empty `blockers` list
  at line 525); do not read it as "no blockers".
- **Added after this file was first written** (present in the repo):
  `Owner Submission.dc.html` (list-your-property form, writes a pending
  `properties` doc with `source="owner_submission"`), `Track Submission.dc.html`
  (customer tracking via `trackToken`), `Leads.dc.html`, `Team.dc.html`,
  `Member Management.dc.html`, `AI Concierge.dc.html` (assistant page),
  `index.html` (see the note below) and `m17/` (Villa M17 listing in 8
  languages, a separate static page added 26 Sep 2026 that has no
  maintenance gate and no Firebase).
- **`index.html` vs `Home.dc.html` are two different files.** `index.html`
  (default document of GitHub Pages) is an older copy of the home page: it
  lacks `_ensureVisitorUid` and `whenFirebaseReady` and its welcome flow
  navigates to Search Results instead of chatting. Both import `ContactRail`.
  Which one visitors get at `/` is not verified; whether they should be
  merged is an open owner decision.

## Shared components
- `PropertyCard.dc.html` — listing card (used in Home, Search Results,
  similar-listings)
- `SearchFilters.dc.html` — filter panel (desktop sidebar / mobile drawer)
- `LanguageSwitcher.dc.html` — flag dropdown, used in every page's header
- `ContactRail.dc.html` — the floating side rail with TWO independent
  entry points: "Contact us" (opens the existing inquiry form) and 💬 chat
  bubble (AI chatbot). On mobile the rail shows collapsed by default per
  user preference (visible, collapsible); "Chat with us" bubble always
  visible, never auto-hidden.

## AI Chatbot (in ContactRail.dc.html)
- Calls a Firebase Cloud Function (`functions/index.js`) that proxies to
  the Anthropic API — the real API key lives ONLY server-side as a Firebase
  secret, never in client code. `window.claude.complete` only works in this
  design-preview environment, NOT in production — production must go
  through the deployed Cloud Function.
- Persona: name/role pulled from Site Content's AI Persona fields (falls
  back to "Anna" / friendly assistant).
  - Answers general chit-chat naturally/warmly like a person.
  - Answers factual questions (price, beds, status, property codes) ONLY
    from real Firestore listing data + AI Notes — never invents facts.
  - Refuses restricted topics (from AI Restrictions field) politely,
    redirecting to contact instead of exposing that a restriction exists.
  - Auto-detects and replies in the customer's own language (all 8
    supported).
  - When it mentions a property code (e.g. HH-109), the UI auto-detects
    the code in the reply text and renders a clickable "View property"
    button (desktop: opens in new tab; mobile: navigates in place, since
    the chat panel is full-screen there). When the reply naturally
    contains "contact us" (in any supported language), the UI renders a
    "Contact us" button that opens the inquiry form.
  - The model is instructed to just state property codes / say "contact
    us" in prose — never fabricate URLs — the UI does the linking.
  - Later additions (all in `functions/index.js`, verified present in source;
    deployed versions NOT verified): the reception chat runs through
    `receptionTurn` / `startConversation` / `sendConversationTurn`;
    `updatePropertyDraft` / `getPropertyDraft` hold the owner-listing draft;
    `createCaseFromConversation` creates a Case (a `properties` doc) only on
    the customer's explicit submit. The "Contact us" button now appears only
    when the reply carries the `[[CONTACT]]` token (PD-15), and Thai replies
    must use a female voice (PD-16, with a server guard `pd16Violation`).
    Product decisions are in BLUEPRINT §36 (PD-01…PD-16) — do not contradict
    them without new approval.

## Data / backend
- `data.js` — the i18n dictionary and label tables. `PROPERTIES`, `OWNERS`
  and `TENANTS` are now empty arrays (the old "24 sample properties" were
  removed), so listings come only from Firestore. `getEffectiveProperties()`
  merges live Firestore listings + admin edits
  on top of the static base at runtime (Home/Search Results/Property
  Details all call this) — replaced the older `applyLiveEdits()` approach.
- `property-adapter.js` / `property-repositories.js` / 
  `property-business-logic.js` — Property Details' normalization and
  repository seam layer (Step 2.2C/3, July 2026): safe read-through for
  identity/price/facts/photos/SEO fields, plus reviews/media/viewing-
  request repository functions (mock-backed today, shaped to swap in real
  Firestore calls later without a UI rewrite).
- `firebase-client.js` — all Firestore read/write helpers: properties,
  owners, listers, AI notes, AI persona, AI restrictions, site content,
  admin account, inquiries/leads, banners, Stripe checkout/portal session
  creation. Photos are stored in **Firebase Storage** (migrated off
  Firestore data-URLs — see Known open items below for what's now current).
- `firebase.json` + `functions/` — Cloud Functions config (20 exported
  functions in `functions/index.js`): Claude API proxy (`claudeComplete`),
  reception/conversation/case functions (see above), Stripe
  (`createCheckoutSession`, `createPortalSession`, `createFeatured…`,
  `createBanner…`, `createVip…`, `stripeWebhook`), LINE login, share/meta
  and notification functions. **Which versions are deployed is NOT verified**
  (the latest recorded deploy is `receptionTurn`, with no date or commit —
  "recorded, unconfirmed"). **Only the owner deploys**, from a GitHub
  Codespace terminal (no local dev environment): `git pull` first, then a
  scoped command such as `firebase deploy --only functions:<name>` (never
  assume the whole `--only functions` bundle). Walk the owner through one
  command at a time and confirm each output before the next. `functions/`
  runs on Node 20 (`functions/package.json`); the upgrade deadline recorded
  in BLUEPRINT (30 Oct 2026) must be checked against the official
  Firebase/Google Cloud announcement before it is treated as confirmed.
- Firebase project: `huahin-properties-5f1b5`. **Firestore Security Rules**:
  the repo's `firestore.rules` is role-based + deny-by-default and BLUEPRINT
  §5 records "deployed 16 July 2026" — **recorded, not re-verified**; the
  rules actually deployed now are unknown. Source review of `firestore.rules`
  found two open issues (public create of `properties` has no allowed-field
  list; `properties` is publicly readable while Cases with contact info and
  `trackToken` live in it) — details in the HANDOFF top block; do NOT edit
  rules without an approved task. Emulator tests (`npm run test:rules`) cover
  `conversations` only. Always trust BLUEPRINT.md over this file if they
  disagree, then check the real code.

## Working workflow (WORKFLOW v2, from 1 Oct 2026 — BLUEPRINT.md §29.0)
Roles: **Owner** sets goals, approves each work package, and alone decides
merge / deploy / switching the site GREEN, and tests on the live domain ·
**ChatGPT Work** defines the scope of a package and reviews every PR before
merge (during the transition) · **Claude Code** works on the branch named in
the package, opens the PR, and reports with evidence.

1. A work package states: name, branch, files that may be edited, what is
   forbidden, definition of done. The owner approves it **as a package** —
   once approved, finish the whole package without asking again per file.
2. Before starting, check `origin/main`; if it differs from the stated base,
   inspect the difference before reusing earlier information.
3. Edit → review the diff → commit → push **only the package's branch** →
   open a PR. Never push to `main`, never merge, never deploy, never switch
   the site GREEN, never edit files outside the package. Anything outside
   scope: stop, report, propose a new package. New problems found along the
   way become a new PENDING item, not a mixed-in fix.
4. Report three statuses separately: **(1) code on main** (merged, commit
   hash) · **(2) published** (Pages build `success` for that commit; Functions
   / rules only after the owner's deploy, with output + date + commit) ·
   **(3) production PASS** (tested on the real domain, with evidence and the
   commit tested). A note without evidence (e.g. "deployed") is
   "recorded, unconfirmed" — never count it as published or PASS. Preview PASS
   is not production PASS. DONE is not CLOSED.
5. Split every report into **verified by me** / **recorded** / **unknown**;
   test results as TEST / EXPECTED / ACTUAL / EVIDENCE with the commit tested.
   No secrets (names of secrets only) and no customer data in docs, PRs or
   comments.
   **Testing follows impact:** a docs-only package is checked for correctness
   and consistency of the documents (against source/git and against each
   other) and needs no GREEN switch or production test; a package that
   changes the system states its tests (what, where, pass criteria, whether
   GREEN is needed) up front.
6. The old Viewer flow (`Copy Code to GitHub.dc.html`, copy-paste file by
   file, `export-for-github/`, zip downloads) is retired and kept as history
   only. The Viewer is not a website file — never commit it to the repo root.
   **Still in force:** guide the owner **one step at a time** — wait for the
   result, then give the next step — and always name the window. Retiring
   the Viewer did not retire this way of helping the owner.
7. Cloud Function / rules changes additionally need the owner to deploy from
   a GitHub Codespace (see the Data/backend section for scope and `git pull`).
   Explain every terminal step and say which window it applies to — owner
   easily gets lost between "the black screen" (Codespace terminal) and
   "the white screen" (GitHub web page).

## Known open items / next steps (check before assuming done)
- **Firestore Security Rules**: the repo file is role-based + deny-by-default
  and was recorded as deployed on 16 July 2026 (unconfirmed since). Two source
  issues are open and need a separate approved package: public create of
  `properties` has no allowed-field list, and `properties` is publicly
  readable while Cases (contact info + `trackToken`) are stored there.
  Source review only; not tested against real Firestore.
- **Stripe**: the code for subscriptions, Featured Listing boost and banner
  purchases exists and is connected. **Test vs Live mode is unknown** —
  BLUEPRINT (line 1288) records the Product being created in Test mode and
  `docs/ceo-handoff/KNOWN_ISSUES.md` says Sandbox. Do not assume real payments
  until the owner confirms in the Stripe Dashboard.
- **Site status**: last recorded RED (23 Sep 2026); current state unknown.
  **#18 (Firebase init race)**: source for all three files is on `main` and
  the Pages build succeeded, but it has NOT passed production testing after
  the fix (STEP 99 S-3 not re-run).
- **Node.js 20 → newer for Cloud Functions**: check the official Firebase /
  Google Cloud announcement before treating the 30 Oct 2026 date as
  confirmed; do not upgrade without an approved package.
- Facebook auto-post integration discussed conceptually (Make.com/n8n or
  Graph API) — NOT built yet, owner deferred it.
- LINE Official Account chat integration discussed conceptually only — NOT
  built, owner deferred it explicitly to stabilize the website chatbot
  first.
- **TikTok**: designated Priority-A platform for the Thailand growth
  strategy in the Social Ecosystem Roadmap (Product Owner decision, 22
  July 2026) — planning/priority only, NO code implemented yet.
- **AI-generated photo captions/SEO keywords exist but aren't wired to
  real `<img alt>` attributes anywhere on the public site** — the content
  is generated correctly in AI Quick Add, the markup just doesn't use it
  yet. This is the highest-value concrete SEO gap identified (BLUEPRINT.md
  §24.8).
- Google Maps distance/nearby-POI auto-calculation in AI Quick Add: verify
  end-to-end that pasted coordinates actually produce 10+ POIs with drive
  times in both EN and TH on save (owner reported this working
  inconsistently in recent tests — re-verify before considering closed).
- Multi-select photo upload (tick multiple / drag-select) — implemented in
  AI Quick Add; verify this pattern is applied everywhere admin uploads
  photos (property edit form, owner reference photos, etc.) if not
  already consistent.
- Chatbot cost/usage guardrails — owner asked about Anthropic API costs
  and rate-limiting; no hard spending cap implemented yet, just discussed.
- **Agent Signup.dc.html password fields**: code uses `password` with an eye
  toggle (outdated "type=text" note removed). Source-verified only; the live
  page was not re-tested. **Admin Login.dc.html** still uses `type="text"`
  (line 40); keep-or-change is an owner decision.

## Working conventions specific to this owner
- Owner is non-technical, communicates in Thai, gets easily confused by
  multi-window workflows (GitHub tab vs. Codespace terminal vs. Firebase
  console) — always name which window/screen an instruction applies to.
- Confirm scope before changes: propose the work package and wait for the
  owner's "อนุมัติ"; owner often asks "explain first, don't code yet."
- Deliver code changes as a branch + PR (WORKFLOW v2 above) — no zip,
  `export-for-github/`, or Viewer copy-paste for new work.
- Prefer targeted edits over rewriting whole files — owner has
  tested/validated specific existing behavior (e.g. photo upload
  persistence, rental-expiry sorting) that must not regress.
