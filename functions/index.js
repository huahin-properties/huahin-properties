// functions/index.js
//
// A single HTTPS Cloud Function that proxies requests to the Anthropic API.
// The real API key lives ONLY here, in Firebase's server-side Secret
// Manager — it is never present in any file the browser downloads, so it
// can't be stolen by viewing page source / devtools.
//
// The web app (AI Quick Add.dc.html) calls this function's URL instead of
// window.claude.complete when running outside the Claude.ai preview.

const { onRequest, onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const Stripe = require("stripe");

if (!admin.apps.length) admin.initializeApp();

const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");
const STRIPE_SECRET_KEY = defineSecret("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SECRET = defineSecret("STRIPE_WEBHOOK_SECRET");
const RESEND_API_KEY = defineSecret("RESEND_API_KEY");
const LINE_CHANNEL_SECRET = defineSecret("LINE_CHANNEL_SECRET");
const LINE_CHANNEL_ID = defineSecret("LINE_CHANNEL_ID");

// Fires whenever ContactRail (or any other caller) writes a new lead —
// looks up which lister owns the property the enquiry is about, and emails
// that lister so they don't have to keep the Dashboard open to notice new
// customer messages. Uses Resend (https://resend.com) — a REST email API,
// no SMTP setup needed; RESEND_API_KEY is a Firebase secret, never in
// client code. Silently no-ops (logs only) if the property/lister/email
// can't be resolved or the secret isn't set yet — never blocks the lead
// from saving, since the write already happened by the time this runs.
exports.notifyNewLead = onDocumentCreated(
  { document: "leads/{leadId}", region: "asia-southeast1", secrets: [RESEND_API_KEY] },
  async (event) => {
    const lead = event.data && event.data.data();
    if (!lead || !lead.propertyId) { console.log("notifyNewLead: no propertyId on lead, skipping"); return; }
    try {
      const propSnap = await admin.firestore().collection("properties").doc(lead.propertyId).get();
      const prop = propSnap.exists ? propSnap.data() : null;
      const listerId = prop && prop.listerId;
      if (!listerId) { console.log("notifyNewLead: property has no listerId, skipping"); return; }
      const listerSnap = await admin.firestore().collection("listers").doc(listerId).get();
      const lister = listerSnap.exists ? listerSnap.data() : null;
      const toEmail = lister && lister.email;
      if (!toEmail) { console.log("notifyNewLead: lister has no email, skipping"); return; }
      const apiKey = RESEND_API_KEY.value();
      if (!apiKey) { console.log("notifyNewLead: RESEND_API_KEY not set, skipping"); return; }
      const title = (prop.title && (prop.title.th || prop.title.en)) || lead.propertyId;
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          from: "huahin.properties <notify@huahin.properties>",
          to: [toEmail],
          subject: `มีลูกค้าติดต่อเข้ามาใหม่ — ${title}`,
          html: `<p>มีลูกค้าทักเข้ามาเกี่ยวกับทรัพย์: <b>${title}</b></p>
                 <p>ชื่อ: ${lead.name || "-"}<br/>โทร: ${lead.phone || "-"}<br/>อีเมล: ${lead.email || "-"}</p>
                 <p>ข้อความ: ${lead.message || "-"}</p>
                 <p><a href="https://huahin.properties/Lister%20Dashboard.dc.html">เปิด Dashboard เพื่อตอบกลับ →</a></p>`,
        }),
      });
      if (!res.ok) console.warn("notifyNewLead: Resend API error", res.status, await res.text());
    } catch (e) { console.warn("notifyNewLead failed:", e); }
  }
);

