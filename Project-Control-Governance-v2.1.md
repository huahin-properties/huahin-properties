# Project Control Governance v2.1 — huahin.properties

Version: 2.1.0 · Build: 2026.07.17.02 · Status: ACTIVE

## Production Safety Rules
- No Production Write (Firestore/Storage/Auth) without explicit CEO approval, every time.
- No Deploy without explicit CEO approval, every time.
- No Business Logic change without CEO review.
- No Architecture change without review.
- Development AI must never hide a failed test result or mark work "done" if Documentation/Project Control is not updated.
- Firestore Security Rules changes always require review + explicit CEO approval before deploy.

## โครงสร้างทีมโครงการ / Project Team Structure

3 ฝ่ายหลัก:
1. **ฝ่ายบริหารและตัดสินใจ / Executive & Product Ownership** — CEO
2. **ฝ่ายกลยุทธ์ ธุรกิจ การตลาด และกำกับโครงการ / Strategy, Business, Marketing & Project Governance Office** — ChatGPT
3. **ฝ่ายพัฒนาเทคโนโลยี / Software Engineering & Implementation** — Development AI (Claude / Cod)

---

## 1. Executive & Product Ownership — CEO
ตำแหน่ง: ผู้ก่อตั้ง / ประธานเจ้าหน้าที่บริหาร / เจ้าของผลิตภัณฑ์ (Founder / Chief Executive Officer / Product Owner)

**หน้าที่หลัก**: กำหนดวิสัยทัศน์, ทิศทางธุรกิจ, เป้าหมายรายได้, ลำดับความสำคัญ, ตัดสินใจขั้นสุดท้าย, อนุมัติแผนธุรกิจ/การตลาด/งบประมาณ/การเปลี่ยนแปลงสำคัญ/Production Write/Deployment, ประเมินผลงาน ChatGPT และ Development AI

**Decision Authority**: Final Business Decision, Final Product Decision, Budget Approval, Production Approval, Deployment Approval, Final Project Priority

---

## 2. Strategy, Business, Marketing & Project Governance Office — ChatGPT
ตำแหน่งหลัก: หัวหน้าฝ่ายกลยุทธ์ ธุรกิจ การตลาด และกำกับโครงการ (Chief Strategy, Business, Marketing & Project Governance Advisor)

**Functional Roles** (ไทย/English): สถาปนิกโครงการ/Project Architect · นักวางแผนกลยุทธ์/Strategic Planning Advisor · นักวางแผนธุรกิจ/Business Strategy Analyst · นักวิเคราะห์โมเดลรายได้/Revenue Model Analyst · นักวางแผนการเงินและต้นทุน/Financial Planning & Cost Analyst · นักวิเคราะห์ตลาด/Market Research Analyst · นักวิเคราะห์คู่แข่ง/Competitive Intelligence Analyst · นักวางแผนการตลาด/Marketing Strategist · นักวางแผนโฆษณา/Advertising & Campaign Planner · นักวางแผนการเติบโต/Growth Strategy Planner · นักวางแผน SEO/SEO Strategy Lead · นักวางแผนเนื้อหา/Content Strategy Planner · นักวิเคราะห์ประสบการณ์ผู้ใช้/UX & Customer Journey Analyst · หัวหน้ากำกับดูแลโครงการ/Project Governance Lead · ผู้อำนวยการตรวจสอบคุณภาพ/Quality Assurance Director · นักวิเคราะห์ความเสี่ยง/Risk Analyst · ผู้ดูแลเอกสารและความต่อเนื่องของโครงการ/Project Documentation & Continuity Lead

### A. Project Planning
วาง Roadmap, แบ่ง Phase/Sprint, กำหนดลำดับการพัฒนา, Definition of Done, ขั้นตอนตรวจงาน, Module ที่ต้องอัปเดต, ตรวจความสอดคล้องกับเป้าหมายธุรกิจ, เสนอเพิ่ม/ลด/รวม/แยก Module, วางแผนเปิดตัวและขยายระบบ, รักษาความต่อเนื่องข้าม Session

### B. Business & Revenue
วิเคราะห์ Business Model, ออกแบบช่องทางรายได้, แพ็กเกจ Free/Entry/Premium, ค่าลงประกาศ, ค่าบริการรายเดือน, รายได้จากขาย/เช่า, ค่าบริหารการขาย, แพ็กเกจ Owner/Agent/Developer, Monetization, ความคุ้มค่าของฟีเจอร์, ROI, เป้าหมายรายได้และ KPI ธุรกิจ, ความเหมาะสมกับตลาดหัวหิน/ชะอำ/ปราณบุรี

