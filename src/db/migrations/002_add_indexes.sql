-- Migration: 002_add_indexes
-- Performance indexes for common query patterns

-- Product catalog filtered by category
CREATE INDEX IF NOT EXISTS idx_products_category
  ON products(category);

-- Order lookup by customer PSID (e.g. order history)
CREATE INDEX IF NOT EXISTS idx_orders_psid
  ON orders(psid);

-- Order queue filtered by status (admin order management)
CREATE INDEX IF NOT EXISTS idx_orders_status
  ON orders(status);

-- Admin dashboard default sort: newest first
CREATE INDEX IF NOT EXISTS idx_orders_created_at
  ON orders(created_at DESC);

-- Order items joined by order_id
CREATE INDEX IF NOT EXISTS idx_order_items_order
  ON order_items(order_id);
