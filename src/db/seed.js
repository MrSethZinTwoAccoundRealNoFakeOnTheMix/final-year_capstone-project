/**
 * Seed Script — Authentic Khmer Local Jewelry Catalog
 * ---------------------------------------------------
 * Seeds authentic Khmer local jewelry products into the 5 official Khmer categories:
 * កាបូប (Bags & Clutches)
 * ស្នាតសក់ (Hairpins & Bridal Combs)
 * កន្លាស់អាវ (Traditional Blouse Brooches)
 * ចិញ្ចៀន (Rings: Pailin Rubies, Diamonds, Khmer Gold)
 * កងដៃ (Bangles: Traditional Carved Gold, Dragon Motifs)
 *
 * Safe to run multiple times.
 */

const db = require('./index');
const variantRepo = require('../repositories/variant.repository');

console.log('\n🇰🇭 Seeding Authentic Khmer Local Jewelry Catalog...\n');

// 1. Archive all existing products first so they disappear from storefront
db.prepare("UPDATE products SET is_active = 0").run();

// 2. Safely delete ONLY products that are NOT referenced in order_items
db.prepare(`
  DELETE FROM products 
  WHERE id NOT IN (SELECT DISTINCT product_id FROM order_items)
    AND id NOT IN (
      'KB-0001', 'KB-0002', 'KB-0003', 'KB-0004', 'KB-0005',
      'SS-0001', 'SS-0002', 'SS-0003', 'SS-0004', 'SS-0005',
      'KA-0001', 'KA-0002', 'KA-0003', 'KA-0004', 'KA-0005',
      'CJ-0001', 'CJ-0002', 'CJ-0003', 'CJ-0004', 'CJ-0005',
      'KD-0001', 'KD-0002', 'KD-0003', 'KD-0004', 'KD-0005'
    )
`).run();

// 2. Ensure categories table has all 5 Khmer categories
const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');
const categories = ['កាបូប', 'ស្នាតសក់', 'កន្លាស់អាវ', 'ចិញ្ចៀន', 'កងដៃ'];
for (const cat of categories) {
  insertCategory.run(cat);
}