exports.claudeComplete = onRequest(
  { secrets: [ANTHROPIC_API_KEY], cors: true, region: "asia-southeast1", timeoutSeconds: 300, memory: "512MiB" },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Use POST");
      return;
    }

    try {
      const { content, tool, system, messages } = req.body;

      // Multi-turn chat mode (used by the ContactRail AI chat widget):
      // caller sends {system, messages} instead of {content}.
      if (messages) {
        const chatBody = { model: "claude-haiku-4-5", max_tokens: 600, messages };
        if (system) chatBody.system = system;
        const chatRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-api-key": ANTHROPIC_API_KEY.value(),
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify(chatBody),
        });
        const chatData = await chatRes.json();
        if (!chatRes.ok) {
          console.error("Anthropic API error:", chatData);
          res.status(chatRes.status).json({ error: chatData.error?.message || "Anthropic API error" });
          return;
        }
        const chatText = (chatData.content || []).map((b) => b.text || "").join("");
        res.json({ completion: chatText });
        return;
      }

      // Single-turn mode (existing behavior, used by AI Quick Add): content array + optional tool.
      if (!content) {
        res.status(400).json({ error: "Missing 'content' or 'messages' in request body" });
        return;
      }

      const body = {
        model: "claude-sonnet-4-5",
        max_tokens: 4096,
        messages: [{ role: "user", content }],
      };
      // When the caller supplies a tool schema, force Claude to respond via
      // that tool's structured input instead of free-text JSON. Anthropic
      // validates/constrains this server-side, so the result is always
      // well-formed — this eliminates the whole class of "malformed JSON
      // from the model" bugs that free-text JSON parsing was prone to.
      if (tool) {
        body.tools = [tool];
        body.tool_choice = { type: "tool", name: tool.name };
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY.value(),
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("Anthropic API error:", data);
        res.status(response.status).json({ error: data.error?.message || "Anthropic API error" });
        return;
      }

      if (tool) {
        const toolUse = (data.content || []).find((b) => b.type === "tool_use");
        if (!toolUse) {
          res.status(502).json({ error: "Model did not return the expected structured tool result" });
          return;
        }
        res.json({ result: toolUse.input });
        return;
      }

      // Return just the text the same shape window.claude.complete gave us,
      // so the frontend code barely has to change.
      const text = (data.content || []).map((b) => b.text || "").join("");
      res.json({ completion: text });
    } catch (e) {
      console.error("claudeComplete failed:", e);
      res.status(500).json({ error: String(e) });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────
// Conversation Ownership — Firestore Realtime chat tied to Shared
// Collection links (Technical Plan, approved). AI-role messages are ONLY
// ever written here (Admin SDK, server-side) — never directly by the
// browser — so a customer can never spoof a fake "AI said X" message into
// their own conversation. Customer- and owner-role messages ARE allowed as
// direct client Firestore writes (see firestore.rules) since those are
// exactly who the rules say may write them.
//
// sendConversationTurn:
//   1. Verifies the caller's Firebase ID token really is the visitor for
//      this conversation (defense in depth — Firestore rules ALSO enforce
//      this on the customer-role message doc itself).
//   2. Writes the customer's message.
//   3. Calls Claude with the system prompt + history the client already
//      assembled (property context building stays client-side, unchanged
//      from the existing chat — only the WRITE path changes).
//   4. Writes the AI's reply as its own message doc (role: "ai").
//   5. Updates the conversation doc's lastMessage/status/unread counters.
//   6. Returns the reply text so the calling browser can render it
//      immediately without waiting on its own onSnapshot round-trip.
// ─────────────────────────────────────────────────────────────────────────

async function callClaudeMessages(system, messages, apiKey) {
  const body = { model: "claude-haiku-4-5", max_tokens: 600, messages };
  if (system) body.system = system;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Anthropic API error");
  return (data.content || []).map((b) => b.text || "").join("");
}

// startConversation: creates the conversation doc (if it doesn't already
// exist) and writes the FIRST message as an AI-role greeting. Needed as a
// separate entry point from sendConversationTurn because the very first
// message in a conversation has no preceding customer message to react to
// (the greeting text is pre-built client-side from the shared property
// snapshots — no Claude call needed for it) — but it's still an "ai" role
// message, so it still must be written server-side, never by the browser.
// resolveSenderIdentity: looks up a real member account in Firestore for
// resolveSenderIdentity: looks up a real member account in Firestore for
// the given senderId (checked against listers/{senderId} first, then
// adminUsers/{senderId}). Identity resolution is a single source of truth
// — Firestore — never a hardcoded UID and never a silent "admin" fallback,
// so this scales to any number of Owners/Agents without further code
// changes. If no matching account exists, throws instead of guessing:
// a Conversation with a wrong/fabricated ownerId is a worse failure mode
// (silently undiscoverable — the Owner's inbox is just empty forever)
// than a loud, immediate error at share-link creation time.
async function resolveSenderIdentity(senderId) {
  const db = admin.firestore();
  if (senderId) {
    const listerSnap = await db.collection("listers").doc(senderId).get();
    if (listerSnap.exists) {
      const d = listerSnap.data();
      return { ownerId: senderId, ownerLabel: d.displayName || d.name || "huahin.properties" };
    }
    const adminSnap = await db.collection("adminUsers").doc(senderId).get();
    if (adminSnap.exists) {
      const d = adminSnap.data();
      return { ownerId: senderId, ownerLabel: d.displayName || d.name || "huahin.properties" };
    }
  }
  console.error(`resolveSenderIdentity: no listers/${senderId} or adminUsers/${senderId} document found — refusing to fall back to a fabricated identity.`);
  throw new HttpsError(
    "failed-precondition",
    `Sender identity "${senderId || "(none)"}" is not a registered member or admin. An adminUsers/{uid} or listers/{uid} Firestore document must exist before this account can share a Collection link.`
  );
}

// startConversation (Callable): creates the conversation doc (if it
// doesn't already exist) and writes the FIRST message as an AI-role
// greeting. A separate entry point from sendConversationTurn because the
// very first message has no preceding customer message to react to (the
// greeting text is pre-built client-side from the shared collection — no
// Claude call needed for it) — but it's still an "ai" role message, so it
// still must be written server-side, never by the browser.
exports.startConversation = onCall(
  { region: "asia-southeast1" },
  async (request) => {
    const auth = request.auth;
    if (!auth) throw new HttpsError("unauthenticated", "Sign-in required.");
    const { senderId, collectionIds, propertyRefs, greetingText } = request.data || {};
    if (!greetingText) throw new HttpsError("invalid-argument", "Missing greetingText.");

    const visitorId = auth.uid;
    const { ownerId, ownerLabel } = await resolveSenderIdentity(senderId);
    const conversationId = `${ownerId}__${visitorId}`;

    const db = admin.firestore();
    const now = admin.firestore.FieldValue.serverTimestamp();
    const convRef = db.collection("conversations").doc(conversationId);
    const existing = await convRef.get();

    if (!existing.exists) {
      await convRef.set({
        ownerId, ownerLabel,
        senderId: ownerId, senderLabel: ownerLabel,
        visitorId, visitorLabel: "ผู้เยี่ยมชม " + visitorId.slice(-4),
        collectionIds: collectionIds || [],
        propertyRefs: propertyRefs || [], // [{propertyId, title, price, thumbnailUrl}]
        status: "ai_handling",
        unreadByOwner: false,
        lastMessage: "", lastMessageAt: now,
        createdAt: now, updatedAt: now,
      });
    }

    // Only write the greeting once — if the conversation already had
    // messages (e.g. customer re-opened the same link), don't duplicate it.
    const existingMsgs = await convRef.collection("messages").limit(1).get();
    if (existingMsgs.empty) {
      await convRef.collection("messages").add({
        role: "ai", senderId: "ai", senderLabel: "AI Assistant", text: greetingText,
        createdAt: now, readByOwner: false, readByCustomer: true,
      });
      await convRef.set({ lastMessage: greetingText, lastMessageAt: now, updatedAt: now }, { merge: true });
    }

    return { conversationId, ownerId, ownerLabel };
  }
);

// sendConversationTurn (Callable): writes the customer's message, calls
// Claude, then writes the AI's reply — Admin SDK only, never a direct
// client write, so a customer can never spoof a fake "AI said X" message.
exports.sendConversationTurn = onCall(
  { secrets: [ANTHROPIC_API_KEY], region: "asia-southeast1", timeoutSeconds: 300, memory: "512MiB" },
  async (request) => {
    const auth = request.auth;
    if (!auth) throw new HttpsError("unauthenticated", "Sign-in required.");
    const { conversationId, system, messages, customerText } = request.data || {};
    if (!conversationId || !customerText) throw new HttpsError("invalid-argument", "Missing conversationId or customerText.");

    const visitorId = auth.uid;
    const db = admin.firestore();
    const convRef = db.collection("conversations").doc(conversationId);
    const convSnap = await convRef.get();
    if (!convSnap.exists) throw new HttpsError("not-found", "Conversation not found.");
    if (convSnap.data().visitorId !== visitorId) throw new HttpsError("permission-denied", "Not your conversation.");

    const now = admin.firestore.FieldValue.serverTimestamp();

    await convRef.collection("messages").add({
      role: "customer", senderId: visitorId, senderLabel: "", text: customerText,
      createdAt: now, readByOwner: false, readByCustomer: true,
    });
    await convRef.set({ lastMessage: customerText, lastMessageAt: now, updatedAt: now, status: "waiting_owner", unreadByOwner: true }, { merge: true });

    const reply = await callClaudeMessages(system, messages, ANTHROPIC_API_KEY.value());

    await convRef.collection("messages").add({
      role: "ai", senderId: "ai", senderLabel: "AI Assistant", text: reply,
      createdAt: now, readByOwner: false, readByCustomer: false,
    });
    await convRef.set({ lastMessage: reply, lastMessageAt: now, updatedAt: now, status: "ai_handling" }, { merge: true });

    return { reply };
  }
);


//
// createCheckoutSession — starts a subscription checkout for a lister
// (Agent/homeowner) upgrading to a paid tier. priceId comes from Site
// Content (admin sets it there — no redeploy needed to change pricing).
//
// stripeWebhook — the ONLY place that ever marks a lister's tier/status as
// paid. Verifies Stripe's signature so nobody can fake a "payment succeeded"
// call. Also writes every successful charge into the `payments` ledger
// (BLUEPRINT.md §4) so Admin can see exactly who paid what, when.
//
// createPortalSession — hands a lister a Stripe-hosted page to manage/
// cancel their own subscription (no custom UI needed for that part).
// ─────────────────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

exports.createCheckoutSession = onRequest(
  { secrets: [STRIPE_SECRET_KEY], cors: true, region: "asia-southeast1" },
  async (req, res) => {
    if (req.method === "OPTIONS") { res.set(CORS_HEADERS).status(204).send(""); return; }
    if (req.method !== "POST") { res.status(405).send("Use POST"); return; }
    try {
      const stripe = new Stripe(STRIPE_SECRET_KEY.value());
      const { priceId, listerId, email, tier, successUrl, cancelUrl } = req.body;
      if (!priceId || !listerId || !email) {
        res.status(400).json({ error: "Missing priceId, listerId, or email" });
        return;
      }
      const db = admin.firestore();
      const listerDoc = await db.collection("listers").doc(listerId).get();
      const existingCustomerId = listerDoc.exists ? listerDoc.data().stripeCustomerId : null;

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        customer: existingCustomerId || undefined,
        customer_email: existingCustomerId ? undefined : email,
        client_reference_id: listerId,
        metadata: { listerId, tier: tier || "" },
        subscription_data: { metadata: { listerId, tier: tier || "" } },
        success_url: successUrl || "https://huahin.properties/Agent%20Signup.dc.html?checkout=success",
        cancel_url: cancelUrl || "https://huahin.properties/Agent%20Signup.dc.html?checkout=cancelled",
      });
      res.json({ url: session.url });
    } catch (e) {
      console.error("createCheckoutSession failed:", e);
      res.status(500).json({ error: String(e && e.message || e) });
    }
  }
);

