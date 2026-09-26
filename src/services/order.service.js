const orderRepository = require('../repositories/order.repository');
const productRepository = require('../repositories/product.repository');
const variantRepository = require('../repositories/variant.repository');
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

  // 3. Consolidate duplicate items in cart by productId + variantId
  const consolidatedMap = new Map();
  for (const item of items) {
    const pId = item.productId || item.id;
    if (!pId) continue;
    const vId = item.variantId || item.variant_id || null;
    const key = `${pId}__${vId || ''}`;
    const qty = parseInt(item.quantity, 10) || 1;
    const existing = consolidatedMap.get(key);
    if (existing) {
      existing.quantity += Math.max(1, qty);
    } else {
      consolidatedMap.set(key, { productId: pId, variantId: vId, quantity: Math.max(1, qty) });
    }
  }

  if (consolidatedMap.size === 0) {
    const error = new Error('Cart contains no valid products.');
    error.status = 400;
    throw error;
  }

  // 4. Calculate totalAmount and verify items in DB (Soft stock check)
  let totalAmount = 0;
  const orderItemsData = [];

  for (const { productId, variantId, quantity } of consolidatedMap.values()) {
    const product = productRepository.findById(productId);
    if (!product) {
      const error = new Error(`Product "${productId}" not found.`);
      error.status = 400;
      throw error;
    }

    let variant = null;
    if (variantId) {
      variant = variantRepository.findById(variantId);
      if (!variant || variant.product_id !== productId) {
        const error = new Error(`Style variant "${variantId}" not found for "${product.name}".`);
        error.status = 400;
        throw error;
      }
    }

    const availableStock = variant ? variant.stock : product.stock;
    const displayName = variant ? `${product.name} (${variant.color_name})` : product.name;

    if (availableStock < quantity) {
      const error = new Error(`Insufficient stock for "${displayName}". Only ${availableStock} available.`);
      error.status = 400;
      throw error;
    }

    const unitPrice = variant ? Number(variant.sell_price || product.sell_price) : Number(product.sell_price);
    const photoUrl = (variant && variant.photo_url) ? variant.photo_url : product.photo_url;
    const itemTotal = unitPrice * quantity;
    totalAmount += itemTotal;

    orderItemsData.push({
      productId: product.id,
      variantId: variant ? variant.id : null,
      variantName: variant ? variant.color_name : null,
      name: displayName,
      photo_url: photoUrl,
      quantity,
      unit_price: unitPrice,
    });
  }

  // 5. Generate Order ID: ORD- + 6 digits (or fallback timestamp if collision)
  const orderId = 'ORD-' + Date.now().toString().slice(-6);
  const VALID_METHODS = ['COD', 'KHQR', 'VET'];
  const rawMethod = (payment_method || 'COD').toUpperCase();
  const paymentMethod = VALID_METHODS.includes(rawMethod)
    ? rawMethod
    : (rawMethod === 'OTHER' ? 'COD' : 'COD');

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
 * Mark order as COMPLETED (Delivered successfully).
 * Note: Customer notification is intentionally skipped to avoid annoyance.
 * @param {string} orderId
 */
function completeOrder(orderId) {
  const updatedOrder = orderRepository.completeOrder(orderId);
  logger.info(`[OrderService] Order ${orderId} marked as COMPLETED.`);
  return updatedOrder;
}

/**
 * Update delivery type / payment method for an order (while PENDING or CONFIRMED).
 * @param {string} orderId
 * @param {string} deliveryType - 'COD' | 'KHQR' | 'VET'
 */
function updateDeliveryType(orderId, deliveryType) {
  const VALID_METHODS = ['COD', 'KHQR', 'VET'];
  const normalized = (deliveryType || '').toUpperCase();
  if (!VALID_METHODS.includes(normalized)) {
    const error = new Error(`Invalid delivery type '${deliveryType}'. Must be one of: COD, KHQR, VET.`);
    error.status = 400;
    throw error;
  }
  const updatedOrder = orderRepository.updateDeliveryType(orderId, normalized);
  logger.info(`[OrderService] Order ${orderId} delivery type updated to ${normalized}.`);
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
  completeOrder,
  updateDeliveryType,
  getAllOrders,
  getOrder,
};
