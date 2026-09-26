# AGENT_HANDOFF.md
# Jewelry Shop Capstone — AI Agent Continuation Guide

> **Purpose:** This document allows any AI agent (or the same agent after a usage reset) to
> pick up exactly where the previous session left off — with full context, zero re-explanation.
>
> **Last Updated:** 2026-09-26 (Phase 9 complete — Dynamic categories, SPU/SKU container variants, Quick Sell POS with color drawer & undo restock)  
> **Project Owner:** Trapi Seth  
> **Stable Backup Branch:** `phase8-stable` (Commit `52da4fa`)  
> **GitHub Repo:** https://github.com/MrSethZinTwoAccoundRealNoFakeOnTheMix/final-year_capstone-project.git

---

## Quick Status

| Phase | Status | Description |
|:---|:---|:---|
| **Phase 1** | ✅ COMPLETE | Database layer, config, repositories |
| **Phase 2** | ✅ COMPLETE | Backend API — routes, services, middlewares, Express server |
| **Phase 3** | ✅ COMPLETE | Customer webview (Tailwind CSS, mobile-first) |
| **Phase 4** | ✅ COMPLETE | Admin panel (Tailwind CSS, mobile-first) |
| **Phase 5** | ✅ COMPLETE | Meta Messenger webhook + notifications (Live verified) |
| **Phase 6** | ✅ COMPLETE | Khmer language toggle (🇰🇭 KM / EN) |
| **Phase 7** | ✅ COMPLETE | Telegram bot — new order alerts + inline confirm/cancel keyboard |
| **Phase 8** | ✅ COMPLETE | Admin order UX redesign, COD/KHQR/VET checkout, COMPLETED status, rate limiter & button debounce |
| **Phase 9** | ✅ COMPLETE | Dynamic categories (name-only), SPU/SKU container variants (`product_variants`), Quick Sell POS with color drawer & undo restock |
| **Phase 10** | ✅ COMPLETE | Admin Inventory Redesign, Visual-first cards (96px), Staged Delta Stock adjustments (Option A) with batch commit |
| **Phase 11** | ✅ COMPLETE | Customer Storefront Redesign: Visual mini-swatches (Option B), Curated Section Stack (Approach B), Live Search, Style Bottom Sheet Modal & Variant Checkout |
| **Phase 12** | 🟢 READY | Live Homelab Testing & Future Refinements |






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


├── scripts/
│   ├── setup-messenger-profile.js      ✅ committed
│   └── test_redesign_verification.js   ✅ Phase 9 DONE (Automated test suite)
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
    │       ├── 002_add_indexes.sql     ✅ Phase 1 DONE
    │       ├── 003_add_payment_method.sql ✅ Phase 8 DONE
    │       ├── 004_add_is_active_to_products.sql ✅ Phase 8 DONE
    │       ├── 005_update_orders_schema_phase8.sql ✅ Phase 8 DONE
    │       └── 006_add_variants_and_categories.sql ✅ Phase 9 DONE
    ├── repositories/
    │   ├── product.repository.js       ✅ Phase 1 + Phase 9 (Container SPU/SKU)
    │   ├── order.repository.js         ✅ Phase 1 DONE
    │   ├── category.repository.js      ✅ Phase 9 DONE (Dynamic name-only categories)
    │   └── variant.repository.js       ✅ Phase 9 DONE (Product variants & stock sync)
    │
    ├── controllers/                    ✅ Phase 2 + Phase 9 (Upload, Categories, Quick Sell)
    ├── middlewares/                    ✅ Phase 2 DONE
    ├── routes/                         ✅ Phase 2 + Phase 9
    ├── services/                       ✅ Phase 2 DONE
    ├── templates/                      ✅ Phase 2 + Phase 6 (Khmer translations)
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

## Phase 5 — Meta Messenger Webhook & Live Messaging (✅ COMPLETE)

Live integration tested and verified with real Facebook Page Token and real PSID (`28248567978157531`).
- Bilingual guide text sent and delivered to Messenger.
- Signed store button card template sent and delivered.
- Order confirmation receipt carousel sent and delivered.
- Failure safeguards and graceful non-blocking behavior verified.


---

