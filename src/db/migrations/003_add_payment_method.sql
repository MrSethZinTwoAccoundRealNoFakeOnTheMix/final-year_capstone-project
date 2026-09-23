-- Migration: 003_add_payment_method
-- Adds payment_method column to orders table (defaults to 'KHQR')

ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'KHQR';
