# Production Architecture Blueprint: Jewelry Shop Capstone

> **Document Type:** Master System Specification & AI Agent Execution Plan  
> **Target Project Location:** `C:\Capstone Project\jewelry-shop`  
> **Reference Prototype:** `messenger-spike` (`d:\Test Page SDK\messenger-spike` or `C:\Capstone Project\messenger-spike`)  
> **Author:** Trapi Seth & Antigravity AI  
> **Date:** September 2026  
> **Status:** APPROVED FOR EXECUTION  

---

## 1. Executive Summary & Mission

### 1.1 The Problem Solved
Traditional e-commerce platforms fail for local Cambodian jewelry shops because:
1. Non-technical, offline-oriented customers refuse to register accounts or remember passwords.
2. Instagram/Facebook DMs lack structured catalogs, resulting in hours of manual back-and-forth messaging.
3. Complex chatbot bots destroy the personalized customer-owner relationship.

### 1.2 The Architectural Solution (Accountless Messenger Commerce)
1. **Zero Registration / No Login:** Customers browse in a mobile webview linked directly to their Facebook Messenger identity.
2. **Cryptographic Identity Verification:** Meta Messenger PSID (Page-Scoped ID) is signed server-side using HMAC-SHA256 (`?psid=...&sig=...`). The backend verifies this signature using timing-safe comparisons before accepting checkouts.
3. **Automated Order Receipts via Meta Graph API:** Upon checkout, the backend dispatches a rich generic carousel receipt directly back into the customer's Messenger thread within Meta's active 24-hour messaging window.
4. **Physical Inventory Guard:** Orders are created in `PENDING` status. Physical stock is only decremented atomically when the owner manually verifies payment and taps **"Confirm Order"**.

### 1.3 Transition from Prototype (`messenger-spike`) to Production (`jewelry-shop`)
* **Prototype State:** Validated core concept in a single monolithic file (`server.js`, 568 lines) using SQLite (`better-sqlite3`), running on PM2 inside a Proxmox LXC (`https://test.trapiseth.site`).
* **Production Objective:** Transition into a professional, modular **3-Tier Architecture (Routes $\rightarrow$ Controllers $\rightarrow$ Services $\rightarrow$ Repositories)** with production-grade image optimization (Sharp), webhook cryptographic verification, multi-stage order lifecycle, robust error handling, and repeatable SQL migrations.

---

## 2. System Stack & Runtime Specifications

| Component | Technology | Version / Configuration | Purpose |
| :--- | :--- | :--- | :--- |
| **Runtime** | Node.js | v22.x LTS (Native ESM or clean CommonJS) | Server engine |
| **Framework** | Express.js | v5.x | HTTP routing and middleware pipeline |
| **Database** | SQLite via `better-sqlite3` | WAL mode, `busy_timeout = 5000` | High-concurrency local relational store |
| **Image Engine** | `sharp` + `multer` | 800px WebP, 80% quality | Automated smartphone photo compression |
| **Identity & Crypto** | Node.js native `crypto` | `createHmac('sha256')`, `timingSafeEqual` | Tamper-proof PSID verification |
| **Process Manager** | PM2 | Cluster or Fork mode, max memory 300MB | 24/7 supervision, auto-restart |
| **Ingress Gateway** | Cloudflare Zero Trust Tunnel | `cloudflared` systemd service | Public HTTPS proxy without open router ports |
| **Target Host** | Proxmox VE 8 LXC | Ubuntu 24.04 (Container ID 100, 192.168.100.232) | 24/7 self-hosted homelab server |

---

## 3. Production Directory Structure