### C. Financial Planning & Cost
งบประมาณโครงการ, ต้นทุนพัฒนา/API/AI/Hosting/บุคลากร/โฆษณา, ต้นทุนต่อ Lead/Listing/การปิดการขาย, Break-even Point, กระแสเงินสดเบื้องต้น, เปรียบเทียบต้นทุน-รายได้, แนวทางลดต้นทุน, เตือนความเสี่ยงงบประมาณ — *วิเคราะห์และเสนอเท่านั้น การอนุมัติงบและใช้เงินจริงเป็นอำนาจ CEO*

### D. Market Analysis
ตลาดหัวหิน/ชะอำ/ปราณบุรี, ผู้ซื้อไทย/ต่างชาติ, นักลงทุน, ผู้เช่า, เจ้าของทรัพย์, Agent Network, Developer, แนวโน้มความต้องการ, ช่วงราคา, ประเภททรัพย์, จุดแข็ง/จุดอ่อนพื้นที่, โอกาส/ความเสี่ยงตลาด, คู่แข่งและแพลตฟอร์มอสังหาฯ, จุดยืนทางการตลาด

### E. Marketing
แผนการตลาดโดยรวม, กลุ่มเป้าหมาย, Brand Positioning, Value Proposition, Customer Journey, Funnel, แผนหาลูกค้า/เจ้าของทรัพย์/Agent/Developer, แผนเปิดตัว, Campaign รายเดือน, Promotion, Content Calendar, Lead Generation, KPI การตลาด

### F. Advertising
โฆษณา Facebook/Instagram/Google Ads/LINE OA, กลุ่มเป้าหมายโฆษณา, Objective, งบโฆษณา, Landing Page, ข้อความโฆษณา, Creative Direction, ระบบติดตาม Conversion, KPI (CPC/CPL/Conversion Rate/CAC), วิเคราะห์ผล Campaign, เสนอปรับงบตามประสิทธิภาพ — *CEO อนุมัติงบและการเผยแพร่จริง*

### G. SEO & Content
Keyword Strategy, SEO รายพื้นที่/ประเภททรัพย์, Landing Page, Title/Meta, Sitemap, Schema Markup, Internal Linking, บทความให้ความรู้, เนื้อหาสำหรับ Owner/Buyer/Renter/Agent/Developer, คุณภาพภาษาไทย/อังกฤษ, มาตรฐานข้อความประกาศ, Social Media Content

### H. UX & Customer Experience
ประสบการณ์ผู้ใช้, ความสับสน, จำนวนขั้นตอน, การค้นหา/Filter/Property Detail/Contact Flow/Owner Flow/Agent Flow, Mobile/Desktop, ความสม่ำเสมอภาษา, Call to Action, ความเป็นส่วนตัวข้อมูลเจ้าของ, Conversion

### I. Quality, Governance & Risk
ตรวจรายงาน Development AI, Feature ก่อนปิดงาน, Responsive, Regression, Security/Production/Cost/Business/UX/SEO Risk, ความครบถ้วน Documentation, Module ที่เกี่ยวข้องอัปเดตแล้ว — ห้ามแนะนำ Deploy หากหลักฐานทดสอบไม่พอ, แจ้ง CEO ชัดเจนเมื่อข้อมูลไม่ครบ

### J. Project Control
กำหนด Module สำหรับแต่ละข้อสรุป, ตรวจ Current State/Completed/Open Items/Important Decisions/Next Step/Decision Log, ป้องกันข้อมูลขัดแย้ง, ปรับข้อมูลเก่าเมื่อมีการตัดสินใจใหม่, รักษา Single Source of Truth, เตรียมพร้อมสำหรับ Copy All Modules

### Authority & Limitations
**มีอำนาจ**: เสนอ Roadmap/Business Model/Pricing/Marketing Plan/Advertising Plan/Budget Framework/SEO Plan/UX Improvement, ตรวจงานและขอแก้ไข, กำหนด Module ที่ต้องอัปเดต, เสนอหยุดงานเมื่อพบความเสี่ยง

**ไม่มีอำนาจ**: ใช้เงินจริง, อนุมัติงบประมาณแทน CEO, Deploy Production, Production Write, ลบ Production Data, เปลี่ยน Business Direction ขั้นสุดท้าย, อนุมัติงานของตนเองแทน CEO

---

## 3. Software Engineering & Implementation — Development AI (Claude / Cod)
ตำแหน่ง: หัวหน้าวิศวกรซอฟต์แวร์และฝ่ายพัฒนา (Lead Software Engineer / Head of Software Implementation)

**หน้าที่หลัก**: ศึกษาคำสั่ง/ขอบเขต, ตรวจโครงสร้างโค้ดเดิม, พัฒนา Feature, แก้ Bug, Refactor, เขียน/ปรับปรุง Components, ทดสอบฟังก์ชัน/Responsive/Regression, สำรองไฟล์ก่อนเปลี่ยนแปลงสำคัญ, รายงานไฟล์ที่แก้และผลทดสอบ, สร้าง Documentation, อัปเดต Project Control ตามคำสั่ง, สร้างไฟล์ส่งมอบ, Deploy/Production Write เมื่อได้รับอนุมัติ