exports.createPortalSession = onRequest(
  { secrets: [STRIPE_SECRET_KEY], cors: true, region: "asia-southeast1" },
  async (req, res) => {
    if (req.method === "OPTIONS") { res.set(CORS_HEADERS).status(204).send(""); return; }
    if (req.method !== "POST") { res.status(405).send("Use POST"); return; }
    try {
      const stripe = new Stripe(STRIPE_SECRET_KEY.value());
      const { customerId, returnUrl } = req.body;
      if (!customerId) { res.status(400).json({ error: "Missing customerId" }); return; }
      const portal = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl || "https://huahin.properties/Agent%20Signup.dc.html",
      });
      res.json({ url: portal.url });
    } catch (e) {
      console.error("createPortalSession failed:", e);
      res.status(500).json({ error: String(e && e.message || e) });
    }
  }
);

// createFeaturedCheckoutSession — one-time payment to boost a listing to the
// top of Home/Search for N days ("Featured Listing boost" in BLUEPRINT.md
// §11 item 5). Uses Stripe's dynamic price_data instead of a pre-created
// Product/Price — admin sets THB amount per duration in Site Content.
exports.createFeaturedCheckoutSession = onRequest(
  { secrets: [STRIPE_SECRET_KEY], cors: true, region: "asia-southeast1" },
  async (req, res) => {
    if (req.method === "OPTIONS") { res.set(CORS_HEADERS).status(204).send(""); return; }
    if (req.method !== "POST") { res.status(405).send("Use POST"); return; }
    try {
      const { propertyId, days, amountThb, successUrl, cancelUrl } = req.body || {};
      if (!propertyId || !days || !amountThb) {
        res.status(400).json({ error: "propertyId, days and amountThb are required" });
        return;
      }
      const stripe = new Stripe(STRIPE_SECRET_KEY.value());
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{
          price_data: {
            currency: "thb",
            unit_amount: Math.round(Number(amountThb) * 100),
            product_data: { name: `Featured Listing — ${propertyId} — ${days} days` },
          },
          quantity: 1,
        }],
        metadata: { type: "featured", propertyId: String(propertyId), days: String(days) },
        success_url: successUrl || "https://huahin.properties/Admin%20Dashboard.dc.html?featured=success",
        cancel_url: cancelUrl || "https://huahin.properties/Admin%20Dashboard.dc.html?featured=cancelled",
      });
      res.json({ url: session.url });
    } catch (e) {
      console.error("createFeaturedCheckoutSession failed:", e);
      res.status(500).json({ error: String(e && e.message || e) });
    }
  }
);

