# AGENT_HANDOFF.md
# Jewelry Shop Capstone — AI Agent Continuation Guide

> **Purpose:** This document allows any AI agent (or the same agent after a usage reset) to
> pick up exactly where the previous session left off — with full context, zero re-explanation.
>
> **Last Updated:** 2026-09-23 (Phase 4 complete)  
> **Project Owner:** Trapi Seth  
> **GitHub Repo:** https://github.com/MrSethZinTwoAccoundRealNoFakeOnTheMix/jewelry-shop_capstone-project-.git

---

## Quick Status

| Phase | Status | Description |
|:---|:---|:---|
| **Phase 1** | ✅ COMPLETE | Database layer, config, repositories |
| **Phase 2** | ✅ COMPLETE | Backend API — routes, services, middlewares, Express server |
| **Phase 3** | ✅ COMPLETE | Customer webview (Tailwind CSS, mobile-first) |
| **Phase 4** | ✅ COMPLETE | Admin panel (Tailwind CSS, mobile-first) |
| **Phase 5** | ⏳ NEXT | Meta Messenger webhook + notifications |
| **Phase 6** | 🔜 PENDING | Khmer language toggle |
| **Phase 7** | 🔜 PENDING | Telegram bot (deferred) |




---

## Project Overview

A **no-login, mobile-first jewelry e-commerce system** for a Cambodian shop. Customers browse a
product catalog via a Meta Messenger webview link. The shop owner gets orders, confirms payment,
and manages inventory via an admin panel. Orders are tied to verified Messenger identities using
server-signed HMAC-SHA256 URLs — no accounts, no passwords.

**Reference prototype:** `C:\Capstone Project\messenger-spike\` (working 568-line monolith)  
**Production target:** `C:\Capstone Project\jewelry-shop\` (this repo — modular 3-tier architecture)

---

## Locked Architecture Decisions

All of these are FINAL — do not re-discuss:

### Payment & Order Flow
- **KHQR display-only** (no Bakong webhook) — owner manually verifies payment in Bakong app
- **No customer payment method selection** — all orders go through the same flow
- **Order lifecycle:** `PENDING → CONFIRMED → SHIPPED → CANCELLED | RETURNED`

### Inventory Rules (CRITICAL)
```
STOCK DECREMENT:  happens at PENDING → CONFIRMED (owner confirms payment received)
STOCK INCREMENT:  happens at:
  - CONFIRMED → CANCELLED  (pre-shipment refund — stock returns to shelf)
  - PENDING   → CANCELLED  (no stock change — stock was never decremented)
  - SHIPPED   → RETURNED   (post-shipment Boom delivery failure — owner clicks "Mark as Returned")
```

### Atomic SQL Pattern
```sql
-- Decrement (prevents overselling):
UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?;
-- Check result.changes === 0 → throw 409 Insufficient Stock

-- Increment (restore on cancel/return):
UPDATE products SET stock = stock + ? WHERE id = ?;
```

### Tech Stack
| Layer | Technology |
|:---|:---|
| Runtime | Node.js v22+ LTS |
| Framework | Express.js v5 (CommonJS — no ESM) |
| Database | SQLite via `better-sqlite3` (WAL mode) |
| Image Engine | `sharp` + `multer` (800px WebP, 80% quality) |
| Frontend | HTML + Tailwind CSS via CDN (no build step) |
| Identity | HMAC-SHA256 PSID signing (`APP_SECRET`) |
| Notifications | Meta Graph API carousel + text messages |
| Currency | USD primary + KHR display (1 USD = 4,100 KHR, fixed) |
| Language | English first → Khmer toggle added in Phase 6 |
| Process Mgr | PM2 |
| Tunnel | Cloudflare Zero Trust (`cloudflared`) |
| Host | Proxmox LXC Ubuntu 24.04 @ 192.168.100.232 |

### Security Rules
- **Dev bypass:** `NODE_ENV !== 'production' && sig === 'demo-bypass'` allows checkout without real PSID
- **Production:** `NODE_ENV=production` in server `.env` — bypass is NEVER active
- **Local dev:** `NODE_ENV=development` (currently set in local `.env`) — bypass active for testing
- **Admin auth:** HMAC token from `ADMIN_PASSWORD` + `APP_SECRET`, sent as `X-Admin-Token` header

---

## What EXISTS in the Repo (Phase 1 Files)

```
jewelry-shop/
├── .env.example                        ✅ committed
├── .gitignore                          ✅ committed
├── ecosystem.config.js                 ✅ committed
├── package.json                        ✅ committed
├── PRODUCTION_ARCHITECTURE_BLUEPRINT.md ✅ committed
├── AGENT_HANDOFF.md                    ✅ this file
│
├── public/
│   ├── index.html                      ✅ Phase 3 DONE
│   ├── admin.html                      ✅ Phase 4 DONE
│   ├── css/
│   │   ├── webview.css                 ✅ Phase 3 DONE
│   │   └── admin.css                   ✅ Phase 4 DONE
│   ├── js/
│   │   ├── webview.js                  ✅ Phase 3 DONE
│   │   └── admin.js                    ✅ Phase 4 DONE
│   └── uploads/.gitkeep               ✅ committed
│


