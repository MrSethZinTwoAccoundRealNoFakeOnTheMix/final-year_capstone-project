-- Migration: 006_add_variants_and_categories
-- 1. Creates dynamic categories table (name only, no technical prefixes required)
-- 2. Rebuilds products table without the hardcoded category CHECK constraint and adds has_variants flag
-- 3. Creates product_variants table for SPU/SKU model (color variants)

CREATE TABLE IF NOT EXISTS categories (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

INSERT OR IGNORE INTO categories (name) VALUES
  ('Hairpin'),
  ('Brooch'),
  ('Bag'),
  ('Decor'),
  ('Earring'),
  ('Necklace'),
  ('Ring'),
  ('Bracelet');

PRAGMA foreign_keys = OFF;

CREATE TABLE products_new (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  category     TEXT NOT NULL,
  import_price REAL NOT NULL,
  sell_price   REAL NOT NULL,
  stock        INTEGER NOT NULL DEFAULT 1,
  photo_url    TEXT DEFAULT '',
  variants     TEXT DEFAULT '',
  has_variants INTEGER NOT NULL DEFAULT 0,
  is_active    INTEGER NOT NULL DEFAULT 1,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO products_new (id, name, category, import_price, sell_price, stock, photo_url, variants, has_variants, is_active, created_at, updated_at)
  SELECT id, name, category, import_price, sell_price, stock, photo_url, variants, 0, is_active, created_at, updated_at
  FROM products;

DROP TABLE products;
ALTER TABLE products_new RENAME TO products;

-- Recreate triggers and indexes
CREATE TRIGGER IF NOT EXISTS trg_products_updated_at
AFTER UPDATE ON products
FOR EACH ROW
BEGIN
  UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_has_variants ON products(has_variants);

-- Product Variants Table (SKUs)
CREATE TABLE IF NOT EXISTS product_variants (
  id           TEXT PRIMARY KEY,
  product_id   TEXT NOT NULL,
  color_name   TEXT NOT NULL,
  import_price REAL NOT NULL,
  sell_price   REAL NOT NULL,
  stock        INTEGER NOT NULL DEFAULT 1,
  photo_url    TEXT DEFAULT '',
  is_active    INTEGER NOT NULL DEFAULT 1,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);

PRAGMA foreign_keys = ON;
