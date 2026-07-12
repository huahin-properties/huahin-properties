// functions/index.js
//
// A single HTTPS Cloud Function that proxies requests to the Anthropic API.
// The real API key lives ONLY here, in Firebase's server-side Secret
// Manager — it is never present in any file the browser downloads, so it
// can't be stolen by viewing page source / devtools.
//
// The web app (AI Quick Add.dc.html) calls this function's URL instead of
// window.claude.complete when running outside the Claude.ai preview.

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");

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