## Phase 6 — Khmer Language Toggle (✅ COMPLETE)

- Created `src/templates/locales/km.js` with full Khmer translation templates.
- Toggle button `🇰🇭 KM / EN` added to Customer Webview and Owner Admin headers.
- Client-side zero-latency bilingual switching engine with `localStorage` persistence.
- Translates catalog categories, stock badges, shopping bag, delivery form, KHQR guide, success receipt, and admin order queue actions.


---

## Phase 7 — Telegram Bot (✅ COMPLETE)

- `node-telegram-bot-api@0.66.0` installed (long-polling mode — no tunnel required).
- `src/services/telegram.service.js` created with graceful no-op if env vars missing.
- **New order** → owner receives Telegram message with order details + `[✅ Confirm & Pack]` `[❌ Cancel]` inline keyboard.
- Tapping **Confirm** from Telegram calls `orderService.confirmOrder()` and decrements stock.
- Tapping **Cancel** from Telegram calls `orderService.cancelOrder()` and restores stock.
- **Ship** → owner receives Telegram confirmation that customer was notified.
- **Cancel** (from admin panel) → owner receives Telegram info alert.
- **Return** → owner receives Telegram alert that stock is restored.
- Inline keyboard buttons disappear after tap (message is edited).
- Graceful failure: all Telegram calls are fire-and-forget, never crash the server.
- `TELEGRAM_BOT_TOKEN` and `TELEGRAM_OWNER_CHAT_ID` added to config and `.env.example`.
- Bot polling stopped cleanly on `SIGTERM`/`SIGINT`.

---

## Phase 8 — Order UX Redesign, Multi-Delivery Checkout & Telegram Lifecycle (✅ COMPLETE)

- **Delivery / Payment Methods:** Supported `COD` (🛵 Cash on Delivery), `KHQR` (💳 Bakong QR payment), and `VET` (📦 Virak Buntham Express bus delivery).
- **Database Migrations:** `003_add_payment_method.sql` and `005_update_orders_schema_phase8.sql`.
- **Order Lifecycle Update:** Added `COMPLETED` state for delivered and settled orders.
- **Admin Delivery Switcher:** Shop owner can change delivery type dynamically from the order queue card (`PATCH /api/admin/orders/:id/delivery-type`).
- **Anti-Spam & Debounce:** `src/middlewares/rateLimiter.js` added 1-hour IP rate limit (max 5 orders/hr) and client-side 3-second button debounce to prevent duplicate order submissions.
- **Telegram Inline Keyboard:** Real-time bot notification allows owner to confirm or cancel orders directly from Telegram with inline buttons.

---

## Phase 9 — Dynamic Categories, SPU/SKU Container Variants & Quick Sell POS (✅ COMPLETE)

### Motivation & Architecture Shift
The previous "Color Group Tag" concept was abandoned because requiring the merchant to create multiple separate products and type the same text tag desynchronized pricing and caused severe cognitive friction. Real e-commerce platforms (Taobao, Shopee, Shopify) treat the product as a container (SPU) with child variants (SKU) inside.

### 1. Database Schema (`006_add_variants_and_categories.sql`)
- **`categories` Table:** Replaced hardcoded category enum with dynamic categories (`id INTEGER PRIMARY KEY AUTOINCREMENT`, `name TEXT NOT NULL UNIQUE`). Seeded with: `Hairpin`, `Brooch`, `Bag`, `Decor`, `Earring`, `Necklace`, `Ring`, `Bracelet`.
- **`products` Table:** Removed CHECK constraint on category, added `has_variants INTEGER NOT NULL DEFAULT 0`. Preserved all existing 1,004 products.
- **`product_variants` Table:** Dedicated child variant table (`id TEXT PRIMARY KEY`, `product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE`, `color_name TEXT NOT NULL`, `import_price REAL NOT NULL`, `sell_price REAL NOT NULL`, `stock INTEGER NOT NULL DEFAULT 1`, `photo_url TEXT DEFAULT ''`, `is_active INTEGER NOT NULL DEFAULT 1`, `created_at`, `updated_at`).

