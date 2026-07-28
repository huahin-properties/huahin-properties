# ADMINISTRATOR CONFIDENTIAL — Internal Pricing Model (WEM v1 Draft)

**Do not place this file's content in any customer-facing UI, DC template, or public documentation.** Never expose these figures or formulas to Members.

## Formula (conceptual, configurable per resource)

```
Member Selling Price =
  Direct Variable Resource Cost
  + Platform Operations
  + Support & Development
  + Business Margin
```

Initial planning reference only: target ~50% gross margin over direct variable resource cost (e.g. direct cost ฿50 → reference selling price ~฿100). This is **not** a fixed permanent rule — actual selling price must stay configurable per resource type, payment fees, tax, support cost, package level, promotional campaign, currency, and supplier price changes.

**Gross margin ≠ net profit.** Administrative, payment processing, tax, development, and support expenses still reduce net profit after gross margin is applied.

## Resources requiring internal cost tracking (not yet implemented)
AI Credits/Actions, Storage, Translation, Media Processing, Export/document generation — each needs its own supplier-cost basis and configurable margin, administered by role (see Admin Configuration Concept below), not hard-coded.

## Admin Configuration Concept (future — not implemented)
Admins should eventually configure: package names/prices, included resources, add-on prices, resource unit costs, target margin, promotional pricing, usage alerts, grace amounts, billing cycles, translation rates, AI action credit values, storage packs, currency, tax display, availability by package. No backend exists for this yet — documented for future implementation only.

## Status
Draft, WEM v1, 22 ก.ค. 2569 — business planning reference, not final pricing, not connected to any billing system.
