# ARCHITECTURE.md — huahin.properties Workspace Platform (Frontend Demo)

## Data relationships (conceptual, demo-only in this package)
```
Member → Username → Mini-Site
Member → Workspace → Customers → Customer Space
Member → My Favorites → Customer Collection → Customer Space
```
One Member: one active username, one Mini-Site, one private Workspace, many customers, many Favorites, many Collections.
One Customer: one persistent Customer Space per Member relationship, may receive many Collections, one conversation per relationship.

## Modules in this package
- **Workspace** (workspace.html): Command Center (Today's Work / Recent Customers / Quick Actions), My Favorites (property library), Collection Builder (+ live Customer Space Preview + Share dialog), Mini-Site (Public View / Private Workspace shortcuts / Username Settings)
- **Customer Space** (customer-space.html): property collection hero, Customer Mindset Box, AI Assistant tab, Message Sender tab, property-context "Ask about this" flow
- **Workspace Economy** (resources.html): Resource meters + 8 AI usage states, Add-ons + order flow, Mini-Site Customiser (theme/colour/sections + live preview), Languages (switcher stub + translation-status vocabulary), Advanced Favorites Filters, Onboarding, Marketing positioning drafts

## Demo data
All property, customer, and usage data in this package is hard-coded demo data inside each page's own script — there is no shared JSON data layer or backend in this static package (see Production Next Steps for the real data-model proposal already documented in BLUEPRINT.md §25.x of the main project).

## Packages (approved pricing, not rebuilt as a screen here)
Free Trial, Package 1 (590 THB), Package 2 (1,190 THB), Package 3 (2,290 THB) — these are the approved main membership tiers; Add-ons (shown in resources.html) are supplementary purchases, not replacements for these tiers.

## Internal pricing model
Kept entirely out of this public package. See the main project's `Internal Pricing Model — CONFIDENTIAL.md` (administrator-only, never bundled into any public/customer-facing delivery).
