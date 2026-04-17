/**
 * CloserAI Chat Widget v3.0 - Premium Edition
 * Embed on any website: <script src="https://closerai-app.vercel.app/widget.js" data-api-key="YOUR_KEY"></script>
 * Stripe/Linear quality design. Fully responsive. Lightweight (~15KB).
 */
(function () {
  "use strict";

  var script = document.currentScript;
  if (!script) return;
  var API_KEY = script.getAttribute("data-api-key");
  if (!API_KEY) { console.error("CloserAI: Missing data-api-key"); return; }

  var BASE_URL = script.src.replace("/widget.js", "");
  var config = {};
  var conversationId = null;
  // Persist conversation across page navigations using sessionStorage
  try { conversationId = sessionStorage.getItem("cai_conv_" + API_KEY) || null; } catch(e) {}
  var isOpen = false;
  var isLoading = false;

  function isValidHexColor(c) { return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(c); }
  function escapeHtml(t) { var d = document.createElement("div"); d.textContent = t; return d.innerHTML; }

  function loadConfig() {
    fetch(BASE_URL + "/api/widget/config?key=" + API_KEY)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.error) { console.error("CloserAI: " + data.error); return; }
        if (!data.brandColor || !isValidHexColor(data.brandColor)) data.brandColor = "#2563eb";
        config = data;
        init();
      })
      .catch(function (err) { console.error("CloserAI: Failed to load config", err); });
  }

  function init() {
    var color = config.brandColor || "#2563eb";
    var darker = shadeColor(color, -15);
    var lighter = shadeColor(color, 20);

    // Inject premium styles
    var style = document.createElement("style");
    style.textContent = [
      // Reset + font
      "#cai-widget, #cai-widget * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; -webkit-tap-highlight-color: transparent; }",
      "@import url('https://rsms.me/inter/inter.css');",

      // Bubble (floating chat button)
      "#cai-bubble { position: fixed; bottom: 24px; right: 24px; width: 60px; height: 60px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px rgba(0,0,0,0.15), 0 4px 12px " + color + "55; z-index: 2147483647; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); background: linear-gradient(135deg, " + lighter + " 0%, " + color + " 50%, " + darker + " 100%); border: none; }",
      "#cai-bubble::before { content: ''; position: absolute; inset: 0; border-radius: 50%; background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent 60%); pointer-events: none; }",
      "#cai-bubble:hover { transform: translateY(-4px) scale(1.06); box-shadow: 0 20px 50px rgba(0,0,0,0.2), 0 6px 20px " + color + "88; }",
      "#cai-bubble:active { transform: translateY(-1px) scale(0.98); }",
      "#cai-bubble svg { width: 28px; height: 28px; fill: white; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2)); position: relative; z-index: 1; }",

      // Badge (notification dot)
      "#cai-badge { position: absolute; top: -2px; right: -2px; min-width: 22px; height: 22px; padding: 0 6px; background: linear-gradient(135deg, #ef4444, #dc2626); border-radius: 11px; display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: 700; border: 3px solid white; box-shadow: 0 2px 8px rgba(239,68,68,0.4); }",
      "#cai-badge::before { content: ''; position: absolute; inset: -4px; border-radius: 50%; border: 2px solid #ef4444; opacity: 0.6; animation: cai-ring 2s ease-out infinite; }",
      "@keyframes cai-ring { 0% { transform: scale(0.8); opacity: 0.8; } 100% { transform: scale(1.8); opacity: 0; } }",

      // Chat window
      "#cai-chat { position: fixed; bottom: 100px; right: 24px; width: 400px; height: 620px; max-height: calc(100vh - 120px); border-radius: 24px; overflow: hidden; box-shadow: 0 24px 64px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04); z-index: 2147483647; display: none; flex-direction: column; background: white; }",
      "#cai-chat.open { display: flex; animation: cai-pop 0.4s cubic-bezier(0.16, 1, 0.3, 1); transform-origin: bottom right; }",
      "@keyframes cai-pop { from { opacity: 0; transform: translateY(16px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }",

      // Header (premium gradient)
      "#cai-header { position: relative; padding: 20px 22px 22px; color: white; display: flex; align-items: center; gap: 14px; flex-shrink: 0; background: linear-gradient(135deg, " + darker + " 0%, " + color + " 45%, " + lighter + " 100%); overflow: hidden; }",
      "#cai-header::before { content: ''; position: absolute; top: -40%; right: -20%; width: 180px; height: 180px; background: radial-gradient(circle, rgba(255,255,255,0.15), transparent 70%); pointer-events: none; }",
      "#cai-header::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent); }",
      "#cai-header-avatar { position: relative; width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.22); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1.5px solid rgba(255,255,255,0.3); z-index: 1; }",
      "#cai-header-avatar::after { content: ''; position: absolute; bottom: -1px; right: -1px; width: 12px; height: 12px; background: #10b981; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 0 0 0 rgba(16,185,129,0.5); animation: cai-pulse 2s ease-in-out infinite; }",
      "@keyframes cai-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.6); } 50% { box-shadow: 0 0 0 6px rgba(16,185,129,0); } }",
      "#cai-header-info { flex: 1; min-width: 0; z-index: 1; }",
      "#cai-header-info h3 { font-size: 16px; font-weight: 700; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: -0.01em; display: flex; align-items: center; gap: 6px; }",
      "#cai-header-info .cai-ai-tag { display: inline-flex; align-items: center; font-size: 9px; font-weight: 700; background: rgba(255,255,255,0.22); padding: 2px 6px; border-radius: 4px; letter-spacing: 0.05em; }",
      "#cai-header-info p { font-size: 12px; opacity: 0.85; margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 4px; }",
      "#cai-header-info p::before { content: ''; width: 6px; height: 6px; background: #4ade80; border-radius: 50%; display: inline-block; box-shadow: 0 0 6px rgba(74,222,128,0.8); }",
      "#cai-close { margin-left: auto; background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); color: white; cursor: pointer; width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; z-index: 1; }",
      "#cai-close:hover { background: rgba(255,255,255,0.28); transform: scale(1.05); }",
      "#cai-close:active { transform: scale(0.95); }",
      "#cai-close svg { width: 16px; height: 16px; }",

      // Messages area
      "#cai-messages { flex: 1; overflow-y: auto; padding: 20px 18px; background: linear-gradient(180deg, #fafbfc 0%, #f8fafc 100%); -webkit-overflow-scrolling: touch; scroll-behavior: smooth; }",
      "#cai-messages::-webkit-scrollbar { width: 6px; }",
      "#cai-messages::-webkit-scrollbar-track { background: transparent; }",
      "#cai-messages::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #cbd5e1, #94a3b8); border-radius: 3px; }",
      "#cai-messages::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, #94a3b8, #64748b); }",

      // Message rows
      ".cai-msg { margin-bottom: 14px; display: flex; gap: 10px; align-items: flex-end; animation: cai-msg-in 0.35s cubic-bezier(0.16, 1, 0.3, 1); }",
      "@keyframes cai-msg-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }",
      ".cai-msg-user { justify-content: flex-end; }",
      ".cai-msg-user .cai-avatar { display: none; }",
      ".cai-msg-bot .cai-avatar { width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, " + lighter + ", " + color + "); color: white; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 3px 10px " + color + "40; border: 2px solid white; }",

      // Message bubbles
      ".cai-msg-bubble { max-width: 82%; padding: 11px 16px; border-radius: 18px; font-size: 14px; line-height: 1.55; word-wrap: break-word; white-space: pre-wrap; letter-spacing: -0.005em; }",
      ".cai-msg-user .cai-msg-bubble { background: linear-gradient(135deg, " + lighter + ", " + color + "); color: white; border-bottom-right-radius: 6px; box-shadow: 0 4px 12px " + color + "40, 0 1px 2px rgba(0,0,0,0.08); }",
      ".cai-msg-bot .cai-msg-bubble { background: white; color: #1f2937; border-bottom-left-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04); }",

      // Typing indicator
      ".cai-typing { display: flex; gap: 5px; padding: 14px 16px; align-items: center; }",
      ".cai-typing span { width: 8px; height: 8px; border-radius: 50%; background: linear-gradient(135deg, " + lighter + ", " + color + "); animation: cai-bounce 1.3s infinite ease-in-out; }",
      ".cai-typing span:nth-child(1) { animation-delay: 0s; }",
      ".cai-typing span:nth-child(2) { animation-delay: 0.15s; }",
      ".cai-typing span:nth-child(3) { animation-delay: 0.3s; }",
      "@keyframes cai-bounce { 0%, 80%, 100% { transform: translateY(0) scale(0.8); opacity: 0.5; } 40% { transform: translateY(-6px) scale(1); opacity: 1; } }",

      // Input area
      "#cai-input-area { padding: 14px 16px 16px; border-top: 1px solid rgba(0,0,0,0.06); display: flex; gap: 10px; background: white; flex-shrink: 0; align-items: flex-end; }",
      "#cai-input { flex: 1; padding: 12px 16px; border: 1.5px solid #e5e7eb; border-radius: 14px; font-size: 14px; outline: none; transition: all 0.2s; background: #f9fafb; font-family: inherit; letter-spacing: -0.005em; min-height: 44px; resize: none; line-height: 1.4; }",
      "#cai-input:hover:not(:disabled) { border-color: #d1d5db; }",
      "#cai-input:focus { border-color: " + color + "; background: white; box-shadow: 0 0 0 3px " + color + "20; }",
      "#cai-input:disabled { opacity: 0.5; cursor: not-allowed; }",
      "#cai-input::placeholder { color: #9ca3af; }",
      "#cai-send { border: none; border-radius: 14px; padding: 0; width: 44px; height: 44px; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); background: linear-gradient(135deg, " + lighter + ", " + color + "); flex-shrink: 0; box-shadow: 0 4px 12px " + color + "40; }",
      "#cai-send:hover:not(:disabled) { transform: translateY(-1px) scale(1.04); box-shadow: 0 6px 20px " + color + "55; }",
      "#cai-send:active:not(:disabled) { transform: translateY(0) scale(0.96); }",
      "#cai-send:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }",
      "#cai-send svg { width: 18px; height: 18px; transform: translateX(-1px); }",

      // Powered by footer
      "#cai-powered { text-align: center; padding: 8px; font-size: 10px; color: #9ca3af; background: white; border-top: 1px solid rgba(0,0,0,0.04); flex-shrink: 0; display: flex; align-items: center; justify-content: center; gap: 4px; }",
      "#cai-powered svg { width: 10px; height: 10px; opacity: 0.6; }",
      "#cai-powered a { color: " + color + "; text-decoration: none; font-weight: 700; letter-spacing: -0.005em; transition: opacity 0.15s; }",
      "#cai-powered a:hover { opacity: 0.8; }",

      // Mobile (full screen)
      "@media (max-width: 480px) {",
      "  #cai-chat { right: 0 !important; left: 0 !important; bottom: 0 !important; width: 100% !important; height: 100% !important; max-height: 100vh !important; border-radius: 0 !important; }",
      "  #cai-chat.open { animation: cai-slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1); }",
      "  @keyframes cai-slide-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }",
      "  #cai-bubble { bottom: 20px; right: 20px; width: 58px; height: 58px; }",
      "  #cai-bubble svg { width: 26px; height: 26px; }",
      "  #cai-header { padding: 18px 20px 20px; padding-top: max(18px, env(safe-area-inset-top)); }",
      "  #cai-input-area { padding-bottom: max(16px, env(safe-area-inset-bottom)); }",
      "  .cai-msg-bubble { max-width: 85%; font-size: 15px; }",
      "  #cai-input { font-size: 16px; }",
      "}",
      "@media (max-width: 380px) {",
      "  #cai-header-info h3 { font-size: 15px; }",
      "  #cai-header-info p { font-size: 11px; }",
      "}",
    ].join("\n");
    document.head.appendChild(style);

    // Container
    var container = document.createElement("div");
    container.id = "cai-widget";
    container.innerHTML = [
      '<button id="cai-bubble" aria-label="Open chat" type="button">',
      '  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
      '    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="white" stroke="none"/>',
      '  </svg>',
      '  <div id="cai-badge">1</div>',
      '</button>',
      '<div id="cai-chat" role="dialog" aria-label="Chat with ' + escapeHtml(config.agentName || "AI Assistant") + '">',
      '  <div id="cai-header">',
      '    <div id="cai-header-avatar">' + escapeHtml((config.agentName || "AI").charAt(0).toUpperCase()) + '</div>',
      '    <div id="cai-header-info">',
      '      <h3>' + escapeHtml(config.agentName || "AI Assistant") + ' <span class="cai-ai-tag">AI</span></h3>',
      '      <p>' + escapeHtml(config.businessName || "Online now") + '</p>',
      '    </div>',
      '    <button id="cai-close" aria-label="Close chat" type="button">',
      '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
      '    </button>',
      '  </div>',
      '  <div id="cai-messages"></div>',
      '  <div id="cai-input-area">',
      '    <input id="cai-input" type="text" placeholder="Type a message..." autocomplete="off" aria-label="Message" />',
      '    <button id="cai-send" aria-label="Send" type="button">',
      '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2" fill="currentColor"/></svg>',
      '    </button>',
      '  </div>',
      config.whiteLabel ? '' : '  <div id="cai-powered">',
      config.whiteLabel ? '' : '    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',
      config.whiteLabel ? '' : '    Powered by <a href="https://closerai-app.vercel.app" target="_blank" rel="noopener">CloserAI</a>',
      config.whiteLabel ? '' : '  </div>',
      '</div>',
    ].join("");
    document.body.appendChild(container);

    var bubble = document.getElementById("cai-bubble");
    var chat = document.getElementById("cai-chat");
    var closeBtn = document.getElementById("cai-close");
    var messagesDiv = document.getElementById("cai-messages");
    var input = document.getElementById("cai-input");
    var sendBtn = document.getElementById("cai-send");
    var badge = document.getElementById("cai-badge");

    bubble.addEventListener("click", function () {
      isOpen = true;
      chat.classList.add("open");
      bubble.style.display = "none";
      if (badge) badge.style.display = "none";
      if (messagesDiv.children.length === 0 && config.welcomeMessage) {
        addMessage("bot", config.welcomeMessage);
      }
      setTimeout(function () { input.focus(); }, 400);
    });

    closeBtn.addEventListener("click", function () {
      isOpen = false;
      chat.classList.remove("open");
      bubble.style.display = "flex";
    });

    function send() {
      var text = input.value.trim();
      if (!text || isLoading) return;
      input.value = "";
      addMessage("user", text);
      showTyping();
      isLoading = true;
      sendBtn.disabled = true;
      input.disabled = true;

      fetch(BASE_URL + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: API_KEY, conversationId: conversationId, message: text }),
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          hideTyping();
          isLoading = false;
          sendBtn.disabled = false;
          input.disabled = false;
          input.focus();
          if (data.error) {
            if (data.trialExpired || data.limitReached) {
              addMessage("bot", "This chat is temporarily unavailable. Please contact us directly for assistance.");
            } else {
              addMessage("bot", "Sorry, I'm having a brief moment — please try again!");
            }
            return;
          }
          conversationId = data.conversationId;
          try { sessionStorage.setItem("cai_conv_" + API_KEY, conversationId); } catch(e) {}
          addMessage("bot", data.message);
        })
        .catch(function () {
          hideTyping();
          isLoading = false;
          sendBtn.disabled = false;
          input.disabled = false;
          addMessage("bot", "Connection issue — please try again.");
        });
    }

    sendBtn.addEventListener("click", send);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    });

    function addMessage(role, text) {
      var div = document.createElement("div");
      div.className = "cai-msg cai-msg-" + role;

      if (role === "bot") {
        var avatar = document.createElement("div");
        avatar.className = "cai-avatar";
        avatar.textContent = (config.agentName || "AI").charAt(0).toUpperCase();
        div.appendChild(avatar);
      }

      var bubbleDiv = document.createElement("div");
      bubbleDiv.className = "cai-msg-bubble";
      bubbleDiv.textContent = text;
      div.appendChild(bubbleDiv);

      messagesDiv.appendChild(div);
      setTimeout(function () { messagesDiv.scrollTop = messagesDiv.scrollHeight; }, 10);
    }

    function showTyping() {
      var div = document.createElement("div");
      div.id = "cai-typing-indicator";
      div.className = "cai-msg cai-msg-bot";

      var avatar = document.createElement("div");
      avatar.className = "cai-avatar";
      avatar.textContent = (config.agentName || "AI").charAt(0).toUpperCase();
      div.appendChild(avatar);

      var bubbleDiv = document.createElement("div");
      bubbleDiv.className = "cai-msg-bubble";
      bubbleDiv.innerHTML = '<div class="cai-typing"><span></span><span></span><span></span></div>';
      div.appendChild(bubbleDiv);

      messagesDiv.appendChild(div);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function hideTyping() {
      var el = document.getElementById("cai-typing-indicator");
      if (el) el.remove();
    }
  }

  function shadeColor(color, percent) {
    var num = parseInt(color.replace("#", ""), 16);
    var amt = Math.round(2.55 * percent);
    var R = (num >> 16) + amt;
    var G = ((num >> 8) & 0x00ff) + amt;
    var B = (num & 0x0000ff) + amt;
    return "#" + (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
  }

  loadConfig();
})();
