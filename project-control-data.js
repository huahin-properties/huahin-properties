// Central data source for CEO Dashboard's "Project Control Center" tab.
// Edit MODULES here — the page renders straight from this array, nothing
// module-related is hardcoded in the .dc.html template. Add/remove/reorder
// by editing this array; each module's fields map directly to the UI.
export const PROJECT_HEADER = {
  name: "huahin.properties",
  title: "PROJECT CONTROL CENTER",
  version: "2.3.0",
  build: "2026.07.18.02",
  status: "ACTIVE",
  phase: "Foundation",
  currentSprint: "Listing Approvals Responsive Testing",
  sourceOfTruth: "CEO Dashboard",
};

export const AI_SESSION_METADATA = {
  projectName: "huahin.properties",
  primaryLanguage: "Thai",
  secondaryLanguage: "English",
  timezone: "Asia/Bangkok (UTC+7)",
  currentEnvironment: "Production (Firebase Hosting + Firestore + Cloud Functions)",
  deploymentTarget: "Firebase Hosting / GitHub Pages",
  architecture: "Firebase (Firestore, Firebase Storage), GitHub Pages",
  projectOwner: "CEO",
  architectureOwner: "ChatGPT",
  implementationOwner: "Development AI",
  singleSourceOfTruth: "Project Control Center",
};

export const SYSTEM_ARCHITECTURE = [
  "Frontend: HTML (.dc.html), JavaScript, Shared Components",
  "Backend: Firebase",
  "Database: Firestore",
  "Storage: Firebase Storage",
  "Authentication: Firebase Authentication",
  "Hosting: Firebase Hosting",
  "Repository: GitHub",
  "AI Development: ChatGPT, Claude / Cod",
  "Deployment Flow: GitHub → Firebase Hosting",
];

export const TECH_STACK = [
  "Language: JavaScript",
  "Frontend: HTML, CSS",
  "Backend: Firebase",
  "Database: Firestore",
  "Storage: Firebase Storage",
  "Authentication: Firebase Authentication",
  "Hosting: Firebase Hosting",
  "Version Control: GitHub",
  "AI: ChatGPT, Claude / Cod",
];

export const CRITICAL_FILES = [
  "CEO Dashboard.dc.html — Main CEO Dashboard",
  "Admin Dashboard.dc.html — Admin System",
  "project-control-data.js — Project Control data source",
  "firebase-client.js — Firebase interface",
  "firestore.rules — Database Security",
  "storage.rules — Storage Security",
  "functions/ — Cloud Functions",
  "Blueprint.dc.html — Project Blueprint",
];

export const CODING_RULES = [
  "Never overwrite Firestore documents using setDoc() without merge when updating existing documents.",
  "Use createDoc() only for new documents.",
  "Use updateDocFields() for partial updates.",
  "Use replaceDoc() only when full replacement is intentional.",
  "Backup before high-risk changes.",
  "Every completed task must include a report.",
  "Update Project Control after important decisions.",
  "No Production Write without explicit CEO approval.",
  "No Deploy without explicit CEO approval.",
  "Never hide failed tests.",
  "Never mark work complete without documentation.",
];

export const PROJECT_GLOSSARY = [
  "CEO — Project Owner",
  "Project Control — Single Source of Truth",
  "Command Center — Project Status Dashboard",
  "AI Session Pack — Context for new AI Sessions",
  "Owner — Property Owner",
  "Lister — Property Manager",
  "Trial — Free Package",
  "Demo Listing — Internal Sample Listing",
  "Production Write — Write to Production Database",
  "Core Feature Audit — Complete Feature Verification",
  "Responsive Testing — Desktop / Tablet / Mobile Testing",
];

export const PERMANENT_DECISIONS = [
  "CEO Dashboard remains the main dashboard.",
  "Project Control is the Single Source of Truth.",
  "ChatGPT is responsible for: Strategy, Business, Marketing, SEO, UX, QA, Risk, Project Governance, Project Control.",
  "Development AI is responsible for: Implementation, Coding, Testing, Documentation.",
  "CEO has final authority for: Budget, Production Write, Deployment, Business Direction.",
  "These decisions are permanent unless explicitly changed.",
];

