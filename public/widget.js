/**
 * CloserAI Chat Widget
 * Embed this on any website to add an AI-powered real estate assistant.
 * Usage: <script src="https://your-domain.com/widget.js" data-api-key="YOUR_KEY"></script>
 */
(function () {
  "use strict";

  // Get config from script tag
  var script = document.currentScript;
  if (!script) return;
  var API_KEY = script.getAttribute("data-api-key");
  if (!API_KEY) { console.error("CloserAI: Missing data-api-key"); return; }

  var BASE_URL = script.src.replace("/widget.js", "");
  var config = {};
  var conversationId = null;
  var isOpen = false;
  var isLoading = false;

  // Validate hex color to prevent CSS injection
  function isValidHexColor(color) {
    return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color);
  }

  // Load widget config
  function loadConfig() {
    fetch(BASE_URL + "/api/widget/config?key=" + API_KEY)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.error) { console.error("CloserAI: " + data.error); return; }
        // Sanitize brand color to prevent CSS injection
        if (!data.brandColor || !isValidHexColor(data.brandColor)) {
          data.brandColor = "#2563eb";
        }
        config = data;
        init();
      })
      .catch(function (err) { console.error("CloserAI: Failed to load config", err); });
  }

  function init() {
    // Inject styles
    var style = document.createElement("style");
    style.textContent = "\n\
      #cai-widget * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }\n\
      #cai-bubble { position: fixed; bottom: 24px; right: 24px; width: 64px; height: 64px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 24px rgba(0,0,0,0.2); z-index: 99999; transition: transform 0.2s; }\n\
      #cai-bubble:hover { transform: scale(1.1); }\n\
      #cai-bubble svg { width: 28px; height: 28px; fill: white; }\n\
      #cai-chat { position: fixed; bottom: 100px; right: 24px; width: 380px; max-height: 560px; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,0.15); z-index: 99999; display: none; flex-direction: column; background: white; }\n\
      #cai-chat.open { display: flex; animation: cai-slide 0.3s ease; }\n\
      @keyframes cai-slide { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }\n\
      #cai-header { padding: 16px 20px; color: white; display: flex; align-items: center; gap: 12px; }\n\
      #cai-header-avatar { width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 600; }\n\
      #cai-header-info h3 { font-size: 15px; font-weight: 600; }\n\
      #cai-header-info p { font-size: 11px; opacity: 0.7; }\n\
      #cai-close { margin-left: auto; background: none; border: none; color: white; cursor: pointer; font-size: 20px; opacity: 0.7; }\n\
      #cai-close:hover { opacity: 1; }\n\
      #cai-messages { flex: 1; overflow-y: auto; padding: 16px; min-height: 300px; max-height: 380px; }\n\
      .cai-msg { margin-bottom: 10px; display: flex; }\n\
      .cai-msg-user { justify-content: flex-end; }\n\
      .cai-msg-bubble { max-width: 80%; padding: 10px 14px; border-radius: 16px; font-size: 14px; line-height: 1.4; word-wrap: break-word; }\n\
      .cai-msg-user .cai-msg-bubble { color: white; border-bottom-right-radius: 4px; }\n\
      .cai-msg-bot .cai-msg-bubble { background: #f3f4f6; color: #1f2937; border-bottom-left-radius: 4px; }\n\
      .cai-typing { display: flex; gap: 4px; padding: 8px 14px; }\n\
      .cai-typing span { width: 8px; height: 8px; border-radius: 50%; background: #9ca3af; animation: cai-bounce 1.2s infinite; }\n\
      .cai-typing span:nth-child(2) { animation-delay: 0.2s; }\n\
      .cai-typing span:nth-child(3) { animation-delay: 0.4s; }\n\
      @keyframes cai-bounce { 0%,80%,100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }\n\
      #cai-input-area { padding: 12px 16px; border-top: 1px solid #e5e7eb; display: flex; gap: 8px; }\n\
      #cai-input { flex: 1; padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 12px; font-size: 14px; outline: none; }\n\
      #cai-input:focus { border-color: " + (config.brandColor || "#2563eb") + "; }\n\
      #cai-send { border: none; border-radius: 12px; padding: 10px 16px; color: white; cursor: pointer; font-size: 14px; font-weight: 500; }\n\
      #cai-send:disabled { opacity: 0.5; cursor: not-allowed; }\n\
      #cai-powered { text-align: center; padding: 6px; font-size: 10px; color: #9ca3af; }\n\
      @media (max-width: 480px) { #cai-chat { right: 0; left: 0; bottom: 0; width: 100%; max-height: 100vh; border-radius: 0; } #cai-bubble { bottom: 16px; right: 16px; } }\n\
    ";
    document.head.appendChild(style);

    var color = config.brandColor || "#2563eb";

    // Create widget container
    var container = document.createElement("div");
    container.id = "cai-widget";
    container.innerHTML = '\
      <div id="cai-bubble" style="background: ' + color + ';">\
        <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>\
      </div>\
      <div id="cai-chat">\
        <div id="cai-header" style="background: ' + color + ';">\
          <div id="cai-header-avatar">' + (config.agentName || "AI").charAt(0) + '</div>\
          <div id="cai-header-info"><h3>' + (config.agentName || "AI Assistant") + "</h3><p>" + (config.businessName || "") + '</p></div>\
          <button id="cai-close">&times;</button>\
        </div>\
        <div id="cai-messages"></div>\
        <div id="cai-input-area">\
          <input id="cai-input" type="text" placeholder="Type a message..." autocomplete="off" />\
          <button id="cai-send" style="background: ' + color + ';">Send</button>\
        </div>\
        <div id="cai-powered">Powered by CloserAI</div>\
      </div>\
    ';
    document.body.appendChild(container);

    // Elements
    var bubble = document.getElementById("cai-bubble");
    var chat = document.getElementById("cai-chat");
    var closeBtn = document.getElementById("cai-close");
    var messagesDiv = document.getElementById("cai-messages");
    var input = document.getElementById("cai-input");
    var sendBtn = document.getElementById("cai-send");

    // Toggle chat
    bubble.addEventListener("click", function () {
      isOpen = !isOpen;
      if (isOpen) {
        chat.classList.add("open");
        bubble.style.display = "none";
        if (messagesDiv.children.length === 0 && config.welcomeMessage) {
          addMessage("bot", config.welcomeMessage);
        }
        input.focus();
      }
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
          if (data.error) {
            addMessage("bot", "Sorry, I'm having trouble right now. Please try again.");
            return;
          }
          conversationId = data.conversationId;
          addMessage("bot", data.message);
        })
        .catch(function () {
          hideTyping();
          isLoading = false;
          sendBtn.disabled = false;
          addMessage("bot", "Sorry, something went wrong. Please try again.");
        });
    }

    sendBtn.addEventListener("click", send);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") send();
    });

    function addMessage(role, text) {
      var div = document.createElement("div");
      div.className = "cai-msg cai-msg-" + role;
      var bubbleDiv = document.createElement("div");
      bubbleDiv.className = "cai-msg-bubble";
      if (role === "user") bubbleDiv.style.background = color;
      bubbleDiv.textContent = text;
      div.appendChild(bubbleDiv);
      messagesDiv.appendChild(div);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function showTyping() {
      var div = document.createElement("div");
      div.id = "cai-typing-indicator";
      div.className = "cai-msg cai-msg-bot";
      div.innerHTML = '<div class="cai-msg-bubble"><div class="cai-typing"><span></span><span></span><span></span></div></div>';
      messagesDiv.appendChild(div);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function hideTyping() {
      var el = document.getElementById("cai-typing-indicator");
      if (el) el.remove();
    }

    // Auto-open after 5 seconds if not opened
    setTimeout(function () {
      if (!isOpen) {
        bubble.style.animation = "cai-bounce 0.5s ease";
      }
    }, 5000);
  }

  // Start
  loadConfig();
})();
