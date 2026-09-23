/**
 * Seed Script
 * Inserts initial sample jewelry products if they do not already exist.
 * Safe to run multiple times (ON CONFLICT DO NOTHING).
 */

const db = require('./index');

const products = [
  {
    id:           'RG-0001',
    name:         'Classic Gold Ring',
    category:     'Ring',
    import_price: 22.00,
    sell_price:   45.00,
    stock:        10,
    photo_url:    '',
    variants:     'Available in sizes 5, 6, 7, 8. Please note your ring size in the Order Note field.',
  },
  {
    id:           'NK-0001',
    name:         'Pearl Pendant Necklace',
    category:     'Necklace',
    import_price: 30.00,
    sell_price:   65.00,
    stock:        8,
    photo_url:    '',
    variants:     '16-inch and 18-inch chain lengths available. Please specify in the Order Note field.',
  },
  {
    id:           'BR-0001',
    name:         'Silver Bangle Bracelet',
    category:     'Bracelet',
    import_price: 12.00,
    sell_price:   28.00,
    stock:        15,
    photo_url:    '',
    variants:     'One size fits most. Adjustable clasp included.',
  },
];

const upsert = db.prepare(`
  INSERT INTO products (id, name, category, import_price, sell_price, stock, photo_url, variants)
  VALUES (@id, @name, @category, @import_price, @sell_price, @stock, @photo_url, @variants)
  ON CONFLICT(id) DO NOTHING
`);

console.log('\n🌱 Seeding products...\n');

let seeded = 0;
for (const product of products) {
  const result = upsert.run(product);
  if (result.changes > 0) {
    console.log(`  ✅ SEED  ${product.id} — ${product.name} ($${product.sell_price.toFixed(2)})`);
    seeded++;
  } else {
    console.log(`  ⏭️  SKIP  ${product.id} (already exists)`);
  }
}

console.log(`\n✨ Seed complete. ${seeded} new product(s) inserted.\n`);
process.exit(0);
