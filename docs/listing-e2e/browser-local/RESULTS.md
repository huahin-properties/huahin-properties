# BROWSER-LOCAL-01 — results (generated)

Evidence class: **LOCAL BROWSER (Chromium + real DC runtime + Firebase SDK 10.12.2) + LOCAL EMULATORS (Firestore, Auth, Storage, real Functions code)**. Synthetic data. Not a real TEST project. No production host, no real AI.

| id | check | status | note |
|---|---|---|---|
| B1 | outsider form → private case, photos in private storage, nothing public | PASS (local browser + emulators) | case own-0893bc26e2b47fb6f21a; console/failed lists in B0 summary |
| B2 | refresh keeps form+photos (no re-upload); lost response → same case; refresh after success keeps confirmation | PASS (local browser + emulators) | submit requests=2 for 1 case; staged files=2 |
| B3 | double click → one request, one case; land with 1 photo is accepted (Photo Standard v1) | PASS (local browser + emulators) |  |
| B4 | agent: submit → own-case list in Lister Dashboard → open; other agent sees nothing (UI + direct read refused); add listing → private form | PASS (local browser + emulators) | case own-bda73957c52364548145 |
| B5 | Staff: case visible (merged private record), no approve button; private image in emulator: NOT rendered | OBSERVED (local emulator limit) | Storage requests for Staff: []. The rules need a cross-service Firestore lookup the Storage emulator does not resolve; real Staff Storage access stays PENDING for the real TEST project. |
| B6 | owner: private photo via authenticated blob (no token URL); preview cancel = no change; failed photos need acknowledgement; contact in public text refused in the dialog; confirm publishes | PASS (local browser + emulators) | approvedBy recorded; 2 public photos |
| B7 | pending invisible (UI + direct reads refused); published listing + photos shown and searchable; owner take-down removes page, records, files; old photo links dead | PASS (local browser + emulators) |  |
| O1 | OBSERVATION: first Firestore read of a public page can run before the Firebase SDK scripts executed (page then shows bundled sample data until reload) | OBSERVED | retries needed in this run: 1. Pre-existing page-load race; not caused by this change; to be checked on the real TEST site. |
