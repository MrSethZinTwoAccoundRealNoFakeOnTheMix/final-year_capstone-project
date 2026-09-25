/**
 * Product Repository
 * All SQL queries for the products table live here.
 * No business logic — pure data access only.
 */

const db = require('../db');
const { SKU_PREFIXES } = require('../config/constants');

// Ensure is_active column exists (safe auto-migration fallback)
try {
  db.exec('ALTER TABLE products ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1');
} catch (e) {
  // Column already exists, safe to ignore
}

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Public catalog — excludes import_price (never expose to customers)
 * Only returns active (non-archived) products.
 */
function findAll() {
  return db.prepare(`
    SELECT id, name, category, sell_price, stock, photo_url, variants, has_variants
    FROM products
    WHERE is_active = 1
    ORDER BY category ASC, id ASC
  `).all();
}

/**
 * Admin view — includes import_price and computed profit margin.
 * Attaches child variants for each product.
 */
function findAllAdmin() {
  const products = db.prepare(`
    SELECT
      id, name, category,
      import_price, sell_price, stock, photo_url, variants, has_variants,
      ROUND(((sell_price - import_price) / sell_price) * 100, 1) AS margin_percent,
      created_at, updated_at
    FROM products
    WHERE is_active = 1
    ORDER BY category ASC, id ASC
  `).all();

  const allVariants = db.prepare(`
    SELECT id, product_id, color_name, import_price, sell_price, stock, photo_url
    FROM product_variants
    WHERE is_active = 1
    ORDER BY id ASC
  `).all();

  const variantMap = new Map();
  for (const v of allVariants) {
    if (!variantMap.has(v.product_id)) variantMap.set(v.product_id, []);
    variantMap.get(v.product_id).push(v);
  }

  for (const p of products) {
    p.variant_list = variantMap.get(p.id) || [];
  }

  return products;
}

/**
 * Single product by SKU (full row including import_price and variants)
 */
function findById(id) {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (product) {
    product.variant_list = db.prepare(`
      SELECT * FROM product_variants WHERE product_id = ? AND is_active = 1 ORDER BY id ASC
    `).all(id);
  }
  return product;
}

// ─── Write ────────────────────────────────────────────────────────────────────

/**
 * Generate next sequential SKU for a category.
 * If known prefix exists, uses it; otherwise derives a 2-letter prefix from category name.
 */
function generateSku(category) {
  const catClean = (category || '').trim();
  let prefix = SKU_PREFIXES[catClean];
  if (!prefix) {
    prefix = catClean.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase() || 'JW';
  }
  const last = db.prepare(
    "SELECT id FROM products WHERE id LIKE ? ORDER BY id DESC LIMIT 1"
  ).get(`${prefix}-%`);

  let nextNum = 1;
  if (last) {
    const match = last.id.match(/(\d+)$/);
    if (match) nextNum = parseInt(match[1], 10) + 1;
  }
  return `${prefix}-${String(nextNum).padStart(4, '0')}`;
}

/**
 * Upsert a product (creates new with auto-SKU, or updates existing by id)
 * Returns the final SKU used.
 */
function upsert(data) {
  const id = data.id || generateSku(data.category);
  const hasVariants = data.has_variants ? 1 : 0;

  db.prepare(`
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
  `).run({
    id,
    name:         data.name,
    category:     data.category,
    import_price: Number(data.import_price),
    sell_price:   Number(data.sell_price),
    stock:        Number(data.stock ?? 1),
    photo_url:    data.photo_url || '',
    variants:     data.variants  || '',
    has_variants: hasVariants,
  });

  return id;
}

/**
 * Delete a product by SKU.
 * If the product is referenced in existing order history (order_items),
 * hard-deleting would trigger a FOREIGN KEY constraint error and corrupt past receipts.
 * Instead, it is safely soft-deleted/archived (is_active = 0, stock = 0) so order history
 * remains valid while removing it completely from customer catalog and active inventory.
 * If the product was never ordered, it is permanently deleted from the database.
 */
function remove(id) {
  const product = db.prepare('SELECT id FROM products WHERE id = ?').get(id);
  if (!product) return { changes: 0 };

  const hasOrders = db.prepare('SELECT 1 FROM order_items WHERE product_id = ? LIMIT 1').get(id);

  if (hasOrders) {
    return db.prepare('UPDATE products SET is_active = 0, stock = 0 WHERE id = ?').run(id);
  } else {
    return db.prepare('DELETE FROM products WHERE id = ?').run(id);
  }
}

// ─── Inventory ────────────────────────────────────────────────────────────────

/**
 * Atomic stock decrement — prevents overselling.
 * The AND stock >= qty guard ensures we never go below 0.
 * Returns the sqlite RunResult; check result.changes === 0 for insufficient stock.
 */
function decrementStock(id, qty) {
  return db.prepare(`
    UPDATE products
    SET stock = stock - ?
    WHERE id = ? AND stock >= ?
  `).run(qty, id, qty);
}

/**
 * Increment stock — used for order cancellations and returned deliveries.
 */
function incrementStock(id, qty) {
  return db.prepare(`
    UPDATE products
    SET stock = stock + ?
    WHERE id = ?
  `).run(qty, id);
}

module.exports = {
  findAll,
  findAllAdmin,
  findById,
  generateSku,
  upsert,
  remove,
  decrementStock,
  incrementStock,
};
