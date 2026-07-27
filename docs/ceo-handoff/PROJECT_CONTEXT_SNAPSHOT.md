---
Title: Project Context Snapshot
Purpose: ภาพรวมโครงการทั้งหมด ณ วันที่จัดทำ — อ่านจบแล้วเข้าใจภาพรวมได้โดยไม่ต้องอ่านแชตเก่า
Status: Active
Owner: Product Owner / CEO Assistant
Source of Truth: อ้างอิงจาก ../../BLUEPRINT.md (Architecture/Vision) + ../../Mission Control.dc.html (Current Status)
Last Updated: 25 กรกฎาคม 2569
Related Documents: CURRENT_PHASE_STATUS.md, ../../BLUEPRINT.md, ../../SOURCE_OF_TRUTH_MATRIX.md
---

# Project Context Snapshot

## Current State

**Project Name**: huahin.properties
**Domain**: https://huahin.properties
**Vision**: จากเว็บลงประกาศอสังหาฯ → "Real Estate Workspace Platform" — Member มี Digital Office (Mini-Site ที่ `huahin.properties/@username`), Customer มี Customer Space ส่วนตัว, AI เป็น Property Assistant (ไม่ใช่ chatbot ทั่วไป)
**Business Model**: (1) ค่าสมาชิกแพ็กเกจรายเดือน (Free Trial / Package 1-3) (2) ระบบ "ให้ทีมช่วยขาย" (assisted sale, ค่าคอมความลับ) (3) Featured Listing + Banner (Stripe) — รายละเอียดเต็ม `../../BLUEPRINT.md` หมวด 1-2
**Target Users**: Buyer, Seller, Agent/Lister (ไม่มีสถานะ "Agent" แยก — ทุกคนคือ "lister"), Project Owner, Admin
**Service Area**: เฉพาะ 3 อำเภอ หัวหิน/ชะอำ/ปราณบุรี — มีระบบตรวจสอบพิกัดก่อนอนุญาตโพสต์

## Current Architecture
- **Frontend**: Design Components (.dc.html) — Home, Search Results, Property Details, Sell, About, Contact, Admin Dashboard, Owners, Property Map, AI Quick Add, Site Content, ฯลฯ
- **Backend**: Firebase (Firestore, Auth, Storage, Cloud Functions), Stripe (subscriptions + featured/banner checkout), Anthropic Claude API (ผ่าน Cloud Function proxy — ไม่มี API key ฝั่ง client)
- **Hosting**: GitHub Pages + custom domain `huahin.properties`, deploy ผ่าน GitHub web UI upload (ไม่ใช่ git CLI ปกติ) — Cloud Functions deploy ผ่าน GitHub Codespace terminal
- **Realtime Chat System**: `conversation-firestore.js` + `ContactRail.dc.html` — Firestore-backed, Firebase Anonymous Auth สำหรับลูกค้า, Cloud Callable Functions (`startConversation`, `sendConversationTurn`)
- **Security**: Firestore Security Rules เป็น role-based + deny-by-default (deploy แล้ว ไม่ใช่ open/test mode)

## Current Features (สรุประดับสูง — รายละเอียดเต็มดู CURRENT_PHASE_STATUS.md)
- **Completed**: 8-language i18n เต็มระบบ, AI chatbot (property Q&A), AI Quick Add (voice+photo+AI draft), Admin Dashboard, Maintenance Gate, Stripe subscriptions+webhook, Property Map, Owners directory
- **In testing / Recently built**: Realtime Firestore conversation system (Customer↔Owner chat ผ่าน Shared Collection Link), Owner identity resolution (sender ID → real name)
- **Prototype only (ยังไม่ implement จริง)**: Workspace Economy, Mini-Site Customiser, Customer Space full architecture, Member Workspace — ทั้งหมดนี้เป็น `.dc.html` prototype แยก ไม่ใช่หน้าที่ deploy ใช้งานจริง

## Current Priorities
ดู `CURRENT_PHASE_STATUS.md` — ล่าสุด: แก้ bug ระบบแชท Realtime (ชื่อผู้ส่งไม่ขึ้น, ข้อความไม่ถึงฝั่ง Owner) และตอนนี้อยู่ระหว่างจัดระเบียบ Documentation/CEO Handoff Package

## Out of Scope (ปัจจุบัน)
- Real payment สำหรับ Add-ons/Workspace Resources (มีแต่ demo pricing)
- Production analytics, real translation API, LINE OA webhook
- Media attachment ในแชท (text only ตาม Customer Space Philosophy)

## Backlog
ดู `../../NEXT-SPRINT.md` และ entries ล่าสุดใน `../../PROJECT_HISTORY.md`

## Last Updated
25 กรกฎาคม 2569 — หากข้อมูลนี้ห่างจากวันที่ปัจจุบันเกิน ~1 สัปดาห์ ให้ตรวจสอบกับ `../../Mission Control.dc.html` ก่อนเชื่อไฟล์นี้ทั้งหมด
