// CHAT-LIVE-01 — must run AFTER gate.test.js in the same mocha process (see `npm run test:chat-live-combined`).
// Confirms the gate tests left no simulated state behind for other suites.
"use strict";
const assert = require("assert");
const path = require("path");
const { assertEmulatorOnly } = require("../helpers/synthetic");
assertEmulatorOnly();
const GATE_SRC = path.join(__dirname, "..", "..", "functions", "chat-test-gate.js");

describe("CHAT-LIVE-01 after the gate suite (same process)", () => {
  it("Z1 the shared gate is back on its runtime provider and its state equals what the runtime yields (not a leftover simulation)", () => {
    const gm = require(GATE_SRC); const gate = gm.sharedGate();
    assert.strictEqual(gate.__testOnly.isRuntimeProvider(), true);
    assert.strictEqual(gate.state(), gm.stateFor(gm.runtimeProjectId(process.env), process.env));
    assert.strictEqual(gate.state(), "off");
  });
  it("Z2 the emulator environment variables the gate tests touched are back to their original, loopback values", () => {
    assert.ok(/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(process.env.FIRESTORE_EMULATOR_HOST || ""), String(process.env.FIRESTORE_EMULATOR_HOST));
    assert.ok(!process.env.FIREBASE_AUTH_EMULATOR_HOST || /^(127\.0\.0\.1|localhost)(:\d+)?$/.test(process.env.FIREBASE_AUTH_EMULATOR_HOST), String(process.env.FIREBASE_AUTH_EMULATOR_HOST));
  });
});
