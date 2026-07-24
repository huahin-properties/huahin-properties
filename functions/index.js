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
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const Stripe = require("stripe");

if (!admin.apps.length) admin.initializeApp();

const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");
const STRIPE_SECRET_KEY = defineSecret("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SECRET = defineSecret("STRIPE_WEBHOOK_SECRET");

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
