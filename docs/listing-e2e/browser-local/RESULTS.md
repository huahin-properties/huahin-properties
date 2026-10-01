# BROWSER-LOCAL-01 — results (generated)

Evidence class: **LOCAL BROWSER (Chromium + real DC runtime + Firebase SDK 10.12.2) + LOCAL EMULATORS (Firestore, Auth, Storage, real Functions code)**. Synthetic data. Not a real TEST project. No production host, no real AI.

| id | check | status | note |
|---|---|---|---|
| B1 | outsider form → private case, photos in private storage, nothing public | PASS (local browser + emulators) | case own-2f9bd534b2ce8209bb8a; console/failed lists in B0 summary |
| B2 | refresh keeps form+photos (no re-upload); lost response → same case; refresh after success keeps confirmation | PASS (local browser + emulators) | submit requests=2 for 1 case; staged files=2 |
| B3 | double click → one request, one case; land with 1 photo is accepted (Photo Standard v1) | PASS (local browser + emulators) |  |
| B4 | agent: submit → own-case list in Lister Dashboard → open; other agent sees nothing (UI + direct read refused); add listing → private form | PASS (local browser + emulators) | case own-3890368b2b4d101363a1 |