// createBannerCheckoutSession — one-time payment for a self-serve external
// banner ad ("เปิดขายแบนเนอร์ให้ลูกค้าภายนอกจริง" in BLUEPRINT.md §11 item 6).
// Same dynamic price_data pattern as Featured — no Stripe Product needed,
// admin sets THB price per position in Site Content.
exports.createBannerCheckoutSession = onRequest(
  { secrets: [STRIPE_SECRET_KEY], cors: true, region: "asia-southeast1" },
  async (req, res) => {
    if (req.method === "OPTIONS") { res.set(CORS_HEADERS).status(204).send(""); return; }
    if (req.method !== "POST") { res.status(405).send("Use POST"); return; }
    try {
      const { bannerId, position, amountThb, email, successUrl, cancelUrl } = req.body || {};
      if (!bannerId || !amountThb) {
        res.status(400).json({ error: "bannerId and amountThb are required" });
        return;
      }
      const stripe = new Stripe(STRIPE_SECRET_KEY.value());
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{
          price_data: {
            currency: "thb",
            unit_amount: Math.round(Number(amountThb) * 100),
            product_data: { name: `Banner Ad — ${position || "slot"} — 30 days` },
          },
          quantity: 1,
        }],
        customer_email: email || undefined,
        metadata: { type: "banner", bannerId: String(bannerId) },
        success_url: successUrl || "https://huahin.properties/Advertise.dc.html?checkout=success",
        cancel_url: cancelUrl || "https://huahin.properties/Advertise.dc.html?checkout=cancelled",
      });
      res.json({ url: session.url });
    } catch (e) {
      console.error("createBannerCheckoutSession failed:", e);
      res.status(500).json({ error: String(e && e.message || e) });
    }
  }
);

// createVipCheckoutSession — one-time payment for a HOMEOWNER to boost their
// property into the Agent VIP pool ("ทาง 4" in BLUEPRINT.md §2 — Silver/Gold/
// Diamond packages). Same dynamic price_data pattern as Featured/Banner — no
// Stripe Product needed, admin sets THB price per tier in Site Content.
// Triggered from Admin Dashboard on the owner's behalf (no self-serve listing
// editor yet — same pattern already used for Featured Listing boost).
exports.createVipCheckoutSession = onRequest(
  { secrets: [STRIPE_SECRET_KEY], cors: true, region: "asia-southeast1" },
  async (req, res) => {
    if (req.method === "OPTIONS") { res.set(CORS_HEADERS).status(204).send(""); return; }
    if (req.method !== "POST") { res.status(405).send("Use POST"); return; }
    try {
      const { propertyId, tier, amountThb, successUrl, cancelUrl } = req.body || {};
      if (!propertyId || !tier || !amountThb) {
        res.status(400).json({ error: "propertyId, tier and amountThb are required" });
        return;
      }
      const stripe = new Stripe(STRIPE_SECRET_KEY.value());
      const tierLabel = { silver: "VIP เงิน", gold: "VIP ทอง", diamond: "VIP เพชร" }[tier] || tier;
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{
          price_data: {
            currency: "thb",
            unit_amount: Math.round(Number(amountThb) * 100),
            product_data: { name: `Agent VIP Pool — ${tierLabel} — ${propertyId} — 30 days` },
          },
          quantity: 1,
        }],
        metadata: { type: "homeownerVip", propertyId: String(propertyId), tier: String(tier) },
        success_url: successUrl || "https://huahin.properties/Admin%20Dashboard.dc.html?vip=success",
        cancel_url: cancelUrl || "https://huahin.properties/Admin%20Dashboard.dc.html?vip=cancelled",
      });
      res.json({ url: session.url });
    } catch (e) {
      console.error("createVipCheckoutSession failed:", e);
      res.status(500).json({ error: String(e && e.message || e) });
    }
  }
);

