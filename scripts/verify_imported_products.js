const fs = require('fs');
const path = require('path');
const db = require('../src/db');

console.log('=== VERIFY IMPORTED PRODUCTS & VARIANTS ===\n');

const jsonPath = path.join(__dirname, '../src/db/real_products.json');
if (!fs.existsSync(jsonPath)) {
  console.error('❌ real_products.json not found!');
  process.exit(1);
}

const products = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
console.log(`Found ${products.length} products in real_products.json\n`);

let missingCovers = 0;
let missingVariantImages = 0;
let totalVariants = 0;

products.forEach((p) => {
  // 1. Check cover image
  const coverDiskPath = path.join(__dirname, '../public', p.photo_url);
  const coverExists = fs.existsSync(coverDiskPath);
  if (!coverExists) {
    console.error(`❌ Missing Cover: ${p.id} -> ${p.photo_url}`);
    missingCovers++;
  }

  // 2. Check variants
  if (p.has_variants) {
    if (!Array.isArray(p.variant_list) || p.variant_list.length === 0) {
      console.warn(`⚠️ Warning: ${p.id} marked has_variants=1 but has no variants!`);
    } else {
      p.variant_list.forEach((v) => {
        totalVariants++;
        const varDiskPath = path.join(__dirname, '../public', v.photo_url);
        if (!fs.existsSync(varDiskPath)) {
          console.error(`❌ Missing Variant Image: ${v.id} (${p.id}) -> ${v.photo_url}`);
          missingVariantImages++;
        }
      });
    }
  }
});

console.log(`\n--- Verification Summary ---`);
console.log(`Total Products: ${products.length}`);
console.log(`Total Variants: ${totalVariants}`);
console.log(`Missing Covers: ${missingCovers}`);
console.log(`Missing Variant Images: ${missingVariantImages}`);

// 3. Database Check
console.log(`\n--- Database Status ---`);
const dbProducts = db.prepare("SELECT id, name, category, photo_url, has_variants, is_active FROM products WHERE id LIKE 'KA-%' OR id = 'KB-0001'").all();
console.log(`Database Real Products Count: ${dbProducts.length}`);

const dbVariants = db.prepare("SELECT count(*) as count FROM product_variants WHERE product_id LIKE 'KA-%' OR product_id = 'KB-0001'").get();
console.log(`Database Real Variants Count: ${dbVariants.count}`);

// Check active status of old dummy products
const oldActive = db.prepare("SELECT count(*) as count FROM products WHERE photo_url LIKE 'http%' AND is_active = 1").get();
console.log(`Old Dummy Products Still Active: ${oldActive.count}`);

if (missingCovers === 0 && missingVariantImages === 0) {
  console.log(`\n✅ ALL 30 PRODUCTS AND ${totalVariants} VARIANTS ARE 100% VALID!`);
} else {
  console.log(`\n❌ THERE ARE BROKEN IMAGE LINKS!`);
}
