# ACCESSIBILITY-QA.md

## What was actually checked in this pass
- **Keyboard navigation**: all interactive elements are native `<button>`, `<a>`, `<select>`, `<input>` elements (no `<div onclick>` custom controls without a real interactive element underneath) — these are keyboard-focusable and activatable by default in every browser
- **Language selector**: implemented as a native `<select>` — keyboard accessible (arrow keys / typeahead) by default, no custom dropdown widget that would need extra ARIA work
- **Form labels**: `packages.html` and Collection Builder fields use visible text labels adjacent to inputs (not icon-only)
- **Modal close**: every modal (Packages order/success, Customer Space share settings) has a visible "Cancel"/"Close" button; clicking the dark backdrop also closes it
- **Colour + text pairing**: status indicators (🟢🟡🔵, Free/Getting Busy/etc.) always pair an icon or word label with colour — never colour alone
- **Semantic headings**: `index.html` and `mission-report.html` use `<h1>` for the page title

## What was NOT verified in this pass (real gaps, stated plainly)
- **Escape-to-close**: modals close via backdrop click and a Cancel button, but no `keydown` handler for the Escape key was added
- **Visible focus outline**: no custom `:focus-visible` styling was added or removed — this relies entirely on each browser's default outline, which was not screenshotted to confirm it isn't accidentally suppressed by a reset rule
- **Colour contrast ratios**: not measured with a contrast-checking tool (e.g. white text on the maroon header was eyeballed, not measured against WCAG AA 4.5:1)
- **Screen reader pass**: no VoiceOver/NVDA testing was performed
- **Alt text**: property "photo" placeholders in the demo pages are text labels (`[HH-111 photo]`), not `<img>` tags, so there are no real images needing alt text in this demo — real property photos in production will need this addressed at that time

## Recommendation
Run an automated pass (e.g. axe DevTools or Lighthouse Accessibility) against the published GitHub Pages URL before treating this as accessibility-complete. This document intentionally separates "checked" from "not yet checked" rather than claiming a full pass.
