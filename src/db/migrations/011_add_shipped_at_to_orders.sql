-- Migration: 011_add_shipped_at_to_orders
-- Adds shipped_at timestamp to orders table to support automated 7-day delivery & archiving

ALTER TABLE orders ADD COLUMN shipped_at DATETIME DEFAULT NULL;

-- Backfill existing SHIPPED and COMPLETED orders using updated_at
UPDATE orders
SET shipped_at = updated_at
WHERE status IN ('SHIPPED', 'COMPLETED') AND shipped_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_orders_shipped_at ON orders(shipped_at);
