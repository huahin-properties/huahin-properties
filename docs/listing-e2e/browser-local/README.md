# BROWSER-LOCAL-01 — real browser, local emulators (synthetic data)

**Evidence class: LOCAL BROWSER + LOCAL EMULATORS.** This is *not* a run on a real TEST project and does not replace one.
Keep the three classes apart when reporting:

| class | what ran | where the proof lives |
|---|---|---|
| unit / emulator tests | Functions + rules logic against emulators, no browser | `npm run test:listing`, `test:chat-live-gate`, … |
| **LOCAL BROWSER + LOCAL EMULATORS (this folder)** | the *built TEST site* in Chromium with the real DC runtime and the pinned Firebase SDK 10.12.2, against Firestore/Auth/Storage emulators and the real Functions code | `npm run test:browser-local`, `RESULTS.md`, `*.png` |
| real TEST project | deployed TEST site + real TEST Firebase project | **not run yet** — owner decides when |

## Run
```
bash tools/browser-local/prepare-vendor.sh      # once: pins the SDK / React / Babel into ./.browser-vendor (git-ignored)
npm run test:browser-local                      # starts the emulators, runs tests/browser-local/scenarios.test.js
```
No production host and no real AI is contacted: every non-loopback request is blocked by a route policy (vendor scripts are served from disk; the
Storage REST host used for private photos is mapped onto the Storage *emulator*). Proxy environment variables are removed for the emulator child process.

## Scenarios (B1–B7, see `RESULTS.md` for the last run)
B1 outsider form · B2 retry + refresh · B3 double click · B4 agent own-case navigation · B5 Staff (no approve button; private image result) ·
B6 Owner preview (cancel, photo-failure acknowledgement, refused contact text, confirm) · B7 pending not public, published photos, search, take-down.
Plus **H8** (`tests/listing/hosting-build.test.js`): navigation / import closure of the built site, with explicit named lists of the dead-by-design admin links.

## Known limits (stay open until the real TEST project)
* **Staff private images — NOT proven here.** `storage.rules` decide Staff/lister access through a cross-service Firestore lookup that the Storage emulator
  cannot resolve (the Owner works because it is a hard-coded uid). Real cross-service Staff access is **pending** on the real TEST project.
* The web `storageBucket` must equal the Functions' default bucket on the real TEST project (the harness uses `<project>.appspot.com` for both).
* Google Maps and web fonts are blocked by the policy (expected; no external traffic).
* O1 (observation): a public page may run its first Firestore read before the helmet-injected SDK scripts have executed → bundled sample data until reload. Pre-existing race; check it on the real TEST site.
* Legacy data migration remains production-only and **BLOCKED**.