```
jewelry-shop/
├── .env.example
├── .gitignore
├── ecosystem.config.js
├── package.json
├── README.md
│
├── public/                             # Static Webview & Admin Assets
│   ├── css/
│   │   ├── webview.css                 # Customer storefront styling (luxury gold/dark palette)
│   │   └── admin.css                   # Admin dashboard styling
│   ├── js/
│   │   ├── webview.js                  # Cart state, Bakong KHQR modal, identity verification
│   │   └── admin.js                    # Admin auth token, order queue management, product CRUD
│   ├── index.html                      # Customer-facing mobile catalog & checkout webview
│   ├── admin.html                      # Store owner management panel
│   └── uploads/                        # Auto-optimized 800px WebP product images
│
└── src/
    ├── app.js                          # Express app configuration & middleware pipeline
    ├── server.js                       # Server entry point, port listener, graceful shutdown
    │
    ├── config/                         # Environment & application constants
    │   ├── index.js                    # Validated env vars (APP_SECRET, PAGE_TOKEN, etc.)
    │   └── constants.js                # Order statuses, cooldown timers, SKU prefixes
    │
    ├── db/                             # Database infrastructure
    │   ├── index.js                    # better-sqlite3 connection, PRAGMA configuration
    │   ├── migrate.js                  # Migration runner
    │   ├── migrations/                 # Timestamped SQL schema migrations
    │   │   ├── 001_init_schema.sql
    │   │   └── 002_add_indexes.sql
    │   └── seed.js                     # Initial jewelry catalog seed data
    │
    ├── routes/                         # HTTP Route Definitions (no business logic)
    │   ├── index.js                    # Master route aggregator
    │   ├── customer.routes.js          # /api/products, /api/identity, /api/orders
    │   ├── admin.routes.js             # /api/admin/login, /api/admin/products, /api/admin/orders
    │   └── webhook.routes.js           # /webhook (GET challenge & POST events)
    │
    ├── controllers/                    # Request parsing, validation, HTTP response formatting
    │   ├── customer.controller.js      # Handles catalog requests & order placement
    │   ├── admin.controller.js         # Handles product CRUD & order status updates
    │   └── webhook.controller.js       # Handles Meta webhook verification & message events
    │
    ├── services/                       # Pure Business Logic (Framework-independent)
    │   ├── identity.service.js         # HMAC signing & timing-safe verification
    │   ├── messenger.service.js        # Graph API calls (carousels, text receipts, status updates)
    │   ├── order.service.js            # Cart subtotal, validation, DB transaction, receipt dispatch
    │   ├── inventory.service.js        # Atomic stock decrement concurrency guards
    │   ├── image.service.js            # Multer storage + Sharp WebP transformation pipeline
    │   └── auth.service.js             # Admin token generation & verification
    │
    ├── repositories/                   # Data Access Layer (SQL queries only)
    │   ├── product.repository.js       # CRUD operations on products table
    │   └── order.repository.js         # Transactions, order queue queries, status mutations
    │
    ├── middlewares/                    # Custom Express Middlewares
    │   ├── requireAdmin.js             # Validates x-admin-token header
    │   ├── verifyWebhookSignature.js   # Validates Meta X-Hub-Signature-256 header
    │   ├── rateLimiter.js              # In-memory or SQLite rate-limiting against spam
    │   └── errorHandler.js             # Centralized JSON error catcher (no leaked stack traces)
    │
    ├── templates/                      # Localized message strings & Messenger card builders
    │   ├── messengerCards.js           # Generic carousel template & button builders
    │   └── locales/
    │       ├── km.js                   # Khmer greetings & order manuals
    │       └── en.js                   # English greetings & order manuals
    │
    └── utils/                          # Cross-cutting utility functions
        ├── logger.js                   # Structured logging with timestamps
        └── crypto.js                   # Timing-safe comparison & hash utilities
```

---

## 4. Database Schema & Migration Blueprint

SQLite must be initialized with the following PRAGMAs:
```sql
PRAGMA journal_mode = WAL;         -- High concurrency: readers do not block writers
PRAGMA busy_timeout = 5000;        -- Wait up to 5s on busy locks before throwing
PRAGMA foreign_keys = ON;          -- Strictly enforce referential integrity
PRAGMA synchronous = NORMAL;       -- Fast disk writes safe under WAL mode
```

### Table 1: `products`
```sql
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,                 -- Category SKU: 'RG-0001', 'NK-0002', 'BR-0003'
  name TEXT NOT NULL,
  category TEXT NOT NULL,             -- 'Ring', 'Necklace', 'Bracelet', 'Earring'
  import_price REAL NOT NULL,         -- Owner private cost basis
  sell_price REAL NOT NULL,           -- Public selling price
  stock INTEGER NOT NULL DEFAULT 0,   -- Available physical inventory
  photo_url TEXT,                     -- Path to /uploads/... or CDN URL
  variants TEXT,                      -- JSON string of options, e.g. ["Size 6", "Size 7"]
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
```