// 3. Products list (5 items per category = 25 products total)
const products = [
  // ─── Category: កាបូប (Bags & Clutches) ────────────────────────────────────
  {
    id:           'KB-0001',
    name:         'កាបូបក្លាត់យួរដៃចូលរួមកម្មវិធី',
    category:     'កាបូប',
    import_price: 25.00,
    sell_price:   49.00,
    stock:        15,
    photo_url:    'https://images.unsplash.com/photo-1590739225287-bd31519780c3?w=800&q=80',
    variants:     'កាបូបក្លាត់ដៃយ៉ាងប្រណិតសម្រាប់ពិធីមង្គលការ និងកម្មវិធីពេលរាត្រី',
    has_variants: 1,
  },
  {
    id:           'KB-0002',
    name:         'កាបូបស្ពាយចំហៀងស្បែកទន់ម៉ូដប្រណិត',
    category:     'កាបូប',
    import_price: 30.00,
    sell_price:   59.00,
    stock:        10,
    photo_url:    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80',
    variants:     'ស្បែកទន់គុណភាពខ្ពស់ ងាយស្រួលប្រើប្រាស់ប្រចាំថ្ងៃ',
    has_variants: 0,
  },
  {
    id:           'KB-0003',
    name:         'កាបូបក្លាត់ប្រាក់រាត្រីសមោសរ',
    category:     'កាបូប',
    import_price: 22.00,
    sell_price:   45.00,
    stock:        8,
    photo_url:    'https://images.unsplash.com/photo-1727262082718-f0591150801b?w=800&q=80',
    variants:     'ម៉ូដចែងចាំងដាំគ្រីស្តាល់ស្អាតឥតខ្ចោះពេលត្រូវពន្លឺភ្លើង',
    has_variants: 0,
  },
  {
    id:           'KB-0004',
    name:         'កាបូបស្បែកខ្មៅខ្សែច្រវាក់មាស',
    category:     'កាបូប',
    import_price: 28.00,
    sell_price:   55.00,
    stock:        12,
    photo_url:    'https://images.unsplash.com/photo-1590739225287-bd31519780c3?w=800&q=80',
    variants:     'ខ្សែច្រវាក់ស្រោបមាសមិនងាយស្រអាប់ ម៉ូដបុរាណលាយសម័យ',
    has_variants: 0,
  },
  {
    id:           'KB-0005',
    name:         'កាបូបយួរដៃស្បែកពណ៌ត្នោតទាន់សម័យ',
    category:     'កាបូប',
    import_price: 35.00,
    sell_price:   68.00,
    stock:        6,
    photo_url:    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
    variants:     'រាងរឹងមាំ ទូលាយ អាចដាក់ទូរស័ព្ទ និងសម្ភារៈតុបតែងមុខបានច្រើន',
    has_variants: 0,
  },

  // ─── Category: ស្នាតសក់ (Hairpins & Combs) ──────────────────────────────────
  {
    id:           'SS-0001',
    name:         'ស្នាតសក់ផ្កាមាសកូនក្រមុំបុរាណ',
    category:     'ស្នាតសក់',
    import_price: 18.00,
    sell_price:   39.00,
    stock:        15,
    photo_url:    'https://images.unsplash.com/photo-1704822805385-5176a86f5b0b?w=800&q=80',
    variants:     'ស្នាតសក់ក្បាច់បុរាណសម្រាប់កូនក្រមុំ ឬសម្លៀកបំពាក់ប្រពៃណីខ្មែរ',
    has_variants: 1,
  },
  {
    id:           'SS-0002',
    name:         'ស្នាតសក់ដាំគជ់ខ្យងផ្កាចំប៉ី',
    category:     'ស្នាតសក់',
    import_price: 15.00,
    sell_price:   32.00,
    stock:        12,
    photo_url:    'https://images.unsplash.com/photo-1654013273452-f10d25f10e67?w=800&q=80',
    variants:     'ដាំគ្រាប់គជ់ខ្យងធម្មជាតិ ផ្កាចំប៉ីស្រទន់សម្រាប់សៀកសក់',
    has_variants: 0,
  },
  {
    id:           'SS-0003',
    name:         'ស្នាតសក់ក្បាច់រចនាមាសសុទ្ធ',
    category:     'ស្នាតសក់',
    import_price: 24.00,
    sell_price:   52.00,
    stock:        8,
    photo_url:    'https://images.unsplash.com/photo-1767096612165-b5a33caa48a5?w=800&q=80',
    variants:     'ក្បាច់ឆ្លាក់ក្បូរក្បាច់បុរាណខ្មែរ រំលេចភាពថ្លៃថ្នូរ',
    has_variants: 0,
  },
  {
    id:           'SS-0004',
    name:         'ស្នាតសក់ដាំគ្រីស្តាល់ភ្លឺចែងចាំង',
    category:     'ស្នាតសក់',
    import_price: 14.00,
    sell_price:   29.00,
    stock:        10,
    photo_url:    'https://images.unsplash.com/photo-1575009965778-64896cad0f87?w=800&q=80',
    variants:     'គ្រីស្តាល់ភ្លឺផ្លេកៗ សាកសមជាមួយម៉ូដសក់បួងកម្មវិធីមង្គល',
    has_variants: 0,
  },
  {
    id:           'SS-0005',
    name:         'ស្នាតសក់ផ្កាកុលាបសៀកសក់ប្រណិត',
    category:     'ស្នាតសក់',
    import_price: 16.00,
    sell_price:   35.00,
    stock:        7,
    photo_url:    'https://images.unsplash.com/photo-1603562439742-cdb93fa71099?w=800&q=80',
    variants:     'ក្បាច់ផ្កាកុលាបលាយគជ់ ជាប់ណែនល្អមិនរបូតពីសក់',
    has_variants: 0,
  },

  // ─── Category: កន្លាស់អាវ (Brooches) ───────────────────────────────────────
  {
    id:           'KA-0001',
    name:         'កន្លាស់អាវផ្កាឈូកដាំពេជ្រប្រណិត',
    category:     'កន្លាស់អាវ',
    import_price: 20.00,
    sell_price:   45.00,
    stock:        15,
    photo_url:    'https://images.unsplash.com/photo-1728318853117-f9b3ce9be350?w=800&q=80',
    variants:     'សម្រាប់កន្លាស់លើអាវប៉ាក់ អាវសូត្រហូលផាមួង ឬស្បៃពិធីបុណ្យប្រពៃណី',
    has_variants: 1,
  },
  {
    id:           'KA-0002',
    name:         'កន្លាស់អាវផ្កាត្បូងទទឹមក្រហម',
    category:     'កន្លាស់អាវ',
    import_price: 22.00,
    sell_price:   48.00,
    stock:        9,
    photo_url:    'https://images.unsplash.com/photo-1766560360153-3d7801040953?w=800&q=80',
    variants:     'ដាំត្បូងទទឹមពណ៌ក្រហមឆ្អៅ លើសម្លៀកបំពាក់ប្រពៃណី',
    has_variants: 0,
  },
  {
    id:           'KA-0003',
    name:         'កន្លាស់អាវផ្កាមាសដាំគជ់បុរាណ',
    category:     'កន្លាស់អាវ',
    import_price: 19.00,
    sell_price:   42.00,
    stock:        8,
    photo_url:    'https://images.unsplash.com/photo-1758723208958-c18fa48aaff3?w=800&q=80',
    variants:     'ក្បាច់ផ្កាមាសលាយគជ់ខ្យងបុរាណ រចនាបែបខ្មែរបុរាណពិតៗ',
    has_variants: 0,
  },
  {
    id:           'KA-0004',
    name:         'កន្លាស់អាវមេអំបៅដាំត្បូងចម្រុះ',
    category:     'កន្លាស់អាវ',
    import_price: 25.00,
    sell_price:   55.00,
    stock:        11,
    photo_url:    'https://images.unsplash.com/photo-1768827824781-c0c9b8766c0b?w=800&q=80',
    variants:     'រូបរាងមេអំបៅរស់រវើក ដាំត្បូងចម្រុះពណ៌ភ្លឺចែងចាំង',
    has_variants: 0,
  },
  {
    id:           'KA-0005',
    name:         'កន្លាស់អាវដាំត្បូងកណ្ដៀងខៀវ',
    category:     'កន្លាស់អាវ',
    import_price: 26.00,
    sell_price:   58.00,
    stock:        7,
    photo_url:    'https://images.unsplash.com/photo-1699119852841-257a183734a3?w=800&q=80',
    variants:     'ត្បូងកណ្ដៀងពណ៌ខៀវទឹកសមុទ្រជ្រៅ កម្ពស់ថ្លៃថ្នូរ',
    has_variants: 0,
  },

  // ─── Category: ចិញ្ចៀន (Rings) ─────────────────────────────────────────────
  {
    id:           'CJ-0001',
    name:         'ចិញ្ចៀនពេជ្រសុទ្ធផ្លាកទីនប្រណិត',
    category:     'ចិញ្ចៀន',
    import_price: 45.00,
    sell_price:   99.00,
    stock:        15,
    photo_url:    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
    variants:     'ចិញ្ចៀនពេជ្រទឹកស្អាត មានទំហំលេខ 5, 6, 7, 8 (សូមកត់សម្គាល់ក្នុង Note)',
    has_variants: 1,
  },
  {
    id:           'CJ-0002',
    name:         'ចិញ្ចៀនមាសដាំត្បូងទទឹមប៉ៃលិន',
    category:     'ចិញ្ចៀន',
    import_price: 50.00,
    sell_price:   110.00,
    stock:        8,
    photo_url:    'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&q=80',
    variants:     'ត្បូងទទឹមធម្មជាតិប៉ៃលិន ពណ៌ឈាមព្រាប ដាំលើមាសទឹកល្អ',
    has_variants: 0,
  },
  {
    id:           'CJ-0003',
    name:         'ចិញ្ចៀនមាសក្បាច់បុរាណខ្មែរ',
    category:     'ចិញ្ចៀន',
    import_price: 38.00,
    sell_price:   85.00,
    stock:        12,
    photo_url:    'https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?w=800&q=80',
    variants:     'ក្បាច់ភ្ញីទេសបុរាណខ្មែរឆ្លាក់យ៉ាងផ្ចិតផ្ចង់ សាកសមទាំងបុរសនិងនារី',
    has_variants: 0,
  },
  {
    id:           'CJ-0004',
    name:         'ចិញ្ចៀនពេជ្រផ្កាត្របក៣ជាន់',
    category:     'ចិញ្ចៀន',
    import_price: 42.00,
    sell_price:   95.00,
    stock:        6,
    photo_url:    'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&q=80',
    variants:     'រាងស្រទាប់ផ្កា ៣ ជាន់ ដាំពេជ្រភ្លឺរលោងជុំវិញ',
    has_variants: 0,
  },
  {
    id:           'CJ-0005',
    name:         'ចិញ្ចៀនមាសត្បូងកណ្ដៀងខៀវប៉ៃលិន',
    category:     'ចិញ្ចៀន',
    import_price: 55.00,
    sell_price:   120.00,
    stock:        5,
    photo_url:    'https://images.unsplash.com/photo-1598560917505-59a3ad559071?w=800&q=80',
    variants:     'ត្បូងកណ្ដៀងខៀវធម្មជាតិរើសដោយដៃ ដាំលើតួមាស 18K',
    has_variants: 0,
  },

  // ─── Category: កងដៃ (Bangles & Bracelets) ──────────────────────────────────
  {
    id:           'KD-0001',
    name:         'កងដៃមាសក្បាច់បុរាណខ្មែរ',
    category:     'កងដៃ',
    import_price: 60.00,
    sell_price:   135.00,
    stock:        15,
    photo_url:    'https://images.unsplash.com/photo-1758995116383-f51775896add?w=800&q=80',
    variants:     'កងដៃក្បាច់ខ្មែរធ្វើពីមាស រចនាបថប្រពៃណីខ្មែរដ៏ប្រណិត',
    has_variants: 1,
  },
  {
    id:           'KD-0002',
    name:         'កងដៃមាសភ្លោះក្បាច់ឆ្លាក់ក្បាលនាគ',
    category:     'កងដៃ',
    import_price: 68.00,
    sell_price:   149.00,
    stock:        6,
    photo_url:    'https://images.unsplash.com/photo-1690175867343-2af70ea57537?w=800&q=80',
    variants:     'ក្បាច់ក្បាលនាគភ្លោះតំណាងឱ្យភាពរុងរឿង សិរីសួស្តី និងអំណាច',
    has_variants: 0,
  },
  {
    id:           'KD-0003',
    name:         'កងដៃមាសដាំពេជ្រជុំវិញ',
    category:     'កងដៃ',
    import_price: 75.00,
    sell_price:   165.00,
    stock:        8,
    photo_url:    'https://images.unsplash.com/photo-1611598935678-c88dca238fce?w=800&q=80',
    variants:     'ដាំពេជ្រជុំវិញរង្វង់កងដៃ ភ្លឺផ្លេកៗពេលត្រូវពន្លឺ',
    has_variants: 0,
  },
  {
    id:           'KD-0004',
    name:         'កងដៃមាសសុទ្ធម៉ូដទាន់សម័យ',
    category:     'កងដៃ',
    import_price: 45.00,
    sell_price:   98.00,
    stock:        10,
    photo_url:    'https://images.unsplash.com/photo-1679156271456-d6068c543ee7?w=800&q=80',
    variants:     'រចនាបថរលោង សាមញ្ញតែទាក់ទាញ សាកសមសម្រាប់ពាក់ប្រចាំថ្ងៃ',
    has_variants: 0,
  },
  {
    id:           'KD-0005',
    name:         'កងដៃខ្នាតរឹងដាំត្បូងមង្គល',
    category:     'កងដៃ',
    import_price: 58.00,
    sell_price:   128.00,
    stock:        7,
    photo_url:    'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80',
    variants:     'កងដៃរឹងមាំ ដាំត្បូងនាំលាភសំណាងនិងសិរីមង្គល',
    has_variants: 0,
  },
];