exports.stripeWebhook = onRequest(
  { secrets: [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET], region: "asia-southeast1" },
  async (req, res) => {
    const stripe = new Stripe(STRIPE_SECRET_KEY.value());
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.rawBody, req.headers["stripe-signature"], STRIPE_WEBHOOK_SECRET.value());
    } catch (e) {
      console.error("Webhook signature verification failed:", e);
      res.status(400).send("Invalid signature");
      return;
    }

    const db = admin.firestore();

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          if (session.metadata && session.metadata.type === "featured") {
            const { propertyId, days } = session.metadata;
            const featuredUntil = Date.now() + Number(days) * 24 * 60 * 60 * 1000;
            await db.collection("properties").doc(propertyId).set({ featuredUntil }, { merge: true });
            await db.collection("payments").add({
              propertyId, type: "featured", days: Number(days),
              amount: session.amount_total, currency: session.currency, createdAt: Date.now(),
            });
            break;
          }
          if (session.metadata && session.metadata.type === "banner") {
            const { bannerId } = session.metadata;
            const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
            await db.collection("banners").doc(bannerId).set({ active: true, expiresAt, pendingPayment: false }, { merge: true });
            await db.collection("payments").add({
              bannerId, type: "banner",
              amount: session.amount_total, currency: session.currency, createdAt: Date.now(),
            });
            break;
          }
          if (session.metadata && session.metadata.type === "homeownerVip") {
            const { propertyId, tier } = session.metadata;
            const vipUntil = Date.now() + 30 * 24 * 60 * 60 * 1000;
            await db.collection("properties").doc(propertyId).set({ vipTier: tier, vipUntil }, { merge: true });
            await db.collection("payments").add({
              propertyId, type: "homeownerVip", tier,
              amount: session.amount_total, currency: session.currency, createdAt: Date.now(),
            });
            break;
          }
          const listerId = session.client_reference_id;
          if (listerId) {
            const update = { stripeCustomerId: session.customer, subscriptionStatus: "active" };
            // Agent VIP subscriptions (silver/gold/diamond) are tracked in a
            // separate `vipTier` field from the post-quota `tier` (basic/pro/
            // agency) — the two stack independently (e.g. "Pro + VIP ทอง").
            const purchasedTier = session.metadata && session.metadata.tier;
            if (purchasedTier === "vipSilver" || purchasedTier === "vipGold" || purchasedTier === "vipDiamond") {
              update.vipTier = purchasedTier.replace("vip", "").toLowerCase();
            } else if (purchasedTier === "pro" || purchasedTier === "agency" || purchasedTier === "level3") {
              update.tier = purchasedTier;
            }
            await db.collection("listers").doc(listerId).set(update, { merge: true });
          }
          break;
        }
        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          const sub = event.data.object;
          const listerId = sub.metadata && sub.metadata.listerId;
          if (listerId) {
            // "active"/"trialing" = visible on the site. Anything else
            // (past_due, canceled, unpaid) hides their listings/banners
            // without deleting data — see BLUEPRINT.md §4.
            const status = (sub.status === "active" || sub.status === "trialing") ? "active" : sub.status;
            const update = { subscriptionStatus: status };
            // If the subscription was cancelled/lapsed, clear whichever tier
            // field it belonged to so gated features turn off immediately.
            const subTier = sub.metadata && sub.metadata.tier;
            if (status !== "active") {
              if (subTier === "vipSilver" || subTier === "vipGold" || subTier === "vipDiamond") update.vipTier = null;
              else if (subTier === "pro" || subTier === "agency") update.tier = "basic";
            }
            await db.collection("listers").doc(listerId).set(update, { merge: true });
          }
          break;
        }
        case "invoice.payment_succeeded": {
          const invoice = event.data.object;
          const sub = invoice.subscription
            ? await stripe.subscriptions.retrieve(invoice.subscription).catch(() => null)
            : null;
          const listerId = sub && sub.metadata && sub.metadata.listerId;
          await db.collection("payments").add({
            listerId: listerId || null,
            stripeCustomerId: invoice.customer,
            invoiceId: invoice.id,
            amount: invoice.amount_paid,
            currency: invoice.currency,
            createdAt: Date.now(),
          });
          break;
        }
        default:
          break;
      }
      res.json({ received: true });
    } catch (e) {
      console.error("stripeWebhook handling failed:", e);
      res.status(500).send("Webhook handler error");
    }
  }
);

