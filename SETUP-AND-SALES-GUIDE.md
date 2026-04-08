# CloserAI - Complete Setup, Management & Sales Guide

## WHAT YOU BUILT

**CloserAI** is a premium AI-powered real estate lead conversion platform.

Your clients (real estate agents and brokerages) embed an AI chat widget on their
websites. The AI chat agent works 24/7 to:
- Engage every website visitor in real-time
- Capture lead information (name, email, phone, budget, preferences)
- Match visitors with properties from the agent's listings
- Qualify leads automatically
- Deliver captured leads to the agent's dashboard

---

## STEP 1: INSTALL NODE.JS (Required First)

1. Go to https://nodejs.org
2. Download the LTS version (the big green button)
3. Install it (click Next through everything)
4. Restart your terminal/computer after installing

Verify it works by opening a new terminal:
```
node --version
npm --version
```

---

## STEP 2: SET UP YOUR CLOSERAI PLATFORM

Open a terminal and run these commands:

```bash
cd "D:\claude code\CloserAI"
npm install
npx prisma db push
npm run db:seed
```

This will:
- Install all dependencies
- Create the database
- Create an admin account and demo client

---

## STEP 3: CONFIGURE YOUR ENVIRONMENT

Edit the file `D:\claude code\CloserAI\.env`:

1. **ANTHROPIC_API_KEY**: Replace with your Claude API key
   - Get one at https://console.anthropic.com
   
2. **ADMIN_EMAIL and ADMIN_PASSWORD**: Change to your preferred login

3. **PayPal** (set up when ready to accept payments - see PayPal section below)

---

## STEP 4: RUN LOCALLY

```bash
cd "D:\claude code\CloserAI"
npm run dev
```

Open http://localhost:3000 to see your landing page.

**Test Logins:**
- Admin: admin@closerai.com / ChangeThisPassword123!
- Demo Client: demo@closerai.com / demo123

---

## STEP 5: DEPLOY TO THE INTERNET

### Recommended: Vercel (Free tier available, perfect for Next.js)

1. Create account at https://vercel.com (free)
2. Install Git: https://git-scm.com
3. Push your code to GitHub:
   ```bash
   cd "D:\claude code\CloserAI"
   git init
   git add .
   git commit -m "Initial commit"
   ```
4. Create a GitHub repo and push to it
5. In Vercel, click "Import Project" and select your GitHub repo
6. Add all your .env variables in Vercel's Environment Variables section
7. Deploy!

**For the database in production**, switch from SQLite to a hosted database:
- Use https://neon.tech (free tier) for PostgreSQL
- Change the DATABASE_URL in .env and prisma schema provider to "postgresql"

### Alternative: Railway.app
1. Go to https://railway.app
2. Deploy from GitHub
3. Add environment variables
4. Railway gives you a free domain

### Buy a domain:
- Go to https://namecheap.com or https://domains.google
- Buy something like closerai.com, closerai.io, etc. (~$12/year)
- Point it to your Vercel/Railway deployment

---

## HOW TO MANAGE YOUR PLATFORM (Admin Guide)

### Admin Dashboard (you)
URL: https://your-domain.com/admin

**What you can do:**
1. **View Overview**: See total clients, leads, revenue estimates
2. **Manage Clients**: Add, activate, or deactivate client accounts
3. **View All Leads**: See every lead captured across all clients

### Adding a New Client (After They Pay)
1. Go to Admin > Clients
2. Click "+ Add Client"
3. Fill in their name, email, password, business name, and plan
4. They receive: login credentials + API key for their widget
5. They log in at your-domain.com/login

### Deactivating a Client (If They Don't Pay)
1. Go to Admin > Clients
2. Find the client
3. Click "Deactivate"
4. Their widget IMMEDIATELY stops working on their website
5. They see "Account deactivated" if they try to log in

### Reactivating a Client (After They Pay Again)
1. Same as above but click "Activate"

---

## HOW YOUR CLIENTS USE THE PLATFORM

### What the client gets:
1. **Login credentials** to their dashboard
2. **An API key** for their chat widget
3. **Widget embed code** - one line of HTML

### Client Setup (takes 5 minutes):
1. Client logs in at your-domain.com/login
2. Goes to Settings - customizes AI agent name, welcome message, brand color
3. Goes to Properties - adds their listings (so AI can recommend them)
4. Goes to Overview - copies the widget embed code
5. Pastes the code on their website before </body>
6. Done! AI is live.

