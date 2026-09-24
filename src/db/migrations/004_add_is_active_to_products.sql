-- Migration: 004_add_is_active_to_products
-- Adds is_active column to products for safe archiving / soft delete (default: 1)

ALTER TABLE products ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;
