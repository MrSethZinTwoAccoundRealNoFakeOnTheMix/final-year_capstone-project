-- Migration: 009_seed_khmer_local_catalog
-- Seeds authentic Khmer local jewelry products into the 5 official Khmer categories:
-- កាបូប, ស្នាតសក់, កន្លាស់អាវ, ចិញ្ចៀន, កងដៃ
-- Around 5 products per category, with rich style/color variants and unique photos.

PRAGMA foreign_keys = OFF;

-- 1. Archive all existing products so they never appear in storefront
UPDATE products SET is_active = 0;

-- 2. Safely delete ONLY products that are NOT referenced by any order_items
DELETE FROM products 
WHERE id NOT IN (SELECT DISTINCT product_id FROM order_items)
  AND id NOT IN (
    'KB-0001', 'KB-0002', 'KB-0003', 'KB-0004', 'KB-0005',
    'SS-0001', 'SS-0002', 'SS-0003', 'SS-0004', 'SS-0005',
    'KA-0001', 'KA-0002', 'KA-0003', 'KA-0004', 'KA-0005',
    'CJ-0001', 'CJ-0002', 'CJ-0003', 'CJ-0004', 'CJ-0005',
    'KD-0001', 'KD-0002', 'KD-0003', 'KD-0004', 'KD-0005'
  );

-- 3. Ensure categories table has all 5 Khmer categories
INSERT OR IGNORE INTO categories (name) VALUES
  ('កាបូប'),
  ('ស្នាតសក់'),
  ('កន្លាស់អាវ'),
  ('ចិញ្ចៀន'),
  ('កងដៃ');

