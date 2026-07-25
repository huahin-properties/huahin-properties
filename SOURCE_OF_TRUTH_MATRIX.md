# SOURCE_OF_TRUTH_MATRIX.md — huahin.properties

| เรื่อง | Source of Truth | ไฟล์รอง / ขยายความ |
|---|---|---|
| Current Status / Current Phase | `Mission Control.dc.html` | — |
| Technical status ("มีอะไรอยู่แล้วตอนนี้") | `CLAUDE.md` | `Mission Control.dc.html` |
| Architecture / Business Reasoning ("ทำไม") | `BLUEPRINT.md` | `CUSTOMER SPACE PLATFORM RULES.md`, `CUSTOMER SPACE REVISION 1.md` |
| Workflow / Process | `CEO GUIDE.md` (§10 One Page Workflow) | `PROJECT_OPERATING_STANDARD.md` (ใหม่, รวมศูนย์กฎ) |
| Release Process | `RELEASE CHECKLIST.md` | `CEO GUIDE.md` §7–10 |
| History (สิ่งที่ปิดไปแล้ว) | `PROJECT_HISTORY.md` | `PROJECT COMPLETION.md`, `PROJECT-COMPLETION.md`, `RELEASE-NOTES-*.md` |
| Known Issues | `KNOWN_ISSUES.md` (ใหม่ — ยังไม่มี, รวมจาก entry ต่างๆ ใน PROJECT_HISTORY.md) | — |
| Internal Pricing / Margin | `Internal Pricing Model - CONFIDENTIAL.md` | ห้ามอยู่ใน Blueprint หรือ UI สาธารณะ |
| Security Rules จริง | `firestore.rules`, `storage.rules`, `firebase.json` | `BLUEPRINT.md` §5 (คำอธิบายระดับสูง) |
| Onboarding ผู้ช่วยใหม่ | `START HERE.md` | `CEO_ASSISTANT_START_HERE.md` (ใหม่, /docs/ceo-handoff/) |

**กติกาเมื่อขัดแย้งกัน**: ใช้คอลัมน์ "Source of Truth" ของหมวดนั้นๆ ชนะเสมอ — ถ้าไฟล์คนละหมวดขัดกัน (เช่น Mission Control บอกอย่าง Blueprint บอกอีกอย่าง) ให้ดูว่าเรื่องนั้นอยู่หมวดไหนในตารางนี้ ไม่ใช่ยึด Mission Control เป็นเจ้าเดียวทุกเรื่อง