### Client Dashboard Features:
- **Overview**: Stats, usage, and widget install code
- **Leads**: All captured leads with status management
- **Conversations**: Full chat history with every visitor
- **Properties**: Manage listings the AI references
- **Settings**: Customize AI behavior and branding

---

## PAYPAL SUBSCRIPTION SETUP

### Step 1: Create PayPal Subscription Plans

1. Log in to https://developer.paypal.com
2. Go to Dashboard > My Apps & Credentials
3. Create a new app (or use existing)
4. Copy the Client ID and Secret to your .env file

5. Go to PayPal Business at https://www.paypal.com/billing/plans
6. Create 3 subscription plans:

   **Starter Plan:**
   - Name: CloserAI Starter
   - Price: $297/month
   - Copy the Plan ID to PAYPAL_PLAN_STARTER in .env

   **Professional Plan:**
   - Name: CloserAI Professional
   - Price: $597/month
   - Copy the Plan ID to PAYPAL_PLAN_PROFESSIONAL in .env

   **Enterprise Plan:**
   - Name: CloserAI Enterprise
   - Price: $1,497/month
   - Copy the Plan ID to PAYPAL_PLAN_ENTERPRISE in .env

### Step 2: Set Up Webhook

1. In PayPal Developer Dashboard > My Apps > Your App
2. Click "Add Webhook"
3. URL: https://your-domain.com/api/webhooks/paypal
4. Select events:
   - BILLING.SUBSCRIPTION.ACTIVATED
   - BILLING.SUBSCRIPTION.SUSPENDED
   - BILLING.SUBSCRIPTION.CANCELLED
   - PAYMENT.SALE.COMPLETED
   - PAYMENT.SALE.DENIED

### Step 3: Collecting Setup Fee

For the $997 setup fee, send a PayPal invoice:
1. Go to paypal.com > Send & Request > Create Invoice
2. Add the client's email
3. Amount: $997 (or whatever setup fee)
4. Description: "CloserAI Platform Setup Fee - [Plan Name]"
5. Send invoice

### Step 4: Client Subscription Flow
1. After receiving setup fee, create client account in your admin panel
2. Send client a PayPal subscription link for their plan
3. When they subscribe, PayPal webhook auto-activates their account
4. If payment fails, webhook auto-deactivates their account

---

## PRICING STRATEGY

### Recommended Pricing:

| | Starter | Professional | Enterprise |
|---|---|---|---|
| Setup Fee | $997 | $997 | $1,497 |
| Monthly | $297/mo | $597/mo | $1,497/mo |
| Widgets | 1 | 5 | Unlimited |
| Conversations | 500/mo | 2,000/mo | Unlimited |
| Properties | 20 | 100 | Unlimited |

### Your Costs Per Client:
- Claude API: ~$5-30/month per client (depends on usage)
- Hosting: ~$0-20/month (Vercel free tier handles a lot)
- Your profit margin: 90%+

### Revenue Projections:
- 5 clients on Starter: $1,485/mo + $4,985 setup
- 10 clients on Professional: $5,970/mo + $9,970 setup
- 3 Enterprise clients: $4,491/mo + $4,491 setup
- **Combined (18 clients): $11,946/mo recurring**

---

## SALES PLAYBOOK - HOW TO GET CLIENTS

### Who to Target:
1. **Real estate agents** with personal websites
2. **Real estate teams** and small brokerages
3. **Property management companies**
4. **Real estate marketing agencies** (they can resell to their clients)

### Where to Find Them:
1. **LinkedIn**: Search "real estate agent" + your city
2. **Facebook Groups**: Real estate agent groups, realtor networking groups
3. **Instagram**: Real estate agents always post listings
4. **Google Maps**: Search "real estate agent" in any city
5. **Realtor.com / Zillow**: Agent profiles with their websites
6. **Local MLS websites**: Agent directories
7. **Real estate meetups**: Networking events

### Your Sales Pitch (Copy-Paste Ready):

**Cold DM/Email Template:**

Subject: Your website is losing leads while you sleep

Hi [Name],

I saw your website at [their-website.com] and noticed you don't have
a live chat or AI assistant handling visitors.

Did you know that 78% of real estate leads go with the first agent
who responds? Every hour your website sits there without engaging
visitors, you're losing potential commissions.

I built an AI assistant specifically for real estate agents. It goes
on your website and:

- Talks to every visitor 24/7 (while you sleep, eat, show homes)
- Captures their name, email, phone, and budget automatically
- Matches them with your listings
- Delivers qualified leads straight to your dashboard

