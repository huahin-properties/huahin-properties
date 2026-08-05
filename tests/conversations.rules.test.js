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
