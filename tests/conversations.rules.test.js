// Emulator Security Tests — Conversation Ownership (simplified v1 schema)
//
// Run with the Firestore Emulator (NOT production):
//
//   npm install
//   npm run test:rules
//
// This file was WRITTEN by this implementation pass but has NOT been
// EXECUTED — running the emulator requires terminal/CLI access this
// environment does not have. Treat it as "tests ready to run," not
// "tests passed."

const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require("@firebase/rules-unit-testing");
const fs = require("fs");

let testEnv;

const OWNER_A = "owner-a-uid";
const OWNER_B = "owner-b-uid";
const VISITOR_A = "visitor-a-uid";
const VISITOR_B = "visitor-b-uid";

const CONV_A = `${OWNER_A}__${VISITOR_A}`;
const CONV_B = `${OWNER_B}__${VISITOR_B}`;

function baseConversation(ownerId, visitorId) {
  return {
    ownerId, ownerLabel: "Test Owner",
    senderId: ownerId, senderLabel: "Test Owner",
    visitorId, visitorLabel: "ผู้เยี่ยมชม test",
    collectionIds: ["HH-101"],
    propertyRefs: [{ propertyId: "HH-101", title: "Test Villa", price: 5000000, thumbnailUrl: "" }],
    status: "ai_handling",
    unreadByOwner: false,
    lastMessage: "", lastMessageAt: new Date(),
    createdAt: new Date(), updatedAt: new Date(),
  };
}

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "huahin-properties-5f1b5-test",
    firestore: { rules: fs.readFileSync("firestore.rules", "utf8") },
  });
});

after(async () => {
  if (testEnv) await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await db.collection("conversations").doc(CONV_A).set(baseConversation(OWNER_A, VISITOR_A));
    await db.collection("conversations").doc(CONV_B).set(baseConversation(OWNER_B, VISITOR_B));
  });
});

describe("Conversation Ownership — Security Rules (simplified v1)", () => {
  it("1. Visitor A cannot read Visitor B's conversation", async () => {
    const asA = testEnv.authenticatedContext(VISITOR_A).firestore();
    await assertFails(asA.collection("conversations").doc(CONV_B).get());
  });

  it("2. Visitor A cannot write role=owner message", async () => {
    const asA = testEnv.authenticatedContext(VISITOR_A).firestore();
    await assertFails(
      asA.collection("conversations").doc(CONV_A).collection("messages").add({
        role: "owner", text: "fake owner message", senderId: VISITOR_A, createdAt: new Date(),
      })
    );
  });

  it("3. Visitor A cannot write role=ai message", async () => {
    const asA = testEnv.authenticatedContext(VISITOR_A).firestore();
    await assertFails(
      asA.collection("conversations").doc(CONV_A).collection("messages").add({
        role: "ai", text: "fake AI message", senderId: "ai", createdAt: new Date(),
      })
    );
  });

  it("4. Owner A cannot read Owner B's conversation", async () => {
    const asOwnerA = testEnv.authenticatedContext(OWNER_A).firestore();
    await assertFails(asOwnerA.collection("conversations").doc(CONV_B).get());
  });

  it("5. Owner cannot change visitorId on an existing conversation", async () => {
    const asOwnerA = testEnv.authenticatedContext(OWNER_A).firestore();
    await assertFails(
      asOwnerA.collection("conversations").doc(CONV_A).update({ visitorId: "someone-else" })
    );
  });

  it("6. Unauthenticated cannot read a conversation", async () => {
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertFails(anon.collection("conversations").doc(CONV_A).get());
  });

  // NOTE: uses the same hardcoded admin UID as firestore.rules' isAdmin().
  // If that UID is rotated, update it here too.
  it("7. Admin can read any conversation", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      const raw = await ctx.firestore().collection("conversations").doc(CONV_A).get();
      console.log("DEBUG raw CONV_A exists:", raw.exists, "data:", JSON.stringify(raw.data()));
    });
    const asAdmin = testEnv.authenticatedContext("n7TZKSBscPXE1kRU8WzYpsqJh2g2").firestore();
    try {
      await asAdmin.collection("conversations").doc(CONV_A).get();
    } catch (e) {
      console.log("DEBUG Admin-read failure:", e.message, e.code);
      throw e;
    }
    await assertSucceeds(asAdmin.collection("conversations").doc(CONV_B).get());
  });

  it("Positive: Visitor A CAN read their own conversation", async () => {
    const asA = testEnv.authenticatedContext(VISITOR_A).firestore();
    await assertSucceeds(asA.collection("conversations").doc(CONV_A).get());
  });

  it("Positive: Owner A CAN read their own conversation", async () => {
    const asOwnerA = testEnv.authenticatedContext(OWNER_A).firestore();
    try {
      await asOwnerA.collection("conversations").doc(CONV_A).get();
    } catch (e) {
      console.log("DEBUG Owner-read failure:", e.message);
      throw e;
    }
  });

  it("Positive: Visitor A CAN write their own customer message", async () => {
    const asA = testEnv.authenticatedContext(VISITOR_A).firestore();
    try {
      await asA.collection("conversations").doc(CONV_A).collection("messages").add({
        role: "customer", text: "hello", senderId: VISITOR_A, createdAt: new Date(),
      });
    } catch (e) {
      console.log("DEBUG Visitor-write failure:", e.message);
      throw e;
    }
  });

  it("Positive: Owner A CAN write role=owner message on their own conversation", async () => {
    const asOwnerA = testEnv.authenticatedContext(OWNER_A).firestore();
    try {
      await asOwnerA.collection("conversations").doc(CONV_A).collection("messages").add({
        role: "owner", text: "hi, this is the owner", senderId: OWNER_A, createdAt: new Date(),
      });
    } catch (e) {
      console.log("DEBUG Owner-write failure:", e.message);
      throw e;
    }
  });

  it("No client can create a conversation doc directly (server-only via Callable Function)", async () => {
    const asA = testEnv.authenticatedContext(VISITOR_A).firestore();
    await assertFails(
      asA.collection("conversations").doc(`${OWNER_A}__new-visitor`).set(baseConversation(OWNER_A, "new-visitor"))
    );
  });
});

