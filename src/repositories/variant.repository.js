/**
 * Product Variant Repository
 * Manages child SKU variants (colors) for products.
 */
const db = require('../db');

function findByProductId(productId) {
  return db.prepare(`
    SELECT id, product_id, color_name, import_price, sell_price, stock, photo_url, is_active, created_at, updated_at
    FROM product_variants
    WHERE product_id = ? AND is_active = 1
    ORDER BY id ASC
  `).all(productId);
}

function findById(id) {
  return db.prepare('SELECT * FROM product_variants WHERE id = ?').get(id);
}

/**
 * Replace all variants for a product atomically
 */
function replaceForProduct(productId, variants) {
  const deleteStmt = db.prepare('DELETE FROM product_variants WHERE product_id = ?');
  const insertStmt = db.prepare(`
    INSERT INTO product_variants (id, product_id, color_name, import_price, sell_price, stock, photo_url, is_active)
    VALUES (@id, @product_id, @color_name, @import_price, @sell_price, @stock, @photo_url, 1)
  `);

  const runTransaction = db.transaction((rows) => {
    deleteStmt.run(productId);
    for (let i = 0; i < rows.length; i++) {
      const v = rows[i];
      const variantId = v.id || `${productId}-V${i + 1}`;
      insertStmt.run({
        id: variantId,
        product_id: productId,
        color_name: v.color_name || v.style_name || `Style ${i + 1}`,
        import_price: Number(v.import_price || 0),
        sell_price: Number(v.sell_price || 0),
        stock: Number(v.stock ?? 1),
        photo_url: v.photo_url || '',
      });
    }
    // Synchronize parent product stock
    syncParentStock(productId);
  });

  runTransaction(variants || []);
}

function deleteByProductId(productId) {
  return db.prepare('DELETE FROM product_variants WHERE product_id = ?').run(productId);
}

function decrementStock(id, qty) {
  const result = db.prepare(`
    UPDATE product_variants
    SET stock = stock - ?
    WHERE id = ? AND stock >= ?
  `).run(qty, id, qty);

  if (result.changes > 0) {
    const variant = findById(id);
    if (variant) syncParentStock(variant.product_id);
  }
  return result;
}

function incrementStock(id, qty) {
  const result = db.prepare(`
    UPDATE product_variants
    SET stock = stock + ?
    WHERE id = ?
  `).run(qty, id);

  if (result.changes > 0) {
    const variant = findById(id);
    if (variant) syncParentStock(variant.product_id);
  }
  return result;
}

function syncParentStock(productId) {
  db.prepare(`
    UPDATE products
    SET stock = (
      SELECT COALESCE(SUM(stock), 0)
      FROM product_variants
      WHERE product_id = ? AND is_active = 1
    )
    WHERE id = ?
  `).run(productId, productId);
}

module.exports = {
  findByProductId,
  findById,
  replaceForProduct,
  deleteByProductId,
  decrementStock,
  incrementStock,
  syncParentStock,
};
