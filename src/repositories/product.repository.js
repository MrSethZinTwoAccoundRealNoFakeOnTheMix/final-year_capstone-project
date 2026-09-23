/**
 * Product Repository
 * All SQL queries for the products table live here.
 * No business logic — pure data access only.
 */

const db = require('../db');
const { SKU_PREFIXES } = require('../config/constants');

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Public catalog — excludes import_price (never expose to customers)
 */
function findAll() {
  return db.prepare(`
    SELECT id, name, category, sell_price, stock, photo_url, variants
    FROM products
    ORDER BY category ASC, id ASC
  `).all();
}

/**
 * Admin view — includes import_price and computed profit margin
 */
function findAllAdmin() {
  return db.prepare(`
    SELECT
      id, name, category,
      import_price, sell_price, stock, photo_url, variants,
      ROUND(((sell_price - import_price) / sell_price) * 100, 1) AS margin_percent,
      created_at, updated_at
    FROM products
    ORDER BY category ASC, id ASC
  `).all();
}

/**
 * Single product by SKU (full row including import_price)
 */
function findById(id) {
  return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
}

// ─── Write ────────────────────────────────────────────────────────────────────

/**
 * Generate next sequential SKU for a category.
 * E.g. existing RG-0003 → returns RG-0004
 */
function generateSku(category) {
  const prefix = SKU_PREFIXES[category] || 'JW';
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

  db.prepare(`
    INSERT INTO products (id, name, category, import_price, sell_price, stock, photo_url, variants)
    VALUES (@id, @name, @category, @import_price, @sell_price, @stock, @photo_url, @variants)
    ON CONFLICT(id) DO UPDATE SET
      name         = excluded.name,
      category     = excluded.category,
      import_price = excluded.import_price,
      sell_price   = excluded.sell_price,
      stock        = excluded.stock,
      photo_url    = excluded.photo_url,
      variants     = excluded.variants
  `).run({
    id,
    name:         data.name,
    category:     data.category,
    import_price: Number(data.import_price),
    sell_price:   Number(data.sell_price),
    stock:        Number(data.stock ?? 0),
    photo_url:    data.photo_url || '',
    variants:     data.variants  || '',
  });

  return id;
}

/**
 * Delete a product by SKU.
 * Note: will fail with FK constraint if the product has order_items referencing it.
 */
function remove(id) {
  return db.prepare('DELETE FROM products WHERE id = ?').run(id);
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
