// One-time setup script: creates the adminUsers/{uid} Identity Document
// required by functions/index.js's resolveSenderIdentity() so this account
// can own Conversations (Owner Inbox, shared Collection links).
//
// This is A+ from the Product Owner's decision: every account that can
// share a Collection link must have a Firestore Identity Document that
// the Cloud Function resolves from — never a hardcoded UID, never a
// silent "admin" fallback. Run this once per new Owner/Admin account.
//
// USAGE (run in a trusted admin context — e.g. Firebase Console > Firestore,
// or via the Firebase Admin SDK in a Cloud Shell/Codespace with credentials):
//
//   node create-admin-identity.js
//
// Requires GOOGLE_APPLICATION_CREDENTIALS or being run inside an
// authenticated Firebase/GCP environment (e.g. `firebase login` done,
// or a service account key configured).

const admin = require("firebase-admin");
if (!admin.apps.length) admin.initializeApp();

const UID = "n7TZKSBscPXE1kRU8WzYpsqJh2g2"; // doothailand — confirmed via Firebase Console > Authentication
const DISPLAY_NAME = "huahin.properties"; // shown to customers as "ownerLabel" when this account shares a Collection link

async function main() {
  const db = admin.firestore();
  await db.collection("adminUsers").doc(UID).set(
    {
      displayName: DISPLAY_NAME,
      role: "owner",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
  console.log(`adminUsers/${UID} created/updated. resolveSenderIdentity() will now resolve this account correctly.`);
}

main().catch((e) => {
  console.error("Failed to create adminUsers identity document:", e);
  process.exit(1);
});