### 2. Repositories
- **`src/repositories/category.repository.js`:** `findAll()`, `findByName(name)`, `findById(id)`, `create(name)` (zero prefix needed from owner), `remove(id)` (blocks deletion if active products exist).
- **`src/repositories/variant.repository.js`:** `findByProductId()`, `findById()`, `replaceForProduct(productId, variants)` in atomic transaction with `syncParentStock()`, `decrementStock()`, `incrementStock()`.
- **`src/repositories/product.repository.js`:**
  - `findAllAdmin()`: Attaches `variant_list` in O(N) map.
  - `generateSku(category)`: Auto-derives 2-letter uppercase prefix in code (e.g. `HP-0001`, `BR-0001`) without asking owner.
  - `upsert()`: Handles SPU container info, default stock `1`, and `has_variants`.

### 3. Controllers & Routes
- `POST /api/admin/upload-image`: Instant image processor & uploader via `sharp` (800px WebP) for parent cover and child variant photos.
- `GET|POST|DELETE /api/admin/categories`: Name-only dynamic categories management.
- `POST /api/admin/products`: SPU/SKU container upsert handling parent info + child `color_variants` array in one payload, auto-calculates total stock.
- `POST /api/admin/products/:id/deduct`: Quick Sell deduction. Supports standalone products or specific variants via `{ variant_id }`.
- `POST /api/admin/products/:id/restock`: Quick Sell restock/undo for standalone products or variants.

### 4. Admin Frontend Features
- **Single-Screen Product Modal:** "Color Variations" toggle switch. When enabled, reveals inline variant rows inside the same modal.
- **Auto-Fill Pricing:** Top-level Cost and Sell price inputs pre-fill newly added variant rows so owner doesn't re-type identical prices.
- **Default Quantity:** All products and variants default to stock `1` (not 5).
- **Individual Colorway Photos:** Each variant row includes a photo upload button with immediate visual preview and background upload to `/api/admin/upload-image`.
- **Zero-Prefix Category Creation:** Inline `+ New` button opens quick-add box requiring name only.
- **Quick Sell POS Tab (`public/admin.html`, `public/js/admin.js`, `public/css/admin.css`):**
  - Sticky category filter chips ("All" + dynamic categories).
  - Standalone products show direct `− Deduct 1` button.
  - Multi-color items show `🎨 {N} Colors` badge and total stock; tapping card/button opens `#qs-variant-drawer`.
  - Variant drawer displays each colorway with photo, color name, price, stock, and deduct button.
  - Tapping deduct auto-closes drawer and opens `#qs-confirm-sheet` (with elevated z-index `z-[65]`).
  - Session deduction tracker bar (`#qs-deduction-bar`) logs deductions with 1-tap Undo/Restock toast and drawer log.
  - Reusable bottom sheet `#confirm-dialog` (`z-[70]`).

### 5. Key Bug Fixes in Phase 9
- **Unquoted Variant SKU ReferenceError:** In `admin.js`, variant buttons rendered with unquoted string IDs (e.g. `onclick="window.qsOpenConfirm('HP-0001', HP-0001-V1)"`), which threw `ReferenceError: HP is not defined`. Fixed by properly quoting `'${v.id}'` and matching with `String(v.id) === String(variantId)`.
- **Drawer Overshadowing Popup:** Variant drawer stayed open behind `#qs-confirm-sheet` with equal z-index. Fixed by auto-closing the variant drawer when opening the confirm sheet and elevating confirm sheet z-index to `z-[65]`.
- **Variant ID Preservation on Form Edit:** Product form previously parsed variant IDs through `Number()`, converting string IDs (`HP-0001-V1`) to `NaN`. Fixed by preserving string IDs on edit.

### 6. Automated Verification Test Suite
- `scripts/test_redesign_verification.js`: Automated end-to-end regression test suite verifying category creation, standalone product creation, variant container creation, variant deduction, parent stock sync, and restock/undo via controller. Passed 100%.