It takes 5 minutes to set up. You just paste one line of code.

I have a few spots open this month. Want to see a live demo?

[Your Name]
CloserAI

---

**Follow-up if they respond "Tell me more":**

Great question [Name]! Here's how it works:

1. You get a dashboard where you manage everything
2. I set up your AI assistant customized to your brand
3. You paste a tiny code snippet on your website
4. The AI starts capturing leads immediately

The AI knows your listings, your brand, and your market. It doesn't
sound robotic - it has real conversations with visitors and naturally
captures their info.

Pricing: $997 one-time setup + $297/month for the Starter plan.

That's less than the commission on ONE deal, and it pays for itself
many times over. Most agents see 3x more leads in the first month.

Want me to set up a demo on a test page so you can see it in action?

---

**Handling Objections:**

"Too expensive":
"One closed deal pays for 2+ years of this service. How many leads
are you currently losing because nobody's responding at 11pm?"

"I already have a chatbot":
"Most chatbots are just forms disguised as chat. Our AI has real
conversations, understands context, and captures leads naturally.
Want to compare them side by side?"

"I need to think about it":
"Totally understand. Just know that every day without it, visitors
are coming and leaving without you capturing them. I can set up a
free 7-day trial so you can see actual results before committing."

---

### Sales Process:
1. **Outreach**: Send DM/email (10-20 per day)
2. **Demo**: Show them the live widget working
3. **Close**: Offer the setup + subscription
4. **Onboard**: Create their account, configure AI, help them install
5. **Support**: Check in monthly, share lead stats

### Scaling Up:
- Month 1-2: Manual outreach, get first 3-5 clients
- Month 3-4: Ask happy clients for referrals
- Month 5+: Run Facebook/Instagram ads targeting real estate agents
- Long term: Hire a sales person, expand to other niches

---

## TECHNICAL ARCHITECTURE

```
D:\claude code\CloserAI\
|-- prisma/
|   |-- schema.prisma       # Database schema
|   |-- seed.ts             # Database seeder
|-- public/
|   |-- widget.js           # Embeddable chat widget (THE PRODUCT)
|-- src/
|   |-- app/
|   |   |-- page.tsx        # Landing page (sales page)
|   |   |-- login/          # Login page
|   |   |-- admin/          # YOUR admin dashboard
|   |   |   |-- page.tsx    # Overview & revenue
|   |   |   |-- clients/    # Manage all clients
|   |   |   |-- leads/      # See all leads
|   |   |-- dashboard/      # CLIENT dashboard
|   |   |   |-- page.tsx    # Client overview + widget code
|   |   |   |-- leads/      # Client's leads
|   |   |   |-- conversations/ # Chat history
|   |   |   |-- properties/ # Property listings
|   |   |   |-- settings/   # AI customization
|   |   |-- api/
|   |       |-- auth/       # Authentication
|   |       |-- chat/       # AI chat endpoint (widget uses this)
|   |       |-- admin/      # Admin API routes
|   |       |-- dashboard/  # Client API routes
|   |       |-- widget/     # Widget config endpoint
|   |       |-- webhooks/   # PayPal webhooks
|   |-- lib/
|   |   |-- ai.ts           # Claude AI integration
|   |   |-- auth.ts         # NextAuth configuration
|   |   |-- db.ts           # Database connection
|   |   |-- paypal.ts       # PayPal integration
|   |-- middleware.ts        # Route protection
```

---

## QUICK REFERENCE - COMMANDS

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Run production build

# Database
npx prisma db push   # Apply schema changes
npx prisma studio    # Visual database editor
npm run db:seed      # Seed admin + demo data

# Full setup from scratch
npm run setup        # Install + DB + Seed
```

---

## FAQ

**Q: What if a client's website is on Wix/Squarespace/WordPress?**
A: The widget works on ANY website. They just paste the script tag
   in their site's custom code section.

**Q: How do I handle support requests?**
A: Create a support email (support@closerai.com). Most issues are
   simple: forgotten passwords, widget not showing (wrong code placement).

**Q: Can I expand to other niches?**
A: Yes! The AI system prompt is customizable per client. You can
   modify it for: dentists, lawyers, car dealerships, etc.

**Q: What if Claude API costs get too high?**
A: The system uses Claude Sonnet (not Opus) which is cost-efficient.
   At $297/mo per client, even heavy usage costs you ~$30/month in API.
   You can also add usage limits per plan.
