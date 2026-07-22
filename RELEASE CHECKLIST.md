# RELEASE CHECKLIST — huahin.properties

Use this checklist immediately before every GitHub upload. Reusable for every future release — do not hard-code version-specific content into it.

## 1. Documentation Checklist
- ☐ `BLUEPRINT.md` — up to date, no unresolved conflicts
- ☐ `Mission Control.dc.html` — Current Phase/Status reflect reality
- ☐ `START HERE.md` — still accurate (role, read order, source-of-truth rule)
- ☐ `HANDOVER PROMPT.md` — still matches current file set and rules
- ☐ `HANDOVER TEST PROCEDURE.md` — still matches current Handover Prompt behavior
- ☐ `OPERATION MANUAL.md` — still matches current PHS files/behavior

## 2. Export Checklist
Verify `export-for-github/` contains the latest version of every file above:
- ☐ `export-for-github/BLUEPRINT.md`
- ☐ `export-for-github/Mission Control.dc.html`
- ☐ `export-for-github/START HERE.md`
- ☐ `export-for-github/HANDOVER PROMPT.md`
- ☐ `export-for-github/HANDOVER TEST PROCEDURE.md`
- ☐ `export-for-github/OPERATION MANUAL.md`
- ☐ Any other changed application files for this release are also present in `export-for-github/`

## 3. Git Repository Checklist
- ☐ Repository contains the latest version of every required file (compare against export folder)
- ☐ No obsolete/superseded files remain in the repository (e.g. old drafts, deprecated scripts)
- ☐ File names match exactly (case, spacing) between export folder and repository

## 4. Release Readiness
- ☐ Documentation complete
- ☐ Export complete
- ☐ Repository ready
- ☐ Product Owner Approved
- ☐ CEO Approved

## 5. GitHub Upload
1. Commit changes (via GitHub web UI: Add file → Upload files, per this project's manual workflow)
2. Push to GitHub (commit directly through the web UI upload)
3. Verify uploaded files — open each changed file on GitHub and confirm content matches the exported version
4. Confirm repository is up to date — no pending changes left un-uploaded

## 6. Completion Record
- **Version**: Mission 09 — Firebase Infrastructure v1.0
- **Release Date**: 22 กรกฎาคม 2569
- **Released By**: Product Owner (verified Steps 8/9/11 via GitHub Pages + Firebase Console)
- **Notes**: 12/12 Steps Complete. Firestore Rules verified production deny-by-default from source. Hosting/SSL, Monitoring/Analytics, and External Verification confirmed directly by Product Owner. No blocking issues. Post-launch Backlog items (Analytics Events, Monitoring Alerts, Performance Optimization) are non-blocking and carried forward.
- **Notes**: Mission Status correctly remains IN PROGRESS per Completion Rule (Steps 9-10 require owner Google account + production URL, marked READY FOR VERIFICATION). All internal work now complete: canonical/OG/Twitter Card/JSON-LD across 9 public pages, robots.txt Disallow + noindex across 33 internal pages, favicon consistency, full Technical SEO checklist PASS, Multilingual SEO documentation. No Official Completion Notice or Completion History entry created — reserved for after Step 9/10 pass.