└── src/
    ├── config/
    │   ├── index.js                    ✅ Phase 1 DONE
    │   └── constants.js                ✅ Phase 1 DONE
    ├── db/
    │   ├── index.js                    ✅ Phase 1 DONE
    │   ├── migrate.js                  ✅ Phase 1 DONE
    │   ├── seed.js                     ✅ Phase 1 DONE
    │   └── migrations/
    │       ├── 001_init_schema.sql     ✅ Phase 1 DONE
    │       └── 002_add_indexes.sql     ✅ Phase 1 DONE
    ├── repositories/
    │   ├── product.repository.js       ✅ Phase 1 DONE
    │   └── order.repository.js         ✅ Phase 1 DONE
    │
    ├── controllers/                    ✅ Phase 2 DONE
    ├── middlewares/                    ✅ Phase 2 DONE
    ├── routes/                         ✅ Phase 2 DONE
    ├── services/                       ✅ Phase 2 DONE
    ├── templates/                      ✅ Phase 2 DONE
    └── utils/                          ✅ Phase 2 DONE
    ├── app.js                          ✅ Phase 2 DONE
    └── server.js                       ✅ Phase 2 DONE
```

---

## Phase 2 — Backend API (✅ COMPLETE)


**Goal:** Every API endpoint works and returns correct JSON. No frontend yet.  
**Test method:** curl commands (listed at bottom of this section)

### Files to create in order:

#### Utils (no dependencies)
1. `src/utils/logger.js` — structured console logger with timestamps (`logger.info/warn/error`)
2. `src/utils/crypto.js` — thin wrappers around Node.js `crypto` (`createHmac`, `timingSafeEqual`)

#### Services (depend on repos + config)
3. `src/services/identity.service.js`
   - `generateSignedUrl(psid)` → `${BASE_URL}/webview?psid=${psid}&sig=${hmac}`
   - `verifyToken(psid, sig)` → `{ok: boolean, reason?: string}`
   - Dev bypass: `if (NODE_ENV !== 'production' && sig === 'demo-bypass') return { ok: true }`

4. `src/services/auth.service.js`
   - `generateAdminToken()` → `HMAC-SHA256(APP_SECRET, 'admin:' + ADMIN_PASSWORD)`
   - `verifyAdminToken(token)` → boolean (use `timingSafeEqual`)

5. `src/services/image.service.js`
   - Multer `memoryStorage()` (buffer, NOT disk — sharp processes from buffer)
   - Sharp: `.resize({ width: 800, withoutEnlargement: true }).webp({ quality: 80 })`
   - Save to `public/uploads/{timestamp}-{random}.webp`
   - Return relative URL: `uploads/{filename}.webp`

6. `src/services/inventory.service.js`
   - `atomicDecrement(id, qty)` — calls `product.repository.decrementStock`, throws if `changes === 0`
   - `increment(id, qty)` — calls `product.repository.incrementStock`

7. `src/services/order.service.js`
   - `placeOrder({ psid, sig, items, customer_name, phone, address, note })`
     1. `verifyToken(psid, sig)` — throw 403 if invalid
     2. Consolidate duplicate productIds in cart (Map reduce)
     3. For each item: `product.repository.findById()` — throw 400 if not found
     4. Check stock >= quantity — throw 400 if insufficient (soft check only, no decrement)
     5. Calculate totalAmount from DB prices (not client prices — never trust client)
     6. `orderId = 'ORD-' + Date.now()`
     7. `order.repository.create(...)` — inserts PENDING order
     8. Fire-and-forget: `messenger.service.sendOrderReceipt()`
     9. Return `{ orderId, total, status: 'PENDING' }`
   - `confirmOrder(id)` → `order.repository.confirmOrder(id)` (atomic decrement inside)
   - `cancelOrder(id)` → `order.repository.cancelOrder(id)` (restores stock if was CONFIRMED)
   - `shipOrder(id)` → `order.repository.shipOrder(id)` then fire-and-forget messenger notify
   - `returnOrder(id)` → `order.repository.returnOrder(id)` (restores stock)

8. `src/services/messenger.service.js`
   - `sendOrderReceipt(psid, order, items)` — carousel of items + text summary
     - API: `POST https://graph.facebook.com/v20.0/me/messages?access_token=${PAGE_TOKEN}`
     - `messaging_type: 'RESPONSE'`
     - Items carousel (generic template, max 10 elements)
     - Then text: "🛍️ Order Received! Order ID: {id}, Total: ${total}..."
     - Wrap in try/catch — log error, NEVER throw (fire-and-forget)
   - `sendShippingNotification(psid, orderId)` — text message
     - "📦 Your order #{orderId} has been shipped! Thank you for shopping with us."
     - Wrap in try/catch — log error + Meta error code, NEVER throw
     - This WILL fail if 24h window expired — that's expected and acceptable

