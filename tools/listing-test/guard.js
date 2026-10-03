// LISTING TEST-site guard (a copy of tools/chat-live/guard.js with ONE addition, see below).
// CHAT-LIVE-01 test-site guard. Runs FIRST (before support.js, before any
// Firebase SDK <script> is inserted, before any app code). If anything is
// missing or does not match the test project it paints a red stop banner and
// never loads the app, so nothing can fall back to production.
(function () {
  // The whole page body is shipped inside <template id="chat-live-app"> (inert: no
  // script runs, no SDK/font/image is fetched). Only after every check below passes
  // does __chatLiveStart() instantiate it and then load support.js.
  window.__chatLiveStart = function () {
    if (!window.__CHAT_LIVE_OK__) return;
    var t = document.getElementById("chat-live-app");
    if (!t) return;
    var frag = t.content;
    // support.js's helmet manager inserts the <helmet> SDK/CSS tags itself (in order). Re-inserting
    // them here made the SDK load twice and wiped the Firebase app (found in the browser test).
    Array.prototype.slice.call(frag.querySelectorAll("script[src]")).forEach(function (el) { el.parentNode.removeChild(el); });
    // LISTING TEST addition (found by BROWSER-LOCAL-01): INLINE scripts inside <helmet> (Agent Signup's Firebase loader) ran twice — once when this fragment is
    // appended and once more when support.js's helmet manager processes the same <helmet> — so the Firebase SDK was loaded twice and the second copy replaced the
    // global ("Firebase is already defined"), leaving firebase.firestore undefined. In production the helmet is processed once; here it must be too.
    Array.prototype.slice.call(frag.querySelectorAll("helmet script")).forEach(function (el) { el.parentNode.removeChild(el); });
    document.body.appendChild(frag);
    var s = document.createElement("script"); s.async = false; s.src = "./support.js"; document.body.appendChild(s);
  };
  var C = window.__CHAT_LIVE__;
  var PROD_MARKERS = ["huahin-properties-5f1b5", "5f1b5", "auth.huahin.properties", "claudecomplete-3j4ldf4pja"];
  var REQUIRED = ["projectId", "apiKey", "appId", "messagingSenderId", "authDomain", "storageBucket", "region", "claudeCompleteUrl", "allowedHosts"];
  function stop(reason) {
    window.__CHAT_LIVE_BLOCKED__ = reason;
    var d = document.createElement("div");
    d.setAttribute("data-chat-live-stop", "1");
    d.style.cssText = "position:fixed;inset:0;z-index:2147483647;background:#b00020;color:#fff;font:16px/1.5 sans-serif;padding:32px;";
    d.textContent = "ไม่ใช่ระบบทดสอบ / คอนฟิกไม่ครบ — หยุดการทำงาน (" + reason + ")";
    (document.body || document.documentElement).appendChild(d);
  }
  if (!C || typeof C !== "object") return stop("no-config");
  for (var i = 0; i < REQUIRED.length; i++) {
    var v = C[REQUIRED[i]];
    if (v === undefined || v === null || v === "" || (Array.isArray(v) && !v.length)) return stop("missing:" + REQUIRED[i]);
  }
  var blob = JSON.stringify(C);
  for (var j = 0; j < PROD_MARKERS.length; j++) if (blob.indexOf(PROD_MARKERS[j]) !== -1) return stop("production-value-in-config");
  if (C.claudeCompleteUrl !== "https://asia-southeast1-" + C.projectId + ".cloudfunctions.net/claudeComplete") return stop("claudeComplete-url-not-bound-to-project");
  if (C.authDomain !== C.projectId + ".firebaseapp.com" || String(C.storageBucket).indexOf(C.projectId + ".") !== 0) return stop("config-not-bound-to-project");
  var host = location.hostname;
  var loopback = (host === "localhost" || host === "127.0.0.1");
  if (!(loopback || C.allowedHosts.indexOf(host) !== -1)) return stop("host-not-allowed");
  // Belt and braces: refuse any request whose URL names a production marker,
  // even if some file the build missed still carries one.
  function bad(u) { u = String(u || ""); for (var k = 0; k < PROD_MARKERS.length; k++) if (u.indexOf(PROD_MARKERS[k]) !== -1) return true; return /^https?:\/\/([a-z0-9-]+\.)*huahin\.properties(\/|$)/i.test(u); }
  var f = window.fetch;
  if (f) window.fetch = function (input, init) { var u = (input && input.url) || input; if (bad(u)) return Promise.reject(new Error("chat-live: blocked production URL")); return f.call(this, input, init); };
  var xo = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (m, u) { if (bad(u)) throw new Error("chat-live: blocked production URL"); return xo.apply(this, arguments); };
  // Visible TEST bar + the tester's own uid (so the owner can allow-list it).
  var bar = document.createElement("div");
  bar.id = "chat-live-bar";
  bar.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:2147483000;background:#ffe600;color:#000;font:12px/1.4 monospace;padding:4px 10px;";
  bar.textContent = "TEST — ข้อมูลสังเคราะห์เท่านั้น · โปรเจกต์ " + C.projectId;
  (document.body || document.documentElement).appendChild(bar);
  var t = setInterval(function () {
    try { var u = window.firebase && window.firebase.apps.length && window.firebase.auth().currentUser; if (u) { bar.textContent = "TEST — ข้อมูลสังเคราะห์เท่านั้น · โปรเจกต์ " + C.projectId + " · รหัสผู้ทดสอบ (UID): " + u.uid; clearInterval(t); } } catch (e) {}
  }, 1000);
  window.__CHAT_LIVE_OK__ = true;
})();
