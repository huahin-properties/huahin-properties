# DOCUMENTATION_AUDIT.md — huahin.properties
วันที่จัดทำ: 25 กรกฎาคม 2569 | จัดทำเพื่อรองรับ CEO Handoff Package

## Active Documents (ใช้งานจริง เป็น Source of Truth)
| ไฟล์ | หน้าที่ |
|---|---|
| `START HERE.md` | จุดเริ่มต้นทุก session ใหม่ — บทบาท, ลำดับการอ่าน, กฎพื้นฐาน |
| `Mission Control.dc.html` | สถานะปัจจุบัน (Current Phase/Status/Decision) |
| `BLUEPRINT.md` | เหตุผล/ประวัติการตัดสินใจ, สถาปัตยกรรมธุรกิจ+เทคนิคเต็ม |
| `CLAUDE.md` | สถานะทางเทคนิคปัจจุบันของเว็บ ("ตอนนี้มีอะไรอยู่แล้ว") |
| `CEO GUIDE.md` | Workflow การเปิดห้องใหม่, Daily Close, Release, ปิดโครงการ, DoD |
| `PROJECT_HISTORY.md` | ประวัติถาวร ทุก Feature/Sprint/Phase/Release ที่ปิดแล้ว |
| `RELEASE CHECKLIST.md` | Checklist ก่อน Upload ทุกครั้ง (reusable, ไม่ hardcode เนื้อหาเฉพาะเวอร์ชัน) |
| `HANDOVER PROMPT.md` | ข้อความวางเป็นข้อความแรกตอนเปิดห้องใหม่ |
| `HANDOVER TEST PROCEDURE.md` | วิธีทดสอบว่า Handover Prompt ยังใช้ได้ผลถูกต้อง |
| `OPERATION MANUAL.md` | คู่มือ PHS (Project Handover System) |
| `CUSTOMER SPACE PLATFORM RULES.md` | Business Rule Book ของ Customer Space (ขยายความ Blueprint §25) |
| `CUSTOMER SPACE REVISION 1.md` | Revision 1 ของสถาปัตยกรรม Customer Space (อ้างถึงจาก Blueprint §25) |
| `Internal Pricing Model - CONFIDENTIAL.md` | ราคาต้นทุน/margin ภายใน — ห้ามเปิดเผยลูกค้า |
| `firestore.rules` / `firestore.indexes.json` / `storage.rules` / `firebase.json` | Security & infra config จริงที่ deploy แล้ว |

## Duplicate / Overlapping Documents
| ไฟล์ | สถานะ | เหตุผล |
|---|---|---|
| `PROJECT COMPLETION.md` | **Keep** (คนละโครงการย่อย) | บันทึกปิด "Project Handover System (PHS) v1.0" — 20 ก.ค. 2569 |
| `PROJECT-COMPLETION.md` | **Keep** (คนละโครงการย่อย) | บันทึกปิด "Knowledge & Handover Center v1" — 21 ก.ค. 2569 — **ไม่ใช่ไฟล์ซ้ำ** ทั้งสองเป็น Completion Record ของ sub-project คนละตัว ชื่อใกล้กันเพราะสร้างต่อเนื่องกันคนละวัน ควร**เปลี่ยนชื่อให้ชัดเจนกว่านี้ในอนาคต** (เช่น `PROJECT-COMPLETION-PHS-v1.md`, `PROJECT-COMPLETION-KnowledgeCenter-v1.md`) แต่ไม่แนะนำให้ลบ/รวม เพราะเป็นประวัติ |
| `Project-Control-Governance-v2.md` / `v2.1.md` / `v2.2.md` | **Archive** ยกเว้น v2.2 (Active) | เอกสารรุ่นต่อรุ่น ให้เก็บ v2.2 เป็นปัจจุบัน ที่เหลือเป็นประวัติเวอร์ชัน |
| `Project-Control-Changelog-v2.1.md` / `v2.2.md` | **Keep ทั้งคู่** | Changelog สะสม ไม่ใช่ไฟล์ซ้ำ |
| `AI-Session-Pack-v2.1.md` / `v2.2.md` | **Archive v2.1, Keep v2.2** | v2.2 เป็นรุ่นล่าสุด |
| `RELEASE-NOTES-Step6/7/8/9.md`, `RELEASE-NOTES-RC1-CEOGuide.md`, `RELEASE-NOTES-KNOWLEDGE-SYNC-RC1.md` | **Keep ทั้งหมด** | บันทึกรายรุ่น เป็นประวัติ ไม่ใช่ Source of Truth ปัจจุบัน |
| `QA-CHECKLIST-KNOWLEDGE-SYNC-RC1.md`, `ROLLBACK-GUIDE-KNOWLEDGE-SYNC-RC1.md`, `FILE-MANIFEST-KNOWLEDGE-SYNC-RC1.md` | **Archive** | ผูกกับ Release Candidate เฉพาะรุ่น (RC1) ที่ปิดไปแล้ว |

