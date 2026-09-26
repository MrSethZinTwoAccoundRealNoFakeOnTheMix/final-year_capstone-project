-- Migration: 007_update_categories_to_khmer
-- 1. Updates categories table to native Khmer:
--    កាបូប, ស្នាតសក់, កន្លាស់អាវ, ចិញ្ចៀន, កងដៃ
-- 2. Remaps existing products to these 5 live Khmer categories

-- Replace default categories with 5 official live categories
DELETE FROM categories;

INSERT INTO categories (name) VALUES
  ('កាបូប'),
  ('ស្នាតសក់'),
  ('កន្លាស់អាវ'),
  ('ចិញ្ចៀន'),
  ('កងដៃ');

-- Remap existing products in the catalog
UPDATE products SET category = 'ចិញ្ចៀន' WHERE category = 'Ring';
UPDATE products SET category = 'កងដៃ' WHERE category = 'Bracelet';
UPDATE products SET category = 'ស្នាតសក់' WHERE category = 'Earring' OR category = 'Hairpin';
UPDATE products SET category = 'កន្លាស់អាវ' WHERE category = 'Brooch';
UPDATE products SET category = 'កាបូប' WHERE category = 'Bag' OR category = 'Decor';

-- Distribute remaining Necklace items into កន្លាស់អាវ and កាបូប
UPDATE products SET category = 'កន្លាស់អាវ' WHERE category = 'Necklace' AND (rowid % 2 = 0);
UPDATE products SET category = 'កាបូប' WHERE category = 'Necklace';

-- Safety fallback for any unmapped or null categories
UPDATE products SET category = 'ចិញ្ចៀន' WHERE category NOT IN ('កាបូប', 'ស្នាតសក់', 'កន្លាស់អាវ', 'ចិញ្ចៀន', 'កងដៃ');