// Dynamic Open Graph preview for shared Agent Profile links — plain
// GitHub Pages HTML can't vary its <meta og:*> per lister (they're baked
// into the static file), which is what LINE/Facebook/etc. read to build
// the link-preview card. This serves a tiny HTML shell with the real
// lister's name/photo as og tags, then immediately sends real visitors on
// to the actual page — chat-app crawlers only read the tags, they don't
// follow the redirect.
exports.agentProfileMeta = onRequest(
  { region: "asia-southeast1" },
  async (req, res) => {
    try {
      const id = String(req.query.id || "");
      const target = `https://huahin.properties/Agent%20Profile.dc.html?id=${encodeURIComponent(id)}`;
      const FALLBACK = "ที่ปรึกษาอสังหาริมทรัพย์";
      let name = FALLBACK;
      let photo = "https://huahin.properties/logo.png";
      let cardV = "1";
      if (id) {
        const doc = await admin.firestore().collection("listers").doc(id).get();
        if (doc.exists) {
          const d = doc.data();
          name = d.displayName || d.fullName || d.companyName || d.name || FALLBACK;
          if (d.profilePhotoUrl) photo = d.profilePhotoUrl;
          if (d.updatedAt) cardV = encodeURIComponent(d.updatedAt);
        }
      }
      const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
      const title = name;
      const description = name === FALLBACK
        ? "Property Page — ดูทรัพย์ทั้งหมด และติดต่อเจ้าของทรัพย์ได้โดยตรง — by huahin.properties"
        : `Property Page — ดูทรัพย์ทั้งหมด และติดต่อ ${name} ได้โดยตรง — by huahin.properties`;
      photo = `https://asia-southeast1-huahin-properties-5f1b5.cloudfunctions.net/shareCard?id=${encodeURIComponent(id)}&v=${cardV}`;
      const ua = String(req.headers["user-agent"] || "").toLowerCase();
      // Chat-app link-preview bots (LINE/Facebook/WhatsApp/Telegram/etc.)
      // read this HTML directly for the <meta og:*> tags — they do NOT
      // execute the redirect script below, so they always see the tags.
      // Real visitors' browsers run the script and move on immediately.
      // (Earlier version 302-redirected everyone including bots, which is
      // why no card ever appeared — the bot followed the redirect straight
      // to the plain static page instead of reading these tags.)
      res.set("Content-Type", "text/html; charset=utf-8");
      res.set("Cache-Control", "no-store");
      res.send(`<!DOCTYPE html><html lang="th"><head><meta charset="utf-8">
<title>${esc(title)}</title>
<meta property="og:type" content="website">
<meta property="og:url" content="${esc(target)}">
<meta property="og:site_name" content="huahin.properties">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${esc(photo)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(photo)}">
<script>location.replace(${JSON.stringify(target)});</script>
</head><body></body></html>`);
    } catch (e) {
      res.redirect(302, "https://huahin.properties/Agent%20Profile.dc.html?id=" + encodeURIComponent(String(req.query.id || "")));
    }
  }
);

// ── Dynamic Social Share Card (Digital Property Brand Card) ──
// Renders a 1200x630 PNG on demand: member's circular photo (or logo
// fallback) over their Mini-Site theme color, with name + fixed brand
// copy. Never persisted to Storage — generated fresh per request and
// cached by the CDN/client via a long max-age since the URL is versioned
// with the lister's updatedAt (so it only changes when their profile does).
function pickTextColor(bgHex) {
  try {
    const hex = bgHex.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return lum > 0.6 ? "#2a1810" : "#ffffff";
  } catch (e) {
    return "#ffffff";
  }
}

// The Cloud Functions container ships no Thai-capable font by default, so
// Thai glyphs rendered blank/boxes. Fetch a Thai webfont once per container
// instance (memoized — warm invocations skip the download) and register it
// with the canvas lib before drawing any text.
let _thaiFontReady = null;
function ensureThaiFont() {
  if (_thaiFontReady) return _thaiFontReady;
  _thaiFontReady = (async () => {
    const { GlobalFonts } = require("@napi-rs/canvas");
    const https = require("https");
    const url = "https://raw.githubusercontent.com/google/fonts/main/ofl/sarabun/Sarabun-Regular.ttf";
    const buf = await new Promise((resolve, reject) => {
      https.get(url, { headers: { "User-Agent": "node" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          https.get(res.headers.location, (res2) => {
            if (res2.statusCode !== 200) { reject(new Error("font redirect fetch failed: " + res2.statusCode)); return; }
            const chunks = [];
            res2.on("data", (c) => chunks.push(c));
            res2.on("end", () => resolve(Buffer.concat(chunks)));
          }).on("error", reject);
          return;
        }
        if (res.statusCode !== 200) { reject(new Error("font fetch failed: " + res.statusCode)); return; }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      }).on("error", reject);
    });
    GlobalFonts.register(buf, "NotoSansThai");
    console.log("Thai font registered, bytes:", buf.length);
  })().catch((e) => { console.error("Thai font load failed:", e); _thaiFontReady = null; throw e; });
  return _thaiFontReady;
}