#### Middlewares
9. `src/middlewares/requireAdmin.js`
   - Read `req.headers['x-admin-token']`
   - Call `auth.service.verifyAdminToken(token)`
   - Return `401` if invalid

10. `src/middlewares/verifyWebhookSignature.js`
    - Capture raw body: `express.json({ verify: (req, _, buf) => { req.rawBody = buf; } })`
    - Compare `X-Hub-Signature-256` header against `sha256=` + HMAC of `req.rawBody`
    - Return `403` if invalid

11. `src/middlewares/rateLimiter.js`
    - In-memory Map: `psid → [timestamps]`
    - Max 5 order submissions per PSID per hour
    - Max 20 catalog requests per IP per minute
    - Return `429 Too Many Requests` on breach
    - Clean up stale entries periodically

12. `src/middlewares/errorHandler.js`
    - Signature: `(err, req, res, next)`
    - Log error with `logger.error`
    - Return `{ error: err.message }` JSON
    - In production: never include stack trace

#### Templates
13. `src/templates/locales/en.js` — English strings object
    ```javascript
    module.exports = {
      greeting: "👋 Hello! Welcome to Luxe Jewelry ✨\nHow can we help you today?...",
      shopGuide: "🛍️ How to Order:\n1. Tap 'Open Shop' below...",
      // etc.
    }
    ```
14. `src/templates/messengerCards.js` — carousel element builder functions
    - `buildItemElement(item, shopUrl)` → generic template element object
    - `buildButtonTemplate(text, url)` → button template message object
    - `QUICK_REPLIES` — constant array with "Open Shop" pill

#### Controllers (thin — parse request, call service, return JSON)
15. `src/controllers/customer.controller.js`
    - `getCatalog(req, res)` → `product.repository.findAll()`
    - `verifyIdentity(req, res)` → `identity.service.verifyToken(psid, sig)`
    - `placeOrder(req, res)` → `order.service.placeOrder(req.body)`

16. `src/controllers/admin.controller.js`
    - `login(req, res)` → validate password, return token
    - `getProducts(req, res)` → `product.repository.findAllAdmin()`
    - `upsertProduct(req, res)` → `image.service.upload` middleware + `product.repository.upsert()`
    - `deleteProduct(req, res)` → `product.repository.remove(id)`
    - `getOrders(req, res)` → `order.repository.findAll()`
    - `confirmOrder(req, res)` → `order.service.confirmOrder(id)`
    - `cancelOrder(req, res)` → `order.service.cancelOrder(id)`
    - `shipOrder(req, res)` → `order.service.shipOrder(id)`
    - `returnOrder(req, res)` → `order.service.returnOrder(id)`

17. `src/controllers/webhook.controller.js`
    - `verifyChallenge(req, res)` → check `hub.verify_token`, return `hub.challenge`
    - `handleEvent(req, res)` → extract PSID, two-tier reply (see prototype `server.js` lines 431–563 for exact logic)
    - In-memory cooldown: `Map<psid, timestamp>` with `SHOP_LINK_COOLDOWN_MS` from constants

