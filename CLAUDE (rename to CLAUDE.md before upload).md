# huahin.properties — Project Blueprint

Real-estate marketplace + admin CMS for a Hua Hin / Pranburi / Cha-am property
agency. Built as Design Components (.dc.html), data lives in Firebase
(Firestore), deployed by the owner (non-technical) via manual GitHub
upload + Firebase Hosting/Functions. Owner cannot code — every change must
ship as ready-to-upload files with plain-language, step-by-step instructions.

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
- `Sell.dc.html` — list-your-property / consignment page
- `About.dc.html` — agency story; area cards (Hua Hin/Pranburi/Cha-am) pull
  photos uploaded via admin (same card component reused across site)
- `Contact.dc.html` — general contact page
- `Admin Login.dc.html` — hardcoded-initially credentials, now editable by
  admin (Site Content page has a change-password/email flow)
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
  KNOWN BUG: password input fields (signup and login) use `type="text"`,
  not `type="password"` — passwords are visible in plaintext on screen.
  Not yet confirmed whether this is intentional (cf. Admin Login's
  deliberate plaintext design) or a defect — flagged, unresolved.
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
  release readiness, diagnostics) — not part of the public site.

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

## Data / backend
- `data.js` — static seed data: 24 sample properties across Hua Hin,
  Pranburi, Cha-am (sale/rent/land/commercial), full i18n dictionary,
  `getEffectiveProperties()` merges live Firestore listings + admin edits
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
- `firebase.json` + `functions/` — Cloud Functions config: Claude API
  proxy, Stripe (`createCheckoutSession`, `createPortalSession`,
  `stripeWebhook`) — all deployed and live. Must be redeployed via
  `firebase deploy --only functions` whenever `functions/index.js`
  changes. Owner deploys via GitHub Codespaces terminal (no local dev
  environment) — walk through commands one at a time, confirm each output
  before the next, since owner is non-technical.
- Firebase project: `huahin-properties-5f1b5`. **Firestore Security Rules
  are role-based + deny-by-default, verified deployed and live (16 July
  2026)** — the rules are NOT the old temporary open rules anymore; see
  BLUEPRINT.md §5 item 1 and §11 ชุด B ข้อ 1 for the full verification
  record. (An earlier version of this file said rules were still
  temporary/open — that was corrected 22 July 2026 after BLUEPRINT.md's
  own record showed otherwise; always trust BLUEPRINT.md over this file if
  they ever disagree again.)

## Deployment workflow (owner's actual process — keep this in mind)
Owner cannot run local dev tools. Workflow every time code changes:
1. I copy changed files into `export-for-github/` and call
   `present_fs_item_for_download`.
2. Owner downloads the zip, extracts, and manually re-uploads the changed
   files to the GitHub repo via the GitHub web UI (Add file → Upload
   files) — NOT git commands, no local git repo, no CLI on their machine.
3. Static site changes go live automatically (GitHub Pages/Hosting).
4. Cloud Function changes additionally require opening a GitHub Codespace
   and running `firebase deploy --only functions` in its browser terminal
   (Firebase CLI + login done fresh each time since it's a cloud sandbox).
   Explain every terminal step explicitly and confirm screenshots — owner
   easily gets lost between "the black screen" (Codespace terminal) and
   "the white screen" (GitHub web page).

## Known open items / next steps (check before assuming done)
- **Firestore Security Rules**: locked down and deployed (role-based +
  deny-by-default) as of 16 July 2026 — this is DONE, not an open item.
  Do not re-flag it as "wide-open" without re-checking `firestore.rules`
  directly first.
- **Stripe**: fully connected and live (subscriptions, Featured Listing
  boost, banner purchases) — this is DONE, not "not yet added."
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
- **Agent Signup.dc.html password fields use `type="text"`** (both signup
  and login) — visible plaintext on screen. Unconfirmed whether intentional
  (cf. Admin Login's deliberate plaintext design) or a defect.

## Working conventions specific to this owner
- Owner is non-technical, communicates in Thai, gets easily confused by
  multi-window workflows (GitHub tab vs. Codespace terminal vs. Firebase
  console) — always name which window/screen an instruction applies to.
- Always confirm scope verbally before large changes; owner often asks
  "explain first, don't code yet."
- After any code change, ALWAYS re-export to `export-for-github/` and
  present for download — owner cannot get updated code any other way.
- Prefer targeted dc_html_str_replace / dc_js_str_replace edits over
  rewrites — owner has tested/validated specific existing behavior (e.g.
  photo upload persistence, rental-expiry sorting) that must not regress.