### Table 2: `orders`
```sql
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,                 -- E.g. 'ORD-1727000000'
  psid TEXT NOT NULL,                  -- Verified Meta Page-Scoped ID
  status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'CONFIRMED', 'SHIPPED', 'CANCELLED'
  total_amount REAL NOT NULL,
  customer_name TEXT,
  phone TEXT,
  address TEXT,
  note TEXT,                           -- Customer sizing notes (e.g. 'Ring size 7')
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_psid ON orders(psid);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
```

### Table 3: `order_items`
```sql
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price REAL NOT NULL,
  FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY(product_id) REFERENCES products(id)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
```

---

## 5. Security & Cryptographic Specifications

### 5.1 HMAC-SHA256 PSID Signature Generation & Verification
* **Algorithm:** `HMAC-SHA256`
* **Secret Key:** `APP_SECRET` from Meta App Dashboard
* **Signing:**
  ```javascript
  const sig = crypto.createHmac('sha256', APP_SECRET).update(psid).digest('hex');
  const shopUrl = `${BASE_URL}/webview?psid=${psid}&sig=${sig}`;
  ```
* **Timing-Safe Verification:**
  ```javascript
  const expected = crypto.createHmac('sha256', APP_SECRET).update(psid).digest('hex');
  if (sig.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  ```
* **Developer Bypass:**
  Only permitted when `NODE_ENV !== 'production'` and `sig === 'demo-bypass'`. Strictly rejected in production.

### 5.2 Meta Webhook Signature Verification (`X-Hub-Signature-256`)
Every incoming `POST /webhook` request must be validated against Meta's header:
```javascript
const signature = req.headers['x-hub-signature-256']; // 'sha256=...'
const rawBody = req.rawBody; // Buffer captured in express.json({ verify: ... })
const expected = 'sha256=' + crypto.createHmac('sha256', APP_SECRET).update(rawBody).digest('hex');
const isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
```

### 5.3 Admin Authentication
* Environment-backed `ADMIN_PASSWORD`.
* Login endpoint `POST /api/admin/login` returns an HMAC token derived from `ADMIN_PASSWORD` + `APP_SECRET`.
* Protected admin routes require `X-Admin-Token` header.

---

## 6. Core Business Workflows & Concurrency Guarantees

### 6.1 Order Placement Flow (`POST /api/orders`)
1. **Identity Guard:** Validate `(psid, sig)`. If invalid, return HTTP `403 Forbidden`.
2. **Cart Consolidation:** Aggregate duplicate product entries.
3. **Database Validation:** Check existence and available stock for all items.
4. **Pending Creation (No Stock Decrement):** Insert into `orders` with status `'PENDING'` inside an atomic SQLite transaction (`db.transaction()`).
5. **Async Receipt Dispatch:** Fire and forget Meta Graph API order receipt carousel into the customer's chat.

### 6.2 Order Confirmation & Concurrency Guard (`POST /api/admin/orders/:id/confirm`)
1. Verify order exists and is in `PENDING` status.
2. In a SQLite transaction, execute atomic decrement for each item:
   ```sql
   UPDATE products
   SET stock = stock - ?
   WHERE id = ? AND stock >= ?
   ```
3. If `result.changes === 0`, throw an error ("Insufficient stock"). The transaction automatically rolls back.
4. Update order status to `'CONFIRMED'`.
5. *(New Feature)* Send automated Messenger notification to customer: *"Your order #ORD-XXXX has been confirmed by the owner and is being prepared!"*

### 6.3 Automated Image Optimization Pipeline (Sharp)
* **Input:** Store owner uploads raw smartphone photos (5–12MB, JPEG/PNG).
* **Processing:**
  ```javascript
  await sharp(file.buffer)
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(path.join(__dirname, '../../public/uploads', filename));
  ```
* **Output:** Clean ~80KB WebP image served with caching headers.

---

## 7. AI Agent Step-by-Step Execution Plan

When an AI agent begins building the production application in `C:\Capstone Project\jewelry-shop`, it **MUST follow these sequential phases**:

### Phase 1: Environment & Project Scaffolding
- [ ] Initialize `package.json` with scripts:
  - `"dev": "node --watch src/server.js"`
  - `"start": "node src/server.js"`
  - `"migrate": "node src/db/migrate.js"`
  - `"seed": "node src/db/seed.js"`
- [ ] Install production dependencies:
  - `express@^5.2.1`, `better-sqlite3@^13.0.3`, `dotenv@^18.0.1`, `sharp@^0.33.x`, `multer@^1.4.x`
