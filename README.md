# Luxe Jewelry — Accountless Social Commerce Platform 💍

A production-ready, mobile-first social commerce platform built for high-end boutique jewelry retail. It seamlessly connects **Facebook Messenger**, **Mobile Webviews (No Login / Zero Registration)**, **Telegram Owner Real-time Alerts & Controls**, and **Bakong KHQR Payments** into a unified e-commerce experience.

---

## 🌟 Key Architecture & Highlights

1. **Accountless / Zero Registration (Frictionless Buying):**
   - Customers never need to create an account, register passwords, or download an app.
   - Customers are authenticated through a cryptographically signed HMAC-SHA256 link (`?psid=...&sig=...`) delivered directly inside Facebook Messenger.
   - Prevents impersonation and spoofing with timing-safe constant-time signature validation.

2. **Automated Messenger Integration & Bot Lifecycle:**
   - **Ice Breakers & Quick Replies:** Instant prompt chips above the chat (*"✨ Open Jewelry Store"*, *"💍 How do I place an order?"*, *"📍 Store Location"*).
   - **Get Started Button & Persistent Menu:** In-chat 3-bar hamburger navigation directly opening the catalog.
   - **Smart Auto-Reply & Cooldown:** Automated greetings with configurable in-memory cooldown (`SHOP_LINK_COOLDOWN_MS`) to prevent spamming while guaranteeing instant responses to explicit store requests.
   - **Rich Media Carousels:** Order receipts with photos, order IDs, quantities, and direct links are delivered to the customer's Messenger thread within Meta's 24-hour customer care window.
   - **Automated Shipping Alerts:** Push notifications automatically dispatched to Messenger when an order transitions to `SHIPPED`.

3. **Telegram Real-time Owner Alerts & Action Center:**
   - Instant rich Markdown notifications for every new order submission.
   - Interactive Inline Keyboards allowing the store owner to **Confirm (✅)** or **Cancel (❌)** orders directly from Telegram with a single tap.
   - Interactive `/menu` command with summary metrics, pending order counts, quick status lookups, and inventory alerts.

4. **Owner Admin Web Dashboard:**
   - Mobile-first, responsive inventory and order management panel.
   - HMAC-SHA256 authenticated session (`X-Admin-Token`).
   - Full order lifecycle state machine: `PENDING` ➔ `CONFIRMED` ➔ `SHIPPED` ➔ `CANCELLED` / `RETURNED`.
   - Automatic atomic stock management (inventory decrements upon `CONFIRMED`, automatically returns upon `CANCELLED` or `RETURNED`).
   - Product catalog management with automated image optimization (Sharp: WebP conversion, auto-resizing, compression).
   - Real-time gross sales, revenue, profit margins, and export to CSV.

5. **Local Payments Ready (Cambodia KHQR):**
   - Integrated Bakong KHQR generator with fixed USD-to-KHR exchange rates (`4,100 KHR`).
   - Dynamic deep-link generator for Cambodian mobile banking apps with QR display and fallback.

---

## 🏗️ Technology Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js (v20+ / v22 LTS recommended) |
| **Backend Framework** | Express.js (Modular Route/Controller/Service/Repository pattern) |
| **Database** | SQLite3 (`better-sqlite3` in WAL mode for ultra-fast ACID transactions) |
| **Security & Auth** | Node.js Native `crypto` (HMAC-SHA256, `timingSafeEqual`), In-Memory Sliding-Window Rate Limiters |
| **Messaging & Bots** | Meta Graph API v20.0 (`node-fetch`), Telegram Bot API (`node-telegram-bot-api` Long-Polling) |
| **Image Processing** | `sharp` (WebP optimization, max width 800px, quality 80%) |
| **Process Manager** | PM2 |
| **Reverse Proxy / SSL** | Cloudflare Tunnel (`cloudflared`) |

---

## 📂 Project Directory Structure

