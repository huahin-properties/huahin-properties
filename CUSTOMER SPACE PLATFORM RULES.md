# Customer Space Platform Rules v1.0
### huahin.properties — Governing Business Rule Book (Not Implementation)

This document is the foundation for all future Customer Space development. It is a rule book, not code — no feature described here is implemented yet. All prototypes referenced (Shared Favorites Prototype, Unified Chat Prototype) remain unchanged by this document.

**Core Concept**: Customer Space is the product. Chat is one component inside it, not the product itself. Each Customer Space bundles: Curated Property Collection, Property Details, AI Assistant, Private Conversation, Member Information, Activity History — as one persistent object per customer↔member relationship.

---

## 1. Customer Space Lifecycle

- **Creation**: A Customer Space is created the first time a Member shares a Collection (or single property) with a specific customer — either via a Share Link resolving to a new customer, or a Member manually starting one from their inbox.
- **Reopening**: The same Share Link, or the customer's own return visit (cookie/session or authenticated account), reopens the *same* Customer Space — never a new one. One customer + one member = exactly one Customer Space, reused across every future share.
- **Expiration**: Customer Spaces do not expire by default (the relationship is durable — a lead shouldn't vanish). Individual **Share Links** may expire (see §2) without deleting the underlying Space; an expired link simply stops granting new access, existing conversation history is untouched.
- **New Share Link vs Existing Space**: If Member A shares a *new* collection with a customer who already has a Space with Member A, the new link resolves into the *same* Customer Space (new collection attached to existing history) — it does not fork a second Space per link.
- **Snapshot vs Live Collection**: A Collection attached to a Customer Space is Snapshot by default (frozen at share time) so the customer's view doesn't shift under them mid-conversation. Member may explicitly opt a Collection into Live (updates as Member's favorites change). This choice is per-collection, not per-Space — a Space may accumulate multiple Collections (some snapshot, some live) over its lifetime.

## 2. Share Link Rules

A Share Link is **only an entry point** — never the owner of a conversation, and never itself a data container.

Resolution chain (always, no shortcuts):
```
Share Link → Customer (identity or guest token) → Member (owner) → Customer Space (persistent)
```

- The Link carries a random, unguessable token that resolves server-side to (memberId, collectionId, optional recipientId).
- Deleting/revoking a Link never deletes the Customer Space or its conversation history — it only closes that entry point.
- A Link may be recipient-specific (pre-bound to one customer) or general (binds to whichever customer/guest opens it first, then becomes recipient-specific from that point on).
- Link-level toggles (from Member's share settings): allow AI, allow private chat, expiration, Snapshot/Live — these configure the *Collection* being shared, not the Space or its rules.

## 3. AI Rules

AI is a **Property Assistant**, scoped to one Customer Space — never a general-purpose chatbot, never shared context across customers or members.

**Escalation ladder** (cost and quality control, checked in order):
1. **Level 1 — Platform data direct answer**: price, beds/baths, land size, status, location, distances — answered from structured property data with no LLM call at all.
2. **Level 2 — LLM only when necessary**: comparative/subjective questions ("which is best for a family," "summarize the differences") that require synthesis across the Level-1 data. LLM is given only this Customer Space's collection data — never other members' or other customers' data.
3. **Level 3 — Escalate to Member**: when the question is outside platform data (negotiation, viewing scheduling nuance, financing specifics beyond the calculator, anything the AI can't answer confidently) — always with explicit customer confirmation before the Member sees it (per existing handoff UI already prototyped).

**Cost control methods to implement**:
- Daily quota per Customer Space (e.g. N AI messages/day) and a soft session quota per visit
- Cache identical/near-identical questions per collection (e.g. "which is closest to the beach" computed once per collection, reused)
- FAQ reuse — common questions answered from a pre-computed per-collection FAQ set before hitting the LLM
- Retrieval-before-generation — always resolve Level 1 facts first; only send the LLM the delta it actually needs to reason about
- Automatic escalation when quota is exceeded or confidence is low, instead of degrading answer quality

## 4. Chat Rules

**Text messages only.** No image, video, audio, or file upload/attachment in-chat.

Reason: reduces storage cost, bandwidth, and moderation surface. Customers needing to share media should be directed to the Member's existing LINE/WhatsApp (already surfaced elsewhere on the site) — Customer Space chat is not meant to replace those channels, only to handle text-based property Q&A and lead capture.

## 5. Behavior Analytics

Track events that are genuinely useful for improving sales conversations — not vanity metrics.

**High-value events to record** (against a Customer Space, not just a page hit):
- Customer opened Share Link / reopened Customer Space
- Customer viewed a specific property (which one, how long)
- Customer opened map / clicked phone / clicked LINE
- Customer asked AI (and whether it escalated)
- Customer contacted Member (private chat first message)
- Customer revisited (return session)
- Property added/removed from the shared collection (Member-side action)
- Conversation created / conversation resumed
- AI escalation triggered
- Member response time (first reply latency — accountability metric for Members)

Rule: every tracked event must answer "does this help a Member close a sale or help the Product Owner improve the funnel" — if not, don't track it.

## 6. Login Strategy

**Frictionless entry, optional depth.** Opening a Customer Space via Share Link must never require registration — the customer sees properties and can chat immediately as a guest (lightweight identity per the earlier chat security model: display name + consent, guest token).

**Registration/sign-in is offered, not required**, and only when it adds real value to the customer:
- Saving preferences/favorites across visits and devices
- Receiving alerts (price drop, new matching listing)
- Persistent personal features (multiple Customer Spaces across different Members, in one account)

If a customer later signs in, their existing guest-token Customer Space history should be linkable/mergeable into their account (exact mechanism to be designed at implementation time — noted here as a requirement, not a solved design).

## 7. Privacy Model

Every resource has exactly one owner; visibility is role-based, never link-based.

| Resource | Customer (own) | Other Customers | Member (owner) | Other Members | Admin | AI |
|---|---|---|---|---|---|---|
| Conversation | Read/Write | No access | Read/Write | No access | Role-gated + logged | Read (own Space only) |
| Collection | Read | No access (unless separately shared) | Read/Write | No access | Read | Read (own Space only) |
| Behavior/Activity | No direct access | No access | Read (own customers) | No access | Read (aggregate + role-gated detail) | No access |
| AI Summary | Read | No access | Read | No access | Role-gated | Generates, doesn't "own" |

This table is the same shape as the Data Model & Security Proposal already documented in the Unified Chat Prototype — this section is the business-rule statement; that prototype's `conversations`/`messages`/`adminAccessLog` shapes are the intended implementation of it.

## 8. AI Summary

Automatic, Member-facing summaries per Customer Space — **assist, don't replace** the conversation.

Suggested summary fields, regenerated as the Space accumulates activity:
- Customer's apparent interests (which properties/features they engaged with most)
- Budget signal (if disclosed or inferable from viewed price range)
- Favorited/shortlisted properties within the collection
- Questions asked (topic list, not full transcript)
- Current buying-stage estimate (browsing / comparing / ready to visit / negotiating) — clearly labeled as an AI estimate, not fact
- Recent activity (last visit, last message, last escalation)

Rule: a Member must always be able to open the full conversation — the summary is a shortcut, never a substitute that hides the real thread.

## 9. Platform Limits

Recommended limits (exact numbers to be set at implementation/business-decision time, not fixed here):
- Maximum AI usage per Customer Space per day (quota, §3)
- Maximum message send rate per customer (basic spam/flood protection)
- Conversation retention period (how long message history is kept before archival)
- Analytics/behavior-event retention period (separate from conversation retention — likely shorter)
- Share Link lifetime default (e.g. no default expiry, but Member-configurable per §1/§2)
- Spam protection on guest-created conversations (rate limiting + basic content filtering before a message reaches a Member)

## 10. Future Features — Phasing

**Phase 1 — Required for Launch**
- Customer Space core object (persistent per customer↔member pair)
- Share Link resolution chain (§2)
- Snapshot Collection sharing
- Text-only AI + private chat (Levels 1–2 of §3, no Level 3 automation yet — manual escalation only)
- Basic privacy model enforcement (§7) via security rules
- Core behavior events (link opened, property viewed, message sent)

**Phase 2 — Recommended**
- Live Collection mode
- AI Summary (§8) surfaced in Member Inbox
- Guest → authenticated account merge (§6)
- Response-time tracking and Member accountability metrics
- Expanded analytics retention/reporting

**Phase 3 — Long-Term Vision**
- Cross-Member customer relationship view for Admin (with strict role gating)
- Predictive buying-stage estimation refinement
- Automated (not just manual) Level 3 AI escalation triggers
- Notification channels beyond in-app (email, LINE OA, push) — already flagged elsewhere in the project as not-yet-built
- Alerts for saved/registered customers (price drop, new match)

---

**Status**: Business Rule Book only. No code changes accompany this document. Existing prototypes (Shared Favorites, Unified Chat v2) are unchanged. Awaiting Product Owner review before any implementation begins.
