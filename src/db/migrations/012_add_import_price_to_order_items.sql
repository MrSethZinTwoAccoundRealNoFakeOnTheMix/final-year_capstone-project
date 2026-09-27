-- Migration: 012_add_import_price_to_order_items
-- Adds import_price column to order_items to permanently record wholesale cost snapshot

ALTER TABLE order_items ADD COLUMN import_price REAL DEFAULT NULL;

-- Backfill existing order items using product_variants and products tables
UPDATE order_items
SET import_price = (
  SELECT COALESCE(pv.import_price, p.import_price, pv_fallback.import_price, parent_p.import_price, 0)
  FROM order_items oi2
  LEFT JOIN products p ON oi2.product_id = p.id
  LEFT JOIN product_variants pv ON oi2.variant_id = pv.id
  LEFT JOIN product_variants pv_fallback ON oi2.product_id = pv_fallback.id
  LEFT JOIN products parent_p ON pv_fallback.product_id = parent_p.id
  WHERE oi2.id = order_items.id
)
WHERE import_price IS NULL;
