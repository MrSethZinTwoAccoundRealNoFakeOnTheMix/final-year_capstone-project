-- Migration: 001_init_schema
-- Creates core tables: products, orders, order_items
-- Plus auto-updated_at triggers

-- ─── Products ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id           TEXT PRIMARY KEY,    -- Category-prefixed SKU: RG-0001, NK-0001, etc.
  name         TEXT NOT NULL,
  category     TEXT NOT NULL CHECK(category IN ('Ring', 'Necklace', 'Bracelet', 'Earring')),
  import_price REAL NOT NULL,       -- Wholesale cost (admin-only, never sent to customer)
  sell_price   REAL NOT NULL,       -- Retail price shown to customers (USD)
  stock        INTEGER NOT NULL DEFAULT 0,
  photo_url    TEXT DEFAULT '',     -- Relative path: uploads/filename.webp
  variants     TEXT DEFAULT '',     -- Optional text description (sizes, lengths, etc.)
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Auto-update products.updated_at on any row change
CREATE TRIGGER IF NOT EXISTS trg_products_updated_at
AFTER UPDATE ON products
FOR EACH ROW
BEGIN
  UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ─── Orders ──────────────────────────────────────────────────────────────────
-- State Machine: PENDING → CONFIRMED → SHIPPED
--                         CONFIRMED → CANCELLED  (stock restored)
--                         SHIPPED   → RETURNED   (stock restored)
CREATE TABLE IF NOT EXISTS orders (
  id            TEXT PRIMARY KEY,   -- e.g. ORD-1727000000000
  psid          TEXT NOT NULL,      -- Verified Meta Page-Scoped ID
  status        TEXT NOT NULL DEFAULT 'PENDING'
                  CHECK(status IN ('PENDING', 'CONFIRMED', 'SHIPPED', 'CANCELLED', 'RETURNED', 'COMPLETED')),
  total_amount  REAL NOT NULL,      -- USD
  customer_name TEXT DEFAULT '',
  phone         TEXT DEFAULT '',
  address       TEXT DEFAULT '',
  note          TEXT DEFAULT '',    -- Customer sizing/variant notes
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  payment_method TEXT DEFAULT 'COD'
);

-- Auto-update orders.updated_at on any row change
CREATE TRIGGER IF NOT EXISTS trg_orders_updated_at
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
  UPDATE orders SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ─── Order Items ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id   TEXT NOT NULL,
  product_id TEXT NOT NULL,
  quantity   INTEGER NOT NULL DEFAULT 1,
  unit_price REAL NOT NULL,         -- Snapshot of sell_price at time of order
  FOREIGN KEY(order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  FOREIGN KEY(product_id) REFERENCES products(id)
);
