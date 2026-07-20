# OPERATION MANUAL — Project Handover System (PHS) Version 1

## 1. Purpose
PHS lets the CEO start a brand-new ChatGPT conversation and have it understand huahin.properties correctly — role, current phase, rules — without re-explaining the project from scratch every time.

## 2. When Should PHS Be Used?
Every time you open a new ChatGPT conversation to continue work on huahin.properties (not needed inside an existing, already-oriented conversation).

## 3. Required Files
- `START HERE.md`
- `Mission Control.dc.html`
- `BLUEPRINT.md`
- `HANDOVER PROMPT.md`

## 4. Preparation Checklist
Before opening a new conversation, verify:
- ☐ You have the latest version of all 4 files (re-download from the project if unsure)
- ☐ `Mission Control.dc.html` reflects the actual current phase/status (check it hasn't gone stale)
- ☐ You have the exact text of `HANDOVER PROMPT.md` ready to paste

## 5. Step-by-Step Instructions
1. Open a new ChatGPT conversation.
2. Attach all 4 required files.
3. Paste the full contents of `HANDOVER PROMPT.md` as your first message.
4. Send, and read the AI's response.
5. Verify the AI's summary matches what you expect (see §6).
6. If correct, give your instruction and begin work.
7. If incorrect, do not just re-explain — see §7 Troubleshooting first.

## 6. Expected AI Behaviour
When PHS is working correctly, the AI will, before anything else:
- Confirm it read the files in order (START HERE → Mission Control → Blueprint)
- Summarize the project correctly in its own words
- State the Current Phase exactly as it appears in Mission Control
- Identify itself as Product Owner (analyze/plan/review — not implement)
- Wait for your instruction instead of starting work

## 7. Troubleshooting
**AI asks questions already answered by the documents**
→ A file may be missing or wasn't actually read. Confirm all 4 files were attached; if so, tell the AI directly: "This is answered in [file] — re-read it before continuing."

**AI ignores Mission Control (states an outdated phase/status)**
→ Check Mission Control itself is current — if stale, that's the real problem (update it first). If Mission Control is current but AI ignored it, tell the AI to re-read Mission Control specifically.

**AI starts implementation immediately**
→ Remind it directly: "Wait — confirm your understanding first per the Handover Prompt rules, do not implement yet."

**Missing file detected**
→ The AI should stop and name the missing file per the rule in `HANDOVER PROMPT.md`. If it doesn't, attach the missing file and restate the rule.

## 8. Best Practices
- Update `Mission Control.dc.html` immediately after any real decision or phase change — it is the only file that should ever go stale, and PHS depends on it being current.
- Don't hand-edit `BLUEPRINT.md` or `Mission Control.dc.html` outside the normal Product Owner → Lead Developer workflow — keeps both documents trustworthy as source of truth.
- Re-run the Handover Test (`HANDOVER TEST PROCEDURE.md`) occasionally, especially after changing any PHS file, to confirm the system still works end-to-end.

## 9. PHS Core Principles
- Keep the system simple.
- Keep responsibilities separated.
- Mission Control is the current state.
- Blueprint is the knowledge base.
- AI must not assume.
- AI must not skip the read order.