#### Routes
18. `src/routes/customer.routes.js`
    ```
    GET  /api/products   → getCatalog
    GET  /api/identity   → verifyIdentity
    POST /api/orders     → rateLimiter (order) → placeOrder
    ```
19. `src/routes/admin.routes.js`
    ```
    POST /api/admin/login                   → login
    GET  /api/admin/products                → requireAdmin → getProducts
    POST /api/admin/products                → requireAdmin → multer → upsertProduct
    DELETE /api/admin/products/:id          → requireAdmin → deleteProduct
    GET  /api/admin/orders                  → requireAdmin → getOrders
    POST /api/admin/orders/:id/confirm      → requireAdmin → confirmOrder
    POST /api/admin/orders/:id/cancel       → requireAdmin → cancelOrder
    POST /api/admin/orders/:id/ship         → requireAdmin → shipOrder
    POST /api/admin/orders/:id/return       → requireAdmin → returnOrder
    ```
20. `src/routes/webhook.routes.js`
    ```
    GET  /webhook  → verifyChallenge
    POST /webhook  → verifyWebhookSignature → handleEvent
    ```
21. `src/routes/index.js` — master aggregator, mounts all route groups

#### App Entry Points
22. `src/app.js`
    ```javascript
    const app = express();
    app.use(express.json({ verify: rawBodyCapture }));  // capture raw body for webhook sig
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname, '../public')));
    app.get(['/', '/webview'], sendIndex);
    app.get('/admin', sendAdmin);
    app.use('/api', customerRoutes);
    app.use('/api/admin', adminRoutes);      // Note: requireAdmin applied per-route inside
    app.use('/', webhookRoutes);
    app.use(errorHandler);
    ```

23. `src/server.js`
    ```javascript
    const app = require('./app');
    const { PORT } = require('./config');
    const db = require('./db');
    const server = app.listen(PORT, () => logger.info(`Server on :${PORT}`));
    // Graceful shutdown
    process.on('SIGTERM', () => { server.close(() => { db.close(); process.exit(0); }); });
    process.on('SIGINT',  () => { server.close(() => { db.close(); process.exit(0); }); });
    ```

### Phase 2 Test Commands (curl)
```bash
# Start: npm run dev

# 1. Public catalog
curl http://localhost:3000/api/products

# 2. Identity verify (dev bypass)
curl "http://localhost:3000/api/identity?psid=test-user&sig=demo-bypass"
# Expected: { "verified": true, "psid": "test-user" }

# 3. Place order (dev bypass) — save orderId from response
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d "{\"psid\":\"test-user\",\"sig\":\"demo-bypass\",\"items\":[{\"productId\":\"RG-0001\",\"quantity\":1}],\"customer_name\":\"Test Customer\",\"phone\":\"012345678\",\"address\":\"Phnom Penh\",\"note\":\"Ring size 7\"}"
# Expected: { "success": true, "orderId": "ORD-...", "total": 45, "status": "PENDING" }
# Verify: RG-0001 stock should still be 10 (not decremented yet)

# 4. Admin login
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d "{\"password\":\"admin\"}"
# Save the token from response

# 5. Admin orders list
curl http://localhost:3000/api/admin/orders -H "X-Admin-Token: <TOKEN>"

# 6. Confirm order → STOCK DECREMENTS HERE
curl -X POST http://localhost:3000/api/admin/orders/ORD-XXXXXX/confirm \
  -H "X-Admin-Token: <TOKEN>"
# Verify: RG-0001 stock should now be 9

# 7. Ship order → Messenger notification fires (may fail in dev, that's OK)
curl -X POST http://localhost:3000/api/admin/orders/ORD-XXXXXX/ship \
  -H "X-Admin-Token: <TOKEN>"

# 8. Webhook challenge
curl "http://localhost:3000/webhook?hub.mode=subscribe&hub.verify_token=jewelry_secret_webhook_token_2026&hub.challenge=99999"
# Expected: 99999

# 9. Rate limit test (run 6 times fast)
for i in 1 2 3 4 5 6; do
  curl -X POST http://localhost:3000/api/orders -H "Content-Type: application/json" \
    -d "{\"psid\":\"spam-test\",\"sig\":\"demo-bypass\",\"items\":[{\"productId\":\"RG-0001\",\"quantity\":1}],\"customer_name\":\"T\",\"phone\":\"1\",\"address\":\"A\"}"
done
# 6th request should return 429
```

