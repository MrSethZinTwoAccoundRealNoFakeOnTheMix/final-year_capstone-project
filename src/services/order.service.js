const orderRepository = require('../repositories/order.repository');
const productRepository = require('../repositories/product.repository');
const identityService = require('./identity.service');
const messengerService = require('./messenger.service');
const telegramService = require('./telegram.service');
const logger = require('../utils/logger');

/**
 * Place a new order from customer webview.
 * Performs identity check, cart consolidation, price verification, soft stock check.
 * Stock is NOT decremented here — only at CONFIRMED status.
 */
async function placeOrder({ psid, sig, items, customer_name, phone, address, note, payment_method }) {
  // 1. Mandatory Identity Check
  const idCheck = identityService.verifyToken(psid, sig);
  if (!idCheck.ok) {
    const error = new Error('Checkout requires a verified Messenger identity link.');
    error.status = 403;
    throw error;
  }

  // 2. Validate items array
  if (!items || !Array.isArray(items) || items.length === 0) {
    const error = new Error('Cart cannot be empty.');
    error.status = 400;
    throw error;
  }

  // 3. Consolidate duplicate productIds in cart
  const consolidatedMap = new Map();
  for (const item of items) {
    const pId = item.productId || item.id;
    if (!pId) continue;
    const qty = parseInt(item.quantity, 10) || 1;
    const prev = consolidatedMap.get(pId) || 0;
    consolidatedMap.set(pId, prev + Math.max(1, qty));
  }

  if (consolidatedMap.size === 0) {
    const error = new Error('Cart contains no valid products.');
    error.status = 400;
    throw error;
  }

  // 4. Calculate totalAmount and verify items in DB (Soft stock check)
  let totalAmount = 0;
  const orderItemsData = [];

  for (const [productId, quantity] of consolidatedMap.entries()) {
    const product = productRepository.findById(productId);
    if (!product) {
      const error = new Error(`Product "${productId}" not found.`);
      error.status = 400;
      throw error;
    }

    if (product.stock < quantity) {
      const error = new Error(`Insufficient stock for "${product.name}". Only ${product.stock} available.`);
      error.status = 400;
      throw error;
    }

    const unitPrice = Number(product.sell_price);
    const itemTotal = unitPrice * quantity;
    totalAmount += itemTotal;

    orderItemsData.push({
      productId: product.id,
      name: product.name,
      photo_url: product.photo_url,
      quantity,
      unit_price: unitPrice,
    });
  }

  // 5. Generate Order ID: ORD- + 6 digits (or fallback timestamp if collision)
  const orderId = 'ORD-' + Date.now().toString().slice(-6);
  const paymentMethod = (payment_method || 'KHQR').toUpperCase() === 'OTHER' ? 'OTHER' : 'KHQR';

  // 6. Persist order in PENDING status
  const order = orderRepository.create({
    orderId,
    psid,
    totalAmount,
    customerName: customer_name,
    phone,
    address,
    note,
    paymentMethod,
    items: orderItemsData,
  });

  logger.info(`[OrderService] Order ${orderId} created in PENDING status (${paymentMethod}). Total: $${totalAmount}`);

  // 7. Fire-and-forget: Send Messenger Receipt Carousel
  messengerService.sendOrderReceipt(psid, order, orderItemsData).catch((err) => {
    logger.error(`[OrderService] Failed sending receipt for ${orderId}:`, err);
  });

  // 8. Fire-and-forget: Telegram new-order alert to owner (with inline confirm/cancel)
  telegramService.notifyNewOrder(order, orderItemsData).catch((err) => {
    logger.error(`[OrderService] Failed sending Telegram alert for ${orderId}:`, err);
  });

  return {
    success: true,
    orderId,
    total: totalAmount,
    status: 'PENDING',
  };
}

/**
 * Confirm order payment and decrement stock atomically.
 * @param {string} orderId 
 */
function confirmOrder(orderId) {
  const updatedOrder = orderRepository.confirmOrder(orderId);
  logger.info(`[OrderService] Order ${orderId} confirmed and stock decremented.`);
  // No separate Telegram notification — owner triggered this themselves
  return updatedOrder;
}

/**
 * Cancel order. If previously CONFIRMED, restores stock.
 * @param {string} orderId 
 */
function cancelOrder(orderId) {
  const updatedOrder = orderRepository.cancelOrder(orderId);
  logger.info(`[OrderService] Order ${orderId} cancelled.`);
  // Notify owner on Telegram (in case cancel came from admin panel, not inline button)
  telegramService.notifyCancelled(orderId).catch(() => {});
  return updatedOrder;
}

/**
 * Mark order as SHIPPED and trigger customer notification.
 * @param {string} orderId 
 */
function shipOrder(orderId) {
  const updatedOrder = orderRepository.shipOrder(orderId);
  logger.info(`[OrderService] Order ${orderId} marked as SHIPPED.`);

  // Fire-and-forget: Messenger shipping notification to customer
  if (updatedOrder.psid) {
    messengerService.sendShippingNotification(updatedOrder.psid, orderId).catch((err) => {
      logger.error(`[OrderService] Failed sending shipping notification for ${orderId}:`, err);
    });
  }

  // Fire-and-forget: Telegram confirmation to owner
  telegramService.notifyShipped(orderId).catch(() => {});

  return updatedOrder;
}

/**
 * Mark a failed delivery as RETURNED and restore stock.
 * @param {string} orderId 
 */
function returnOrder(orderId) {
  const updatedOrder = orderRepository.returnOrder(orderId);
  logger.info(`[OrderService] Order ${orderId} marked as RETURNED; stock restored.`);
  telegramService.notifyReturned(orderId).catch(() => {});
  return updatedOrder;
}

/**
 * Get all orders for admin review.
 */
function getAllOrders() {
  return orderRepository.findAll();
}

/**
 * Get single order by ID.
 * @param {string} orderId 
 */
function getOrder(orderId) {
  return orderRepository.findById(orderId);
}

module.exports = {
  placeOrder,
  confirmOrder,
  cancelOrder,
  shipOrder,
  returnOrder,
  getAllOrders,
  getOrder,
};