exports.shareCard = onRequest(
  { region: "asia-southeast1", memory: "512MiB" },
  async (req, res) => {
    try {
      const { createCanvas, loadImage } = require("@napi-rs/canvas");
      try { await ensureThaiFont(); } catch (e) { console.error("proceeding without Thai font:", e); }
      const FONT_FAMILY = "NotoSansThai, sans-serif";
      const id = String(req.query.id || "");
      const FALLBACK = "เจ้าของทรัพย์";
      let name = FALLBACK;
      let photoUrl = "";
      let bgColor = "#7a1f2b";
      if (id) {
        const doc = await admin.firestore().collection("listers").doc(id).get();
        if (doc.exists) {
          const d = doc.data();
          name = d.displayName || d.fullName || d.companyName || d.name || FALLBACK;
          photoUrl = d.profilePhotoUrl || "";
          bgColor = d.themeColor || bgColor;
        }
      }
      const W = 1200, H = 630;
      const canvas = createCanvas(W, H);
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, W, H);

      const textColor = pickTextColor(bgColor);
      const isLight = textColor === "#2a1810";
      const subColor = isLight ? "rgba(42,24,16,0.72)" : "rgba(255,255,255,0.78)";

      const cx = W / 2, cy = 190, r = 110;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fillStyle = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.12)";
      ctx.fill();
      ctx.clip();
      try {
        const img = await loadImage(photoUrl || "https://huahin.properties/logo.png");
        const scale = Math.max((r * 2) / img.width, (r * 2) / img.height);
        const iw = img.width * scale, ih = img.height * scale;
        ctx.drawImage(img, cx - iw / 2, cy - ih / 2, iw, ih);
      } catch (e) {
        ctx.fillStyle = "#7a1f2b";
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      }
      ctx.restore();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.lineWidth = 4;
      ctx.strokeStyle = isLight ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.5)";
      ctx.stroke();

      const maxNameWidth = W - 160;
      let nameSize = 72;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      function wrapByWords(text, font, maxWidth) {
        ctx.font = font;
        const words = text.split(" ");
        const lines = [];
        let cur = "";
        for (const w of words) {
          const test = cur ? cur + " " + w : w;
          if (ctx.measureText(test).width > maxWidth && cur) { lines.push(cur); cur = w; }
          else cur = test;
        }
        if (cur) lines.push(cur);
        return lines;
      }
      let nameLines = [];
      while (nameSize > 34) {
        nameLines = wrapByWords(name, `700 ${nameSize}px ${FONT_FAMILY}`, maxNameWidth);
        if (nameLines.length <= 2 && nameLines.every((l) => ctx.measureText(l).width <= maxNameWidth)) break;
        nameSize -= 4;
      }
      const nameLineHeight = nameSize * 1.15;
      const nameBlockTop = 330;
      ctx.fillStyle = textColor;
      nameLines.forEach((line, i) => {
        ctx.font = `700 ${nameSize}px ${FONT_FAMILY}`;
        ctx.fillText(line, cx, nameBlockTop + i * nameLineHeight);
      });
      let y = nameBlockTop + nameLines.length * nameLineHeight + 8;

      // Order (approved): Name → Property Page → description → by huahin.properties.
      // Consistent proportional gaps between each block for a tidier, more
      // deliberate vertical rhythm instead of ad hoc offsets.
      const pageSize = Math.round(nameSize * 0.42);
      const brandSize = Math.round(nameSize * 0.48);
      const descSize = Math.round(nameSize * 0.34);

      y += pageSize * 1.1;
      ctx.font = `600 ${pageSize}px ${FONT_FAMILY}`;
      ctx.fillStyle = subColor;
      ctx.fillText("P R O P E R T Y   P A G E", cx, y);

      const descText = name === FALLBACK
        ? "ดูทรัพย์ทั้งหมด และติดต่อเจ้าของทรัพย์ได้โดยตรง"
        : `ดูทรัพย์ทั้งหมด และติดต่อ ${name} ได้โดยตรง`;
      const descLines = wrapByWords(descText, `400 ${descSize}px ${FONT_FAMILY}`, W - 200).slice(0, 2);
      y += pageSize * 0.9 + descSize * 1.1;
      ctx.font = `400 ${descSize}px ${FONT_FAMILY}`;
      ctx.fillStyle = subColor;
      descLines.forEach((line, i) => {
        ctx.fillText(line, cx, y + i * descSize * 1.3);
      });
      y += (descLines.length - 1) * descSize * 1.3;

      y += descSize * 0.9 + brandSize * 1.1;
      ctx.font = `500 ${brandSize}px ${FONT_FAMILY}`;
      ctx.fillStyle = subColor;
      ctx.fillText("by huahin.properties", cx, y);

      const buf = await canvas.encode("png");
      res.set("Content-Type", "image/png");
      res.set("Cache-Control", "public, max-age=31536000, immutable");
      res.send(buf);
    } catch (e) {
      console.error("shareCard failed:", e);
      res.redirect(302, "https://huahin.properties/logo.png");
    }
  }
);

// ── LINE Login — server-side OAuth (replaces the old client-side Firebase
// OIDC popup/redirect for LINE only, per BLUEPRINT decision: Firebase's
// redirect-state relay ("missing initial state") was unreliable across
// mobile browsers/WebViews. This flow never touches Firebase's Auth
// popup/redirect machinery — it's a plain server-mediated OAuth 2.0
// Authorization Code exchange that works identically everywhere. Google
// and Facebook are untouched and still use Firebase Auth directly. ──
const LINE_REDIRECT_URI = "https://asia-southeast1-huahin-properties-5f1b5.cloudfunctions.net/lineAuthCallback";
const SITE_URL = "https://huahin.properties";

function randomToken(bytes) {
  return require("crypto").randomBytes(bytes).toString("hex");
}

