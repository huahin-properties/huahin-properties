# BROWSER-LOCAL-01 — results (generated)

Evidence class: **LOCAL BROWSER (Chromium + real DC runtime + Firebase SDK 10.12.2) + LOCAL EMULATORS (Firestore, Auth, Storage, real Functions code)**. Synthetic data. Not a real TEST project. No production host, no real AI.

| id | check | status | note |
|---|---|---|---|
| B10 | Staff sees all 7 DIFFERENT private photos (thumbnail i = stored photo i, by sha-256) and each lightbox opens the matching big image 1/7…7/7; getCasePhoto calls: 7 | PASS (local browser + emulators) | regression for: only the cover loaded (1 call), 6 grey tiles, clicking one opened a broken image |
| B11a | Staff from the real buttons: refused before claiming → claim → open data page → invalid coordinates refused → enter data → save → reopen shows the values; photos/status/public untouched; no Admin SDK seeding of these values | PASS (local browser + emulators) | values read back from the Case record; Staff can not write listingStatus=live or approval stamps (rules); Lister Dashboard still redirects Staff |
| B11b | refused: another Staff who has not claimed the case (page), an agent (page + direct read/write denied by rules), signed-out visitor | PASS (local browser + emulators) | assignment is enforced by the page, not by Firestore rules (rules let any Staff write non-stamp fields — unchanged, documented) |
