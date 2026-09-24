/**
 * Bulk Demo Product Seeder
 * -------------------------
 * Generates realistic, high-stock jewelry items for stress-testing and catalog demo.
 *
 * Usage:
 *   node src/db/seed_bulk.js         -> Seeds 1,000 demo products (default)
 *   node src/db/seed_bulk.js 500     -> Seeds 500 demo products
 *   node src/db/seed_bulk.js --clear -> Removes all DEMO-* products in 1 command
 */

const db = require('./index');

const args = process.argv.slice(2);

// ─── Wipe / Clean Command ───────────────────────────────────────────────────
if (args.includes('--clear') || args.includes('-c') || args.includes('--clean')) {
  console.log('\n🧹 Clearing all demo products (SKU starting with "DEMO-")...');
  const result = db.prepare("DELETE FROM products WHERE id LIKE 'DEMO-%'").run();
  console.log(`✅ Removed ${result.changes} demo product(s). Your real shop products remain intact!\n`);
  process.exit(0);
}

// ─── Target Quantity ────────────────────────────────────────────────────────
const targetCount = parseInt(args[0], 10) || 1000;

console.log(`\n💎 Generating ${targetCount} high-stock demo jewelry products...`);

// Curated high-res Unsplash CDN jewelry photography categorized by type
const CATEGORY_PHOTOS = {
  Ring: [
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',
    'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&q=80',
    'https://images.unsplash.com/photo-1598560917505-59a3ad559071?w=600&q=80',
    'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=600&q=80',
    'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=600&q=80',
  ],
  Necklace: [
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
    'https://images.unsplash.com/photo-1611591475155-428482329957?w=600&q=80',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
    'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?w=600&q=80',
  ],
  Bracelet: [
    'https://images.unsplash.com/photo-1611591475152-47e273031070?w=600&q=80',
    'https://images.unsplash.com/photo-1611591475143-69e12089f21d?w=600&q=80',
    'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&q=80',
    'https://images.unsplash.com/photo-1611591475168-98e3b333a925?w=600&q=80',
  ],
  Earring: [
    'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&q=80',
    'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=600&q=80',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
  ],
};

const CATEGORIES = ['Ring', 'Necklace', 'Bracelet', 'Earring'];

const PREFIXES = [
  'Royal', 'Luxe', 'Celestial', 'Imperial', 'Aura', 'Eternity',
  'Radiant', 'Heritage', 'Timeless', 'Serenity', 'Opulent', 'Majestic',
  'Gilded', 'Luminous', 'Enchanted', 'Prestige', 'Regal', 'Infinity'
];

const METALS = [
  '18K Yellow Gold', 'Platinum', 'Sterling Silver', 'Rose Gold', 'White Gold'
];

const GEMS = [
  'Solitaire Diamond', 'Blue Sapphire', 'Emerald', 'Ruby',
  'South Sea Pearl', 'Moissanite', 'Amethyst', 'Topaz'
];

const NOUNS = {
  Ring: ['Signet Ring', 'Eternity Band', 'Solitaire Ring', 'Halo Ring', 'Stackable Ring'],
  Necklace: ['Pendant Necklace', 'Choker Chain', 'Strand Necklace', 'Medallion', 'Lariat Necklace'],
  Bracelet: ['Tennis Bracelet', 'Cuff Bangle', 'Charm Bracelet', 'Link Chain', 'Twisted Bangle'],
  Earring: ['Stud Earrings', 'Hoop Earrings', 'Drop Earrings', 'Huggie Earrings', 'Chandelier Earrings'],
};

const VARIANTS_BY_CAT = {
  Ring: 'Available in US sizes 5, 6, 7, 8, 9. Specify in note.',
  Necklace: 'Available in 16-inch, 18-inch, and 20-inch lengths.',
  Bracelet: 'Adjustable 6.5" to 7.5" wrist sizing with safety clasp.',
  Earring: 'Hypoallergenic posts with 14K silicone-comfort backs.',
};

// Prepared statement with ON CONFLICT DO UPDATE so it's safe to re-run
const insertProduct = db.prepare(`
  INSERT INTO products (id, name, category, import_price, sell_price, stock, photo_url, variants, is_active)
  VALUES (@id, @name, @category, @import_price, @sell_price, @stock, @photo_url, @variants, 1)
  ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    category = excluded.category,
    import_price = excluded.import_price,
    sell_price = excluded.sell_price,
    stock = excluded.stock,
    photo_url = excluded.photo_url,
    variants = excluded.variants,
    is_active = 1
`);

const startTime = Date.now();

// Wrap in atomic transaction for sub-second execution
const seedTransaction = db.transaction(() => {
  for (let i = 1; i <= targetCount; i++) {
    const padId = String(i).padStart(4, '0');
    const id = `DEMO-${padId}`;

    const category = CATEGORIES[i % CATEGORIES.length];
    const prefix = PREFIXES[(i * 7) % PREFIXES.length];
    const metal = METALS[(i * 3) % METALS.length];
    const gem = GEMS[(i * 5) % GEMS.length];
    const noun = NOUNS[category][(i * 2) % NOUNS[category].length];

    const name = `${prefix} ${gem} ${noun} (${metal})`;

    // Realistic pricing: wholesale $20-$180, retail margin 1.8x - 2.5x ($45-$420)
    const baseCost = 20 + ((i * 13) % 150);
    const import_price = Number(baseCost.toFixed(2));
    const markup = 1.8 + (((i * 9) % 7) * 0.1);
    const sell_price = Number(Math.round(import_price * markup));

    // High stock for stress testing: 50 - 500 units
    const stock = 50 + ((i * 37) % 450);

    const photos = CATEGORY_PHOTOS[category];
    const photo_url = photos[i % photos.length];
    const variants = VARIANTS_BY_CAT[category];

    insertProduct.run({
      id,
      name,
      category,
      import_price,
      sell_price,
      stock,
      photo_url,
      variants,
    });
  }
});

seedTransaction();

const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

console.log(`\n✨ Successfully seeded ${targetCount} demo products in ${elapsed}s!`);
console.log(`📦 Categories distributed evenly: Ring, Necklace, Bracelet, Earring`);
console.log(`🏷️  SKU range: DEMO-0001 to DEMO-${String(targetCount).padStart(4, '0')}`);
console.log(`📸 High-res Unsplash CDN jewelry photography attached`);
console.log(`\n💡 To clear all demo products anytime, run:`);
console.log(`   node src/db/seed_bulk.js --clear\n`);