export const CHANGELOG_V2_1 = [
  "[v2.3.0] QA Sprint Completion (18/07/2569) — Listing Approvals Responsive+Functional test PASS, Firestore Index Review Production Ready, AI Quick Add POI Verification conditional PASS (1 risk found: TH fullDesc non-deterministic), Firebase QA Cleanup plan drafted (no write), Demo Listing audit (28 found, not 22 — pending CEO confirmation), HH-70724 Storage verification (Firestore clean, Storage unconfirmed), Production Readiness estimated 85%",
  "[v2.2.0] Added System Architecture, Tech Stack, Critical Files, Coding Rules, Project Glossary, Permanent Decisions sections",
  "Project Control Center completed",
  "Command Center completed",
  "Copy Module completed",
  "Copy All completed",
  "AI Session Pack completed",
  "Module 02 expanded",
  "Module 03 expanded",
  "Module 04 expanded",
  "Module 06 expanded",
  "Module 07 synchronized",
  "Module 08 synchronized",
  "Module 99 replaced",
  "Responsibility Matrix added",
  "Workflow added",
  "Session Handover added",
  "Roles updated",
  "Command Center synchronized",
];

export const MODULES = [
  {
    num: "00", th: "กติกาและวิธีทำงานของโครงการ", en: "Project Rules & Workflow",
    lastUpdated: "17/07/2569",
    currentState: "Chat ใช้สำหรับสนทนา วิเคราะห์ ตรวจงาน และตัดสินใจ\nProject Control เป็นแหล่งเก็บข้อมูลและข้อสรุปหลักของโครงการ\nเมื่อมีข้อสรุปสำคัญ ต้องอัปเดต Module ที่เกี่ยวข้อง\nหนึ่งการตัดสินใจสำคัญ ต้องมีหนึ่งการบันทึก\nข้อมูลเก่าสามารถแก้ ลบ หรือแทนที่ได้ เมื่อมีแนวทางใหม่ที่ดีกว่า",
    completed: "Workflow ตกลงร่วมกัน:\n1. CEO กำหนดทิศทางและอนุมัติ\n2. ChatGPT วางแผน ตรวจงาน และกำหนด Module ที่ต้องอัปเดต\n3. Development AI พัฒนา ทดสอบ และรายงาน\n4. อัปเดต Project Control\n5. CEO ตรวจ\n6. จึง Deploy เมื่อได้รับอนุมัติ",
    openItems: "",
    decisions: "",
    nextStep: "",
  },
  {
    num: "01", th: "ตรวจงานและรายงานการพัฒนา", en: "Development Review & Reports",
    lastUpdated: "17/07/2569",
    currentState: "Core Feature Audit กำลังดำเนินไปทีละโมดูล",
    completed: "Admin Dashboard ตรวจและปิดงานแล้ว\nOwners Management ตรวจและปิดงานแล้ว\nพบ P0 จาก global setDoc overwrite\nเปลี่ยนแนวทาง partial update เป็น merge semantics\nตรวจผลกระทบของ call sites และเพิ่ม helper naming สำหรับ create/update/replace",
    openItems: "Listing Approvals Responsive Testing ยังไม่เสร็จ\nต้องกลับมาตรวจต่อหลัง Project Control พร้อมใช้งาน",
    decisions: "",
    nextStep: "กลับไปทำ Listing Approvals Responsive Testing",
  },
  {
    num: "02", th: "ธุรกิจและรายได้", en: "Business & Revenue",
    lastUpdated: "17/07/2569",
    currentState: "โครงการ huahin.properties เป็นแพลตฟอร์มอสังหาริมทรัพย์สำหรับพื้นที่หัวหิน ชะอำ และปราณบุรี\n\nกลุ่มผู้ใช้งานหลัก:\n- เจ้าของทรัพย์\n- ผู้ซื้อ\n- ผู้เช่า\n- นายหน้าและ Agent Network\n- ทีมงานภายใน\n\nเป้าหมายธุรกิจ:\n- สร้างรายได้ประจำอย่างยั่งยืน\n- ลดจำนวนพนักงานประจำให้อยู่ไม่เกินประมาณ 2 คน\n- ให้ CEO สามารถทำงานออนไลน์และควบคุมระบบจากระยะไกล\n- เป้าหมายรายได้ส่วนบุคคลจากโครงการอย่างน้อย 100,000 บาทต่อเดือน\n\nแนวทางรายได้ที่อยู่ระหว่างการพัฒนา:\n- ค่าลงประกาศ\n- แพ็กเกจโปรโมตทรัพย์\n- ค่าบริการเจ้าของทรัพย์\n- ค่าบริหารการขาย\n- รายได้จากการปิดการขายหรือเช่า\n- แพ็กเกจสำหรับ Agent หรือ Developer\n- บริการเสริมด้านสื่อ โฆษณา และ AI",
    completed: "",
    openItems: "กำหนดแพ็กเกจ Free / Entry / Premium\nกำหนดค่าบริการรายเดือน\nกำหนดส่วนแบ่งรายได้กับ Agent\nกำหนดเงื่อนไขรับฝากขายและสัญญากับเจ้าของ\nประเมินต้นทุน API, AI และการตลาด\nวางแผนรายได้ช่วงเปิดตัว",
    decisions: "",
    nextStep: "หลัง Core Feature Audit เสร็จ ให้กลับมาสรุป Business Model และ Pricing อย่างเป็นทางการ",
  },
  {
    num: "03", th: "ประสบการณ์ผู้ใช้และหน้าตาเว็บไซต์", en: "UX/UI",
    lastUpdated: "17/07/2569",
    currentState: "หน้าและส่วนประกอบหลักที่มีแล้ว:\nHome, Search Results, Property Details, Sell, About, Contact, Admin Login, Admin Dashboard, Owners, Property Map, AI Quick Add, Site Content\n\nShared Components:\nPropertyCard, SearchFilters, LanguageSwitcher, ContactRail\n\nฟีเจอร์ UX หลัก:\nระบบหลายภาษา 8 ภาษา, แสดงทรัพย์พร้อมหลายรูป, แผนที่และตำแหน่ง, Contact Rail, ฟิลเตอร์ค้นหา, หน้า Detail, Dashboard สำหรับ Admin, Owners Management\n\nหลักการ UX:\n- ใช้งานง่ายทั้งมือถือและ Desktop\n- ลูกค้าต้องค้นหาทรัพย์ได้รวดเร็ว\n- ข้อมูลเจ้าของและข้อมูลภายในต้องไม่เปิดเผยต่อสาธารณะ\n- ลดจำนวนขั้นตอนที่ทำให้ลูกค้าสับสน\n- รองรับผู้ใช้ทั้งไทยและต่างชาติ",
    completed: "",
    openItems: "Listing Approvals Responsive Testing\nตรวจความสม่ำเสมอของ Mobile UI\nตรวจ Search และ Filter\nตรวจ Property Detail\nตรวจ Contact Flow\nตรวจความชัดเจนของข้อความหลายภาษา",
    decisions: "",
    nextStep: "กลับไปทดสอบ Listing Approvals Responsive หลัง Project Control เสร็จ",
  },
  {
    num: "04", th: "การตลาดและ SEO", en: "Marketing & SEO",
    lastUpdated: "17/07/2569",
    currentState: "พื้นที่เป้าหมาย: Hua Hin, Cha-Am, Pranburi\n\nกลุ่มเป้าหมาย: ผู้ซื้อชาวไทย, ผู้ซื้อต่างชาติ, นักลงทุน, ผู้เช่า, เจ้าของทรัพย์, Agent Network, Developer\n\nช่องทางที่วางไว้: เว็บไซต์ huahin.properties, Facebook, Instagram, LINE OA, Google Search, แผนที่, คอนเทนต์ภาษาไทยและอังกฤษ, รองรับหลายภาษาในอนาคต\n\nแนวทางเนื้อหา: SEO รายพื้นที่, SEO ตามประเภททรัพย์, หน้าทรัพย์รายรายการ, บทความให้ความรู้, คอนเทนต์สำหรับเจ้าของ, คอนเทนต์สำหรับผู้ซื้อและผู้เช่า, โปรโมตทรัพย์ผ่าน Social Media",
    completed: "",
    openItems: "Keyword Plan\nLanding Pages รายพื้นที่\nSEO Metadata\nSitemap\nSchema Markup\nGoogle Business Profile\nแผนเปิดตัวเว็บไซต์\nแผน Social Posting\nระบบติดตาม Lead\nงบโฆษณาเริ่มต้น",
    decisions: "",
    nextStep: "เริ่ม SEO Audit หลัง Core Feature Audit และก่อน Public Launch",
  },
  {
    num: "05", th: "ปัญหา ความเสี่ยง และความปลอดภัย", en: "Bugs, Risks & Security",
    lastUpdated: "17/07/2569",
    currentState: "P0 data-loss bug แก้แล้ว, รอ cleanup งานทดสอบค้าง",
    completed: "P0: global setDoc overwrite สามารถล้างข้อมูล property document ได้\nมีการแก้ wrapper ให้ partial update ใช้ merge\nมีการตรวจ call sites ที่เสี่ยง",
    openItems: "ตรวจ regression จากการเปลี่ยน global merge semantics\nQA test leftovers ต้อง Cleanup\nQA Auth accounts ต้อง Cleanup ผ่าน Firebase Console\nReview and test latest firestore.rules — Deployment pending explicit CEO approval",
    decisions: "HH-58538: QA/Test Data — ตัดสินใจให้ลบทั้งหมดแล้ว (property document, propertyPhotos และ Storage files ที่เกี่ยวข้อง) — ยังรอคำสั่ง Production Write โดยตรงจาก CEO ก่อนลบจริง\nHH-70724: Firestore property + propertyPhotos cleanup เสร็จสมบูรณ์แล้ว — เหลือเฉพาะตรวจ Storage orphan files ห้ามลบ Storage โดยไม่มี Production Write approval",
    nextStep: "รอคำสั่ง Production Write เพื่อลบ HH-58538 และตรวจ/ลบ Storage orphan ของ HH-70724",
  },
  {
    num: "06", th: "คลังคำสั่งสำหรับ AI", en: "AI Prompt Library",
    lastUpdated: "17/07/2569",
    currentState: "โมดูลนี้ใช้เก็บเฉพาะ Prompt ที่:\n- ผ่านการใช้งานจริง\n- ตรวจแล้วว่าถูกต้อง\n- สามารถนำกลับมาใช้ซ้ำได้\n- ระบุขอบเขตและข้อห้ามชัดเจน\n\nหมวด Prompt เริ่มต้น: Core Feature Audit, Bug Investigation, Responsive Testing, Firebase Safety, Production Write Approval, CEO Dashboard Update, Project Control Module Update, Deployment Checklist, Regression Test, Property Content, SEO Content, Business Analysis\n\nกฎการเก็บ Prompt:\n- ไม่เก็บ Prompt ที่ยังไม่ผ่านการตรวจ\n- ต้องมีชื่อ Prompt\n- ต้องมีวัตถุประสงค์\n- ต้องมีข้อห้าม\n- ต้องระบุว่าต้องรอ CEO อนุมัติหรือไม่\n- Prompt ที่เสี่ยงต่อ Production ต้องมี Safety Block",
    completed: "",
    openItems: "ย้าย Prompt ที่ผ่านการใช้งานจริงจากห้องเดิมเข้ามา\nแยก Prompt สำหรับ Claude และ Cod AI\nเพิ่ม Version และ Last Tested\nเพิ่มปุ่ม Copy Prompt ในอนาคต",
    decisions: "",
    nextStep: "เริ่มจากเก็บ Prompt: 1) Project Control Update 2) Core Feature Audit 3) Production Safety 4) Responsive Test",
  },
  {
    num: "07", th: "แผนงานและ Sprint ปัจจุบัน", en: "Roadmap & Current Sprint",
    lastUpdated: "17/07/2569",
    currentState: "Current Priority: รอ CEO อนุมัติ QA Cleanup (Production Write) + ยืนยันจำนวน Demo Listings ที่ถูกต้อง (พบจริง 28 รายการ ไม่ใช่ 22)\nQA Sprint (18/07/2569) เสร็จแล้ว 6/6 งาน: Listing Approvals Responsive Testing (PASS), Firestore Index Review (Production Ready), AI Quick Add POI Verification (conditional PASS), Firebase QA Cleanup Planning, Demo Listing Verification, HH-70724 Storage Verification (Firestore-side clean)\nProduction Readiness: 85%\n\nเว็บไซต์มีโครงสร้างหลักแล้ว: Home, Search Results, Property Details, Sell, About, Contact, Admin Login, Admin Dashboard, Owners, Property Map, AI Quick Add, Site Content, ระบบ 8 ภาษา, ระบบ Listing, แผนที่, Multi-image, Owners Management\n\nCore Feature Audit: Admin Dashboard — Completed, Owners Management — Completed, Listing Approvals — Responsive+Functional Test PASS",
    completed: "Project Control Center Initial Structure — Completed\nQA Sprint 18/07/2569 — 6/6 งานตรวจเสร็จ (Listing Approvals Responsive, Firestore Index Review, AI Quick Add POI Verification, QA Cleanup Planning, Demo Listing Verification, HH-70724 Storage Verification)",
    openItems: "1. Deploy firestore.rules\n2. QA Cleanup (Production Write)\n3. Storage Verification (HH-70724)\n4. Demo Listing 28 รายการ (กำหนด isDemo / Badge)\n5. HH-111 เติม Zone\n6. Public Launch Preparation",
    decisions: "", nextStep: "",
  },
  {
    num: "08", th: "บันทึกการตัดสินใจ", en: "Decision Log",
    lastUpdated: "17/07/2569",
    currentState: "",
    completed: "",
    openItems: "",
    decisions: "อนุมัติให้สร้าง Project Control Center ภายใน CEO Dashboard\nอนุมัติ Module เริ่มต้น 00–08 และ 99\nอนุมัติระบบ Copy Module และ Copy All Modules\nอนุมัติให้ใช้ Project Control เป็นแหล่งข้อมูลหลักของโครงการ\nอนุมัติให้ค่อยๆ เติม แก้ ลบ และปรับข้อมูลภายหลังได้\nอนุมัติให้ ChatGPT เสนอการเพิ่ม ลด รวม หรือเปลี่ยน Module ตามความจำเป็น โดยแจ้ง CEO ก่อนการเปลี่ยนโครงสร้างสำคัญ\nHH-58538 เป็น QA/Test Data และต้องลบ ไม่ใช่ซ่อนหรือกู้คืน\nงาน Listing Approvals ถูกพักชั่วคราว เพื่อสร้าง Project Control ก่อน\nCEO Dashboard จะยังคงชื่อเดิม\nProject Control เป็นแท็บหนึ่งภายใน CEO Dashboard และเปิดเป็นหน้าใหม่ภายใน Dashboard\nข้อมูล Module ต้องสามารถ Copy แยกและ Copy ทั้งหมดได้\nชื่อ Module ต้องแสดงทั้งภาษาไทยและอังกฤษ\nModule สามารถเพิ่ม ลด รวม หรือเปลี่ยนได้ในอนาคต ไม่จำเป็นต้องรอให้เนื้อหาสมบูรณ์ก่อนเริ่มใช้งาน\nProject Control ต้องเน้นความเรียบง่ายและรองรับ Ctrl+F\nChat ใหม่ควรเริ่มต้นจากข้อมูล Copy All Modules\nข้อมูล Project Control ต้องเน้นสถานะล่าสุด ไม่คัดลอกบทสนทนาทุกประโยค\nอนุมัติให้แบ่งทีมโครงการเป็น 3 ฝ่ายอย่างเป็นทางการ\nอนุมัติให้ ChatGPT อยู่ภายใต้ฝ่ายเดียวชื่อ \"ฝ่ายกลยุทธ์ ธุรกิจ การตลาด และกำกับโครงการ / Strategy, Business, Marketing & Project Governance Office\"\nอนุมัติให้ ChatGPT รับผิดชอบ Project Planning, Business, Revenue, Financial Planning, Cost Analysis, Market Research, Competitor Analysis, Marketing, Advertising, SEO, Content, UX, QA, Risk และ Project Control\nChatGPT มีหน้าที่วิเคราะห์ วางแผน ตรวจสอบ และเสนอคำแนะนำ แต่ไม่มีอำนาจใช้เงินจริง อนุมัติงบ Deploy หรือ Production Write แทน CEO\nCEO เป็นผู้มีอำนาจตัดสินใจและอนุมัติขั้นสุดท้าย\nDevelopment AI เป็นฝ่ายพัฒนา ทดสอบ จัดทำเอกสาร และดำเนินการตามคำสั่งที่ได้รับอนุมัติ",
    nextStep: "",
  },
  {
    num: "99", th: "คู่มือการทำงานร่วมกับ AI", en: "AI Collaboration Guide",
    lastUpdated: "17/07/2569",
    currentState: "โครงการ huahin.properties ใช้โครงสร้างทีมหลัก 3 ฝ่าย: 1) ฝ่ายบริหารและตัดสินใจ / Executive & Product Ownership  2) ฝ่ายกลยุทธ์ ธุรกิจ การตลาด และกำกับโครงการ / Strategy, Business, Marketing & Project Governance Office  3) ฝ่ายพัฒนาเทคโนโลยี / Software Engineering & Implementation",
    completed: "1. ฝ่ายบริหารและตัดสินใจ / EXECUTIVE & PRODUCT OWNERSHIP\nผู้รับผิดชอบ: CEO\nตำแหน่งภาษาไทย: ผู้ก่อตั้ง, ประธานเจ้าหน้าที่บริหาร, เจ้าของผลิตภัณฑ์\nOfficial English Titles: Founder, Chief Executive Officer, Product Owner\nหน้าที่หลัก: กำหนดวิสัยทัศน์ของโครงการ, กำหนดทิศทางธุรกิจ, กำหนดเป้าหมายรายได้, กำหนดลำดับความสำคัญ, ตัดสินใจขั้นสุดท้าย, อนุมัติ Business Model, อนุมัติ Pricing, อนุมัติแผนการตลาด, อนุมัติงบประมาณ, อนุมัติการโฆษณา, อนุมัติการเปลี่ยนแปลงสำคัญ, อนุมัติ Production Write, อนุมัติ Deployment, ตรวจและประเมินผลงานของทีม\nอำนาจการตัดสินใจ (Decision Authority): Final Business Decision, Final Product Decision, Final Budget Approval, Final Priority Approval, Production Write Approval, Deployment Approval, Final Acceptance\n\n2. ฝ่ายกลยุทธ์ ธุรกิจ การตลาด และกำกับโครงการ / STRATEGY, BUSINESS, MARKETING & PROJECT GOVERNANCE OFFICE\nผู้รับผิดชอบ: ChatGPT\nตำแหน่งหลักภาษาไทย: หัวหน้าฝ่ายกลยุทธ์ ธุรกิจ การตลาด และกำกับโครงการ\nOfficial Main English Title: Chief Strategy, Business, Marketing & Project Governance Advisor\nตำแหน่งตามหน้าที่ (ไทย): สถาปนิกโครงการ, นักวางแผนกลยุทธ์, นักวางแผนธุรกิจ, นักวิเคราะห์โมเดลรายได้, นักวางแผนการเงินและต้นทุน, นักวิเคราะห์ตลาด, นักวิเคราะห์คู่แข่ง, นักวางแผนการตลาด, นักวางแผนโฆษณา, นักวางแผนการเติบโต, นักวางแผน SEO, นักวางแผนเนื้อหา, นักวิเคราะห์ UX และ Customer Journey, หัวหน้ากำกับดูแลโครงการ, ผู้อำนวยการประกันคุณภาพ, นักวิเคราะห์ความเสี่ยง, ผู้ดูแล Project Control, ผู้ดูแล Documentation และความต่อเนื่องของโครงการ\nEnglish Functional Titles: Project Architect, Strategic Planning Advisor, Business Strategy Analyst, Revenue Model Analyst, Financial Planning & Cost Analyst, Market Research Analyst, Competitive Intelligence Analyst, Marketing Strategist, Advertising & Campaign Planner, Growth Strategy Planner, SEO Strategy Lead, Content Strategy Planner, UX & Customer Journey Analyst, Project Governance Lead, Quality Assurance Director, Risk Analyst, Project Control Lead, Project Documentation & Continuity Lead\n\nA. การวางแผนโครงการ / PROJECT PLANNING: วาง Roadmap, แบ่ง Phase และ Sprint, กำหนดลำดับงาน, กำหนด Scope, กำหนด Definition of Done, กำหนดขั้นตอนตรวจงาน, กำหนด Module ที่ต้องอัปเดต, วิเคราะห์ผลกระทบก่อนเริ่มพัฒนา, ตรวจความสอดคล้องกับเป้าหมายธุรกิจ, เสนอเพิ่ม/ลด/รวม/แยก Module, เตรียมบริบทสำหรับ AI Session ใหม่, รักษาความต่อเนื่องของโครงการ\n\nB. ธุรกิจและรายได้ / BUSINESS & REVENUE: วิเคราะห์ Business Model, ออกแบบช่องทางรายได้, วาง Free/Entry/Premium และแพ็กเกจอื่น, วิเคราะห์ค่าลงประกาศ, ค่าบริการรายเดือน, รายได้จากขาย/เช่า, ค่าบริหารการขาย, แพ็กเกจ Owner/Agent/Developer, Monetization Strategy, ความคุ้มค่าของ Feature, Return on Investment เบื้องต้น, เป้าหมายรายได้และ KPI ธุรกิจ, ความเหมาะสมกับตลาดหัวหิน ชะอำ และปราณบุรี\n\nC. การเงินและต้นทุน / FINANCIAL PLANNING & COST: กรอบงบประมาณ, ต้นทุนพัฒนา/API/AI/Hosting/เครื่องมือภายนอก/บุคลากร/โฆษณา, ต้นทุนต่อ Lead/Listing/Conversion/การปิดการขาย, Break-even Point, กระแสเงินสดเบื้องต้น, เปรียบเทียบต้นทุน-รายได้คาดการณ์, แนวทางลดต้นทุน, เตือน CEO เมื่อพบความเสี่ยงงบประมาณ. ข้อจำกัด: ChatGPT วิเคราะห์/วางแผน/เสนอเท่านั้น — CEO อนุมัติงบประมาณและการใช้เงินจริง\n\nD. การวิเคราะห์ตลาดและคู่แข่ง / MARKET & COMPETITOR ANALYSIS: ตลาดหัวหิน/ชะอำ/ปราณบุรี, ผู้ซื้อไทย/ต่างชาติ, นักลงทุน, ผู้เช่า, เจ้าของทรัพย์, Agent Network, Developer, แนวโน้มความต้องการ, ช่วงราคา, ประเภททรัพย์, โอกาสและความเสี่ยง, วิเคราะห์คู่แข่ง, เปรียบเทียบราคา/บริการ/ฟีเจอร์/โมเดลรายได้, เสนอ Market Positioning และ Value Proposition ของ huahin.properties\n\nE. การตลาด / MARKETING: Marketing Strategy, กลุ่มเป้าหมาย, Brand Positioning, Value Proposition, Customer Journey, Marketing Funnel, แผนหาผู้ซื้อ/ผู้เช่า/เจ้าของทรัพย์, แผนสร้าง Agent Network, แผนเข้าถึง Developer, แผนเปิดตัวเว็บไซต์, Campaign รายเดือน, Promotion, Content Calendar, Lead Generation, KPI ทางการตลาด, วิเคราะห์ผลและเสนอปรับปรุง\n\nF. การโฆษณา / ADVERTISING: Facebook Ads, Instagram Ads, Google Ads, LINE OA Campaign, กลุ่มเป้าหมาย, Campaign Objective, งบโฆษณา, Landing Page, ข้อความโฆษณา, Creative Direction, Conversion Tracking, KPI (CPC, CPL, CPA, Conversion Rate), วิเคราะห์ผล Campaign, เสนอหยุด/เพิ่ม/ลดงบ, ป้องกันการใช้งบโดยไม่มีระบบวัดผล. ข้อจำกัด: ChatGPT วางแผน/วิเคราะห์/ตรวจ — CEO อนุมัติงบและการเผยแพร่จริง\n\nG. SEO และเนื้อหา / SEO & CONTENT: Keyword Strategy, SEO รายพื้นที่/ประเภททรัพย์, Landing Pages, Title/Meta Description, Sitemap, Schema Markup, Internal Linking, บทความ, คอนเทนต์ Owner/Buyer/Renter/Agent/Developer, ตรวจภาษาไทยและอังกฤษ, ตรวจเนื้อหาหลายภาษา, มาตรฐานประกาศทรัพย์, Social Media Content, ป้องกันเนื้อหาซ้ำหรือขัดแย้งกัน\n\nH. UX/UI และ Customer Experience: วิเคราะห์ UX, ความสับสนของผู้ใช้, จำนวนขั้นตอน, Search, Filter, Property Detail, Contact Flow, Owner Flow, Agent Flow, Mobile, Desktop, หลายภาษา, Call to Action, Privacy, เสนอปรับปรุง Conversion\n\nI. คุณภาพ ความเสี่ยง และ Governance / QUALITY, RISK & GOVERNANCE: ตรวจรายงาน Development AI, ตรวจ Feature, Responsive, Regression, Security Risk, Production Risk, Cost Risk, Business Risk, Marketing Risk, UX Risk, SEO Risk, Documentation, Project Control, ห้ามแนะนำ Deploy หากหลักฐานไม่เพียงพอ, แจ้ง CEO เมื่อข้อมูลไม่ครบ, เสนอหยุดงานเมื่อพบความเสี่ยงสำคัญ\n\nJ. Project Control: กำหนด Module ที่ต้องอัปเดต, ตรวจ Current State/Completed/Open Items/Important Decisions/Next Step/Decision Log, ป้องกันข้อมูลขัดแย้งกัน, แก้ข้อมูลเก่าเมื่อมีมติใหม่, รักษา Single Source of Truth, เตรียม Copy All Modules, เตรียมข้อมูลสำหรับ AI Session ใหม่\n\nขอบเขตอำนาจ / AUTHORITY: ChatGPT สามารถ เสนอ Roadmap/Business Model/Pricing/Marketing Plan/Advertising Plan/Budget Framework/SEO Plan/UX Improvement, ตรวจงาน, ขอให้แก้ไข, กำหนด Module ที่ต้องอัปเดต, เสนอให้หยุดงานเมื่อพบความเสี่ยง. ChatGPT ไม่สามารถ ใช้เงินจริง, อนุมัติงบแทน CEO, Deploy, Production Write, ลบ Production Data, เปลี่ยน Business Direction ขั้นสุดท้าย, อนุมัติงานของตนเองแทน CEO\n\n3. ฝ่ายพัฒนาเทคโนโลยี / SOFTWARE ENGINEERING & IMPLEMENTATION\nผู้รับผิดชอบ: Development AI — Claude / Cod\nตำแหน่งภาษาไทย: หัวหน้าวิศวกรซอฟต์แวร์, หัวหน้าฝ่ายพัฒนาและนำระบบไปใช้งาน\nOfficial English Titles: Lead Software Engineer, Head of Software Implementation\nหน้าที่หลัก: ตรวจโครงสร้างโค้ด, พัฒนา Feature, แก้ Bug, Refactor, เขียน Components, ทดสอบ Function/Responsive/Regression, Backup ก่อนงานสำคัญ, รายงานไฟล์ที่แก้และผลทดสอบ, สร้าง Documentation, อัปเดต Project Control ตามคำสั่ง, สร้างไฟล์ส่งมอบ, Deploy เมื่อได้รับอนุมัติ, Production Write เมื่อได้รับคำสั่งโดยตรง\nข้อห้าม: ห้าม Deploy โดยไม่มี CEO อนุมัติ, ห้าม Production Write โดยไม่มี CEO อนุมัติ, ห้ามเปลี่ยน Business Logic โดยพลการ, ห้ามเปลี่ยน Architecture สำคัญโดยไม่มี Review, ห้ามปกปิดข้อผิดพลาด, ห้ามปิดงานถ้า Documentation และ Project Control ยังไม่อัปเดต",
    openItems: "STANDARD WORKFLOW: 1) CEO กำหนดเป้าหมายหรือปัญหา. 2) ChatGPT วิเคราะห์/วางแผน/ประเมินผลกระทบ/กำหนด Scope/กำหนด Module/สร้างคำสั่งให้ Development AI. 3) Development AI พัฒนา/ทดสอบ/Backup/รายงาน/อัปเดต Documentation. 4) ChatGPT ตรวจ QA/Business/UX/Marketing/Advertising/Finance/Cost/SEO/Risk แล้วสรุปให้ CEO. 5) CEO ตรวจ/อนุมัติ/ขอแก้ไข/อนุมัติ Production Write หรือ Deploy. 6) Development AI ดำเนินการ Production เฉพาะเมื่อได้รับคำสั่งชัดเจน.",
    decisions: "AUTHORITY & LIMITATIONS — ChatGPT สามารถ: เสนอ Roadmap/Business Model/Pricing/Marketing/Advertising/Budget Framework/SEO/UX Improvement, ตรวจงาน, กำหนด Module, เสนอหยุดงานเมื่อเสี่ยง. ChatGPT ไม่สามารถ: ใช้เงินจริง, อนุมัติงบแทน CEO, Deploy, Production Write, ลบ Production Data, เปลี่ยน Business Direction ขั้นสุดท้าย, อนุมัติงานตนเองแทน CEO.\n\nSESSION HANDOVER CHECKLIST — ก่อนปิด Session Development AI ต้องรายงาน: Completed, Pending, Blocked, Changed Files, Testing Results, Updated Modules, Production Write Status, Deploy Status, Risks, Next Step.",
    nextStep: "RESPONSIBILITY MATRIX — Vision/Final Business/Product Decision/Budget/Production Write/Deployment Approval/Final Acceptance: CEO. Project Architecture/Market Research/Competitor Analysis/Marketing/SEO/Content/UX/Risk/Quality Assurance: ChatGPT. Project Roadmap/Business Model/Revenue/Financial Planning/Advertising: ChatGPT เสนอ / CEO อนุมัติ. Project Control: ChatGPT กำหนด / Dev AI อัปเดต. Coding/Technical Implementation: Development AI. Testing: Dev AI ดำเนินการ / ChatGPT ตรวจ. Documentation: Dev AI จัดทำ / ChatGPT ตรวจ.",
  },
];
