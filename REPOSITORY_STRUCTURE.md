---
Title: Repository Structure
Purpose: อธิบายว่าโฟลเดอร์/กลุ่มไฟล์ใน Repository ใช้ทำอะไร เพื่อให้คนใหม่หาเอกสารเจอทันที
Status: Active
Owner: Product Owner / CEO Assistant
Source of Truth: ไฟล์นี้ (structure overview เท่านั้น ไม่ใช่เนื้อหา)
Last Updated: 25 กรกฎาคม 2569
Related Documents: docs/ceo-handoff/DOCUMENT_INDEX.md, FILE_MAPPING.md
---

# Repository Structure

```
/ (root)
├── docs/
│   └── ceo-handoff/              ← ชุดเอกสาร Onboarding ผู้ช่วย CEO ใหม่ (เริ่มอ่านที่นี่)
│       ├── CEO_ASSISTANT_START_HERE.md
│       ├── PROJECT_CONTEXT_SNAPSHOT.md
│       ├── CURRENT_PHASE_STATUS.md
│       ├── PROJECT_OPERATING_STANDARD.md
│       ├── CEO_WORKING_GUIDE.md
│       ├── CLAUDE_WORKING_GUIDE.md
│       ├── HANDOFF_CHECKLIST.md
│       ├── NEW_CHAT_BOOTSTRAP_PROMPT.md
│       ├── KNOWN_ISSUES.md
│       └── DOCUMENT_INDEX.md
│
├── HUAHIN_PROPERTIES_MASTER_HANDOFF.md   ← ไฟล์เดียวรวมทุกอย่าง (กรณีส่งได้ไฟล์เดียว)
├── DOCUMENTATION_AUDIT.md                ← ผลตรวจสอบโครงสร้างเอกสาร (25 ก.ค. 2569)
├── DOCUMENTATION_VALIDATION_REPORT.md    ← ผล validation รอบสุดท้ายก่อน Upload
├── FILE_MAPPING.md                       ← ไฟล์เดิม → สถานะ → action (keep/archive)
├── SOURCE_OF_TRUTH_MATRIX.md             ← เรื่องไหนเชื่อไฟล์ไหน
├── REPOSITORY_STRUCTURE.md               ← ไฟล์นี้
│
├── Mission/                              (แนวคิด — ไฟล์จริงอยู่ที่ root เป็น .dc.html)
│   Mission Control.dc.html, Mission Library.dc.html, Mission Archive.dc.html,
│   Mission Template.dc.html, Mission 01/07/08/09/11 - *.dc.html
│   → ระบบติดตามงานแบบ Mission-based ของโครงการ
│
├── Documentation (Core — Source of Truth)/  (แนวคิด — ไฟล์จริงอยู่ root)
│   START HERE.md, BLUEPRINT.md, CLAUDE.md, CEO GUIDE.md, PROJECT_HISTORY.md,
│   RELEASE CHECKLIST.md, HANDOVER PROMPT.md, HANDOVER TEST PROCEDURE.md, OPERATION MANUAL.md
│   → เอกสารหลักดั้งเดิมของโครงการ (ยังใช้งานอยู่ ไม่ถูกแทนที่โดย docs/ceo-handoff/)
│
├── Business Rules/  (แนวคิด — ไฟล์จริงอยู่ root)
│   CUSTOMER SPACE PLATFORM RULES.md, CUSTOMER SPACE REVISION 1.md,
│   Internal Pricing Model - CONFIDENTIAL.md (⚠️ ห้ามเผยแพร่)
│
├── Application (.dc.html — หน้าเว็บ/Component จริง)
│   Home.dc.html, Search Results.dc.html, Property Details.dc.html, Admin Dashboard.dc.html,
│   ContactRail.dc.html, PropertyCard.dc.html, ... (ดูรายชื่อเต็มด้วย list_files ที่ root)
│
├── Application Logic (.js)
│   conversation-firestore.js, conversation-store.js, firebase-client.js, data.js,
│   favorites.js, property-adapter.js, property-repositories.js, property-business-logic.js
│
├── Infra Config
│   firebase.json, firestore.rules, firestore.indexes.json, storage.rules, package.json,
│   robots.txt, sitemap.xml
│
├── functions/                             ← Cloud Functions source (deploy แยกจาก static site)
├── tests/                                 ← Emulator security rule tests
├── scripts/                               ← Migration/one-off scripts (เช่น create-admin-identity.js)
│
└── Archive-candidate (Snapshot เก่า — ไม่ใช่ Source of Truth ปัจจุบัน)
    export-for-github/, export-phase2-mission1/, export-phase2-mission1-final/,
    huahin-properties-PHS-V1-CLOSED-FINAL-2026-07-20/,
    huahin-properties-PHS-V1-COMPLETE-SNAPSHOT-FINAL-2026-07-20/,
    huahin-properties-PHS-Version-1-FINAL-GitHub-Upload/,
    release-package/, sprint-closure/, Step7-DMC-Release-Package/,
    huahin-properties-release-review.zip
    → ดูรายละเอียด/เหตุผลใน FILE_MAPPING.md — ยังไม่ย้าย/ลบจริงในรอบนี้
```

## วิธีใช้ไฟล์นี้
- คนใหม่เปิด Repository → เจอไฟล์นี้ (หรือ `docs/ceo-handoff/CEO_ASSISTANT_START_HERE.md`) → รู้ทันทีว่าโฟลเดอร์ไหนมีไว้ทำอะไร
- "Mission/" และ "Documentation (Core)/" และ "Business Rules/" เป็นการจัดกลุ่มเชิงแนวคิดเพื่ออธิบาย — ไฟล์จริงทั้งหมดยังอยู่ที่ root ไม่ได้ย้ายโฟลเดอร์จริง (การย้ายจริงเป็นงานคนละ scope ต้องขออนุมัติแยก)
