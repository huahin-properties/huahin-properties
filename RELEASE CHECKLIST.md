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
- **Version**: Mission 01 — QA & Review Standard Framework v1.2
- **Release Date**: 22 กรกฎาคม 2569
- **Released By**: Product Owner (Final Authorization) / CEO (execution order)
- **Notes**: 12-Step Framework/Readiness Formula/Evidence Matrix/Approval Workflow confirmed LOCKED, unmodified. Mission Library, Mission Archive, Mission Template created and cross-linked with Mission Control/Launch Readiness/CEO Guide. BLUEPRINT.md §24.9 synced to v1.2. All updated files re-verified byte-identical between source and export-for-github/. GitHub upload remains a manual owner action per this project's deployment workflow (no automated GitHub write access in this environment).