-- 4. Upsert 25 authentic Khmer local products (5 per category)
INSERT INTO products (id, name, category, import_price, sell_price, stock, photo_url, variants, has_variants, is_active)
VALUES
  -- ─── Category: កាបូប (Bags & Clutches) ────────────────────────────────────
  (
    'KB-0001',
    'កាបូបក្លាត់យួរដៃចូលរួមកម្មវិធី',
    'កាបូប',
    25.00, 49.00, 15,
    'https://images.unsplash.com/photo-1590739225287-bd31519780c3?w=800&q=80',
    'កាបូបក្លាត់ដៃយ៉ាងប្រណិតសម្រាប់ពិធីមង្គលការ និងកម្មវិធីពេលរាត្រី',
    1, 1
  ),
  (
    'KB-0002',
    'កាបូបស្ពាយចំហៀងស្បែកទន់ម៉ូដប្រណិត',
    'កាបូប',
    30.00, 59.00, 10,
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80',
    'ស្បែកទន់គុណភាពខ្ពស់ ងាយស្រួលប្រើប្រាស់ប្រចាំថ្ងៃ',
    0, 1
  ),
  (
    'KB-0003',
    'កាបូបក្លាត់ប្រាក់រាត្រីសមោសរ',
    'កាបូប',
    22.00, 45.00, 8,
    'https://images.unsplash.com/photo-1727262082718-f0591150801b?w=800&q=80',
    'ម៉ូដចែងចាំងដាំគ្រីស្តាល់ស្អាតឥតខ្ចោះពេលត្រូវពន្លឺភ្លើង',
    0, 1
  ),
  (
    'KB-0004',
    'កាបូបស្បែកខ្មៅខ្សែច្រវាក់មាស',
    'កាបូប',
    28.00, 55.00, 12,
    'https://images.unsplash.com/photo-1590739225287-bd31519780c3?w=800&q=80',
    'ខ្សែច្រវាក់ស្រោបមាសមិនងាយស្រអាប់ ម៉ូដបុរាណលាយសម័យ',
    0, 1
  ),
  (
    'KB-0005',
    'កាបូបយួរដៃស្បែកពណ៌ត្នោតទាន់សម័យ',
    'កាបូប',
    35.00, 68.00, 6,
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
    'រាងរឹងមាំ ទូលាយ អាចដាក់ទូរស័ព្ទ និងសម្ភារៈតុបតែងមុខបានច្រើន',
    0, 1
  ),

  -- ─── Category: ស្នាតសក់ (Hairpins & Combs) ──────────────────────────────────
  (
    'SS-0001',
    'ស្នាតសក់ផ្កាមាសកូនក្រមុំបុរាណ',
    'ស្នាតសក់',
    18.00, 39.00, 15,
    'https://images.unsplash.com/photo-1704822805385-5176a86f5b0b?w=800&q=80',
    'ស្នាតសក់ក្បាច់បុរាណសម្រាប់កូនក្រមុំ ឬសម្លៀកបំពាក់ប្រពៃណីខ្មែរ',
    1, 1
  ),
  (
    'SS-0002',
    'ស្នាតសក់ដាំគជ់ខ្យងផ្កាចំប៉ី',
    'ស្នាតសក់',
    15.00, 32.00, 12,
    'https://images.unsplash.com/photo-1654013273452-f10d25f10e67?w=800&q=80',
    'ដាំគ្រាប់គជ់ខ្យងធម្មជាតិ ផ្កាចំប៉ីស្រទន់សម្រាប់សៀកសក់',
    0, 1
  ),
  (
    'SS-0003',
    'ស្នាតសក់ក្បាច់រចនាមាសសុទ្ធ',
    'ស្នាតសក់',
    24.00, 52.00, 8,
    'https://images.unsplash.com/photo-1767096612165-b5a33caa48a5?w=800&q=80',
    'ក្បាច់ឆ្លាក់ក្បូរក្បាច់បុរាណខ្មែរ រំលេចភាពថ្លៃថ្នូរ',
    0, 1
  ),
  (
    'SS-0004',
    'ស្នាតសក់ដាំគ្រីស្តាល់ភ្លឺចែងចាំង',
    'ស្នាតសក់',
    14.00, 29.00, 10,
    'https://images.unsplash.com/photo-1575009965778-64896cad0f87?w=800&q=80',
    'គ្រីស្តាល់ភ្លឺផ្លេកៗ សាកសមជាមួយម៉ូដសក់បួងកម្មវិធីមង្គល',
    0, 1
  ),
  (
    'SS-0005',
    'ស្នាតសក់ផ្កាកុលាបសៀកសក់ប្រណិត',
    'ស្នាតសក់',
    16.00, 35.00, 7,
    'https://images.unsplash.com/photo-1603562439742-cdb93fa71099?w=800&q=80',
    'ក្បាច់ផ្កាកុលាបលាយគជ់ ជាប់ណែនល្អមិនរបូតពីសក់',
    0, 1
  ),

  -- ─── Category: កន្លាស់អាវ (Brooches) ───────────────────────────────────────
  (
    'KA-0001',
    'កន្លាស់អាវផ្កាឈូកដាំពេជ្រប្រណិត',
    'កន្លាស់អាវ',
    20.00, 45.00, 15,
    'https://images.unsplash.com/photo-1728318853117-f9b3ce9be350?w=800&q=80',
    'សម្រាប់កន្លាស់លើអាវប៉ាក់ អាវសូត្រហូលផាមួង ឬស្បៃពិធីបុណ្យប្រពៃណី',
    1, 1
  ),
  (
    'KA-0002',
    'កន្លាស់អាវផ្កាត្បូងទទឹមក្រហម',
    'កន្លាស់អាវ',
    22.00, 48.00, 9,
    'https://images.unsplash.com/photo-1766560360153-3d7801040953?w=800&q=80',
    'ដាំត្បូងទទឹមពណ៌ក្រហមឆ្អៅ លើសម្លៀកបំពាក់ប្រពៃណី',
    0, 1
  ),
  (
    'KA-0003',
    'កន្លាស់អាវផ្កាមាសដាំគជ់បុរាណ',
    'កន្លាស់អាវ',
    19.00, 42.00, 8,
    'https://images.unsplash.com/photo-1758723208958-c18fa48aaff3?w=800&q=80',
    'ក្បាច់ផ្កាមាសលាយគជ់ខ្យងបុរាណ រចនាបែបខ្មែរបុរាណពិតៗ',
    0, 1
  ),
  (
    'KA-0004',
    'កន្លាស់អាវមេអំបៅដាំត្បូងចម្រុះ',
    'កន្លាស់អាវ',
    25.00, 55.00, 11,
    'https://images.unsplash.com/photo-1768827824781-c0c9b8766c0b?w=800&q=80',
    'រូបរាងមេអំបៅរស់រវើក ដាំត្បូងចម្រុះពណ៌ភ្លឺចែងចាំង',
    0, 1
  ),
  (
    'KA-0005',
    'កន្លាស់អាវដាំត្បូងកណ្ដៀងខៀវ',
    'កន្លាស់អាវ',
    26.00, 58.00, 7,
    'https://images.unsplash.com/photo-1699119852841-257a183734a3?w=800&q=80',
    'ត្បូងកណ្ដៀងពណ៌ខៀវទឹកសមុទ្រជ្រៅ កម្ពស់ថ្លៃថ្នូរ',
    0, 1
  ),

  -- ─── Category: ចិញ្ចៀន (Rings) ─────────────────────────────────────────────
  (
    'CJ-0001',
    'ចិញ្ចៀនពេជ្រសុទ្ធផ្លាកទីនប្រណិត',
    'ចិញ្ចៀន',
    45.00, 99.00, 15,
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
    'ចិញ្ចៀនពេជ្រទឹកស្អាត មានទំហំលេខ 5, 6, 7, 8 (សូមកត់សម្គាល់ក្នុង Note)',
    1, 1
  ),
  (
    'CJ-0002',
    'ចិញ្ចៀនមាសដាំត្បូងទទឹមប៉ៃលិន',
    'ចិញ្ចៀន',
    50.00, 110.00, 8,
    'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&q=80',
    'ត្បូងទទឹមធម្មជាតិប៉ៃលិន ពណ៌ឈាមព្រាប ដាំលើមាសទឹកល្អ',
    0, 1
  ),
  (
    'CJ-0003',
    'ចិញ្ចៀនមាសក្បាច់បុរាណខ្មែរ',
    'ចិញ្ចៀន',
    38.00, 85.00, 12,
    'https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?w=800&q=80',
    'ក្បាច់ភ្ញីទេសបុរាណខ្មែរឆ្លាក់យ៉ាងផ្ចិតផ្ចង់ សាកសមទាំងបុរសនិងនារី',
    0, 1
  ),
  (
    'CJ-0004',
    'ចិញ្ចៀនពេជ្រផ្កាត្របក៣ជាន់',
    'ចិញ្ចៀន',
    42.00, 95.00, 6,
    'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&q=80',
    'រាងស្រទាប់ផ្កា ៣ ជាន់ ដាំពេជ្រភ្លឺរលោងជុំវិញ',
    0, 1
  ),
  (
    'CJ-0005',
    'ចិញ្ចៀនមាសត្បូងកណ្ដៀងខៀវប៉ៃលិន',
    'ចិញ្ចៀន',
    55.00, 120.00, 5,
    'https://images.unsplash.com/photo-1598560917505-59a3ad559071?w=800&q=80',
    'ត្បូងកណ្ដៀងខៀវធម្មជាតិរើសដោយដៃ ដាំលើតួមាស 18K',
    0, 1
  ),

  -- ─── Category: កងដៃ (Bangles & Bracelets) ──────────────────────────────────
  (
    'KD-0001',
    'កងដៃមាសក្បាច់បុរាណខ្មែរ',
    'កងដៃ',
    60.00, 135.00, 15,
    'https://images.unsplash.com/photo-1758995116383-f51775896add?w=800&q=80',
    'កងដៃក្បាច់ខ្មែរធ្វើពីមាស រចនាបថប្រពៃណីខ្មែរដ៏ប្រណិត',
    1, 1
  ),
  (
    'KD-0002',
    'កងដៃមាសភ្លោះក្បាច់ឆ្លាក់ក្បាលនាគ',
    'កងដៃ',
    68.00, 149.00, 6,
    'https://images.unsplash.com/photo-1690175867343-2af70ea57537?w=800&q=80',
    'ក្បាច់ក្បាលនាគភ្លោះតំណាងឱ្យភាពរុងរឿង សិរីសួស្តី និងអំណាច',
    0, 1
  ),
  (
    'KD-0003',
    'កងដៃមាសដាំពេជ្រជុំវិញ',
    'កងដៃ',
    75.00, 165.00, 8,
    'https://images.unsplash.com/photo-1611598935678-c88dca238fce?w=800&q=80',
    'ដាំពេជ្រជុំវិញរង្វង់កងដៃ ភ្លឺផ្លេកៗពេលត្រូវពន្លឺ',
    0, 1
  ),
  (
    'KD-0004',
    'កងដៃមាសសុទ្ធម៉ូដទាន់សម័យ',
    'កងដៃ',
    45.00, 98.00, 10,
    'https://images.unsplash.com/photo-1679156271456-d6068c543ee7?w=800&q=80',
    'រចនាបថរលោង សាមញ្ញតែទាក់ទាញ សាកសមសម្រាប់ពាក់ប្រចាំថ្ងៃ',
    0, 1
  ),
  (
    'KD-0005',
    'កងដៃខ្នាតរឹងដាំត្បូងមង្គល',
    'កងដៃ',
    58.00, 128.00, 7,
    'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80',
    'កងដៃរឹងមាំ ដាំត្បូងនាំលាភសំណាងនិងសិរីមង្គល',
    0, 1
  )
