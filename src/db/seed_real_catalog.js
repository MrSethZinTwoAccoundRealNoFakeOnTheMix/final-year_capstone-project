/**
 * Seed Real Catalog Script
 * Seeds the 30 authentic products (KA-0001 to KA-0029, KB-0001)
 * along with their 93 real cropped child variants into SQLite.
 */

const fs = require('fs');
const path = require('path');
const db = require('./index');
const variantRepo = require('../repositories/variant.repository');

console.log('\n💎 Seeding Real Khmer Jewelry Products (KA-0001 to KA-0029, KB-0001)...\n');

const dataFile = path.join(__dirname, 'real_products.json');
if (!fs.existsSync(dataFile)) {
  console.error('❌ real_products.json not found in src/db/');
  process.exit(1);
}

const products = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));

// 1. Ensure categories exist
const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');
['កាបូប', 'ស្នាតសក់', 'កន្លាស់អាវ', 'ចិញ្ចៀន', 'កងដៃ'].forEach(cat => insertCategory.run(cat));

// 2. Prepare product upsert statement
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
let variantCount = 0;

for (const p of products) {
  upsertProduct.run({
    id: p.id,
    name: p.name,
    category: p.category,
    import_price: Number(p.import_price || 0),
    sell_price: Number(p.sell_price || 0),
    stock: Number(p.stock || 0),
    photo_url: p.photo_url,
    variants: p.variants || '',
    has_variants: Number(p.has_variants || 0),
  });
  productCount++;

  // Insert child variants
  if (p.has_variants === 1 && Array.isArray(p.variant_list) && p.variant_list.length > 0) {
    variantRepo.replaceForProduct(p.id, p.variant_list);
    variantCount += p.variant_list.length;
  }
}

console.log(`✅ Successfully seeded ${productCount} products into database!`);
console.log(`💎 Attached ${variantCount} cropped child variants with unique local images.\n`);
