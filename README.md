# huahin.properties — Phase 2 Mission 1 (FINAL)

**A connected static frontend demo** of huahin.properties as a Real Estate Workspace Platform. 12/12 Mission Steps complete at the frontend level (10 🟢 fully frontend-complete, 2 🟡 frontend-complete with documented production/QA follow-up).

This is a **frontend demo only** — no real backend, Firebase, Firestore, payments, or AI. All data is demo data.

## How to open locally
Open `index.html` in any browser. No build step, no server.

## One connected website
Every page shares: `assets/css/app.css` (design system), `assets/js/i18n.js` (translation dictionary: ไทย/English/中文/Русский), `assets/js/app.js` (global header, navigation, language switcher with localStorage persistence, footer, Reset Demo). No page-facing "Prototype"/Claude/DC wording remains — footer reads "Frontend Demonstration".

## Pages
- `index.html` — landing + 12-step summary
- `workspace.html` — Command Center (hash-routed tabs: `#workspace` `#favorites` `#builder` `#minisite`)
- `favorites.html`, `collections.html`, `mini-site.html` — direct routes into the corresponding Workspace tab (thin redirect pages, documented in ARCHITECTURE.md — same underlying module, not duplicated code)
- `customer-space.html` — AI Assistant + Message Sender tabs
- `resources.html` — Resource Center, Filters, Onboarding, Marketing (hash-routed: `#resources` `#addons` `#customiser` `#languages` `#filters` `#onboarding` `#marketing`)
- `addons.html`, `customiser.html`, `onboarding.html` — direct routes into `resources.html` (same pattern as above)
- `packages.html` — full 4-tier package comparison + selection + demo order flow (newly built, not a route)
- `settings.html` — minimal settings page
- `mission-report.html` — 12/12 status report

## Known demo limitations
See `PRODUCTION-NEXT-STEPS.md`. Headline: ZH/RU cover navigation, headings, primary actions, and critical alerts as directed — not full long-form translation of every module's demo copy.