## Deprecated / Snapshot Folders (ไม่ใช้เป็น Source of Truth อีกต่อไป)
โฟลเดอร์ export/snapshot เก่าเหล่านี้เป็น**ภาพนิ่ง ณ เวลาที่ Upload ไปแล้ว** ไม่อัปเดตอีก ห้ามใช้อ้างอิงสถานะปัจจุบัน:
- `export-for-github/` — โฟลเดอร์ staging สำหรับ Upload รอบล่าสุด (จะถูกเขียนทับทุกรอบ ไม่ใช่ archive)
- `export-phase2-mission1/`, `export-phase2-mission1-final/`
- `huahin-properties-PHS-V1-CLOSED-FINAL-2026-07-20/`
- `huahin-properties-PHS-V1-COMPLETE-SNAPSHOT-FINAL-2026-07-20/`
- `huahin-properties-PHS-Version-1-FINAL-GitHub-Upload/`
- `release-package/`, `sprint-closure/`, `Step7-DMC-Release-Package/`
- `huahin-properties-release-review.zip`

**คำแนะนำ**: ย้ายทั้งหมดนี้ไปเก็บใน `/archive/snapshots/` (หรือลบออกจาก root หลังยืนยันว่าไม่มีไฟล์ใดที่ยังไม่ได้ backup ที่อื่น) เพื่อไม่ให้ผู้ช่วยใหม่สับสนว่าอันไหนคือปัจจุบัน — **ยังไม่ลบในรอบนี้** ตามกฎ "ห้ามลบเอกสารเก่าโดยไม่มี Backup/Archive"

## Missing Documents (ยังไม่มี ควรสร้าง)
- `PROJECT_OPERATING_STANDARD.md` — กฎ Workflow กลาง (ตอนนี้กฎกระจายอยู่ใน CEO GUIDE.md + START HERE.md + BLUEPRINT.md)
- `KNOWN_ISSUES.md` — ยังไม่มีไฟล์รวมศูนย์ (ตอนนี้ known issues กระจายอยู่ท้าย entry ต่างๆ ใน PROJECT_HISTORY.md)
- `/docs/ceo-handoff/` ทั้งชุด (ตามที่ร้องขอ)
- `DOCUMENT_INDEX.md`

## Recommended Structure (สรุป)
- **ไม่ย้าย/ลบไฟล์ที่ระบุ "Keep"** — โครงสร้างปัจจุบันใช้งานได้ เพียงต้องมี Index มาช่วยนำทาง
- **สร้างใหม่**: PROJECT_OPERATING_STANDARD.md, KNOWN_ISSUES.md, DOCUMENT_INDEX.md, ชุด `/docs/ceo-handoff/`
- **Archive ภายหลัง** (ไม่ใช่รอบนี้): โฟลเดอร์ snapshot เก่า 8 โฟลเดอร์ข้างต้น + ไฟล์ RC1-เฉพาะรุ่นที่ปิดแล้ว
