# RESPONSIVE-QA.md

## Tooling honesty note (read first)
This package was built and screenshotted inside Claude's own iframe preview tool, which renders at a fixed viewport and did not respond to a programmatic `window.resize` in earlier testing this session. That means the 5 required viewports (1440×900, 1024×768, 768×1024, 430×932, 390×844) were **not independently confirmed pixel-by-pixel by an automated tool** in this delivery. What follows is what was actually verified, stated plainly rather than inflated.

## What was actually checked
- **Layout technique**: every page uses CSS Grid with `auto-fit`/`minmax()` for card grids (`packages.html` plan grid, `index.html` step grid, module tab content) and Flexbox with `flex-wrap:wrap` for the global header/nav — both are inherently responsive patterns that reflow at narrow widths without JS, by design (not a claim of "tested," a statement of the technique used)
- `.app-header` has an explicit `@media (max-width:720px)` rule in `assets/css/app.css` collapsing the nav row (documented, present in source, not screenshotted at 390px in this tool)
- Screenshots were taken at the tool's default desktop width for: index.html, workspace.html, packages.html, favorites.html (redirect), customer-space.html (prior session) — all rendered without horizontal scrollbars or visible overlap at that width
- Modal dialogs (`packages.html` order/success modals, Customer Space share settings) use `width:min(420px,90vw)` — a pattern that caps width on desktop and shrinks to viewport on mobile by construction

## What was NOT independently verified
- Actual rendering at 1024×768, 768×1024, 430×932, 390×844 was not captured as separate screenshots in this delivery
- Real touch-target sizing on a physical device
- Real mobile browser keyboard-safe-area behavior for form inputs (Collection Builder fields, Customer Space message composer)

## Recommendation
Before relying on this for a Product Owner mobile sign-off: open the published GitHub Pages URL on an actual phone (or Chrome DevTools device toolbar) and check the pages listed above at 390px width. This is flagged as a genuine gap, not silently assumed passing.
