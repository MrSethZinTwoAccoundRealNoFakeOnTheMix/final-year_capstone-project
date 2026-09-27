-- Migration: 010_add_pos_sales
-- Adds tables for persistent in-person / walk-in Quick Sell POS transactions

CREATE TABLE IF NOT EXISTS pos_sales (
  id             TEXT PRIMARY KEY,
  total_amount   REAL NOT NULL,
  total_cost     REAL NOT NULL DEFAULT 0,
  item_count     INTEGER NOT NULL DEFAULT 1,
  payment_method TEXT DEFAULT 'CASH',
  note           TEXT DEFAULT '',
  status         TEXT DEFAULT 'COMPLETED'
                   CHECK(status IN ('COMPLETED', 'RESTOCKED')),
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pos_sale_items (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_id      TEXT NOT NULL,
  product_id   TEXT NOT NULL,
  variant_id   TEXT DEFAULT NULL,
  product_name TEXT NOT NULL,
  variant_name TEXT DEFAULT '',
  quantity     INTEGER NOT NULL DEFAULT 1,
  unit_price   REAL NOT NULL,
  import_price REAL NOT NULL DEFAULT 0,
  FOREIGN KEY(sale_id) REFERENCES pos_sales(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pos_sales_created_at ON pos_sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pos_sales_status ON pos_sales(status);
CREATE INDEX IF NOT EXISTS idx_pos_sale_items_sale_id ON pos_sale_items(sale_id);