```
jewelry-shop/
├── .env                              # Environment secrets (git-ignored)
├── .env.example                      # Template environment variables
├── ecosystem.config.js               # PM2 process configuration
├── package.json                      # Project dependencies & scripts
├── setup-messenger-profile.js        # Graph API script for Ice Breakers & Persistent Menu
│
├── public/                           # Frontend Assets & Webviews
│   ├── css/
│   │   └── style.css                 # Custom styles & micro-animations
│   ├── js/
│   │   ├── admin.js                  # Admin dashboard logic & charts
│   │   └── webview.js                # Customer catalog, cart, KHQR & checkout
│   ├── uploads/                      # Processed WebP product images
│   ├── admin.html                    # Admin management panel
│   └── index.html                    # Mobile-first customer store webview
│
├── src/
│   ├── server.js                     # Server entrypoint & graceful shutdown handlers
│   ├── app.js                        # Express app setup, middleware, security headers
│   │
│   ├── config/
│   │   ├── index.js                  # Environment variable validator & exporter
│   │   └── constants.js              # Business constants (cooldowns, rates, statuses)
│   │
│   ├── controllers/
│   │   ├── admin.controller.js       # Admin auth, product upsert, order status transitions
│   │   ├── order.controller.js       # Customer order submissions & receipt queries
│   │   ├── product.controller.js     # Public catalog query endpoints
│   │   └── webhook.controller.js     # Meta Messenger webhook verification & event handler
│   │
│   ├── middlewares/
│   │   ├── adminAuth.js              # Validates X-Admin-Token via HMAC
│   │   ├── rateLimiter.js            # Sliding-window rate limiters for orders & catalog
│   │   └── webhookVerify.js          # Meta X-Hub-Signature-256 HMAC verification
│   │
│   ├── repositories/
│   │   ├── db.js                     # SQLite connection manager & WAL enabler
│   │   ├── order.repository.js       # ACID order queries & transaction wrappers
│   │   └── product.repository.js     # Product queries, stock modifiers & analytics
│   │
│   ├── routes/
│   │   ├── admin.routes.js           # /api/admin/*
│   │   ├── order.routes.js           # /api/orders/*
│   │   ├── product.routes.js         # /api/products/*
│   │   └── webhook.routes.js         # /webhook (GET & POST)
│   │
│   ├── services/
│   │   ├── auth.service.js           # Admin token generator & password checker
│   │   ├── identity.service.js       # Customer PSID cryptographic signer & validator
│   │   ├── image.service.js          # Sharp image pipeline (WebP / auto-orient)
│   │   ├── inventory.service.js      # Stock decrement/restore logic
│   │   ├── messenger.service.js      # Meta Graph API sender (carousels, receipts, text)
│   │   ├── order.service.js          # Order coordinator (DB + Messenger + Telegram)
│   │   └── telegram.service.js       # Telegram bot polling, alerts & inline button handlers
│   │
│   ├── templates/
│   │   ├── messengerCards.js         # Generic carousel builders & quick reply pills
│   │   └── locales/
│   │       ├── en.js                 # English message templates
│   │       └── km.js                 # Khmer (ភាសាខ្មែរ) message templates
│   │
│   └── utils/
│       ├── crypto.js                 # HMAC & timing-safe equality utilities
│       ├── formatters.js             # Currency (USD/KHR) & date formatters
│       └── logger.js                 # Structured console logger
│
└── migrations/                       # Database DDL & initial seed scripts
    ├── 001_init.sql                  # Products, orders, order_items table definitions
    ├── migrate.js                    # SQLite schema migration runner
    └── seed.js                       # Idempotent demo jewelry inventory seeder
```

---

## ⚙️ Environment Variables Reference

Create a `.env` file in the root directory (based on `.env.example`):

```env
PORT=3000
NODE_ENV=production
BASE_URL=https://your-domain.com

# --- Meta App & Messenger ---
APP_SECRET=your_meta_app_secret_here
APP_SESSION_TOKEN=your_meta_page_access_token_here
VERIFY_TOKEN=your_webhook_verify_token_here

# --- Admin Security ---
ADMIN_PASSWORD=your_secure_admin_password_here

# --- Telegram Notifications & Owner Control ---
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_OWNER_CHAT_ID=your_telegram_user_id_here
TELEGRAM_OWNER_CHAT_ID_2=optional_second_owner_id_here
```

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Run migrations and seed sample jewelry products
npm run migrate
npm run seed

# 3. Start development server with live reload
npm run dev
```

Visit:
- **Customer Store:** `http://localhost:3000`
- **Admin Dashboard:** `http://localhost:3000/admin.html`

---

## 📖 Deployment Guide
For complete step-by-step instructions on deploying to Proxmox LXC, configuring PM2, setting up Cloudflare Tunnels, and configuring Meta Messenger Profile and Webhooks, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).
