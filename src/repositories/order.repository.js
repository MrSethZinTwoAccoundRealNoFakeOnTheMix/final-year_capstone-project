/**
 * Order Repository
 * All SQL queries for orders and order_items tables.
 * Contains the full order lifecycle as atomic SQLite transactions.
 *
 * State Machine:
 *   PENDING → CONFIRMED  (stock decremented here)
 *   CONFIRMED → SHIPPED  (no stock change)
 *   CONFIRMED → CANCELLED (stock restored — was decremented)
 *   PENDING → CANCELLED  (no stock change — was never decremented)
 *   SHIPPED → RETURNED   (stock restored)
 */

const db = require('../db');

// Ensure variant_id column exists in order_items (safe auto-migration fallback)
try {
  db.exec('ALTER TABLE order_items ADD COLUMN variant_id TEXT DEFAULT NULL');
} catch (e) {
  // Column already exists, safe to ignore
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Fetch order items with product details joined.
 * Used internally to attach items to order objects.
 */
function getItemsForOrder(orderId) {
  return db.prepare(`
    SELECT
      oi.id, oi.order_id, oi.product_id, oi.variant_id, oi.quantity, oi.unit_price,
      oi.unit_price AS price_at_order,
      COALESCE(p.name, parent_p.name, 'Item ' || oi.product_id) AS name,
      COALESCE(p.name, parent_p.name, 'Item ' || oi.product_id) AS product_name,
      COALESCE(pv.color_name, pv_fallback.color_name, '') AS variant_name,
      COALESCE(pv.color_name, pv_fallback.color_name, '') AS variants,
      COALESCE(pv.photo_url, p.photo_url, pv_fallback.photo_url, parent_p.photo_url, '') AS photo_url,
      COALESCE(p.category, parent_p.category, 'General') AS category
    FROM order_items oi
    LEFT JOIN products p ON oi.product_id = p.id
    LEFT JOIN product_variants pv ON oi.variant_id = pv.id
    LEFT JOIN product_variants pv_fallback ON oi.product_id = pv_fallback.id
    LEFT JOIN products parent_p ON pv_fallback.product_id = parent_p.id
    WHERE oi.order_id = ?
  `).all(orderId);
}

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Get all orders with their items (admin order queue).
 */
function findAll() {
  const orders = db.prepare(`
    SELECT * FROM orders ORDER BY created_at DESC
  `).all();

  for (const order of orders) {
    order.items = getItemsForOrder(order.id);
  }
  return orders;
}

/**
 * Get a single order by ID with items attached.
 * Returns null if not found.
 */
function findById(id) {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!order) return null;
  order.items = getItemsForOrder(id);
  return order;
}

/**
 * Find the most recent order for a PSID to retrieve past customer contact details.
 * @param {string} psid
 * @returns {Object|null}
 */
function findLatestByPsid(psid) {
  if (!psid) return null;
  return db.prepare(`
    SELECT id, psid, customer_name, phone, address
    FROM orders
    WHERE psid = ? AND customer_name IS NOT NULL AND customer_name != ''
    ORDER BY created_at DESC
    LIMIT 1
  `).get(psid) || null;
}

// ─── Write ────────────────────────────────────────────────────────────────────

/**
 * Create a new PENDING order in an atomic transaction.
 * Does NOT touch stock — stock is only decremented at CONFIRM.
 *
 * @param {Object} params
 * @param {string} params.orderId
 * @param {string} params.psid
 * @param {number} params.totalAmount
 * @param {string} params.customerName
 * @param {string} params.phone
 * @param {string} params.address
 * @param {string} params.note
 * @param {string} [params.paymentMethod] — 'COD' | 'KHQR' | 'VET'
 * @param {Array}  params.items — [{ productId, quantity, unit_price }]
 */
