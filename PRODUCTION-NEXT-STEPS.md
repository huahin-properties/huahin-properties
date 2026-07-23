# PRODUCTION-NEXT-STEPS.md

## Frontend Demo Complete
- Member Workspace (Command Center, My Favorites, Collection Builder, Mini-Site shell)
- Customer Space (mindset, AI tab, Sender chat tab, property context)
- Workspace Economy (resources, AI states, add-ons, customiser, filters, onboarding, marketing drafts)
- Static site packaged for GitHub Pages with relative paths, no build step

## Production Backend Pending (not started, not implied done)
- Firebase Authentication for Members and Customers (real login, not demo)
- Firestore data model for Workspace/Favorites/Collections/Customer Space/Conversations (proposal exists in BLUEPRINT.md §25 of the main project — not implemented)
- Firestore Security Rules for the above (proposal exists — not deployed)
- Real AI integration (Cloud Function proxy to Anthropic API, per this project's existing ContactRail pattern) — Customer Space AI/Sender chat here is 100% static demo text
- Real payment processing for Add-ons and Package upgrades (Stripe, per this project's existing pattern) — order flow here is demo-only, no charge occurs
- Real username reservation/uniqueness check and redirect-on-change logic
- Real global multi-language system — a proper central translation dictionary covering every screen (this package only stubs the language switcher visually; this is the single largest remaining gap)
- Real file/photo upload for Mini-Site branding and property photos
- Real storage/AI/translation usage metering tied to actual billing cycles
- Production analytics events (list documented in BLUEPRINT.md §25.2)
- Admin configuration backend for package/add-on pricing (internal pricing model documented, not implemented)

## Recommended Next Mission
Mission 2: build the real Firestore data model + security rules for Workspace/Favorites/Collections/Customer Space (Phase A/B from the earlier Shared Favorites directive), starting with Read-only prototypes against a real (test-mode) Firestore project before any write path is enabled.
