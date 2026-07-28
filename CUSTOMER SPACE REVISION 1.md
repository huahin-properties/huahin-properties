# Customer Space — Revision 1
### Approved Product Architecture (Product Owner Specification)

This document is the official Product Owner specification for the Customer Space platform, consolidating all architecture decisions to date. It supersedes conflicting assumptions in earlier chat/favorites discussions where noted. It refines — does not replace — the architecture already recorded in `CUSTOMER SPACE PLATFORM RULES.md` and BLUEPRINT.md §25.

No backend, Firestore, or implementation work is authorized by this document. Blueprint, Documentation, and Prototype UI only.

---

## 1. Customer Space Philosophy (confirmed, see BLUEPRINT.md §25)
The product is Customer Space, not a chat app. Chat, Property Collections, AI Property Assistant, Member Information, and (future) Shared Documents are components inside it — never marketed or designed as a standalone messaging product.

## 2. Chat Architecture
```
Customer → Private Conversation → Member → Admin
```
- Customers never see other customers (no group threads, no conversation list on the customer side — see Unified Chat Prototype's Shared Link views).
- Members see only their own conversations (Member Inbox).
- Admins see conversations per platform permission (Admin Inbox, role-gated).
- Conversation identity is always explicit in the header: "Chat with Somchai" / "Chat with huahin.properties" / "Chat with Admin Team" — AI has its own distinct visual identity, never blended with a human sender.

## 3. Inbox Rules
- **Customer**: no Inbox. Only their own Customer Space (single conversation view).
- **Member**: own Inbox with a conversation list ("ลูกค้าของฉัน").
- **Admin**: platform-wide Inbox with a conversation list.
- Inbox rows include: Avatar, Display Name, Private Alias (optional), Latest Message, Time, Unread, Property Context.

## 4. Favorites Workspace
Favorites is not only a bookmark list — it is the Member's property workspace, serving two purposes:
1. **Personal bookmark** — properties the Member wants to track.
2. **Collection building** — properties organized before sharing with a customer.

The Favorites page must carry an explanation card at the top:

> ⭐ **Favorites Workspace**
> Save properties for yourself, or organise them into collections before sharing them with customers.
> ✓ Save properties · ✓ Build customer collections · ✓ Edit your workspace anytime · ✓ Share the same property with multiple customers · ✓ Create new collections without affecting previous shares

*(No dedicated Favorites/Member Workspace page exists in the project yet — this section documents the required architecture and copy for when that page is built. It is not yet implemented as a live page.)*

## 5. Collection Architecture (corrected model)

**Incorrect (rejected) model**: `Favorites → Share`

**Correct model**:
```
Property → Favorites Workspace → Customer Collection → Customer Space
```
- **Favorites** belongs to the Member (personal workspace, mutable).
- **Collections** belong to each Customer Space (created from Favorites at share time, then independent).
- Editing Favorites later must **never** overwrite a Collection already shared — Collections are forked copies, not live references back to Favorites, unless explicitly in Live mode (§6).
- A Member can create Collection A → share → later create Collection B (different properties) → share, without affecting Collection A. Both remain available to their respective Customer Spaces.
- The same property may belong to many Collections simultaneously (Customer A's collection and Customer B's collection can both include property HH-111).

## 6. Collection Modes (architecture only, not implemented)
- **Snapshot (default)**: Customer always sees the version frozen at share time.
- **Live Collection (optional)**: Customer always sees the Member's latest version of that collection.

## 7. Customer Space Sharing
Sharing a Customer Space is **not** sharing Favorites — it means creating or selecting a **Customer Collection** for that specific customer. Each Customer Space may hold multiple Collections over its lifetime (see also `CUSTOMER SPACE PLATFORM RULES.md` §1 on Space lifecycle — a new share to an existing customer attaches a new Collection to the existing Space, it does not fork a new Space).

## 8. Growth Components
Growth prompts are contextual suggestions, never advertisements. Components: Guest → Free Member, Login, Upgrade, Renew. Every prompt must answer "what value does the user receive now?" and must include **"Later"** and **"Don't show again today"** dismissal options.

## 9. Identity
Customer, Member, Admin, and AI each carry a consistent color, badge, avatar, and title. The conversation header must always make unambiguous who the customer is talking to (already implemented in Unified Chat Prototype's context banner).

## 10. Multi-Language
Customer Space inherits platform language support. Detection order: Preferred Language (Member-set) → Browser → Region → Default. AI always responds using the Customer Space's resolved language (see also BLUEPRINT.md §25 Multilingual section).

## 11. UX Philosophy
Help first, sell later. Never interrupt the customer journey. Every prompt must provide immediate value before asking for anything.

## 12. Growth Matrix (documentation only, no implementation)

| Trigger | Suggested Action |
|---|---|
| Customer used AI several times | Suggest Free Registration |
| Customer wants to save favourites | Suggest Login |
| Free member reaches usage limit | Suggest Upgrade |
| Near expiration | Suggest Renewal |

## 13–14. Blueprint & Documentation
BLUEPRINT.md §25 refined (not replaced) to cross-reference this Revision 1 document. This file is the official Product Owner specification of record for Customer Space architecture going forward.

## 15. Stop Condition
Blueprint, Prototype, Documentation, and UX are aligned as of this revision. No new feature implementation proceeds until Product Owner review.

---
**Status**: Architecture Revision 1 — Approved for documentation/prototype alignment only. No Firestore, no backend, no new production code.