function create({ orderId, psid, totalAmount, customerName, phone, address, note, paymentMethod = 'COD', items }) {
  const insertOrder = db.prepare(`
    INSERT INTO orders (id, psid, status, total_amount, customer_name, phone, address, note, payment_method)
    VALUES (?, ?, 'PENDING', ?, ?, ?, ?, ?, ?)
  `);
  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, variant_id, quantity, unit_price)
    VALUES (?, ?, ?, ?, ?)
  `);

  const run = db.transaction(() => {
    insertOrder.run(orderId, psid, totalAmount, customerName || '', phone || '', address || '', note || '', paymentMethod || 'COD');
    for (const item of items) {
      insertItem.run(orderId, item.productId, item.variantId || null, item.quantity, item.unit_price);
    }
  });

  run();
  return findById(orderId);
}

// ─── State Transitions ────────────────────────────────────────────────────────

/**
 * CONFIRM: PENDING → CONFIRMED
 * Atomically decrements stock for every item (either variant or parent product).
 * If any item has insufficient stock, the ENTIRE transaction rolls back.
 * Throws descriptive Error on any failure (caller catches and returns 409).
 */
function confirmOrder(id) {
  const order = findById(id);
  if (!order) throw new Error('Order not found.');
  if (order.status === 'CONFIRMED') {
    return order;
  }
  if (order.status !== 'PENDING') {
    throw new Error(`Cannot confirm order with status '${order.status}'.`);
  }

  const decrementStock = db.prepare(`
    UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?
  `);
  const decrementVariant = db.prepare(`
    UPDATE product_variants SET stock = stock - ? WHERE id = ? AND stock >= ?
  `);
  const syncParent = db.prepare(`
    UPDATE products
    SET stock = (
      SELECT COALESCE(SUM(stock), 0)
      FROM product_variants
      WHERE product_id = ? AND is_active = 1
    )
    WHERE id = ?
  `);
  const setStatus = db.prepare(`UPDATE orders SET status = 'CONFIRMED' WHERE id = ?`);

  db.transaction(() => {
    for (const item of order.items) {
      if (item.variant_id) {
        const vResult = decrementVariant.run(item.quantity, item.variant_id, item.quantity);
        if (vResult.changes === 0) {
          throw new Error(`Insufficient stock for "${item.name}" (${item.variant_name || item.variant_id}). Cannot confirm.`);
        }
        syncParent.run(item.product_id, item.product_id);
      } else {
        const result = decrementStock.run(item.quantity, item.product_id, item.quantity);
        if (result.changes === 0) {
          throw new Error(`Insufficient stock for "${item.name}" (${item.product_id}). Cannot confirm.`);
        }
      }
    }
    setStatus.run(id);
  })();

  return findById(id);
}

/**
 * CANCEL: PENDING → CANCELLED  (no stock change)
 *         CONFIRMED → CANCELLED (stock restored)
 * Cannot cancel SHIPPED or RETURNED orders.
 */
function cancelOrder(id) {
  const order = findById(id);
  if (!order) throw new Error('Order not found.');
  if (order.status === 'CANCELLED') {
    return order;
  }
  if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
    throw new Error(`Cannot cancel order with status '${order.status}'. Only PENDING or CONFIRMED orders can be cancelled.`);
  }

  const wasConfirmed = order.status === 'CONFIRMED';
  const restoreStock = db.prepare(`UPDATE products SET stock = stock + ? WHERE id = ?`);
  const restoreVariant = db.prepare(`UPDATE product_variants SET stock = stock + ? WHERE id = ?`);
  const syncParent = db.prepare(`
    UPDATE products
    SET stock = (
      SELECT COALESCE(SUM(stock), 0)
      FROM product_variants
      WHERE product_id = ? AND is_active = 1
    )
    WHERE id = ?
  `);
  const setStatus = db.prepare(`UPDATE orders SET status = 'CANCELLED' WHERE id = ?`);

  db.transaction(() => {
    if (wasConfirmed) {
      // Restore stock that was decremented at confirmation
      for (const item of order.items) {
        if (item.variant_id) {
          restoreVariant.run(item.quantity, item.variant_id);
          syncParent.run(item.product_id, item.product_id);
        } else {
          restoreStock.run(item.quantity, item.product_id);
        }
      }
    }
    setStatus.run(id);
  })();

  return findById(id);
}

/**
 * SHIP: CONFIRMED → SHIPPED
 * No stock change (already decremented at CONFIRM).
 * The order receipt / Messenger notification is triggered by the service layer.
 */
function shipOrder(id) {
  const order = findById(id);
  if (!order) throw new Error('Order not found.');
  if (order.status === 'SHIPPED') {
    return order;
  }
  if (order.status !== 'CONFIRMED') {
    throw new Error(`Cannot ship order with status '${order.status}'. Only CONFIRMED orders can be shipped.`);
  }

  db.prepare(`UPDATE orders SET status = 'SHIPPED' WHERE id = ?`).run(id);
  return findById(id);
}

/**
 * RETURN: SHIPPED → RETURNED
 * Owner clicks "Mark as Returned" after delivery driver brings package back.
 * Restores stock for all items in the order.
 */
function returnOrder(id) {
  const order = findById(id);
  if (!order) throw new Error('Order not found.');
  if (order.status === 'RETURNED') {
    return order;
  }
  if (order.status !== 'SHIPPED') {
    throw new Error(`Cannot return order with status '${order.status}'. Only SHIPPED orders can be returned.`);
  }

  const restoreStock = db.prepare(`UPDATE products SET stock = stock + ? WHERE id = ?`);
  const setStatus    = db.prepare(`UPDATE orders SET status = 'RETURNED' WHERE id = ?`);

  db.transaction(() => {
    for (const item of order.items) {
      restoreStock.run(item.quantity, item.product_id);
    }
    setStatus.run(id);
  })();

  return findById(id);
}

/**
 * COMPLETE: SHIPPED → COMPLETED
 * Terminal state for successful delivery confirmed by owner.
 * No stock change (stock was decremented at CONFIRM).
 */
function completeOrder(id) {
  const order = findById(id);
  if (!order) throw new Error('Order not found.');
  if (order.status === 'COMPLETED') {
    return order;
  }
  if (order.status !== 'SHIPPED') {
    throw new Error(`Cannot complete order with status '${order.status}'. Only SHIPPED orders can be completed.`);
  }

  db.prepare(`UPDATE orders SET status = 'COMPLETED' WHERE id = ?`).run(id);
  return findById(id);
}

/**
 * Update delivery type / payment method for an order.
 * Can only be changed while PENDING or CONFIRMED (before shipping).
 */
function updateDeliveryType(id, deliveryType) {
  const order = findById(id);
  if (!order) throw new Error('Order not found.');
  if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
    throw new Error(`Cannot update delivery type for order with status '${order.status}'. Only PENDING or CONFIRMED orders can be updated.`);
  }

  db.prepare(`UPDATE orders SET payment_method = ? WHERE id = ?`).run(deliveryType, id);
  return findById(id);
}

module.exports = {
  findAll,
  findById,
  create,
  confirmOrder,
  cancelOrder,
  shipOrder,
  returnOrder,
  completeOrder,
  updateDeliveryType,
  findLatestByPsid,
};
