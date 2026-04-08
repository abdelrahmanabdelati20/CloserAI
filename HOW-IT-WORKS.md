# CloserAI — Complete Guide: How It Works

## FOR YOU (The Owner / Platform Admin)

### What You Built
CloserAI is a SaaS (Software as a Service) platform. You sell AI-powered chat
assistants to real estate agents. Each client gets their own AI chatbot that
lives on their website and captures leads 24/7.

### How the Business Model Works

```
VISITOR arrives at agent's website
        |
        v
AI CHAT WIDGET pops up (powered by your platform)
        |
        v
AI has a REAL CONVERSATION — asks about needs, budget, location
        |
        v
AI CAPTURES lead info (name, email, phone, budget, preferences)
        |
        v
LEAD appears in agent's dashboard instantly
        |
        v
Agent CLOSES THE DEAL
```

You charge the agent $997 setup + $297-$1,497/month for this service.
Your cost per client is ~$10-30/month in Claude API fees.
Your profit margin is 90%+.

### How to Onboard a New Client (Step by Step)

1. Client pays setup fee ($997) via PayPal invoice
2. You log in to your admin panel: yourdomain.com/admin
3. Click "Clients" in sidebar, then "+ Add Client"
4. Fill in: their name, email, a password, their business name, plan
5. Click "Create Client" — system generates their API key automatically
6. Send client their login credentials
7. Client logs in, customizes their AI, copies widget code to their site
8. Set up their PayPal subscription (send them the subscription link)
9. Done! Recurring income.

### How to Cut Off a Non-Paying Client

1. Go to Admin > Clients
2. Find the client
3. Click "DEACTIVATE SERVICE" (red button)
4. Immediately: their widget stops responding, dashboard shows deactivated
5. That's it. One click. Their AI is dead until you reactivate.

### How to Change Anything About a Client

1. Go to Admin > Clients
2. Click "Edit Everything" on any client
3. You can change:
   - Their plan (upgrade/downgrade)
   - Monthly conversation limit
   - AI agent name and personality
   - Welcome message
   - AI behavior instructions (system prompt)
   - Brand colors
   - Their login password
4. Click "Save Changes"

### Your Daily Workflow
- Check admin dashboard for new leads across all clients
- Monitor client usage (are they hitting limits?)
- Check PayPal for payment status
- Respond to client support requests
- Send outreach messages to get new clients (10-20/day)

---

## FOR YOUR CLIENTS (Share This With Them)

### What is CloserAI?

CloserAI is your personal AI sales assistant that lives on your website.
It talks to every visitor 24/7 — while you're sleeping, showing properties,
or on vacation. It captures their name, email, phone number, budget, and
property preferences through natural conversation.

### What Does the AI Do?

The AI assistant:
- Greets every website visitor instantly (under 2 seconds)
- Has real, human-like conversations about real estate
- Asks about their needs: buying, selling, or renting
- Understands budgets, locations, and property preferences
- Matches visitors with your property listings automatically
- Captures their contact information naturally (no boring forms)
- Delivers qualified leads straight to your dashboard

### How to Set Up (5 Minutes)

**Step 1: Log In**
Go to [YOUR DOMAIN]/login and use the credentials we provided.

**Step 2: Customize Your AI (Settings Page)**
- Give your AI a name (e.g., "Sarah", "Alex", "PropertyBot")
- Write a custom welcome message
- Add special instructions (e.g., "Focus on luxury homes",
  "Always mention our free consultation")
- Pick your brand color to match your website

**Step 3: Add Your Listings (Properties Page)**
Click "+ Add Property" and enter your active listings. The AI will
recommend these to visitors who match the criteria.

**Step 4: Install the Widget (Dashboard Page)**
Copy the one-line code snippet shown on your dashboard.
Paste it on your website before the closing </body> tag.

For specific platforms:
- **WordPress**: Go to Appearance > Theme Editor > footer.php, paste before </body>
- **Wix**: Settings > Custom Code > Add Custom Code > paste in Body End
- **Squarespace**: Settings > Advanced > Code Injection > Footer, paste there
- **Shopify**: Online Store > Themes > Edit Code > theme.liquid, paste before </body>
- **Any HTML site**: Open your HTML file, paste before </body>

**Step 5: You're Live!**
Visit your website and you'll see the chat bubble in the bottom-right corner.
Click it and test the AI yourself.

### Your Dashboard

**Overview**: See total leads, conversations, monthly usage, and your widget code.

**Leads**: Every person who chatted with your AI and shared info. You can:
- Filter by status (New, Contacted, Qualified, Converted, Lost)
- Update lead status as you work them
- See their budget, location preferences, and property type

**Conversations**: Read the full chat history with every visitor. Great for
understanding what your leads want before you call them.

**Properties**: Add/remove your active listings. The AI will recommend
properties that match what visitors are looking for.

**Settings**: Change your AI's name, welcome message, behavior, and brand color.

### FAQ for Clients

**Q: Does the AI sound robotic?**
A: No. It uses advanced AI (Claude by Anthropic) that has natural,
human-like conversations. Most visitors can't tell it's AI.

**Q: What if someone asks something weird?**
A: The AI is trained to stay focused on real estate. It will politely
redirect off-topic conversations.

**Q: Can I see what the AI says to my visitors?**
A: Yes. Every conversation is recorded in your Conversations tab.

**Q: What if I run out of monthly conversations?**
A: Contact us to upgrade your plan or purchase additional conversations.

**Q: Can I customize what the AI says?**
A: Yes. In Settings, you can add "Custom Instructions" that shape the
AI's behavior. For example: "Always mention our free home valuation offer."

**Q: What happens if I cancel?**
A: Your widget stops working and your dashboard becomes inactive.
Your data is preserved for 30 days in case you reactivate.

---

## TECHNICAL OVERVIEW (How It Works Under the Hood)

### The Flow

1. Client puts widget code on their website:
   `<script src="yourdomain.com/widget.js" data-api-key="cai_xxx"></script>`

2. When a visitor loads the page, widget.js:
   - Fetches config from /api/widget/config (agent name, color, welcome msg)
   - Renders a chat bubble in the bottom-right corner
   - Shows welcome message when visitor opens it

3. When visitor sends a message:
   - Widget sends POST to /api/chat with apiKey + message
   - Server validates the API key and checks if client is active
   - Server checks monthly usage limits
   - Server sends conversation history + message to Claude API
   - Claude generates an intelligent response
   - Server extracts any lead info (name, email, phone, etc.)
   - Server saves the conversation and updates lead record
   - Response is sent back to the widget

4. Lead data flows to the client's dashboard in real-time.

### Security & Control

- Each client has a unique API key — widget won't work without it
- Admin can deactivate any client instantly (kills their widget)
- All routes are protected by authentication (NextAuth.js)
- Admin and client roles are enforced by middleware
- CORS headers allow the widget to work on any domain
- PayPal webhooks auto-deactivate accounts when payment fails
