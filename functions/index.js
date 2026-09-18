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
const { onDocumentCreated, onDocumentWritten } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const Stripe = require("stripe");
// C4.2b — trackToken generation. Node's CSPRNG, server-side only. The token
// must never be predictable: it is the ONLY credential a customer holds for
// their own Case (see the trackToken branches in firestore.rules).
const nodeCrypto = require("crypto");
// C4.3 Phase 2A-1 - the SINGLE customer-facing draft completeness evaluator.
// Lives in functions/ so it is deployed with this file and the server stays
// the only place the percentage is computed. It does NOT import, copy or
// mirror intake-workflow.js: staff workflow completeness is a different
// concept and remains untouched.
const { evaluateDraftCompleteness } = require("./draft-completeness");

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
      const { content, tool, system, messages, max_tokens } = req.body;

      // Multi-turn chat mode (used by the ContactRail AI chat widget):
      // caller sends {system, messages} instead of {content}. Chat replies
      // stay capped at 600 tokens for cost/speed, but a caller doing a
      // heavier job (e.g. translateDescriptionAll translating a full
      // listing description into 8 languages at once) can pass its own
      // max_tokens — without this, long descriptions got cut off mid-JSON
      // and silently failed to translate (BLUEPRINT.md fix, Aug 2026).
      if (messages) {
        const chatBody = { model: "claude-haiku-4-5", max_tokens: max_tokens || 600, messages };
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

// ── C4.1 Reception AI persistence (ก.ย. 2569) ──────────────────────
//
// Stages/intents are plain strings, never a rules-level enum, so new intent
// types can be added later without a schema or rules change (BLUEPRINT 26.14.2).
const RECEPTION_STAGES = ["general", "advisory", "qualified"];
const RECEPTION_INTENTS = [
  "SELL", "RENT_OUT", "BUY", "RENT", "VALUATION", "MARKET_ADVICE",
  "PROPERTY_ADVICE", "LEGAL_GENERAL", "PROPERTY_SEARCH",
  "SPECIFIC_PROPERTY_INTEREST", "OTHER",
];

// ONE model call returns the customer reply AND the classification. Forcing
// tool_choice makes Anthropic validate the shape server-side, so the reply
// text travels as a FIELD of the tool input rather than as prose - that is
// what lets a single call do both jobs (no second summariser call).
const RECEPTION_TOOL = {
  name: "reception_reply",
  description:
    "Reply to the visitor AND classify the conversation. Classify conservatively: " +
    "a general market/legal/browsing question stays general even when it mentions " +
    "prices or properties. Use advisory only when the visitor discusses THEIR OWN " +
    "property or THEIR OWN real search/sale. Use qualified only when they ask us to " +
    "act for them. If intent is unclear, use OTHER and ask a short clarifying " +
    "question in the reply instead of guessing.",
  input_schema: {
    type: "object",
    properties: {
      reply: { type: "string", description: "The reply to show the visitor, in their language." },
      stage: { type: "string", enum: RECEPTION_STAGES },
      primaryIntent: { type: "string", enum: RECEPTION_INTENTS },
      secondaryIntents: { type: "array", items: { type: "string", enum: RECEPTION_INTENTS } },
      requirementsSummary: {
        type: "string",
        description:
          "One or two sentences of the visitor OWN stated situation/requirements " +
          "(budget, zone, bedrooms, what they own, timing). Empty string when nothing " +
          "was stated. Never invent facts the visitor did not say.",
      },
      customerName: { type: "string", description: "Only if the visitor actually gave a name, else empty." },
      contact: { type: "string", description: "Only if the visitor actually gave a phone/email/LINE, else empty." },
      // C4.2b — the MINIMAL structured property context. Deliberately three
      // short free-text facts, NOT a property schema: they exist only so the
      // server can tell a real actionable SELL/RENT_OUT inquiry from a weak
      // phrase like "อยากขายบ้าน" WITHOUT counting characters in
      // requirementsSummary (an AI-authored string, so its length measures the
      // model's verbosity, not what the customer said).
      //
      // Each field must be left EMPTY unless the visitor actually stated that
      // fact. Emptiness is the signal - a blank area/scale is what refuses a
      // vague inquiry, so inventing a plausible value defeats the only gate
      // protecting the Staff queue from junk Cases.
      propertyBasics: {
        type: "object",
        description:
          "ONLY for a visitor discussing THEIR OWN property to sell or rent out. " +
          "Each field: exactly what the visitor said, in their own words, or an " +
          "empty string. NEVER guess, infer, or fill from context.",
        properties: {
          kind: { type: "string", description: "What the property is, as stated: e.g. บ้านเดี่ยว, condo, land, townhouse. Empty if not stated." },
          area: { type: "string", description: "Where it is, as stated: e.g. หัวหิน ซอย 70, Pranburi, Cha-am. Empty if not stated." },
          scale: { type: "string", description: "ONE concrete size or price fact as stated: e.g. 3 ห้องนอน, 8 ล้าน, 2 ไร่. Empty if not stated." },
        },
      },
      // C4.3 Phase 1 - TYPED property fields, ADDITIVE to propertyBasics.
      //
      // propertyBasics above is NOT replaced and NOT changed: the C4.2b
      // submission gate reads its three strings, so altering it would move a
      // production gate. This object exists alongside it and feeds the
      // customer's property DRAFT only - nothing here reaches a Case in
      // Phase 1.
      //
      // Keys are the CANONICAL production property field names (the same ones
      // Owner Submission writes and intake-workflow.js reads), so a draft
      // value can later be promoted to the Case with no translation layer and
      // no second schema. Do NOT rename these to workspace-specific names.
      //
      // ABSENCE IS MEANINGFUL AND MUST BE PRESERVED. Omit a key entirely
      // unless the visitor actually stated that fact. Never emit 0, "0",
      // "-", "n/a", "unknown", a guess, or a value inferred from another
      // field. A wrong number here would become a canonical property fact.
      propertyFields: {
        type: "object",
        description:
          "ONLY for a visitor discussing THEIR OWN property to sell or rent out. " +
          "One key per fact the visitor EXPLICITLY stated, using their own meaning. " +
          "OMIT any field not stated - do not include it with an empty or zero " +
          "value. Never guess or infer. If a statement is ambiguous (e.g. \"ประมาณ 100 " +
          "ตารางวา\" or a size with no unit), omit the field and ask about it in " +
          "the reply instead. " +
          // C4.3 Phase 1 fix - MULTI-VALUE AMBIGUITY.
          // Production: the customer said bedrooms could be counted as 3 or 4;
          // the model picked 3 (the value it recommended in its own reply) and
          // reported it as a stated fact, overwriting a clear stored 4. The
          // schema had taught ambiguity only for ranges and missing units, so
          // "A or B" read as "stated, with two candidates - choose one".
          "ALSO OMIT the field whenever the customer presents TWO OR MORE " +
          "plausible alternative values for that SAME field and has not yet " +
          "chosen between them - no matter which language or wording they use. " +
          "You must never pick one of the alternatives yourself. This holds " +
          "even when one alternative seems more reasonable, more conservative, " +
          "more marketable, or is the very value you recommend in your " +
          "natural-language reply: your recommendation is advice to the " +
          "customer, never a fact they stated. Put the field in unclearFields " +
          "instead and ask them to choose.",
        properties: {
          type: { type: "string", description: "Property type, normalised to one of: villa, house, townhouse, condo, land, commercial. บ้านเดี่ยว = house. Omit if not clearly stated." },
          area: { type: "string", description: "Area/district/soi as stated, e.g. หัวหินซอย 70, Pranburi. Omit if not stated." },
          price: { type: "number", description: "Price in THB as a plain number. ขาย 8 ล้านบาท -> 8000000. For RENT_OUT this is the monthly rent. Omit if no price was stated - never 0." },
          landSize: { type: "number", description: "Land size in square wah (ตารางวา). 1 ไร่ = 400, 1 งาน = 100. Omit if not stated or if the unit is unclear." },
          livingArea: { type: "number", description: "Living/usable area in square metres. Omit if not stated." },
          bedrooms: { type: "number", description: "Number of bedrooms as an integer. Omit if not stated." },
          bathrooms: { type: "number", description: "Number of bathrooms as an integer. Omit if not stated." },
          ownership: { type: "string", description: "Title/ownership as stated, e.g. โฉนด, chanote, น.ส.3ก, leasehold, company. Omit if not stated." },
          floor: { type: "string", description: "Floor number, condos only. Omit otherwise." },
          coordsRaw: { type: "string", description: "Map coordinates ONLY if the visitor gave them as decimal lat,lng (e.g. 12.558940,99.909039). Omit anything else - never a place name." },
        },
      },
      // Fields the visitor mentioned but did NOT state clearly enough to
      // record. These become needsConfirmation markers on the draft so the
      // Workspace can ask later; they never carry a value.
      unclearFields: {
        type: "array",
        items: { type: "string" },
        description:
          "Canonical field names (from propertyFields) the visitor referred to " +
          "ambiguously. TWO KINDS of ambiguity both belong here. " +
          "(1) IMPRECISE: a number with no unit, a vague size, an approximate " +
          "amount, a range, a maybe. " +
          "(2) UNRESOLVED ALTERNATIVES: the customer named two or more " +
          "plausible values for the SAME field and has not selected one - " +
          "for example a count that could be either of two numbers, a price " +
          "that could be either of two figures, a property type or title type " +
          "that could be either of two kinds, or any 'not sure whether X or Y' " +
          "/ 'could be counted either way' statement. This rule is about " +
          "MEANING, not about particular words: apply it in every language, " +
          "however the customer phrases it. " +
          "Listing a field here is how you say \"they mentioned it but I " +
          "must not record a value\". " +
          "ALWAYS return this array. Return [] when there is nothing to report. " +
          "Do not omit the array. " +
          "It is NOT ambiguity merely because several numbers appear in the " +
          "sentence. If the customer clearly settles on ONE value - correcting " +
          "an earlier figure, describing a change over time, or choosing " +
          "between options they just raised - that is a CLEAR value: put it in " +
          "propertyFields and leave it out of this list. Max 6.",
      },
      // C4.3 Phase 1 - EVIDENCE CLASSIFICATION, not a confidence score.
      //
      // This is the model's report of WHERE a value came from, and it decides
      // the field's provenance: listed here -> customer_stated, otherwise
      // ai_chat. Provenance governs precedence, so this list is the difference
      // between the customer's own correction landing and being refused.
      //
      // Mechanical unit/format conversion does NOT disqualify a field: "8
      // ล้านบาท" -> 8000000 and "3 ห้องนอน" -> 3 are representations of an
      // explicit statement, not inferences. Only genuine inference is excluded.
      statedFields: {
        type: "array",
        items: { type: "string" },
        description:
          "Canonical field names from propertyFields that the visitor stated " +
          "DIRECTLY AND UNAMBIGUOUSLY IN THEIR CURRENT MESSAGE. Converting " +
          "units or wording into the required format still counts as stated " +
          "(\"ขาย 8 ล้านบาท\" -> price, \"ที่ดิน 100 ตารางวา\" -> landSize, \"3 " +
          "ห้องนอน\" -> bedrooms, \"เปลี่ยนราคาเป็น 7.5 ล้าน\" -> price). OMIT a " +
          "field if you worked the value out rather than being told it - " +
          "inferred from an earlier turn, deduced from another field, assumed " +
          "from the property type, or carried over from context. Do NOT list a " +
          "field merely because you extracted it. " +
          // C4.3 Phase 1 fix - the AI's own judgement is not the customer's word.
          "A value you INFERRED, SELECTED between alternatives, resolved by " +
          "judgement, or RECOMMENDED is not customer-stated just because you " +
          "mentioned it in your reply - mentioning a value never makes it a " +
          "fact the customer gave you. List a field here only when the " +
          "customer's CURRENT message itself states, selects or confirms ONE " +
          "authoritative value for it. " +
          "ALWAYS return this array. Return [] when there is nothing to report. " +
          "Do not omit the array. Max 10.",
      },
      // C4.3 Phase 1 fix #3 - OBSERVATION, not judgement.
      //
      // Two prompt/schema attempts failed in production: the model correctly
      // stopped choosing between "3 or 4 bedrooms", but then reported nothing
      // at all (pfKeys [] / statedKeys [] / unclearKeys []) and explained the
      // ambiguity in `reply`, where nothing reads it. JSON Schema can require
      // an array to be PRESENT; it can never require it to be NON-EMPTY on a
      // condition. So asking the model to judge ambiguity can never be
      // enforced.
      //
      // This field asks a FACTUAL question instead - "which fields is the
      // customer giving property data about right now?" - and the SERVER then
      // derives the ambiguity itself: a field the customer is supplying but
      // for which no value was recorded is, by definition, unresolved. The
      // model's (already reliable) refusal to invent a value becomes the
      // signal. No natural-language parsing anywhere.
      mentionedFields: {
        type: "array",
        items: { type: "string" },
        description:
          "Canonical field names that the CUSTOMER'S CURRENT MESSAGE is " +
          "actually supplying, correcting, confirming, or offering " +
          "alternatives for, about THEIR OWN property. List the field even " +
          "when you did not record a value for it - especially then. " +
          "DO NOT list a field merely because: you mentioned it in your " +
          "reply; an earlier turn discussed it; the customer asked a general " +
          "question about that kind of thing; the field is still missing; or " +
          "you intend to ask about it next. The test is whether THIS message " +
          "from the customer is giving property data about that field. " +
          "ALWAYS return this array. Return [] when the current customer " +
          "message is not supplying, correcting, confirming or discussing any " +
          "canonical property field as property data. Max 12.",
      },
    },
    // C4.3 Phase 1 fix #2 - statedFields and unclearFields are STRUCTURALLY
    // REQUIRED, not merely described.
    //
    // Production: after the multi-value ambiguity wording landed, the model
    // correctly stopped picking one of "3 or 4 bedrooms" - but then reported
    // NOTHING at all (propertyFields {} and unclearFields omitted entirely),
    // explaining the ambiguity in `reply` instead. The draft block is gated on
    // (propertyFields.length || unclearFields.length), so it never ran and the
    // needsConfirmation flag was never raised.
    //
    // Requiring the ARRAYS - never their contents - turns "you may report
    // ambiguity" into "you must state whether there is any". [] remains the
    // correct answer for a clear message.
    required: ["reply", "stage", "primaryIntent", "statedFields", "unclearFields", "mentionedFields"],
  },
};

async function callClaudeReception(system, messages, apiKey) {
  const body = {
    model: "claude-haiku-4-5",
    max_tokens: 900,
    messages,
    tools: [RECEPTION_TOOL],
    tool_choice: { type: "tool", name: RECEPTION_TOOL.name },
  };
  if (system) body.system = system;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Anthropic API error");
  const block = (data.content || []).find((b) => b.type === "tool_use");
  const out = (block && block.input) || {};
  const stage = RECEPTION_STAGES.includes(out.stage) ? out.stage : "general";
  return {
    reply: out.reply || "",
    stage,
    primaryIntent: RECEPTION_INTENTS.includes(out.primaryIntent) ? out.primaryIntent : "OTHER",
    secondaryIntents: Array.isArray(out.secondaryIntents)
      ? out.secondaryIntents.filter((s) => RECEPTION_INTENTS.includes(s)).slice(0, 4) : [],
    requirementsSummary: typeof out.requirementsSummary === "string" ? out.requirementsSummary.slice(0, 600) : "",
    customerName: typeof out.customerName === "string" ? out.customerName.slice(0, 120) : "",
    contact: typeof out.contact === "string" ? out.contact.slice(0, 160) : "",
    // C4.2b — normalised to a 3-string object ALWAYS present in the return
    // value (never undefined), so every caller can read .kind/.area/.scale
    // without guarding. Missing/omitted -> empty strings, which the gate
    // treats as "not stated" and refuses.
    propertyBasics: normalisePropertyBasics(out.propertyBasics),
    // C4.3 Phase 1 - typed draft fields. Always an object (possibly empty);
    // only keys the model actually supplied and that survive validation
    // appear. Never normalised into "present but empty" keys: absence is a
    // meaningful state that must reach the draft writer intact.
    propertyFields: normalisePropertyFields(out.propertyFields),
    unclearFields: Array.isArray(out.unclearFields)
      ? out.unclearFields.filter((k) => DRAFT_FIELD_SPECS[k]).slice(0, 6) : [],
    // Evidence classification. Filtered to known field names here; filtered
    // again at the draft writer against the fields that actually survived
    // validation, so a name listed without a usable value cannot promote
    // anything.
    statedFields: Array.isArray(out.statedFields)
      ? out.statedFields.filter((k) => DRAFT_FIELD_SPECS[k]).slice(0, 10) : [],
    // Observation feed for the server-side ambiguity derivation. Same
    // allow-list filter as the other two arrays, so an unknown name can never
    // reach the derivation.
    mentionedFields: Array.isArray(out.mentionedFields)
      ? out.mentionedFields.filter((k) => DRAFT_FIELD_SPECS[k]).slice(0, 12) : [],
  };
}

// ── C4.3 Phase 1 - canonical draft field specification ───────────────────
//
// The ONLY definition of which fields a property draft may hold. Keys are
// canonical production property field names on purpose: a draft value is a
// future Case value, so a rename here would silently create the parallel
// schema the architecture lock forbids.
//
// `kind` drives validation, nothing else. Bounds are sanity limits against a
// model typo becoming a canonical fact (a 9-bedroom villa is plausible; 900
// is a hallucination). A value outside its bound is DISCARDED, not clamped -
// clamping would invent a fact.
const DRAFT_FIELD_SPECS = {
  type: { kind: "enum", values: ["villa", "house", "townhouse", "condo", "land", "commercial"] },
  area: { kind: "string", max: 120 },
  price: { kind: "number", min: 1, max: 5000000000 },
  landSize: { kind: "number", min: 1, max: 1000000 },
  livingArea: { kind: "number", min: 1, max: 100000 },
  bedrooms: { kind: "int", min: 1, max: 50 },
  bathrooms: { kind: "int", min: 1, max: 50 },
  ownership: { kind: "string", max: 80 },
  floor: { kind: "string", max: 20 },
  coordsRaw: { kind: "coords" },
};

const COORDS_RE = /^\s*-?\d{1,3}(\.\d+)?\s*,\s*-?\d{1,3}(\.\d+)?\s*$/;

// Validate ONE field against its spec. Returns undefined for anything that
// is not a usable stated value - and undefined means "do not write this
// field at all", never "write an empty value".
function validateDraftField(key, raw) {
  const spec = DRAFT_FIELD_SPECS[key];
  if (!spec) return undefined;
  if (raw === null || raw === undefined) return undefined;
  if (spec.kind === "enum") {
    const v = String(raw).trim().toLowerCase();
    return spec.values.includes(v) ? v : undefined;
  }
  if (spec.kind === "string") {
    const v = String(raw).trim();
    // Placeholder words are the model's way of saying "not stated". They must
    // never be recorded as if the customer had said them.
    if (!v || /^(-|--|n\/a|na|none|unknown|ไม่ทราบ|ไม่ระบุ)$/i.test(v)) return undefined;
    return v.slice(0, spec.max);
  }
  if (spec.kind === "coords") {
    const v = String(raw).trim();
    return COORDS_RE.test(v) ? v : undefined;
  }
  // number / int
  const n = Number(raw);
  if (!Number.isFinite(n)) return undefined;
  if (n < spec.min || n > spec.max) return undefined;
  return spec.kind === "int" ? Math.round(n) : n;
}

// Keep only keys that are known AND carry a usable stated value. An omitted
// or rejected field is simply absent from the result.
function normalisePropertyFields(pf) {
  const o = pf && typeof pf === "object" ? pf : {};
  const out = {};
  for (const key of Object.keys(DRAFT_FIELD_SPECS)) {
    const v = validateDraftField(key, o[key]);
    if (v !== undefined) out[key] = v;
  }
  return out;
}

// ── C4.3 Phase 1 - draft identity, provenance and precedence ─────────────
//
// Phase 1 is single-draft by design: ONE working draft per visitor, id
// derived from the caller's own uid. Multi-property (Phase 3) adds further
// drafts; nothing here assumes this is the only one, and the id is
// deterministic so a retry can never fork a second draft.
function draftIdForVisitor(uid) { return "draft__" + uid; }

// Source TIERS, not a flat rank ladder. Two customer-authored sources share
// one tier on purpose.
//
//   1  ai_chat          - AI extraction from the transcript
//   2  customer_stated  - the customer said it in chat, explicitly
//   2  customer_edit    - the customer typed it into the Workspace
//   3  staff_edit       - a staff member entered it
//
// Why customer_stated and customer_edit are EQUAL: both are the customer
// speaking about their own pre-submit working draft, and neither is
// permanently more true than the other. A flat ladder (edit > stated) would
// mean a Workspace edit on Monday could never be corrected by "เปลี่ยนราคาขาย
// เป็น 7.5 ล้าน" on Tuesday - the customer's own newer correction would be
// silently refused. Inside this tier, RECENCY decides.
const DRAFT_SOURCE_TIER = { ai_chat: 1, customer_stated: 2, customer_edit: 2, staff_edit: 3 };

// Every source this code accepts. Used to reject an unknown/forged source
// before it can reach a tier lookup.
const DRAFT_SOURCES = Object.keys(DRAFT_SOURCE_TIER);

// Decide whether an incoming value may replace what is stored.
//
// Rules, in order:
//   1. Nothing stored -> accept.
//   2. Identical value -> refuse, so updatedAt does not churn.
//   3. Incoming tier HIGHER -> accept. A customer correcting an AI
//      extraction, or staff correcting either, always lands.
//   4. Incoming tier LOWER -> REFUSE, regardless of time. This is the stale-AI
//      guard (ai_chat can never touch a customer or staff value) and the
//      staff guard (neither the AI nor the customer silently replaces a
//      staff_edit - post-submit that becomes a Guarded Change, Phase 4).
//   5. SAME tier -> the newer timestamp wins. This is what lets a newer
//      customer_stated correct an older customer_edit and vice versa.
function draftFieldMayWrite(stored, incomingSource, incomingAt, incomingValue) {
  if (!stored || typeof stored !== "object") return true;
  if (stored.value === incomingValue) return false;
  // A stored entry that carries needsConfirmation but no value is a question,
  // not a value: any real value may replace it.
  if (stored.value === undefined) return true;
  const a = DRAFT_SOURCE_TIER[incomingSource] || 0;
  const b = DRAFT_SOURCE_TIER[stored.source] || 0;
  if (a > b) return true;
  if (a < b) return false;
  return Number(incomingAt || 0) > Number(stored.updatedAt || 0);
}

// C4.3 Phase 1 fix - the SAME authority test as above, minus the
// identical-value short-circuit.
//
// Why it exists: an explicit confirmation ("ใช้ราคา 7.5 ล้านบาทเหมือนเดิม")
// carries a value IDENTICAL to what is stored, so draftFieldMayWrite
// correctly refuses it as "nothing to write" - and the field's
// needsConfirmation flag was then stranded at true forever. The VALUE does
// not need changing; the METADATA does. This helper answers the narrower
// question "is this source allowed to touch this field at all?" so a
// metadata-only transition can be authorised without weakening precedence.
//
// `>=` rather than `>` on the timestamp: a confirmation arriving in the same
// millisecond as the stored write is still a confirmation.
function draftFieldAuthorityAllows(stored, incomingSource, incomingAt) {
  if (!stored || typeof stored !== "object") return true;
  if (stored.value === undefined) return true;
  const a = DRAFT_SOURCE_TIER[incomingSource] || 0;
  const b = DRAFT_SOURCE_TIER[stored.source] || 0;
  if (a > b) return true;
  if (a < b) return false;
  return Number(incomingAt || 0) >= Number(stored.updatedAt || 0);
}

// Build the merge patch for a draft document. Pure function, no I/O, so it is
// directly testable and is the single place precedence is enforced.
//
// Returns { patch, applied, refused, confirmations } where `applied` lists the
// fields actually written - the Workspace uses it for the small "✓ เพิ่ม 3
// ห้องนอน" feedback without re-reading the document.
function buildDraftPatch(storedFields, incoming, opts) {
  const o = opts || {};
  const source = DRAFT_SOURCES.includes(o.source) ? o.source : "ai_chat";
  const at = Number(o.at) || Date.now();
  const stored = storedFields && typeof storedFields === "object" ? storedFields : {};
  // Per-field evidence promotion. `stated` names fields the customer said
  // outright in the current turn; those are recorded as customer_stated
  // instead of the batch's default source.
  //
  // DELIBERATELY ONE-WAY AND NARROW: it can only promote ai_chat ->
  // customer_stated. It can never reach customer_edit or staff_edit, so no
  // caller - and no model output - can use it to claim staff authority.
  const statedSet = new Set(Array.isArray(o.stated) ? o.stated.filter((k) => DRAFT_FIELD_SPECS[k]) : []);
  const unclearSet = new Set(Array.isArray(o.unclear) ? o.unclear.filter((k) => DRAFT_FIELD_SPECS[k]) : []);
  const sourceFor = (key) => (source === "ai_chat" && statedSet.has(key) ? "customer_stated" : source);
  const patch = {}, applied = [], refused = [], confirmed = [];
  for (const key of Object.keys(incoming || {})) {
    const value = validateDraftField(key, incoming[key]);
    if (value === undefined) { refused.push(key); continue; }
    const src = sourceFor(key);
    if (!draftFieldMayWrite(stored[key], src, at, value)) {
      // EXPLICIT CONFIRMATION of an already-stored value. All five conditions
      // are required, and each one blocks a specific wrong way to clear the
      // flag:
      //   • same value          - this is a confirmation, not a correction
      //   • flag currently set  - nothing to do otherwise
      //   • NOT listed unclear  - an ambiguous restatement must never resolve
      //                           its own ambiguity
      //   • src is not ai_chat  - an AI re-extraction repeating the number is
      //                           not the customer confirming it
      //   • authority allows    - a customer can never clear a staff_edit flag
      const cur = stored[key];
      if (cur && cur.value === value && cur.needsConfirmation === true &&
          !unclearSet.has(key) && src !== "ai_chat" &&
          draftFieldAuthorityAllows(cur, src, at)) {
        // Metadata-only: value, source and updatedAt are kept EXACTLY as they
        // were. The stored provenance is the original statement's, and a
        // confirmation does not rewrite history.
        patch[key] = { ...cur, needsConfirmation: false };
        confirmed.push(key);
      } else {
        refused.push(key);
      }
      continue;
    }
    const entry = { value, source: src, updatedAt: at };
    // confidence is written ONLY when a GENUINE per-field signal was supplied,
    // and only for AI-derived values. There is no such signal in Phase 1, so
    // in practice this key is absent. A constant would be worse than nothing:
    // a hardcoded 0.8 sitting in Firestore reads like a real 80% model
    // confidence to anyone who finds it later. The schema supports the field;
    // nothing invents it.
    if (src === "ai_chat" && Number.isFinite(o.confidence)) entry.confidence = o.confidence;
    // A recorded value is no longer awaiting confirmation.
    entry.needsConfirmation = false;
    patch[key] = entry;
    applied.push(key);
  }
  // Ambiguous mentions ("ประมาณ 7-8 ล้าน"). An ambiguous statement must never
  // replace a clear stored value - but it must not be silently dropped
  // either, or the contradiction is lost. So:
  //   - nothing stored -> a value-less question the Workspace can ask.
  //   - a value stored -> KEEP the value, its source and its updatedAt
  //     exactly, and only raise needsConfirmation on it.
  const confirmations = [];
  for (const key of unclearSet) {
    if (patch[key]) continue;
    const cur = stored[key];
    if (cur && cur.value !== undefined) {
      if (cur.needsConfirmation === true) continue; // already flagged
      patch[key] = { ...cur, needsConfirmation: true };
    } else {
      patch[key] = { source, updatedAt: at, needsConfirmation: true };
    }
    confirmations.push(key);
  }
  return { patch, applied, refused, confirmed, confirmations };
}

// C4.2b — trim/cap the three property-context strings. Short caps on purpose:
// these are short factual phrases, not descriptions. Anything non-string
// becomes "", which the gate reads as "not stated".
function normalisePropertyBasics(pb) {
  const s = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const o = pb && typeof pb === "object" ? pb : {};
  return { kind: s(o.kind, 80), area: s(o.area, 120), scale: s(o.scale, 80) };
}

// ── C4.2b Step 1 diagnostics (7 ก.ย. 2569) — LOGGING ONLY ────────────
//
// Why this exists: production showed two successful (HTTP 200) receptionTurn
// invocations that produced NO Reception document, and the platform logs
// expose only the HTTP status - not the returned stage, not whether the
// persistence gate refused. So the outcome of a turn was unobservable and the
// cause could not be narrowed from logs alone.
//
// Structured single-line JSON so Cloud Logging parses it into jsonPayload and
// each field is filterable (e.g. jsonPayload.component="receptionTurn").
//
// PRIVACY - HARD RULE: this function logs DECISIONS, never CONTENT. Never add
// reply text, customerText, requirementsSummary, customerName, contact,
// propertyBasics VALUES, trackToken, or the full visitor uid. Presence
// booleans and lengths only. `uidTail` is the last 4 chars of the anonymous
// uid - the same non-identifying fragment already shown in visitorLabel - so
// one visitor's turns can be correlated without storing their identity.
function rxLog(fields) {
  try {
    console.log(JSON.stringify({ component: "receptionTurn", ...fields }));
  } catch (e) { /* logging must never break a turn */ }
}

// receptionTurn: the ONLY write path for Reception AI conversations.
//
// Why a callable and not a client write: firestore.rules sets
// "allow create: if false" on /conversations (a client may never create one)
// and role "ai" messages may never be written by a client. Doing the Claude
// call and the persistence in the SAME server call is also what makes an AI
// message unspoofable - the text the browser receives is the text the server
// just wrote; the browser never supplies it.
//
// Reception docs are deliberately a DIFFERENT KIND in the SAME collection:
//   id      = "reception__<visitorUid>"  (deterministic -> idempotent resume,
//                                          refresh can never duplicate)
//   ownerId = "reception"                (no lister/agent owns it)
//   kind    = "reception"
// Agent-share docs keep id "<ownerId>__<visitorId>", a real ownerId, and NO
// kind field - they are untouched and behave exactly as before. Staff/Owner
// can still read Reception docs because isConvOwner() already includes
// isAdmin(), so NO rules change is required.
//
// Persistence begins ONLY at advisory/qualified. A general question performs
// zero Firestore writes - the reply is returned and nothing is stored.
exports.receptionTurn = onCall(
  { secrets: [ANTHROPIC_API_KEY], region: "asia-southeast1", timeoutSeconds: 120, memory: "512MiB" },
  async (request) => {
    const auth = request.auth;
    // rid = per-invocation correlation id. Returned to the caller so a browser
    // console line and a Cloud Logging line can be tied to the SAME turn.
    const rid = nodeCrypto.randomBytes(6).toString("hex");
    if (!auth) {
      rxLog({ rid, event: "reject", reason: "unauthenticated" });
      throw new HttpsError("unauthenticated", "Sign-in required.");
    }
    const visitorId = auth.uid;
    const uidTail = String(visitorId).slice(-4);
    const { system, messages, customerText, seedMessages, propertyRefs, collectionIds } = request.data || {};
    if (!customerText || !Array.isArray(messages)) {
      rxLog({ rid, event: "reject", reason: "invalid_argument", uidTail,
        hasCustomerText: !!customerText, messagesIsArray: Array.isArray(messages) });
      throw new HttpsError("invalid-argument", "Missing customerText or messages.");
    }

    // Shape of the inbound turn only - counts and roles, never text. The
    // firstMessageRole field is here because Anthropic requires the first
    // message to be a user turn and the client sends its rendered history
    // verbatim; if that is ever the cause, this field shows it without
    // logging a single character of the conversation.
    rxLog({ rid, event: "turn_start", uidTail,
      messagesCount: messages.length,
      firstMessageRole: (messages[0] && messages[0].role) || null,
      seedCount: Array.isArray(seedMessages) ? seedMessages.length : 0,
      systemLen: typeof system === "string" ? system.length : 0 });

    // ONE model call: reply + classification together.
    let out;
    try {
      out = await callClaudeReception(system, messages, ANTHROPIC_API_KEY.value());
    } catch (e) {
      rxLog({ rid, event: "model_error", uidTail, name: (e && e.name) || null,
        code: (e && e.code) || null, msgLen: e && e.message ? String(e.message).length : 0 });
      throw e;
    }

    // Classification outcome BEFORE the gate runs - this is the datum the
    // platform logs could not show. Property-basics fields are reported as
    // presence booleans only, never values.
    // C4.3 Phase 1 fix #3 - derive the ambiguity BEFORE any logging, so the
    // derivation is visible on every turn (including a general-stage turn
    // that returns early) rather than only when a draft write happens.
    const recorded = new Set(Object.keys(out.propertyFields));
    const derivedUnclear = out.mentionedFields.filter((k) => !recorded.has(k));
    const unclearIn = Array.from(new Set([...out.unclearFields, ...derivedUnclear]));

    rxLog({ rid, event: "classified", uidTail,
      stage: out.stage, primaryIntent: out.primaryIntent,
      secondaryIntents: out.secondaryIntents,
      replyLen: (out.reply || "").length,
      hasRequirements: !!out.requirementsSummary,
      hasName: !!out.customerName, hasContact: !!out.contact,
      pbKind: !!out.propertyBasics.kind, pbArea: !!out.propertyBasics.area, pbScale: !!out.propertyBasics.scale,
      // C4.3 Phase 1 fix #2 - extraction diagnostics. FIELD NAMES ONLY.
      // Investigation #2 cost a full round because nothing recorded what the
      // model had returned for these three, so "the model omitted it" could
      // not be separated from "the server dropped it". Canonical field names
      // are not customer content; the PRIVACY rule above still holds - no
      // values, no message text, no name/phone/price/size, no raw payload.
      // Read from the NORMALISED output, so the log describes what the server
      // actually processed rather than what arrived.
      pfKeys: Object.keys(out.propertyFields),
      statedKeys: out.statedFields,
      unclearKeys: out.unclearFields,
      mentionedKeys: out.mentionedFields,
      derivedUnclearKeys: derivedUnclear });

    const db = admin.firestore();
    const conversationId = "reception__" + visitorId;
    const convRef = db.collection("conversations").doc(conversationId);
    let snap;
    try {
      snap = await convRef.get();
    } catch (e) {
      rxLog({ rid, event: "read_error", uidTail, code: (e && e.code) || null, name: (e && e.name) || null });
      throw e;
    }
    const already = snap.exists;
    const docAction = already ? "reused" : "created";

    // Still casual and nothing persisted yet -> store NOTHING.
    if (!already && out.stage === "general") {
      rxLog({ rid, event: "turn_done", uidTail, persisted: false, docAction: "none",
        stage: out.stage, primaryIntent: out.primaryIntent,
        reason: "gate_stage_general_and_no_existing_doc" });
      return { reply: out.reply, meta: out, persisted: false, conversationId: null, rid };
    }

    const now = admin.firestore.FieldValue.serverTimestamp();
    // C4.3 Phase 1 FIX 2 - an EXPLICIT millisecond clock for field-level
    // precedence. `now` above is a serverTimestamp SENTINEL, not a number:
    // passing it as buildDraftPatch's `at` made Number(sentinel) -> NaN, which
    // fell through to Date.now() by accident. Document-level createdAt /
    // updatedAt keep using the sentinel; only the per-field precedence clock
    // is this value, and it is now intentional rather than incidental.
    const nowMs = Date.now();
    let stage = out.stage;
    // C4.3 Phase 1 FIX 1 - declared in the FUNCTION scope, not inside the
    // persistence try block below. The Phase 1 draft block reads it after
    // that block closes; a `const` inside the try was out of scope there and
    // threw ReferenceError on every qualifying turn. Value and semantics are
    // unchanged - only the declaration moved out.
    let nextIntent = out.primaryIntent;
    try {

    if (!already) {
      // Crossing into advisory/qualified: create the doc and seed it with a
      // BOUNDED slice of the recent raw exchange (the evidentiary record of
      // what was actually said) - never the whole casual transcript.
      const seed = (Array.isArray(seedMessages) ? seedMessages : []).slice(-8);
      await convRef.set({
        kind: "reception",
        ownerId: "reception", ownerLabel: "huahin.properties",
        visitorId, visitorLabel: "ผู้เยี่ยมชม " + visitorId.slice(-4),
        conversationStage: out.stage,
        primaryIntent: out.primaryIntent,
        secondaryIntents: out.secondaryIntents,
        requirementsSummary: out.requirementsSummary,
        customerName: out.customerName || "",
        contact: out.contact || "",
        // C4.2b — additive. Always seeded (possibly with empty strings) so the
        // field's SHAPE is stable from the first write; the C4.2b gate then
        // reads it without existence checks.
        propertyBasics: out.propertyBasics,
        propertyRefs: Array.isArray(propertyRefs) ? propertyRefs.slice(0, 10) : [],
        collectionIds: Array.isArray(collectionIds) ? collectionIds.slice(0, 10) : [],
        // linkedCaseIds stays EMPTY in C4.1 - no Case/Demand is created here.
        linkedCaseIds: [],
        status: "ai_handling",
        unreadByOwner: false,
        stageEnteredAt: now, qualifiedAt: out.stage === "qualified" ? now : null,
        lastCustomerActivityAt: now,
        lastMessage: "", lastMessageAt: now, createdAt: now, updatedAt: now,
      });
      for (const m of seed) {
        const role = m && m.role === "assistant" ? "ai" : "customer";
        const text = (m && typeof m.text === "string") ? m.text.slice(0, 4000) : "";
        if (!text) continue;
        await convRef.collection("messages").add({
          role, senderId: role === "ai" ? "ai" : visitorId,
          senderLabel: role === "ai" ? "AI Assistant" : "",
          text, seeded: true, createdAt: now, readByOwner: false, readByCustomer: true,
        });
      }
    }

    // This turn: customer message, then the AI reply the server just produced.
    await convRef.collection("messages").add({
      role: "customer", senderId: visitorId, senderLabel: "",
      text: String(customerText).slice(0, 4000),
      createdAt: now, readByOwner: false, readByCustomer: true,
    });
    await convRef.collection("messages").add({
      role: "ai", senderId: "ai", senderLabel: "AI Assistant", text: out.reply,
      createdAt: now, readByOwner: false, readByCustomer: true,
    });

    // Stage may only advance (general -> advisory -> qualified), never regress:
    // one vague later question must not discard an established intent.
    const prev = already ? (snap.data().conversationStage || "general") : out.stage;
    const rank = (s) => RECEPTION_STAGES.indexOf(s);
    stage = rank(out.stage) > rank(prev) ? out.stage : prev;

    // C4.2b FIX — primaryIntent must not be DOWNGRADED by a later turn.
    //
    // Every other accumulated field in this patch is already protected:
    // conversationStage may only advance (above), and requirementsSummary /
    // customerName / contact / propertyBasics are written only when non-empty.
    // primaryIntent was the one unguarded field, so a process question
    // ("ผมส่งข้อมูลให้ทีมงานแล้วใช่ไหม", "ค่าโอนคิดอย่างไร") classified as OTHER
    // overwrote a stored SELL — and receptionCaseGate then refused the
    // customer's own submission with intent_out_of_scope.
    //
    // The guard is deliberately NARROW: an established SUPPLY-side intent
    // (the two in CASE_INTENTS_C42B) survives a turn that carries no real
    // intent signal. It is NOT a freeze — an explicit switch to the other
    // supply intent still applies (SELL -> RENT_OUT and back), and BUY /
    // RENT / OTHER conversations are untouched, so out-of-scope protection
    // is unchanged in both directions.
    const prevIntent = already ? (snap.data().primaryIntent || "") : "";
    const intentIsSupply = (i) => !!CASE_INTENTS_C42B[i || ""];
    nextIntent = (intentIsSupply(prevIntent) && !intentIsSupply(out.primaryIntent))
      ? prevIntent : out.primaryIntent;

    const patch = {
      kind: "reception",
      conversationStage: stage,
      primaryIntent: nextIntent,
      lastMessage: out.reply, lastMessageRole: "ai",
      lastMessageAt: now, lastCustomerActivityAt: now, updatedAt: now,
    };
    if (out.secondaryIntents.length) patch.secondaryIntents = out.secondaryIntents;
    // Never overwrite a real stored value with an empty extraction.
    if (out.requirementsSummary) patch.requirementsSummary = out.requirementsSummary;
    if (out.customerName) patch.customerName = out.customerName;
    if (out.contact) patch.contact = out.contact;
    // C4.2b — accumulate property context across turns, NEVER erase it.
    // Only non-empty extractions are written, and they go in as a PARTIAL map:
    // set({merge:true}) merges nested maps field-by-field, so writing
    // { propertyBasics: { area: "หัวหิน" } } leaves an earlier kind/scale
    // intact. Writing the whole normalised object here instead would blank
    // previously-captured facts on any later turn that restates only one of
    // them - which would make the gate flap between pass and fail.
    const pbPatch = {};
    if (out.propertyBasics.kind) pbPatch.kind = out.propertyBasics.kind;
    if (out.propertyBasics.area) pbPatch.area = out.propertyBasics.area;
    if (out.propertyBasics.scale) pbPatch.scale = out.propertyBasics.scale;
    if (Object.keys(pbPatch).length) patch.propertyBasics = pbPatch;
    if (stage !== prev) patch.stageEnteredAt = now;
    if (stage === "qualified" && prev !== "qualified") patch.qualifiedAt = now;
    await convRef.set(patch, { merge: true });
    } catch (e) {
      // A write failure previously surfaced only as a generic "internal" to the
      // browser. The original error is rethrown unchanged - behavior is
      // identical, the cause is merely now recorded.
      rxLog({ rid, event: "persist_error", uidTail, docAction,
        stage: out.stage, primaryIntent: out.primaryIntent,
        code: (e && e.code) || null, name: (e && e.name) || null });
      throw e;
    }

    // ── C4.3 Phase 1 — typed property draft ──────────────────────────
    //
    // Written AFTER the Reception document and deliberately NON-FATAL: the
    // draft is a working surface, the Reception document is the thing the
    // C4.2b gate reads. A draft write failure must never cost the customer
    // their turn or their submission, so it is logged and swallowed.
    //
    // Supply-side only. A BUY/RENT visitor has no property of their own to
    // draft, and creating an empty draft for every browser would be noise.
    //
    // FIX 3 - the try starts BEFORE the condition. Previously only the body
    // was protected, so the condition itself (which referenced an
    // out-of-scope binding) threw straight past the handler and cost the
    // customer their turn. Everything the draft needs now sits inside.
    let draftApplied = [];
    let draftConfirmed = [];
    // ADDITIVE (C4.3 Phase 2A-1). Stays null on every path that does not write
    // a draft this turn - a general question performs no draft work and gets
    // no percentage, exactly as before. No existing response key changes.
    let draftCompleteness = null;
    try {
      if (CASE_INTENTS_C42B[nextIntent] &&
          (recorded.size || unclearIn.length)) {
        const draftRef = db.collection("propertyDrafts").doc(draftIdForVisitor(visitorId));
        const res = await db.runTransaction(async (t) => {
          const dSnap = await t.get(draftRef);
          const cur = dSnap.exists ? (dSnap.data() || {}) : {};
          // Ownership is structural (id built from the caller's own uid) but
          // asserted anyway: a draft owned by someone else is never touched.
          if (dSnap.exists && cur.ownerUid && cur.ownerUid !== visitorId) return { applied: [], confirmed: [] };
          const built = buildDraftPatch(cur.fields, out.propertyFields, {
            source: "ai_chat", at: nowMs, unclear: unclearIn,
            // Evidence classification: fields the customer stated outright in
            // THIS turn are recorded as customer_stated, everything else as
            // ai_chat. Without this split an explicit "เปลี่ยนราคาเป็น 7.5 ล้าน"
            // would arrive as ai_chat and be refused against the customer's
            // own earlier Workspace edit.
            stated: out.statedFields,
            // No confidence is passed: there is no genuine per-field signal in
            // Phase 1 and a constant must never be persisted as if there were.
          });
          if (!Object.keys(built.patch).length) return { applied: [], confirmed: [] };
          const doc = {
            ownerUid: visitorId,
            conversationId,
            status: cur.status || "draft",
            updatedAt: now,
            fields: built.patch,
          };
          if (!dSnap.exists) doc.createdAt = now;
          // merge:true merges `fields` key-by-key, so untouched fields and
          // their provenance survive - the same accumulate-never-erase rule
          // propertyBasics already relies on.
          t.set(draftRef, doc, { merge: true });
          // Evaluated on the POST-WRITE field map (stored merged with the
          // patch), inside the transaction, so the number the customer is
          // shown is the number implied by what was just persisted.
          const after = Object.assign({}, cur.fields || {}, built.patch);
          return { applied: built.applied, confirmed: built.confirmed,
            completeness: evaluateDraftCompleteness(after, { validate: validateDraftField }) };
        });
        draftApplied = (res && res.applied) || [];
        draftConfirmed = (res && res.confirmed) || [];
        draftCompleteness = (res && res.completeness) || null;
      }
    } catch (e) {
      // Non-fatal by contract: the customer's turn already succeeded. Log the
      // cause (name included, so a ReferenceError is visible here instead of
      // reaching the browser) and carry on with the normal response.
      rxLog({ rid, event: "draft_error", uidTail, code: (e && e.code) || null, name: (e && e.name) || null });
      draftApplied = [];
      draftConfirmed = [];
      draftCompleteness = null;
    }
    // Field NAMES only - never values. Same privacy rule as every other rxLog
    // call: this function logs decisions, not customer content. `confirmed` is
    // logged separately so a metadata-only confirmation (value unchanged,
    // needsConfirmation cleared) is visible instead of looking like a no-op.
    if (draftApplied.length || draftConfirmed.length) {
      rxLog({ rid, event: "draft_updated", uidTail, fields: draftApplied, confirmed: draftConfirmed,
        derivedUnclearKeys: derivedUnclear });
    }

    rxLog({ rid, event: "turn_done", uidTail, persisted: true, docAction,
      stage, modelStage: out.stage, primaryIntent: out.primaryIntent, reason: "persisted" });
    // draftApplied lets the client show "✓ เพิ่ม 3 ห้องนอน" without a read.
    // Field names only; no values, no provenance.
    // draftCompleteness is ADDITIVE and may be null. Information only: no
    // client or server behaviour may gate submission, approval or publication
    // on it.
    return { reply: out.reply, meta: out, persisted: true, conversationId, stage, rid, draftApplied,
      draftCompleteness };
  }
);

// ── C4.2b Step 1 — Qualified Reception conversation → canonical Property Case
//
// NOT REACHABLE FROM CUSTOMER UI IN THIS STEP. ContactRail has no confirmation
// button yet (Step 2, separately approved), so the only way to invoke this is a
// direct callable invocation. That is deliberate: the server logic is proven in
// isolation before any customer-facing surface can trigger it.
//
// WHY A CALLABLE: the Admin SDK bypasses firestore.rules, which is what lets
// this create a Case whose fields (reviewStatus, caseSource, trackToken) a
// client must never be trusted to set. NO Rules change is required by this
// phase - same reasoning as receptionTurn.
//
// REQUEST CONTRACT - { confirmed: true } AND NOTHING ELSE.
// Every other key in the payload is ignored. The conversation is derived from
// request.auth.uid, exactly as receptionTurn derives it. This is the phase's
// central security property: a caller cannot name a conversation, a Case, a
// property id, or a token, and cannot supply customer or property data. The
// only thing a hostile client can do by calling this repeatedly is create ONE
// Case from ITS OWN already-AI-classified conversation.
//
// Accepting a client-supplied propertyId/caseId "for convenience" would turn
// the token-recovery path into an IDOR. Do not add it later.
const CASE_INTENTS_C42B = { SELL: "sale", RENT_OUT: "rent" };

// A contact must be USABLE, not merely non-empty: "จะบอกทีหลัง" ("I'll tell you
// later") satisfies a presence check and would let a Case reach the Staff queue
// with no way to reach the customer. Phone (>=8 digits after stripping
// separators) OR email OR a LINE id.
function isUsableContact(raw) {
  const s = String(raw || "").trim();
  if (s.length < 5) return false;
  const digits = s.replace(/[^0-9]/g, "");
  if (digits.length >= 8) return true;
  if (/[^\s@]+@[^\s@]+\.[^\s@]+/.test(s)) return true;
  if (/(line|ไลน์)\s*[:：]?\s*\S{3,}/i.test(s)) return true;
  return false;
}

// The five-condition gate, evaluated ONLY against fields the server itself read
// from the Reception document. Returns "" when the conversation may become a
// Case, or a refusal code. Refusal codes are internal: the caller maps them to
// a natural follow-up question and must never surface which field was missing.
function receptionCaseGate(d) {
  if ((d.conversationStage || "") !== "qualified") return "not_qualified";
  if (!CASE_INTENTS_C42B[d.primaryIntent || ""]) return "intent_out_of_scope";
  if (String(d.customerName || "").trim().length < 2) return "missing_name";
  if (!isUsableContact(d.contact)) return "missing_contact";
  const pb = d.propertyBasics || {};
  if (!String(pb.kind || "").trim()) return "insufficient_property_info";
  if (!String(pb.area || "").trim()) return "insufficient_property_info";
  if (!String(pb.scale || "").trim()) return "insufficient_property_info";
  return "";
}

// ── C4.3 Phase 1 — server-authoritative draft mutation ────────────────────
//
// The ONLY write path for a customer-originated draft change. The browser is
// never granted write access to propertyDrafts (see firestore.rules): it may
// read its own draft, and it must come through here to change one.
//
// The client sends field VALUES but never provenance: `source` is decided
// here, so a browser cannot claim staff_edit precedence and overwrite a real
// staff value. Unknown keys and unusable values are discarded, not stored.
//
// Phase 1 exposes this seam so the Phase 2 Workspace UI has an authoritative
// writer to call. No UI calls it yet.
exports.updatePropertyDraft = onCall(
  { region: "asia-southeast1" },
  async (request) => {
    const uid = request.auth && request.auth.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Sign-in required.");
    const fields = (request.data && request.data.fields) || {};
    // PROVENANCE IS NEVER TAKEN FROM THE CLIENT. request.data.source (and any
    // other provenance-shaped key) is ignored entirely: this callable IS the
    // manual-Workspace-edit path, so its source is customer_edit by
    // definition. A browser able to name its own source could claim
    // staff_edit and overwrite real staff data.
    if (typeof fields !== "object" || Array.isArray(fields)) {
      return { updated: false, reason: "invalid_fields" };
    }
    if (Object.keys(fields).length > 20) return { updated: false, reason: "too_many_fields" };

    const db = admin.firestore();
    const ref = db.collection("propertyDrafts").doc(draftIdForVisitor(uid));
    const now = Date.now();
    try {
      return await db.runTransaction(async (t) => {
        const snap = await t.get(ref);
        const cur = snap.exists ? (snap.data() || {}) : {};
        // Ownership: structural via the id, asserted anyway.
        if (snap.exists && cur.ownerUid && cur.ownerUid !== uid) {
          return { updated: false, reason: "not_owner" };
        }
        // Once a draft has produced a Case, canonical data is staff-governed:
        // post-submit changes are Supplements / Guarded Changes (Phase 4),
        // NOT silent draft edits. Refuse rather than mutate.
        if (cur.caseId) return { updated: false, reason: "already_submitted" };
        const built = buildDraftPatch(cur.fields, fields, { source: "customer_edit", at: now });
        if (!Object.keys(built.patch).length) {
          return { updated: false, reason: "nothing_to_apply", refused: built.refused };
        }
        const doc = { ownerUid: uid, status: cur.status || "draft", updatedAt: now, fields: built.patch };
        if (!snap.exists) doc.createdAt = now;
        t.set(ref, doc, { merge: true });
        // Same post-write evaluation as receptionTurn, from the same single
        // evaluator: a Workspace edit and an AI extraction can never disagree
        // about the percentage. ADDITIVE - `updated`/`applied`/`confirmed`/
        // `refused` keep their existing meaning.
        const after = Object.assign({}, cur.fields || {}, built.patch);
        return { updated: true, applied: built.applied, confirmed: built.confirmed, refused: built.refused,
          completeness: evaluateDraftCompleteness(after, { validate: validateDraftField }) };
      });
    } catch (e) {
      console.warn("updatePropertyDraft failed:", (e && e.code) || "error");
      throw new HttpsError("internal", "Could not update the draft.");
    }
  },
);

// ── C4.3 Phase 2A-2 ─────────────────────────────────────────────────────
// getPropertyDraft: READ-ONLY. The single read path that lets the customer's
// Progress indicator survive a page reload.
//
// Why a callable and not a client Firestore read: the draft document stores
// ONLY `fields` - the completeness object (percent/requiredFields/
// completeFields/missingFields/confirmationFields/complete) is never
// persisted, it is derived. A browser reading the document directly would
// therefore have to compute the percentage itself, which would duplicate the
// deterministic standard and let the two definitions drift. This callable
// evaluates with the SAME evaluator (draft-completeness.js) that receptionTurn
// and updatePropertyDraft use, so there is exactly one definition of the
// number a customer can ever see.
//
// REQUEST CONTRACT - nothing. The draft is derived from request.auth.uid
// exactly as the write paths derive it: a caller cannot name a draft, a uid,
// a conversation or a Case.
//
// Writes NOTHING: no draft mutation, no Case, no Reception document, no
// conversation field. Does not touch C4.2a/C4.2b, humanHandlingStartedAt,
// receptionCaseGate or firestore.rules.
exports.getPropertyDraft = onCall(
  { region: "asia-southeast1" },
  async (request) => {
    const uid = request.auth && request.auth.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Sign-in required.");

    const db = admin.firestore();
    try {
      const snap = await db.collection("propertyDrafts").doc(draftIdForVisitor(uid)).get();
      // No draft yet (e.g. the visitor only ever asked a general question) is
      // a normal state, not an error: the client hides the indicator.
      if (!snap.exists) return { exists: false, fields: {}, completeness: null };
      const data = snap.data() || {};
      // Ownership is structural (the id is built from the caller's own uid)
      // but asserted anyway, mirroring the write paths.
      if (data.ownerUid && data.ownerUid !== uid) {
        return { exists: false, fields: {}, completeness: null };
      }
      const fields = data.fields || {};
      return {
        exists: true,
        fields,
        // Same evaluator, same validator, same standard marker as every other
        // completeness number in the system. Informational only: no server or
        // client path may gate submission, approval or publication on it.
        completeness: evaluateDraftCompleteness(fields, { validate: validateDraftField }),
      };
    } catch (e) {
      console.warn("getPropertyDraft failed:", (e && e.code) || "error");
      throw new HttpsError("internal", "Could not read the draft.");
    }
  },
);

exports.createCaseFromConversation = onCall(
  { region: "asia-southeast1" },
  async (request) => {
    const visitorId = request.auth && request.auth.uid;
    if (!visitorId) throw new HttpsError("unauthenticated", "ต้องเข้าสู่ระบบก่อน");
    // Consent is a USER ACTION, never an AI judgement. If this were inferred
    // from the model's output, the AI would be able to create Staff work items
    // on its own initiative - the one design error in this phase that would be
    // hard to walk back.
    if (request.data && request.data.confirmed === true) {
      // ok
    } else {
      return { created: false, reason: "not_confirmed" };
    }

    const db = admin.firestore();
    const conversationId = "reception__" + visitorId;
    const convRef = db.collection("conversations").doc(conversationId);

    // Generated BEFORE the transaction so the transaction body is a pure
    // compare-and-set on linkedCaseIds. Same prefix as Owner Submission: the
    // canonical id deliberately does NOT encode the intake channel (caseSource
    // does that), and storage.rules gates public submission photo uploads on
    // 'own-.*\.webp', so a different prefix would silently break attachments.
    const propertyId = "own-" + Date.now() + "-" + nodeCrypto.randomBytes(4).toString("hex").slice(0, 5);
    // 48 hex chars from the server CSPRNG. Never derived from the id, the uid,
    // or the clock. Length is opaque downstream (Track Submission compares the
    // whole string; firestore.rules tokenOk() enforces only size() > 20), so
    // the approved 24-byte entropy is used with no compatibility concern.
    const trackToken = nodeCrypto.randomBytes(24).toString("hex");
    const now = Date.now();

    let result;
    try {
      result = await db.runTransaction(async (t) => {
        const snap = await t.get(convRef);
        if (!snap.exists) return { created: false, reason: "not_qualified" };
        const d = snap.data() || {};
        // Ownership is structural - the id was built from the caller's own uid,
        // so a mismatch is impossible today. Asserted anyway as defence in
        // depth against a future change to the id scheme.
        if (d.visitorId && d.visitorId !== visitorId) return { created: false, reason: "not_qualified" };

        const linked = Array.isArray(d.linkedCaseIds) ? d.linkedCaseIds : [];
        if (linked.length) {
          // ── RECOVERY PATH (repeat call) — PURE READ, NO WRITES ────────────
          // A double-tap, refresh, retry or network flake must return the
          // customer's real track link, not a scary error. The Case id comes
          // from the SERVER's own read of the conversation it derived from the
          // caller's uid - never from the request - so this cannot be steered
          // toward another customer's Case.
          const existingId = String(linked[0]);
          const caseSnap = await t.get(db.collection("properties").doc(existingId));
          // Unreachable while creation stays atomic (below); fails closed
          // anyway rather than returning a token for a Case we cannot see.
          if (!caseSnap.exists) return { created: false, reason: "case_missing" };
          const c = caseSnap.data() || {};
          // BOTH ends of the link must agree before any token is released. A
          // tampered or corrupted link returns no token at all.
          if (c.conversationId !== conversationId) return { created: false, reason: "link_mismatch" };
          // A recovered token must also be USABLE. Returning created:true with
          // an empty/short token would hand back a trackPath that firestore.rules
          // tokenOk() (size() > 20) refuses - a broken link presented to the
          // customer as success. Fail closed instead; releases no token.
          const recovered = typeof c.trackToken === "string" ? c.trackToken : "";
          if (recovered.length <= 20) return { created: false, reason: "token_unavailable" };
          return {
            created: true, alreadyExisted: true,
            propertyId: existingId, trackToken: recovered,
          };
        }

        const reason = receptionCaseGate(d);
        if (reason) return { created: false, reason };

        const pb = d.propertyBasics || {};
        // ── The canonical Property Case ───────────────────────────────────
        t.create(db.collection("properties").doc(propertyId), {
          // COMPATIBILITY, NOT LAZINESS. `source` is a capability key in
          // firestore.rules (isPublicOwnerSubmission, the trackToken reply
          // branches, the caseMessages tokenOk check) and gates ~15 behaviours
          // in Listing Approvals. Writing anything else here would silently
          // disable the customer's ability to communicate on their own Case.
          source: "owner_submission",
          // The additive channel marker - the ONLY field that says an AI
          // conversation created this Case. C1 created this slot for exactly
          // this value.
          caseSource: "ai_assistant",
          listingStatus: "pending",
          reviewStatus: "submitted",
          status: CASE_INTENTS_C42B[d.primaryIntent],
          // A chat Case is lead-grade: thinner than a form Case by design.
          description: String(d.requirementsSummary || "").slice(0, 600),
          contactName: String(d.customerName || "").slice(0, 120),
          // Kept verbatim. NOT regex-split into contactPhone/contactEmail:
          // those columns are security-relevant downstream, and Staff fill
          // them during review.
          ownerContact: String(d.contact || "").slice(0, 160),
          contactPhone: "", contactEmail: "",
          // Structured property context, carried onto the Case so Staff see
          // the three facts the gate was satisfied by.
          aiPropertyKind: pb.kind || "",
          aiPropertyArea: pb.area || "",
          aiPropertyScale: pb.scale || "",
          // No pin was collected in chat, so the EXISTING intake workflow must
          // see this as an outstanding follow-up - same flags a form
          // submission with no coordinates sets. Reuses existing machinery
          // instead of inventing an "AI case is incomplete" concept.
          locationProvided: false, locationFollowUpNeeded: true,
          coordsRaw: "",
          // Written EXPLICITLY. Owner Submission omits it and works only
          // because intake-workflow.js defaults to intake_v1; a new writer
          // should not inherit that fragility.
          workflowVersion: "intake_v1",
          trackToken,
          submittedAt: now,
          // Provenance / traceability back to the conversation.
          conversationId,
          receptionVisitorId: visitorId,
          qualifiedAt: d.qualifiedAt || null,
          aiPropertyRefs: Array.isArray(d.propertyRefs) ? d.propertyRefs.slice(0, 10) : [],
          customerLanguage: d.customerLanguage || "th",
          // humanHandlingStartedAt is DELIBERATELY ABSENT. C4.2a is locked: the
          // marker is written once, by assignCase(), the first time a human
          // takes responsibility. An AI-created Case has never been touched by
          // a human, so writing it here would permanently disable AI on a Case
          // no human has seen - and would forge the human-handoff record.
        });
        // Same commit as the Case. linkedCaseIds non-empty therefore IMPLIES
        // the Case exists: the dangling-pointer state cannot occur.
        t.update(convRef, {
          linkedCaseIds: [propertyId],
          caseCreatedAt: now,
          status: "case_created",
          updatedAt: now,
        });
        return { created: true, alreadyExisted: false, propertyId, trackToken };
      });
    } catch (e) {
      // NEVER log the error alongside the Case object or the token. Id only.
      console.error("createCaseFromConversation failed", conversationId, propertyId,
        (e && e.message) || String(e));
      throw new HttpsError("internal", "ไม่สามารถเปิดเคสได้ในขณะนี้ กรุณาลองอีกครั้ง");
    }

    if (!result.created) return result;

    // ── Secondary writes — OUTSIDE the transaction, ON PURPOSE ──────────────
    // The lead is already captured. A failed provenance message or activity
    // entry must never roll back or block a created Case (the lesson recorded
    // in Owner Submission's photo-upload handling). Both are best-effort.
    if (!result.alreadyExisted) {
      // ONE read, reused by both secondary writes.
      let d2 = {};
      try { d2 = (await convRef.get()).data() || {}; } catch (e) { d2 = {}; }
      const pb2 = d2.propertyBasics || {};
      try {
        // ONE bounded internal message. The full Reception transcript is NOT
        // copied: it stays at conversations/reception__<uid>/messages, which
        // Staff/Owner can already read (isConvOwner includes isAdmin), so
        // nothing is lost - it is merely not duplicated. Blind-copying would
        // add unbounded writes, drag unrelated chit-chat into a formal work
        // record, and risk mislabelling an internal turn as customer-visible.
        //
        // visibility "internal" is REQUIRED: this text contains the AI's
        // classification and must not be readable by a token-holding customer.
        // It carries NO caseToken for the same reason.
        await db.collection("properties").doc(result.propertyId)
          .collection("caseMessages").add({
            senderType: "system", direction: "internal",
            messageType: "case_provenance", channel: "reception_ai",
            visibility: "internal",
            text:
              "เคสนี้สร้างจากการสนทนากับผู้ช่วย AI (ลูกค้ายืนยันเปิดเคสแล้ว)\n" +
              "ประเภททรัพย์: " + (pb2.kind || "-") + "\n" +
              "พื้นที่: " + (pb2.area || "-") + "\n" +
              "ขนาด/ราคาที่ลูกค้าระบุ: " + (pb2.scale || "-") + "\n" +
              "ความต้องการ: " + (d2.requirementsSummary || "-") + "\n" +
              "ชื่อ: " + (d2.customerName || "-") + " · ติดต่อ: " + (d2.contact || "-") + "\n" +
              "conversation: " + conversationId,
            createdAt: now, readByStaff: false,
          });
      } catch (e) {
        console.warn("case provenance message failed", result.propertyId,
          (e && e.message) || String(e));
      }
      try {
        // No trackToken field. A customer holding the token can read
        // caseMessages, and activityLog is internal - neither may carry it.
        await db.collection("activityLog").add({
          type: "case_created_from_reception",
          propertyId: result.propertyId, caseId: result.propertyId,
          conversationId, caseSource: "ai_assistant",
          primaryIntent: d2.primaryIntent || "",
          at: now, createdAt: now,
          summary: "สร้างเคส " + result.propertyId + " จากการสนทนากับผู้ช่วย AI",
        });
      } catch (e) {
        console.warn("case activityLog failed", result.propertyId,
          (e && e.message) || String(e));
      }
    }

    // Only safe, customer-facing identifiers. No assignee, no reviewStatus, no
    // classification, no conversation internals.
    return {
      created: true,
      alreadyExisted: !!result.alreadyExisted,
      propertyId: result.propertyId,
      trackToken: result.trackToken,
      trackPath: "Track%20Submission.dc.html?id=" +
        encodeURIComponent(result.propertyId) + "&t=" + result.trackToken,
    };
  }
);

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
      const title = "huahin.properties";
      const description = name === FALLBACK
        ? "ติดต่อเจ้าของทรัพย์โดยตรง ที่ปรึกษาอสังหาริมทรัพย์หัวหิน"
        : `ติดต่อ ${name} โดยตรง ที่ปรึกษาอสังหาริมทรัพย์หัวหิน`;
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
      const nameBlockTop = 335;
      ctx.fillStyle = textColor;
      nameLines.forEach((line, i) => {
        ctx.font = `700 ${nameSize}px ${FONT_FAMILY}`;
        ctx.fillText(line, cx, nameBlockTop + i * nameLineHeight);
      });
      let y = nameBlockTop + (nameLines.length - 1) * nameLineHeight;

      // Order (approved): Name → Property Page → description → by huahin.properties.
      // Consistent proportional gaps between each block for a tidier, more
      // deliberate vertical rhythm instead of ad hoc offsets — kept tight
      // enough that all 4 lines fit inside the 630px canvas even with a
      // 2-line name or 2-line description.
      const pageSize = Math.round(nameSize * 0.46);
      const brandSize = Math.round(nameSize * 0.5);
      const descSize = Math.round(nameSize * 0.38);

      y += nameSize * 0.75 + pageSize * 0.7;
      ctx.font = `600 ${pageSize}px ${FONT_FAMILY}`;
      ctx.fillStyle = subColor;
      ctx.fillText("P R O P E R T Y   P A G E", cx, y);

      const descText = name === FALLBACK
        ? "ดูทรัพย์ทั้งหมด และติดต่อเจ้าของทรัพย์ได้โดยตรง"
        : `ดูทรัพย์ทั้งหมด และติดต่อ ${name} ได้โดยตรง`;
      const descLines = wrapByWords(descText, `400 ${descSize}px ${FONT_FAMILY}`, W - 200).slice(0, 2);
      y += pageSize * 0.7 + descSize * 1.05;
      ctx.font = `400 ${descSize}px ${FONT_FAMILY}`;
      ctx.fillStyle = subColor;
      descLines.forEach((line, i) => {
        ctx.fillText(line, cx, y + i * descSize * 1.25);
      });
      y += (descLines.length - 1) * descSize * 1.25;

      y += descSize * 0.7 + brandSize * 1.05;
      ctx.font = `500 ${brandSize}px ${FONT_FAMILY}`;
      ctx.fillStyle = subColor;
      ctx.fillText("By: huahin.properties", cx, y);

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

// ── LINE notification to the Owner when a listing needs approval ──
// Fires whenever a property document is written with listingStatus
// "pending_owner" (Staff prepared it and pressed "ส่งให้ Owner อนุมัติ") or
// "pending" (an external member submitted). Sends a LINE push message to the
// Owner's LINE user id so they can approve from their phone while out.
//
// SETUP REQUIRED BEFORE THIS WORKS (Owner does this once):
//   1. Create a LINE Messaging API channel (LINE Developers Console)
//   2. Get its Channel Access Token (long-lived)
//   3. Add friend / follow that channel with your own LINE account
//   4. Set the secrets:
//        firebase functions:secrets:set LINE_MESSAGING_TOKEN
//        firebase functions:secrets:set LINE_OWNER_USER_ID
// Until both secrets exist this function logs and exits quietly — it never
// blocks or breaks the listing save.
const LINE_MESSAGING_TOKEN = defineSecret("LINE_MESSAGING_TOKEN");
const LINE_OWNER_USER_ID = defineSecret("LINE_OWNER_USER_ID");

exports.notifyOwnerApproval = onDocumentWritten(
  {
    document: "properties/{propertyId}",
    region: "asia-southeast1",
    secrets: [LINE_MESSAGING_TOKEN, LINE_OWNER_USER_ID],
  },
  async (event) => {
    try {
      const after = event.data && event.data.after && event.data.after.data();
      const before = event.data && event.data.before && event.data.before.data();
      if (!after) return;
      const newStatus = after.listingStatus;
      const oldStatus = before ? before.listingStatus : null;
      // Only fire on a fresh transition INTO an approval-waiting state.
      if (newStatus !== "pending_owner" && newStatus !== "pending") return;
      if (oldStatus === newStatus) return;

      let token = "";
      let ownerId = "";
      try { token = LINE_MESSAGING_TOKEN.value(); } catch (e) {}
      try { ownerId = LINE_OWNER_USER_ID.value(); } catch (e) {}
      if (!token || !ownerId) {
        console.log("notifyOwnerApproval: LINE secrets not configured yet — skipping push");
        return;
      }

      const code = event.params.propertyId;
      const titleTh = (after.title && (after.title.th || after.title.en)) || code;
      const price = Number(after.price) || 0;
      const zone = (after.zone && (after.zone.th || after.zone.en)) || after.zone || "-";
      const who = newStatus === "pending_owner" ? "ทีมงาน" : "สมาชิก";
      const text = [
        "🔔 มีประกาศรออนุมัติ",
        "",
        `${who}เตรียมประกาศไว้แล้ว รอคุณตรวจและอนุมัติ`,
        "",
        `📌 ${titleTh}`,
        `💰 ${price.toLocaleString()} บาท`,
        `📍 ${zone}`,
        `🏷️ รหัส ${code}`,
        "",
        "ตรวจและอนุมัติที่:",
        `${SITE_URL}/Listing%20Approvals.dc.html`,
      ].join("\n");

      const res = await fetch("https://api.line.me/v2/bot/message/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ to: ownerId, messages: [{ type: "text", text }] }),
      });
      if (!res.ok) {
        console.error("notifyOwnerApproval: LINE push failed", res.status, await res.text());
      }
    } catch (e) {
      console.error("notifyOwnerApproval failed:", e);
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