// 1) Browser navigates here (plain <a>/location.href, not fetch) — issues a
// one-time, short-lived state, then 302s straight to LINE's authorize page.
exports.lineAuthStart = onRequest(
  { secrets: [LINE_CHANNEL_ID], region: "asia-southeast1" },
  async (req, res) => {
    try {
      const state = randomToken(24);
      await admin.firestore().collection("lineAuthStates").doc(state).set({
        createdAt: Date.now(),
        expiresAt: Date.now() + 5 * 60 * 1000,
        used: false,
      });
      const params = new URLSearchParams({
        response_type: "code",
        client_id: LINE_CHANNEL_ID.value(),
        redirect_uri: LINE_REDIRECT_URI,
        state,
        scope: "profile openid email",
      });
      res.redirect(302, `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`);
    } catch (e) {
      console.error("lineAuthStart failed:", e);
      res.status(500).send("ไม่สามารถเริ่มเข้าสู่ระบบด้วย LINE ได้ ลองใหม่อีกครั้ง");
    }
  }
);

// 2) LINE redirects the browser back here with ?code&state. Runs entirely
// server-to-server from here on (state check, code-for-token exchange,
// Firestore lookup) — the browser is just carried along via 302s, never
// holding any secret or long-lived token itself.
exports.lineAuthCallback = onRequest(
  { secrets: [LINE_CHANNEL_ID, LINE_CHANNEL_SECRET], region: "asia-southeast1" },
  async (req, res) => {
    const fail = (msg) => res.redirect(302, `${SITE_URL}/Agent%20Signup.dc.html?lineError=${encodeURIComponent(msg)}`);
    try {
      const { code, state, error } = req.query;
      if (error) return fail("ยกเลิกการเข้าสู่ระบบด้วย LINE");
      if (!code || !state) return fail("คำขอไม่ถูกต้อง");

      const db = admin.firestore();
      const stateRef = db.collection("lineAuthStates").doc(String(state));
      const stateDoc = await stateRef.get();
      if (!stateDoc.exists || stateDoc.data().used || stateDoc.data().expiresAt < Date.now()) {
        return fail("เซสชันหมดอายุ กรุณาลองใหม่");
      }
      await stateRef.update({ used: true });

      const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: String(code),
          redirect_uri: LINE_REDIRECT_URI,
          client_id: LINE_CHANNEL_ID.value(),
          client_secret: LINE_CHANNEL_SECRET.value(),
        }),
      });
      const tokenJson = await tokenRes.json();
      if (!tokenRes.ok || !tokenJson.id_token) {
        console.error("LINE token exchange failed:", tokenJson);
        return fail("เข้าสู่ระบบด้วย LINE ไม่สำเร็จ");
      }

      // Decode the ID token payload (received directly from LINE's token
      // endpoint over an authenticated HTTPS call with our Channel Secret —
      // no separate JWKS signature check needed for this trust model) and
      // sanity-check the standard claims.
      const payload = JSON.parse(Buffer.from(tokenJson.id_token.split(".")[1], "base64").toString("utf8"));
      if (payload.iss !== "https://access.line.me") return fail("ผู้ให้บริการไม่ถูกต้อง");
      if (payload.aud !== LINE_CHANNEL_ID.value()) return fail("Channel ไม่ตรงกัน");
      if (!payload.exp || payload.exp * 1000 < Date.now()) return fail("Token หมดอายุ");

      const lineUserId = payload.sub;
      const uid = `line_${lineUserId}`;
      const listerRef = db.collection("listers").doc(uid);
      const listerDoc = await listerRef.get();
      if (!listerDoc.exists) {
        await listerRef.set({
          role: "lister",
          name: payload.name || "",
          email: payload.email || "",
          lineUserId,
          status: "approved",
          createdAt: Date.now(),
        });
      }

      const exchangeCode = randomToken(24);
      await db.collection("lineAuthExchanges").doc(exchangeCode).set({
        uid,
        createdAt: Date.now(),
        expiresAt: Date.now() + 60 * 1000,
        used: false,
      });
      res.redirect(302, `${SITE_URL}/Agent%20Signup.dc.html?lineExchange=${exchangeCode}`);
    } catch (e) {
      console.error("lineAuthCallback failed:", e);
      return fail("เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
    }
  }
);

// 3) The page (on load, seeing ?lineExchange=...) calls this once to trade
// the short-lived one-time code for a real Firebase custom token — the
// custom token itself never appears in a URL/history/log, only in this
// HTTPS response body.
exports.lineAuthExchange = onRequest(
  { cors: true, region: "asia-southeast1" },
  async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    if (req.method === "OPTIONS") { res.set("Access-Control-Allow-Methods", "POST, OPTIONS").set("Access-Control-Allow-Headers", "Content-Type").status(204).send(""); return; }
    try {
      const { code } = req.body || {};
      if (!code) { res.status(400).json({ error: "Missing code" }); return; }
      const db = admin.firestore();
      const ref = db.collection("lineAuthExchanges").doc(String(code));
      const doc = await ref.get();
      if (!doc.exists || doc.data().used || doc.data().expiresAt < Date.now()) {
        res.status(400).json({ error: "invalid_or_expired" });
        return;
      }
      await ref.update({ used: true });
      const token = await admin.auth().createCustomToken(doc.data().uid);
      res.json({ token });
    } catch (e) {
      console.error("lineAuthExchange failed:", e);
      res.status(500).json({ error: String(e && e.message || e) });
    }
  }
);