// 4. Style Variants (Unique photos per variant)
const variantsMap = {
  'KB-0001': [
    { color_name: 'ពណ៌ខ្មៅរាត្រី (Noir Black)', import_price: 25.00, sell_price: 49.00, stock: 5, photo_url: 'https://images.unsplash.com/photo-1590739225287-bd31519780c3?w=800&q=80' },
    { color_name: 'ពណ៌មាសស្រាល (Champagne Gold)', import_price: 25.00, sell_price: 49.00, stock: 5, photo_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80' },
    { color_name: 'ពណ៌ទឹកប្រាក់ចែងចាំង (Silver Shimmer)', import_price: 25.00, sell_price: 49.00, stock: 5, photo_url: 'https://images.unsplash.com/photo-1727262082718-f0591150801b?w=800&q=80' },
  ],
  'SS-0001': [
    { color_name: 'ក្បាច់មាសបុរាណ (Antique Gold)', import_price: 18.00, sell_price: 39.00, stock: 5, photo_url: 'https://images.unsplash.com/photo-1704822805385-5176a86f5b0b?w=800&q=80' },
    { color_name: 'ក្បាច់ផ្លាកទីនដាំគជ់ (Platinum Pearl)', import_price: 18.00, sell_price: 39.00, stock: 5, photo_url: 'https://images.unsplash.com/photo-1654013273452-f10d25f10e67?w=800&q=80' },
    { color_name: 'ក្បាច់គ្រីស្តាល់ផ្កាចំប៉ី (Crystal Floral)', import_price: 18.00, sell_price: 39.00, stock: 5, photo_url: 'https://images.unsplash.com/photo-1575009965778-64896cad0f87?w=800&q=80' },
  ],
  'KA-0001': [
    { color_name: 'ផ្កាឈូកពេជ្រស (White Diamond Lotus)', import_price: 20.00, sell_price: 45.00, stock: 5, photo_url: 'https://images.unsplash.com/photo-1728318853117-f9b3ce9be350?w=800&q=80' },
    { color_name: 'ផ្កាឈូកត្បូងទទឹម (Ruby Lotus)', import_price: 22.00, sell_price: 48.00, stock: 5, photo_url: 'https://images.unsplash.com/photo-1766560360153-3d7801040953?w=800&q=80' },
    { color_name: 'ផ្កាឈូកគជ់បុរាណ (Vintage Pearl Lotus)', import_price: 20.00, sell_price: 45.00, stock: 5, photo_url: 'https://images.unsplash.com/photo-1758723208958-c18fa48aaff3?w=800&q=80' },
  ],
  'CJ-0001': [
    { color_name: 'ផ្លាកទីនទឹកភ្លឺ (Platinum White)', import_price: 45.00, sell_price: 99.00, stock: 5, photo_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80' },
    { color_name: 'មាសទឹកដប់ (24K Gold)', import_price: 48.00, sell_price: 105.00, stock: 5, photo_url: 'https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?w=800&q=80' },
    { color_name: 'មាសផ្កាឈូក (Rose Gold)', import_price: 45.00, sell_price: 99.00, stock: 5, photo_url: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&q=80' },
  ],
  'KD-0001': [
    { color_name: 'ក្បាច់បុរាណទោល (Single Carved)', import_price: 60.00, sell_price: 135.00, stock: 5, photo_url: 'https://images.unsplash.com/photo-1758995116383-f51775896add?w=800&q=80' },
    { color_name: 'ក្បាច់ឆ្លាក់ក្បាលនាគ (Twin Dragon Head)', import_price: 65.00, sell_price: 145.00, stock: 5, photo_url: 'https://images.unsplash.com/photo-1690175867343-2af70ea57537?w=800&q=80' },
    { color_name: 'ដាំពេជ្រក្បាច់រង្វង់ (Round Diamond Encrusted)', import_price: 70.00, sell_price: 155.00, stock: 5, photo_url: 'https://images.unsplash.com/photo-1611598935678-c88dca238fce?w=800&q=80' },
  ],
};

const upsertProduct = db.prepare(`
  INSERT INTO products (id, name, category, import_price, sell_price, stock, photo_url, variants, has_variants, is_active)
  VALUES (@id, @name, @category, @import_price, @sell_price, @stock, @photo_url, @variants, @has_variants, 1)
  ON CONFLICT(id) DO UPDATE SET
    name         = excluded.name,
    category     = excluded.category,
    import_price = excluded.import_price,
    sell_price   = excluded.sell_price,
    stock        = excluded.stock,
    photo_url    = excluded.photo_url,
    variants     = excluded.variants,
    has_variants = excluded.has_variants,
    is_active    = 1
`);

let productCount = 0;
for (const p of products) {
  upsertProduct.run(p);
  productCount++;

  // Handle variants if any
  if (variantsMap[p.id]) {
    variantRepo.replaceForProduct(p.id, variantsMap[p.id]);
  }
}

console.log(`✅ Successfully seeded ${productCount} authentic Khmer local products across 5 categories.`);
console.log('💎 Child variants successfully attached with unique images.\n');
process.exit(0);
