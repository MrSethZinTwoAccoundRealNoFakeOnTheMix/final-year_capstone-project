-- Migration: 005_update_orders_schema_phase8
-- Widens orders.status to include 'COMPLETED' (Delivered successfully)
-- Sets default payment_method to 'COD'
-- Preserves all existing data, triggers, and indexes

PRAGMA foreign_keys = OFF;

CREATE TABLE orders_new (
  id            TEXT PRIMARY KEY,
  psid          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'PENDING'
                  CHECK(status IN ('PENDING', 'CONFIRMED', 'SHIPPED', 'CANCELLED', 'RETURNED', 'COMPLETED')),
  total_amount  REAL NOT NULL,
  customer_name TEXT DEFAULT '',
  phone         TEXT DEFAULT '',
  address       TEXT DEFAULT '',
  note          TEXT DEFAULT '',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  payment_method TEXT DEFAULT 'COD'
);

INSERT INTO orders_new (id, psid, status, total_amount, customer_name, phone, address, note, created_at, updated_at, payment_method)
SELECT id, psid, status, total_amount, customer_name, phone, address, note, created_at, updated_at, COALESCE(payment_method, 'COD')
FROM orders;

DROP TABLE orders;
ALTER TABLE orders_new RENAME TO orders;

-- Recreate updated_at trigger
CREATE TRIGGER IF NOT EXISTS trg_orders_updated_at
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
  UPDATE orders SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_orders_psid ON orders(psid);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

PRAGMA foreign_keys = ON;
