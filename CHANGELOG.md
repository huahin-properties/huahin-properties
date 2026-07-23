# CHANGELOG

## P2-M1 Live Deployment Repair
Fixed a real broken link in `workspace.html` (leftover reference to a non-existent internal admin file, now points to `packages.html`). Added `?v=phase2-m1-final-2` cache-busting query params to all shared asset includes (css/js) across every page. Added `CNAME` file (`huahin.properties`) for the custom domain. Verified no absolute (`/...`) paths, no remaining `.dc.html`/Prototype links, and confirmed `support.js`'s Claude-runtime hooks are self-guarded (`if (window.parent === window) return`) so they no-op harmlessly outside the Claude preview — support.js does not block standalone loading.

## P2-M1 Final Fix 1
Added global connected header/nav/language-switcher (i18n.js + app.js) to every page. New `packages.html` (4-tier comparison + selection + demo order flow). Split tabbed modules into real routed files (favorites/collections/mini-site/addons/customiser/onboarding.html) via `location.hash`. Removed all user-facing "Prototype"/Claude wording. Added RESPONSIVE-QA.md and ACCESSIBILITY-QA.md. Mission Report now 12/12 Frontend Steps Complete (10 🟢, 2 🟡 — no 🔵/⚪/🔴 remain).

## WEA v1 — Workspace Experience Architecture v1
Initial Member Workspace prototype: Command Center concept, My Favorites, Collection Builder, Mini-Site (basic).

## WEA v1.1 — Refinement
Official `@username` Mini-Site URL format adopted. Added Today's Work, Recent Customers, Quick Actions, Username Settings with validation states, refined Mini-Site public header, Collection Builder live preview + Share dialog.

## WEM v1 — Workspace Economy
Added Workspace Resource Center (6 resources, 8 AI usage states), Add-ons + order flow, Mini-Site Customiser (themes/colours/sections), Multi-language config concept, Advanced Favorites Filters, Onboarding (role-based), Marketing positioning drafts. Internal pricing model documented separately as ADMINISTRATOR CONFIDENTIAL.

## Phase 2 — Mission 1 (this package)
Consolidated WEA v1.1 + WEM v1 prototypes into one downloadable, GitHub-Pages-ready static site (index.html shell + workspace/customer-space/resources pages + mission report + full documentation set). 10/12 Steps 🟢 Complete, 2/12 🟡 Complete-with-pending-work. Global multi-language system intentionally flagged 🔵 Demonstration-only — not fully built in this pass.