// ── C4.1 Reception conversations ────────────────────────────────────────
// Reception docs are the SAME collection, a different kind: deterministic
// id "reception__<visitorUid>", ownerId "reception", kind "reception".
// These tests assert the additive discriminator needs NO rules change and
// leaves agent-share semantics untouched.

const RECEPTION_A = `reception__${VISITOR_A}`;
const RECEPTION_B = `reception__${VISITOR_B}`;

function receptionConversation(visitorId) {
  return {
    kind: "reception",
    ownerId: "reception", ownerLabel: "huahin.properties",
    visitorId, visitorLabel: "ผู้เยี่ยมชม test",
    conversationStage: "advisory",
    primaryIntent: "BUY",
    secondaryIntents: [],
    requirementsSummary: "งบ 5 ล้าน โซนหัวหิน",
    customerName: "", contact: "",
    propertyRefs: [], collectionIds: [], linkedCaseIds: [],
    status: "ai_handling", unreadByOwner: false,
    stageEnteredAt: new Date(), qualifiedAt: null,
    lastCustomerActivityAt: new Date(),
    lastMessage: "", lastMessageAt: new Date(),
    createdAt: new Date(), updatedAt: new Date(),
  };
}

describe("C4.1 Reception conversations", () => {
  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();
      await db.collection("conversations").doc(RECEPTION_A).set(receptionConversation(VISITOR_A));
      await db.collection("conversations").doc(RECEPTION_B).set(receptionConversation(VISITOR_B));
      await db.collection("conversations").doc(RECEPTION_A).collection("messages").add({
        role: "ai", senderId: "ai", senderLabel: "AI Assistant", text: "server-authored reply", createdAt: new Date(),
      });
    });
  });

  it("R1. Visitor A can read their own Reception conversation (idempotent resume)", async () => {
    const asA = testEnv.authenticatedContext(VISITOR_A).firestore();
    await assertSucceeds(asA.collection("conversations").doc(RECEPTION_A).get());
  });

  it("R2. Visitor A cannot read Visitor B's Reception conversation", async () => {
    const asA = testEnv.authenticatedContext(VISITOR_A).firestore();
    await assertFails(asA.collection("conversations").doc(RECEPTION_B).get());
  });

  it("R3. Visitor A can read the messages of their own Reception conversation", async () => {
    const asA = testEnv.authenticatedContext(VISITOR_A).firestore();
    await assertSucceeds(asA.collection("conversations").doc(RECEPTION_A).collection("messages").get());
  });

  it("R4. Visitor A cannot read Visitor B's Reception messages", async () => {
    const asA = testEnv.authenticatedContext(VISITOR_A).firestore();
    await assertFails(asA.collection("conversations").doc(RECEPTION_B).collection("messages").get());
  });

  it("R5. Visitor cannot create a Reception conversation directly (receptionTurn only)", async () => {
    const asA = testEnv.authenticatedContext(VISITOR_A).firestore();
    await assertFails(
      asA.collection("conversations").doc(`reception__${VISITOR_A}-new`).set(receptionConversation(`${VISITOR_A}-new`))
    );
  });

  it("R6. Visitor cannot spoof an AI message into their own Reception conversation", async () => {
    const asA = testEnv.authenticatedContext(VISITOR_A).firestore();
    await assertFails(
      asA.collection("conversations").doc(RECEPTION_A).collection("messages").add({
        role: "ai", senderId: "ai", text: "fake AI reply", createdAt: new Date(),
      })
    );
  });

  it("R7. Visitor cannot rewrite classification fields on their Reception doc", async () => {
    const asA = testEnv.authenticatedContext(VISITOR_A).firestore();
    await assertFails(
      asA.collection("conversations").doc(RECEPTION_A).update({ conversationStage: "qualified" })
    );
  });

  it("R8. Unauthenticated cannot read any Reception conversation", async () => {
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertFails(anon.collection("conversations").doc(RECEPTION_A).get());
  });

  it("R9. Admin can read a Reception conversation (staff visibility, no rules change)", async () => {
    const asAdmin = testEnv.authenticatedContext("n7TZKSBscPXE1kRU8WzYpsqJh2g2").firestore();
    await assertSucceeds(asAdmin.collection("conversations").doc(RECEPTION_A).get());
  });

  it("R10. A lister/agent owner query (ownerId == their uid) never returns Reception docs", async () => {
    const asOwnerA = testEnv.authenticatedContext(OWNER_A).firestore();
    const snap = await asOwnerA.collection("conversations").where("ownerId", "==", OWNER_A).get();
    if (snap.docs.some((d) => d.id.startsWith("reception__"))) {
      throw new Error("Reception doc leaked into an agent-share owner inbox query");
    }
  });

  it("R11. Visitor cannot list all conversations (unscoped query denied)", async () => {
    const asA = testEnv.authenticatedContext(VISITOR_A).firestore();
    await assertFails(asA.collection("conversations").get());
  });

  it("R12. Visitor cannot list all Reception docs by ownerId == 'reception'", async () => {
    const asA = testEnv.authenticatedContext(VISITOR_A).firestore();
    await assertFails(asA.collection("conversations").where("ownerId", "==", "reception").get());
  });

  it("R13. Legacy agent-share doc WITHOUT a `kind` field still reads normally", async () => {
    const asVisitorA = testEnv.authenticatedContext(VISITOR_A).firestore();
    const legacy = await asVisitorA.collection("conversations").doc(CONV_A).get();
    if (legacy.data().kind !== undefined) throw new Error("legacy fixture unexpectedly has a kind field");
    const asOwnerA = testEnv.authenticatedContext(OWNER_A).firestore();
    await assertSucceeds(asOwnerA.collection("conversations").doc(CONV_A).get());
    await assertSucceeds(asOwnerA.collection("conversations").doc(CONV_A).collection("messages").get());
  });

  it("R14. Agent-share owner inbox query still works while Reception docs exist", async () => {
    const asOwnerA = testEnv.authenticatedContext(OWNER_A).firestore();
    const snap = await asOwnerA.collection("conversations").where("ownerId", "==", OWNER_A).get();
    if (snap.empty) throw new Error("agent-share owner inbox returned nothing");
  });
});
