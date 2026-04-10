/**
 * CloserAI Chat Widget v2.0
 * Embed on any website: <script src="https://closerai-app.vercel.app/widget.js" data-api-key="YOUR_KEY"></script>
 * Works perfectly on desktop, tablet, and mobile.
 */
(function () {
  "use strict";

  // Get script config
  var script = document.currentScript;
  if (!script) return;
  var API_KEY = script.getAttribute("data-api-key");
  if (!API_KEY) { console.error("CloserAI: Missing data-api-key"); return; }

  var BASE_URL = script.src.replace("/widget.js", "");
  var config = {};
  var conversationId = null;
  var isOpen = false;
  var isLoading = false;
  var hasInteracted = false;

  // Validate hex color to prevent CSS injection
  function isValidHexColor(color) {
    return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color);
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Load widget config from server
  function loadConfig() {
    fetch(BASE_URL + "/api/widget/config?key=" + API_KEY)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.error) {
          console.error("CloserAI: " + data.error);
          return;
        }
        if (!data.brandColor || !isValidHexColor(data.brandColor)) {
          data.brandColor = "#2563eb";
        }
        config = data;
        init();
      })
      .catch(function (err) {
        console.error("CloserAI: Failed to load config", err);
      });
  }

  function init() {
    var color = config.brandColor || "#2563eb";
    var darkerColor = shadeColor(color, -20);

    // Inject styles
    var style = document.createElement("style");
    style.textContent = [
      "#cai-widget, #cai-widget * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-tap-highlight-color: transparent; }",
      "#cai-bubble { position: fixed; bottom: 24px; right: 24px; width: 60px; height: 60px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(0,0,0,0.25); z-index: 2147483647; transition: transform 0.2s ease, box-shadow 0.2s ease; background: " + color + "; }",
      "#cai-bubble:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(0,0,0,0.3); }",
      "#cai-bubble:active { transform: scale(0.95); }",
      "#cai-bubble svg { width: 26px; height: 26px; fill: white; }",
      "#cai-badge { position: absolute; top: -4px; right: -4px; width: 20px; height: 20px; background: #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: 700; border: 2px solid white; animation: cai-pulse 2s infinite; }",
      "@keyframes cai-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); } 50% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); } }",
      "#cai-chat { position: fixed; bottom: 100px; right: 24px; width: 380px; height: 580px; max-height: calc(100vh - 120px); border-radius: 20px; overflow: hidden; box-shadow: 0 10px 50px rgba(0,0,0,0.25); z-index: 2147483647; display: none; flex-direction: column; background: white; }",
      "#cai-chat.open { display: flex; animation: cai-slide 0.25s ease-out; }",
      "@keyframes cai-slide { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }",
      "#cai-header { padding: 16px 18px; color: white; display: flex; align-items: center; gap: 12px; background: linear-gradient(135deg, " + darkerColor + ", " + color + "); flex-shrink: 0; }",
      "#cai-header-avatar { position: relative; width: 42px; height: 42px; border-radius: 50%; background: rgba(255,255,255,0.25); display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; flex-shrink: 0; }",
      "#cai-header-avatar::after { content: ''; position: absolute; bottom: 0; right: 0; width: 11px; height: 11px; background: #10b981; border-radius: 50%; border: 2px solid white; }",
      "#cai-header-info { flex: 1; min-width: 0; }",
      "#cai-header-info h3 { font-size: 15px; font-weight: 700; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }",
      "#cai-header-info p { font-size: 11px; opacity: 0.85; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }",
      "#cai-close { margin-left: auto; background: rgba(255,255,255,0.15); border: none; color: white; cursor: pointer; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: background 0.15s; flex-shrink: 0; }",
      "#cai-close:hover { background: rgba(255,255,255,0.25); }",
      "#cai-close svg { width: 16px; height: 16px; }",
      "#cai-messages { flex: 1; overflow-y: auto; padding: 16px; background: #fafbfc; -webkit-overflow-scrolling: touch; }",
      "#cai-messages::-webkit-scrollbar { width: 6px; }",
      "#cai-messages::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }",
      ".cai-msg { margin-bottom: 12px; display: flex; gap: 8px; align-items: flex-start; animation: cai-msg-in 0.2s ease-out; }",
      "@keyframes cai-msg-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }",
      ".cai-msg-user { justify-content: flex-end; }",
      ".cai-msg-bot .cai-avatar { width: 28px; height: 28px; border-radius: 50%; background: " + color + "; color: white; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }",
      ".cai-msg-bubble { max-width: 80%; padding: 10px 14px; border-radius: 16px; font-size: 14px; line-height: 1.5; word-wrap: break-word; white-space: pre-wrap; }",
      ".cai-msg-user .cai-msg-bubble { background: " + color + "; color: white; border-bottom-right-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }",
      ".cai-msg-bot .cai-msg-bubble { background: white; color: #1f2937; border-bottom-left-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.08); border: 1px solid #f0f0f0; }",
      ".cai-typing { display: flex; gap: 4px; padding: 10px 14px; }",
      ".cai-typing span { width: 8px; height: 8px; border-radius: 50%; background: #9ca3af; animation: cai-bounce 1.2s infinite; }",
      ".cai-typing span:nth-child(2) { animation-delay: 0.15s; }",
      ".cai-typing span:nth-child(3) { animation-delay: 0.3s; }",
      "@keyframes cai-bounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.5; } 40% { transform: translateY(-6px); opacity: 1; } }",
      "#cai-input-area { padding: 12px 14px; border-top: 1px solid #e5e7eb; display: flex; gap: 8px; background: white; flex-shrink: 0; }",
      "#cai-input { flex: 1; padding: 11px 14px; border: 1px solid #e5e7eb; border-radius: 12px; font-size: 14px; outline: none; transition: border-color 0.15s; background: #f9fafb; }",
      "#cai-input:focus { border-color: " + color + "; background: white; }",
      "#cai-input:disabled { opacity: 0.6; }",
      "#cai-send { border: none; border-radius: 12px; padding: 0; width: 42px; height: 42px; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.15s, opacity 0.15s; background: " + color + "; flex-shrink: 0; }",
      "#cai-send:hover:not(:disabled) { transform: scale(1.05); }",
      "#cai-send:active:not(:disabled) { transform: scale(0.95); }",
      "#cai-send:disabled { opacity: 0.4; cursor: not-allowed; }",
      "#cai-send svg { width: 18px; height: 18px; }",
      "#cai-powered { text-align: center; padding: 6px; font-size: 10px; color: #9ca3af; background: white; border-top: 1px solid #f3f4f6; flex-shrink: 0; }",
      "#cai-powered a { color: " + color + "; text-decoration: none; font-weight: 600; }",
      "@media (max-width: 480px) {",
      "  #cai-chat { right: 0 !important; left: 0 !important; bottom: 0 !important; width: 100% !important; height: 100% !important; max-height: 100vh !important; border-radius: 0 !important; }",
      "  #cai-bubble { bottom: 20px; right: 20px; width: 56px; height: 56px; }",
      "  #cai-bubble svg { width: 24px; height: 24px; }",
      "  #cai-header { padding: 14px 16px; padding-top: max(14px, env(safe-area-inset-top)); }",
      "  #cai-input-area { padding-bottom: max(12px, env(safe-area-inset-bottom)); }",
      "  .cai-msg-bubble { max-width: 85%; font-size: 15px; }",
      "  #cai-input { font-size: 16px; }", // Prevents iOS zoom
      "}",
      "@media (max-width: 380px) {",
      "  #cai-header-info h3 { font-size: 14px; }",
      "  #cai-header-info p { font-size: 10px; }",
      "}",
    ].join("\n");
    document.head.appendChild(style);

    // Create widget container
    var container = document.createElement("div");
    container.id = "cai-widget";
    container.innerHTML = [
      '<div id="cai-bubble" role="button" aria-label="Open chat">',
      '  <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>',
      '  <div id="cai-badge">1</div>',
      '</div>',
      '<div id="cai-chat" role="dialog" aria-label="Chat with ' + escapeHtml(config.agentName || "AI Assistant") + '">',
      '  <div id="cai-header">',
      '    <div id="cai-header-avatar">' + escapeHtml((config.agentName || "AI").charAt(0).toUpperCase()) + '</div>',
      '    <div id="cai-header-info">',
      '      <h3>' + escapeHtml(config.agentName || "AI Assistant") + '</h3>',
      '      <p>' + escapeHtml(config.businessName || "Online") + '</p>',
      '    </div>',
      '    <button id="cai-close" aria-label="Close chat">',
      '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
      '    </button>',
      '  </div>',
      '  <div id="cai-messages"></div>',
      '  <div id="cai-input-area">',
      '    <input id="cai-input" type="text" placeholder="Type a message..." autocomplete="off" aria-label="Message" />',
      '    <button id="cai-send" aria-label="Send">',
      '      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>',
      '    </button>',
      '  </div>',
      '  <div id="cai-powered">Powered by <a href="https://closerai-app.vercel.app" target="_blank" rel="noopener">CloserAI</a></div>',
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

    // Toggle chat
    bubble.addEventListener("click", function () {
      isOpen = true;
      chat.classList.add("open");
      bubble.style.display = "none";
      if (badge) badge.style.display = "none";
      if (messagesDiv.children.length === 0 && config.welcomeMessage) {
        addMessage("bot", config.welcomeMessage);
      }
      setTimeout(function () { input.focus(); }, 300);
      hasInteracted = true;
    });

    closeBtn.addEventListener("click", function () {
      isOpen = false;
      chat.classList.remove("open");
      bubble.style.display = "flex";
    });

    // Send message
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
      bubbleDiv.textContent = text; // textContent prevents XSS
      div.appendChild(bubbleDiv);

      messagesDiv.appendChild(div);
      setTimeout(function () {
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
      }, 10);
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

  // Utility: shade a hex color
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

  // Start
  loadConfig();
})();