### 7. Jewelry Style Variations & Single-to-Variant Migration
- **Shift from "Colors" to "Styles":** In jewelry, variations represent subtle differences like gem size ("Small Gem" vs. "Big Gem"), style motifs, or finishes rather than just apparel colors. Replaced "Color Variations" with "Styles / Variations" in the admin modal, Quick Sell drawer, and inventory cards.
- **Smart Auto-Incremented Style Naming:** Tapping `+ Add Style` auto-generates sequential style names (`Style 1`, `Style 2`, `Style 3`...) based on existing row count and highest index. Zero typing required for the owner, but remains completely editable.
- **Automatic Single-to-Variant Photo Migration:** Fixed the critical workflow gap where converting an existing single product to variants caused the original photo to become trapped as the cover image without a variant entry. When toggling the variant switch ON for an existing product with a photo:
  - **Style 1** is automatically created with the existing product's photo, stock, and pricing intact.
  - **Style 2** is automatically prepared below it with default stock `1`, pre-filled prices, and ready for the owner to upload the second photo.
  - Total stock automatically updates to `currentStock + 1`. Zero searching for old photos or re-uploading needed.

---

## Phase 10 — Admin Inventory Redesign & Option A Staged Stock Adjustments (✅ COMPLETE)

### 1. Visual-First Inventory Card Layout
- **Visual Priority:** Since jewelry is identified visually rather than by name or barcode, inventory cards were enlarged to feature 96px high-resolution square photos with hover scale and click-to-lightbox zoom.
- **Dynamic Category Filtering & Live Search:** Sticky category chips (derived from `/api/categories`) and a real-time SKU/name search bar.
- **Multi-Style Accordion:** Expandable child row preview displaying each style's thumbnail, price, and stock.

### 2. Option A Staged Delta Stock Adjustments
- **The Problem:** Shop owners feared losing track of stock if `+` or `−` buttons were tapped accidentally or rapidly during a busy shift, corrupting inventory without an audit trail.
- **The Solution (Option A):**
  - Tapping `+` or `−` steppers on any product or variant **stages changes locally** in UI memory.
  - The badge visually reflects the staged adjustment: e.g. `2 → 3 (+1)` in amber, with an inline `[ ✕ ]` instant revert button.
  - A sticky floating action bar (`[ 📝 Save Changes ({N}) ✓ ]`) appears at the bottom.
  - Tapping "Save Changes" shows a review dialog with before-and-after counts, then executes an **atomic batch commit** against the backend.
  - Backend endpoints (`POST /api/admin/products/:id/restock` and `/deduct`) updated to accept `{ qty, variant_id }`.
- **Git Checkpoint Tag:** `checkpoint-before-inventory-redesign`.

---

## Phase 11 — Customer Storefront Redesign: Visual Swatches, Curated Sections & Style Drawer (✅ COMPLETE)

### 1. Visual-First Style Swatches (Option B)
- **Mini Photo Swatches (24px × 24px):** Product cards display a row of mini circular image thumbnails directly below the title.
- **Instant In-Card Preview:** Tapping any swatch swaps the card's main photo and updates the price directly on the card without opening a modal.
- **Smart Dynamic Pricing:** Displays a single price if variants share the same price (`$45.00`), or dynamic price range (`$45.00 – $52.00`) if prices differ.

### 2. Luxury Style Selection Bottom Sheet Modal (`#style-modal`)
- Tapping a product card or `[ ✨ Select Style ]` slides up an elegant drawer:
  - High-res photo preview updating dynamically as styles are selected.
  - 4-column visual grid of style photo tiles with style names and price badges. Active style is highlighted with a gold border ✨.
  - In-stock, low-stock (`Only X left`), and dimmed `Sold Out` badges.
  - Quantity stepper `[ − 1 + ]` respecting available stock.
  - Sticky CTA: `Add Style 2 to Bag • $52.00`.

### 3. Curated Section Stack Layout (Approach B)
- **"All Collections" View:** Instead of a jumbled product grid, products are organized into clean boutique shelves (`💍 Rings (8 pieces)` with an `[ Explore All → ]` link, followed by `📿 Necklaces (5 pieces)`).
- **Full-Size 2-Column Cards:** Keeps photos large and sharp on mobile screens.
- **Category Tabs:** Tapping any category tab (or `Explore All →`) seamlessly focuses the page into the full 2-column collection for that category.
- **Dynamic Category Navigation:** Loaded dynamically from `/api/categories`.

