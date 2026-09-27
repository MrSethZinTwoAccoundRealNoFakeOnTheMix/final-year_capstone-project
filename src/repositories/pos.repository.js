/**
 * POS / Quick Sell Repository
 * Handles persistent in-person sales and stock deductions.
 */

const db = require('../db');
const productRepository = require('./product.repository');
const variantRepository = require('./variant.repository');

/**
 * Attach items to a POS sale row
 */
function getItemsForSale(saleId) {
  return db.prepare(`
    SELECT
      id, sale_id, product_id, variant_id, product_name, variant_name,
      quantity, unit_price, import_price
    FROM pos_sale_items
    WHERE sale_id = ?
    ORDER BY id ASC
  `).all(saleId);
}

/**
 * Fetch all POS sales with attached items
 */
function findAll() {
  const sales = db.prepare(`
    SELECT * FROM pos_sales ORDER BY created_at DESC
  `).all();

  for (const s of sales) {
    s.items = getItemsForSale(s.id);
  }
  return sales;
}

/**
 * Find a single POS sale by ID
 */
function findById(id) {
  const sale = db.prepare('SELECT * FROM pos_sales WHERE id = ?').get(id);
  if (!sale) return null;
  sale.items = getItemsForSale(id);
  return sale;
}

/**
 * Create a new POS sale atomically.
 * Decrements inventory, saves the sale & items snapshot.
 *
 * @param {Object} params
 * @param {string} [params.id]
 * @param {Array} params.items - [{ productId, variantId, qty, unitPrice, name }]
 * @param {string} [params.payment_method='CASH']
 * @param {string} [params.note='']
 */
function createSale({ id, items, payment_method = 'CASH', note = '' }) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Sale must contain at least one item.');
  }

  const saleId = id || `QS-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const tx = db.transaction(() => {
    let totalAmount = 0;
    let totalCost = 0;
    let totalItemCount = 0;
    const preparedItems = [];

    // 1. Verify stock and calculate totals
    for (const item of items) {
      const qty = Math.max(1, Number(item.qty || item.quantity) || 1);
      const productId = item.productId || item.product_id;
      const variantId = item.variantId || item.variant_id || null;

      let productName = item.name || '';
      let variantName = '';
      let unitPrice = Number(item.price || item.unitPrice || item.unit_price || 0);
      let importPrice = 0;

      if (variantId) {
        const variant = variantRepository.findById(variantId);
        if (!variant || !variant.is_active) {
          throw new Error(`Variant ${variantId} not found or inactive.`);
        }
        if (variant.stock < qty) {
          throw new Error(`Insufficient stock for ${variant.color_name || 'variant'}. (Available: ${variant.stock})`);
        }
        const prod = productRepository.findById(variant.product_id);
        productName = prod ? prod.name : (productName || 'Jewelry Piece');
        variantName = variant.color_name || '';
        if (!unitPrice) unitPrice = Number(variant.sell_price || 0);
        importPrice = Number(variant.import_price || 0);

        const decResult = variantRepository.decrementStock(variantId, qty);
        if (decResult.changes === 0) {
          throw new Error(`Failed to deduct stock for ${variant.color_name}.`);
        }
      } else {
        const product = productRepository.findById(productId);
        if (!product || !product.is_active) {
          throw new Error(`Product ${productId} not found or inactive.`);
        }
        if (product.stock < qty) {
          throw new Error(`Insufficient stock for ${product.name}. (Available: ${product.stock})`);
        }
        productName = product.name;
        if (!unitPrice) unitPrice = Number(product.sell_price || 0);
        importPrice = Number(product.import_price || 0);

        const decResult = productRepository.decrementStock(productId, qty);
        if (decResult.changes === 0) {
          throw new Error(`Failed to deduct stock for ${product.name}.`);
        }
      }

      totalAmount += unitPrice * qty;
      totalCost += importPrice * qty;
      totalItemCount += qty;

      preparedItems.push({
        saleId,
        productId,
        variantId,
        productName,
        variantName,
        quantity: qty,
        unitPrice,
        importPrice,
      });
    }

    // 2. Insert into pos_sales
    db.prepare(`
      INSERT INTO pos_sales (id, total_amount, total_cost, item_count, payment_method, note, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'COMPLETED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(saleId, totalAmount, totalCost, totalItemCount, payment_method, note);

    // 3. Insert into pos_sale_items
    const insertItem = db.prepare(`
      INSERT INTO pos_sale_items (sale_id, product_id, variant_id, product_name, variant_name, quantity, unit_price, import_price)
      VALUES (@saleId, @productId, @variantId, @productName, @variantName, @quantity, @unitPrice, @importPrice)
    `);

    for (const pi of preparedItems) {
      insertItem.run(pi);
    }

    return {
      id: saleId,
      total_amount: totalAmount,
      total_cost: totalCost,
      item_count: totalItemCount,
      payment_method,
      note,
      status: 'COMPLETED',
      items: preparedItems,
      created_at: new Date().toISOString(),
    };
  });

  return tx();
}

/**
 * Undo / Restock a POS sale atomically.
 * Restores items to inventory and marks the sale RESTOCKED.
 */
function undoSale(id) {
  const sale = findById(id);
  if (!sale) {
    throw new Error('Sale record not found.');
  }
  if (sale.status === 'RESTOCKED') {
    throw new Error('This sale has already been restocked.');
  }

  const tx = db.transaction(() => {
    // Restore stock for all items
    for (const item of sale.items) {
      if (item.variant_id) {
        variantRepository.incrementStock(item.variant_id, item.quantity);
      } else {
        productRepository.incrementStock(item.product_id, item.quantity);
      }
    }

    // Update status to RESTOCKED
    db.prepare(`
      UPDATE pos_sales
      SET status = 'RESTOCKED', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(id);

    return { success: true, id, status: 'RESTOCKED' };
  });

  return tx();
}

module.exports = {
  createSale,
  findAll,
  findById,
  undoSale,
};