---

## Phase 3 — Customer Webview (✅ COMPLETE)

**Files:** `public/index.html`, `public/js/webview.js`, `public/css/webview.css`


**Design:**
- Dark luxury: background `#1a1a2e`, gold accent `#c9a84c`
- Tailwind CSS via CDN: `<script src="https://cdn.tailwindcss.com"></script>`
- Mobile-first (375px Messenger webview)
- Dual currency: `$45.00 / ៛184,500` everywhere

**Sections:** Header + cart badge → Category filter tabs → Product grid → Cart drawer → Checkout form + KHQR → Order success screen

**KHQR:** Display static/hardcoded QR image for the total amount (no dynamic Bakong generation — future work)

**Identity guard:** If URL has no valid `psid`+`sig`, checkout button is disabled with message "📱 Message us on Facebook to get your shopping link"

**Reference:** See `messenger-spike/index.html` for the working prototype to migrate from

---

## Phase 4 — Admin Panel (✅ COMPLETE)

**Files:** `public/admin.html`, `public/js/admin.js`, `public/css/admin.css`


**Design:** Dark admin — sidebar `#0f172a`, content `#1e293b`, Tailwind CDN

**Order action buttons by status:**
- `PENDING` → [✅ Confirm & Pack] [❌ Cancel]
- `CONFIRMED` → [🚚 Ship] [❌ Cancel]
- `SHIPPED` → [📦 Mark as Returned]
- `CANCELLED` / `RETURNED` → read-only (no actions)

**Reference:** See `messenger-spike/admin.html` for the working prototype to migrate from

---

## Phase 5 — Meta Messenger Webhook (after Phase 4 checkpoint passes)

Live testing with real Facebook Tester account. All code already written in Phase 2.
Steps:
1. SSH into LXC `192.168.100.232`, pull from Git, `npm ci`, `npm run migrate`
2. `pm2 start ecosystem.config.js`, verify `pm2 status`
3. In Meta Developer Portal: set webhook URL to `https://test.trapiseth.site/webhook`
4. Subscribe to `messages` and `messaging_postbacks` fields
5. Add test Facebook account as Tester under App Roles
6. Message the page, receive signed URL, checkout, verify receipt carousel

---

## Phase 6 — Khmer Language Toggle (after Phase 5 passes)

Add `src/templates/locales/km.js` with Khmer translations.
Toggle button `🇰🇭 KM / EN` in top-right of both pages.
`setLanguage(lang)` swaps the active strings object from `en.js` or `km.js`.
Preference saved to `localStorage`.

---

## Phase 7 — Telegram Bot (after Phase 6 or separately)

Steps when ready:
1. Create bot via @BotFather on Telegram → get `TELEGRAM_BOT_TOKEN`
2. Get owner chat ID via @userinfobot
3. Add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_OWNER_CHAT_ID` to `.env`
4. Install `node-telegram-bot-api`: `npm install node-telegram-bot-api`
5. Create `src/services/telegram.service.js`
6. Hook into `order.service.placeOrder()` to send notification on new order
7. Implement inline keyboard: [✅ Confirm] [❌ Cancel] callback handlers

---

## Key Files for Reference

| File | Purpose |
|:---|:---|
| `messenger-spike/server.js` | Working prototype (568 lines) — source of truth for business logic |
| `messenger-spike/index.html` | Working customer webview — migrate to Phase 3 |
| `messenger-spike/admin.html` | Working admin panel — migrate to Phase 4 |
| `PRODUCTION_ARCHITECTURE_BLUEPRINT.md` | Original architecture document |
| `src/repositories/order.repository.js` | 5-state order lifecycle with atomic transactions |
| `src/repositories/product.repository.js` | Atomic stock decrement/increment |

---

## Environment Notes

- **Local dev `.env`:** `NODE_ENV=development` (enables `sig=demo-bypass` for testing)
- **Production server `.env`:** `NODE_ENV=production` (bypass NEVER active)
- **The real `.env` is NOT committed to git** (correctly gitignored)
- `npm run migrate` before first run on any new machine
- `npm run seed` to populate sample products (idempotent, safe to re-run)

---

*If you are an AI agent reading this: Phases 1, 2, 3, and 4 are COMPLETE. Start with Phase 5 (Meta Messenger Webhook live configuration & notifications). Do not rebuild Phases 1, 2, 3, or 4.*