### 4. Minimalist Live Search Engine
- Integrated search bar at the top: `🔍 Search collection, style, or SKU...`
- Real-time filtering matching product name, category, SKU (`RG-0001`), or style name.
- Instant `[ ✕ ]` clear button to quickly return to the curated collections.

### 5. Backend Stock Synchronization & Order Placement
- **Public Catalog API (`GET /api/products`):** Attaches active `variant_list` while strictly hiding `import_price`.
- **Order Items Schema:** Auto-migration adds `variant_id TEXT DEFAULT NULL` to `order_items`.
- **Atomic Order Lifecycle:**
  - `placeOrder`: Accepts `variantId`, soft-checks against variant stock, sets variant unit price and style photo in `order_items`.
  - `confirmOrder`: Atomically decrements variant stock (or parent product stock) and syncs parent stock.
  - `cancelOrder`: Atomically restores variant stock and syncs parent stock.
- **Git Checkpoint Tag:** `checkpoint-before-customer-redesign`.

---

## Key Problems Encountered & Root-Cause Solutions

### 1. Telegram 409 Conflict (`terminated by other getUpdates request`)
- **Symptom:** Homelab server logs showed repeated `[ERROR] [Telegram] Polling error: ETELEGRAM ETELEGRAM: 409 Conflict: terminated by other getUpdates request; make sure that only one bot instance is running`.
- **Root Cause:** When `node src/server.js` was run as a local background daemon during browser testing, both the local dev machine and the homelab PM2 instance were polling Telegram simultaneously using the same `TELEGRAM_BOT_TOKEN`. Furthermore, local dev was intercepting Telegram order confirmation callbacks meant for the homelab database.
- **Fix:** Terminated and killed the local background node server process.
- **Golden Rule:** Never run `node src/server.js` locally with Telegram bot polling enabled at the same time as the homelab PM2 production server!

### 2. Playwright Azure CDN 404
- **Symptom:** `browser_subagent` failed with HTTP 404 from `https://playwright.azureedge.net/builds/driver/playwright-1.57.0-win32_x64.zip`.
- **Root Cause:** Microsoft Azure CDN driver repository had an upstream 404 on the specific build URL for this Windows environment.
- **Workaround:** Verified frontend DOM rendering and HTTP status via curl/node test assertions, and verified end-to-end functionality via user testing on the live homelab domain.

---

## Key Files for Reference

| File | Purpose |
|:---|:---|
| `public/index.html` | Customer storefront HTML (search bar, dynamic categories, curated sections, style modal) |
| `public/js/webview.js` | Customer storefront logic (mini-swatches, curated sections, search, style modal, cart) |
| `public/css/webview.css` | Customer storefront luxury styling (swatch thumbnails, style tiles, section headers) |
| `src/repositories/product.repository.js` | SPU container operations, `findAll()` with `variant_list` |
| `src/repositories/variant.repository.js` | Child variant operations & atomic parent stock synchronization |
| `src/repositories/order.repository.js` | 5-state order lifecycle with variant stock decrements and restoration |
| `src/services/order.service.js` | Order placement with variant consolidation and soft stock checks |
| `scripts/test_customer_storefront.js` | Automated integration test verifying catalog variants and variant order lifecycle |
| `scripts/test_redesign_verification.js` | Automated regression test suite for admin categories, products, variants, and Quick Sell |
| `CUSTOMER_STOREFRONT_PLAN.md` | Customer storefront redesign architecture plan and tracking |

---

## Environment & Deployment Workflow

- **Homelab Host:** Ubuntu 24.04 via PM2 (`pm2 reload jewelry-shop`)
- **Deployment Command:** `git pull origin master && pm2 reload jewelry-shop`
- **Database Migrations:** SQLite auto-migrates safely on server boot (`is_active` on products, `variant_id` on order_items).
- **Test Suites:**
  - `node scripts/test_customer_storefront.js` (Customer catalog & order lifecycle)
  - `node scripts/test_redesign_verification.js` (Admin SPU/SKU & Quick Sell)

---

*If you are an AI agent reading this: ALL PHASES THROUGH PHASE 11 ARE COMPLETE, TESTED, AND LIVE ON MASTER.*