- [ ] Create `.env.example` and set up `src/config/index.js` to validate required variables.
- [ ] Create directory structure specified in Section 3.

### Phase 2: Database Layer & Repositories
- [ ] Build `src/db/index.js` with WAL mode and `PRAGMA foreign_keys = ON`.
- [ ] Write SQL migrations (`001_init_schema.sql`, `002_add_indexes.sql`) and migration runner `src/db/migrate.js`.
- [ ] Write `src/db/seed.js` with initial jewelry items (category SKUs `RG-0001`, `NK-0001`, `BR-0001`).
- [ ] Implement `src/repositories/product.repository.js` and `src/repositories/order.repository.js`.

### Phase 3: Core Business Services
- [ ] Implement `src/services/identity.service.js` (HMAC generator, timing-safe validator).
- [ ] Implement `src/services/inventory.service.js` (atomic decrement with changes check).
- [ ] Implement `src/services/order.service.js` (consolidation, price verification, transactional insert).
- [ ] Implement `src/services/messenger.service.js` (Graph API `/me/messages` client, carousels, text receipts, status notifications).
- [ ] Implement `src/services/image.service.js` (Multer + Sharp 800px WebP pipeline).

### Phase 4: Express Controllers & Routing Pipeline
- [ ] Write `src/middlewares/requireAdmin.js`, `src/middlewares/verifyWebhookSignature.js`, and `src/middlewares/errorHandler.js`.
- [ ] Build `customer.controller.js` and mount on `src/routes/customer.routes.js`.
- [ ] Build `admin.controller.js` and mount on `src/routes/admin.routes.js`.
- [ ] Build `webhook.controller.js` and mount on `src/routes/webhook.routes.js` with the two-tier auto-reply flow (lightweight greeting vs explicit shop guide).
- [ ] Assemble `src/app.js` and `src/server.js` with graceful shutdown handlers (`SIGTERM`, `SIGINT`).

### Phase 5: Frontend Migration & Asset Polish
- [ ] Migrate `index.html` into `public/index.html`, extracting CSS to `public/css/webview.css` and JS to `public/js/webview.js`.
- [ ] Migrate `admin.html` into `public/admin.html`, extracting CSS to `public/css/admin.css` and JS to `public/js/admin.js`.
- [ ] Add the Sharp image upload dropzone into `admin.html` for easy product creation.

### Phase 6: End-to-End Verification & Homelab Deployment
- [ ] Run verification tests:
  1. Unit test: HMAC signing and tamper detection.
  2. Integration test: `POST /api/orders` with mock PSID creates pending order and sends receipt.
  3. Concurrency test: Multiple simultaneous order confirmations on stock = 1 ensures only 1 succeeds.
  4. Webhook test: Verification challenge responds with `hub.challenge`.
- [ ] Prepare `ecosystem.config.js` with `name: 'jewelry-shop'`, `max_memory_restart: '300M'`.
- [ ] Deploy to homelab LXC container (`192.168.100.232`) via Git and reload PM2.

---

## 8. Verification Matrix

| Test Case | Method | Expected Result |
| :--- | :--- | :--- |
| **Tampered PSID Checkout** | `curl -X POST /api/orders -d '{"psid":"123","sig":"fake"}'` | `403 Forbidden` (`tampered`) |
| **Valid PSID Checkout** | `curl -X POST /api/orders -d '{"psid":"demo","sig":"valid_hmac"}'` | `200 OK`, order created in `PENDING`, stock unchanged |
| **Simultaneous Confirmation** | 2 concurrent `POST /api/admin/orders/:id/confirm` on stock=1 | 1st returns `200 OK`, 2nd returns `409 Conflict` (Insufficient stock) |
| **Image Upload** | Upload 8MB smartphone photo via `/api/admin/products` | File stored as ~80KB `.webp` in `public/uploads/` |
| **Webhook Challenge** | `GET /webhook?hub.mode=subscribe&hub.challenge=12345&hub.verify_token=...` | `200 OK` returning `12345` |
| **Graceful Shutdown** | Send `kill -SIGTERM <pid>` | Active requests finish, SQLite connection closed cleanly, exit code 0 |

---
*End of Blueprint. Any AI agent or developer reading this document has full context and authoritative instructions to execute the production build.*