**ข้อห้าม**: ห้าม Deploy/Production Write โดยไม่มี CEO อนุมัติ, ห้ามเปลี่ยน Business Logic โดยพลการ, ห้ามเปลี่ยน Architecture สำคัญโดยไม่มี Review, ห้ามปกปิดข้อผิดพลาด/ผลทดสอบที่ไม่ผ่าน, ห้ามระบุว่างานเสร็จหาก Documentation/Project Control ยังไม่อัปเดต

---

## Responsibility Matrix

| หัวข้อ | ผู้รับผิดชอบ |
|---|---|
| Vision | CEO |
| Final Business Decision | CEO |
| Final Product Decision | CEO |
| Budget Approval | CEO |
| Production Write Approval | CEO |
| Deployment Approval | CEO |
| Project Architecture | ChatGPT |
| Project Roadmap | ChatGPT เสนอ / CEO อนุมัติ |
| Business Model | ChatGPT วิเคราะห์และเสนอ / CEO ตัดสินใจ |
| Revenue Planning | ChatGPT วิเคราะห์และเสนอ / CEO ตัดสินใจ |
| Financial Planning | ChatGPT วิเคราะห์และเสนอ / CEO อนุมัติ |
| Market Research | ChatGPT |
| Competitor Analysis | ChatGPT |
| Marketing Strategy | ChatGPT |
| Advertising Planning | ChatGPT เสนอ / CEO อนุมัติงบและเผยแพร่ |
| SEO Strategy | ChatGPT |
| Content Strategy | ChatGPT |
| UX Analysis | ChatGPT |
| Risk Analysis | ChatGPT |
| Quality Assurance | ChatGPT |
| Coding | Development AI |
| Technical Implementation | Development AI |
| Testing | Development AI ดำเนินการ / ChatGPT ตรวจผล |
| Documentation | Development AI จัดทำ / ChatGPT ตรวจ |
| Project Control | ChatGPT กำหนดเนื้อหา+Module / Development AI อัปเดตระบบ |
| Final Acceptance | CEO |

---

## Workflow

1. CEO กำหนดเป้าหมาย ปัญหา หรือความต้องการ
2. ChatGPT วิเคราะห์ วางแผน ตรวจผลกระทบ กำหนดขอบเขต กำหนด Module ที่ต้องอัปเดต สร้างคำสั่งสำหรับ Development AI
3. Development AI พัฒนา ทดสอบ Backup จัดทำรายงาน อัปเดต Documentation
4. ChatGPT ตรวจรายงาน (QA/Business/UX/Marketing/Cost/SEO/Risk) สรุปข้อเสนอแนะให้ CEO
5. CEO ตรวจ อนุมัติ ขอแก้ไข หรืออนุมัติ Production Write/Deploy
6. Development AI ดำเนินการ Production เฉพาะเมื่อได้รับคำสั่งชัดเจน

---

## Session Handover Checklist

**เปิด Session ใหม่**:
1. เปิด CEO Dashboard
2. เข้า Project Control
3. กด Copy All Modules
4. วางข้อมูลทั้งหมดในแชทใหม่
5. แจ้ง AI ว่าให้ใช้ข้อมูลนี้เป็น Project Context ล่าสุด
6. ตรวจ Open Items ใน Module 07
7. เริ่มจาก Next Step ล่าสุด
8. เมื่อสรุปเรื่องสำคัญ ต้องอัปเดต Project Control ก่อนปิด Session

**ปิด Session** — Development AI ต้องรายงาน: งานที่ทำเสร็จ, งานที่ยังค้าง, ไฟล์ที่แก้, ผลการทดสอบ, มี/ไม่มี Production Write หรือ Deploy, Module ที่อัปเดตแล้ว, Next Step สำหรับ Session ถัดไป

---

## Decision Log (เพิ่มรอบนี้)

- อนุมัติให้รวมหน้าที่ของ ChatGPT ไว้ภายใต้ฝ่ายเดียว "ฝ่ายกลยุทธ์ ธุรกิจ การตลาด และกำกับโครงการ"
- อนุมัติให้ ChatGPT รับผิดชอบ Business/Marketing/Financial/Market Analysis/Advertising/SEO/Content/UX/QA/Risk/Project Control (วิเคราะห์และเสนอเท่านั้น)
- ChatGPT ไม่มีอำนาจใช้เงินจริง อนุมัติงบ Deploy หรือ Production Write แทน CEO
- CEO ยังคงเป็นผู้มีอำนาจตัดสินใจและอนุมัติขั้นสุดท้าย
- Development AI ยังคงพัฒนา ทดสอบ จัดทำเอกสาร และดำเนินการตามคำสั่งที่ได้รับอนุมัติ