ON CONFLICT(id) DO UPDATE SET
  name         = excluded.name,
  category     = excluded.category,
  import_price = excluded.import_price,
  sell_price   = excluded.sell_price,
  stock        = excluded.stock,
  photo_url    = excluded.photo_url,
  variants     = excluded.variants,
  has_variants = excluded.has_variants,
  is_active    = 1;

-- 5. Upsert Product Child Variants (Safe ON CONFLICT, no blind DELETE)
INSERT INTO product_variants (id, product_id, color_name, import_price, sell_price, stock, photo_url, is_active)
VALUES
  -- KB-0001 Variants
  ('KB-0001-V1', 'KB-0001', 'ពណ៌ខ្មៅរាត្រី (Noir Black)', 25.00, 49.00, 5, 'https://images.unsplash.com/photo-1590739225287-bd31519780c3?w=800&q=80', 1),
  ('KB-0001-V2', 'KB-0001', 'ពណ៌មាសស្រាល (Champagne Gold)', 25.00, 49.00, 5, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80', 1),
  ('KB-0001-V3', 'KB-0001', 'ពណ៌ទឹកប្រាក់ចែងចាំង (Silver Shimmer)', 25.00, 49.00, 5, 'https://images.unsplash.com/photo-1727262082718-f0591150801b?w=800&q=80', 1),

  -- SS-0001 Variants
  ('SS-0001-V1', 'SS-0001', 'ក្បាច់មាសបុរាណ (Antique Gold)', 18.00, 39.00, 5, 'https://images.unsplash.com/photo-1704822805385-5176a86f5b0b?w=800&q=80', 1),
  ('SS-0001-V2', 'SS-0001', 'ក្បាច់ផ្លាកទីនដាំគជ់ (Platinum Pearl)', 18.00, 39.00, 5, 'https://images.unsplash.com/photo-1654013273452-f10d25f10e67?w=800&q=80', 1),
  ('SS-0001-V3', 'SS-0001', 'ក្បាច់គ្រីស្តាល់ផ្កាចំប៉ី (Crystal Floral)', 18.00, 39.00, 5, 'https://images.unsplash.com/photo-1575009965778-64896cad0f87?w=800&q=80', 1),

  -- KA-0001 Variants
  ('KA-0001-V1', 'KA-0001', 'ផ្កាឈូកពេជ្រស (White Diamond Lotus)', 20.00, 45.00, 5, 'https://images.unsplash.com/photo-1728318853117-f9b3ce9be350?w=800&q=80', 1),
  ('KA-0001-V2', 'KA-0001', 'ផ្កាឈូកត្បូងទទឹម (Ruby Lotus)', 22.00, 48.00, 5, 'https://images.unsplash.com/photo-1766560360153-3d7801040953?w=800&q=80', 1),
  ('KA-0001-V3', 'KA-0001', 'ផ្កាឈូកគជ់បុរាណ (Vintage Pearl Lotus)', 20.00, 45.00, 5, 'https://images.unsplash.com/photo-1758723208958-c18fa48aaff3?w=800&q=80', 1),

  -- CJ-0001 Variants
  ('CJ-0001-V1', 'CJ-0001', 'ផ្លាកទីនទឹកភ្លឺ (Platinum White)', 45.00, 99.00, 5, 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80', 1),
  ('CJ-0001-V2', 'CJ-0001', 'មាសទឹកដប់ (24K Gold)', 48.00, 105.00, 5, 'https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?w=800&q=80', 1),
  ('CJ-0001-V3', 'CJ-0001', 'មាសផ្កាឈូក (Rose Gold)', 45.00, 99.00, 5, 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&q=80', 1),

  -- KD-0001 Variants
  ('KD-0001-V1', 'KD-0001', 'ក្បាច់បុរាណទោល (Single Carved)', 60.00, 135.00, 5, 'https://images.unsplash.com/photo-1758995116383-f51775896add?w=800&q=80', 1),
  ('KD-0001-V2', 'KD-0001', 'ក្បាច់ឆ្លាក់ក្បាលនាគ (Twin Dragon Head)', 65.00, 145.00, 5, 'https://images.unsplash.com/photo-1690175867343-2af70ea57537?w=800&q=80', 1),
  ('KD-0001-V3', 'KD-0001', 'ដាំពេជ្រក្បាច់រង្វង់ (Round Diamond Encrusted)', 70.00, 155.00, 5, 'https://images.unsplash.com/photo-1611598935678-c88dca238fce?w=800&q=80', 1)
ON CONFLICT(id) DO UPDATE SET
  product_id   = excluded.product_id,
  color_name   = excluded.color_name,
  import_price = excluded.import_price,
  sell_price   = excluded.sell_price,
  stock        = excluded.stock,
  photo_url    = excluded.photo_url,
  is_active    = 1;

-- 6. Synchronize stock of products that have child variants
UPDATE products
SET stock = (
  SELECT COALESCE(SUM(stock), 0)
  FROM product_variants
  WHERE product_variants.product_id = products.id AND product_variants.is_active = 1
)
WHERE has_variants = 1;

PRAGMA foreign_keys = ON;
