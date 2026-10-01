const productRepository = require('../repositories/product.repository');
const orderRepository = require('../repositories/order.repository');
const identityService = require('../services/identity.service');
const orderService = require('../services/order.service');
const messengerService = require('../services/messenger.service');
const bakongService = require('../services/bakong.service');
const logger = require('../utils/logger');

/**
 * Public catalog API - returns all products without import prices
 */
function getCatalog(req, res, next) {
  try {
    const products = productRepository.findAll();
    res.json(products);
  } catch (err) {
    next(err);
  }
}

/**
 * Identity verification API - checks signed webview token and resolves customer profile
 */
async function verifyIdentity(req, res, next) {
  try {
    const { psid, sig } = req.query;
    if (!psid) {
      return res.json({ verified: false, reason: 'missing params' });
    }

    const check = identityService.verifyToken(psid, sig);
    if (!check.ok) {
      return res.json({
        verified: false,
        psid: null,
        reason: check.reason || 'invalid_signature',
      });
    }

    let customerName = null;
    let phone = null;
    let address = null;

    // 1. Resolve actual customer name via Facebook Graph API
    try {
      const profile = await messengerService.getUserProfile(psid);
      if (profile && profile.name) {
        customerName = profile.name;
      }
    } catch (profileErr) {
      logger.warn(`[Identity] Could not resolve Graph profile for PSID ${psid}:`, profileErr.message || profileErr);
    }

    // 2. Query past order history for this PSID as a fallback for name and auto-fill for phone/address
    try {
      const pastOrder = orderRepository.findLatestByPsid(psid);
      if (pastOrder) {
        if (!customerName && pastOrder.customer_name) {
          customerName = pastOrder.customer_name;
        }
        if (pastOrder.phone) phone = pastOrder.phone;
        if (pastOrder.address) address = pastOrder.address;
      }
    } catch (dbErr) {
      logger.debug(`[Identity] Past order lookup failed for PSID ${psid}:`, dbErr.message || dbErr);
    }

    res.json({
      verified: true,
      psid,
      customerName: customerName || null,
      phone: phone || null,
      address: address || null,
      reason: check.reason || null,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Place Order API - validates cart and creates pending order
 */
async function placeOrder(req, res, next) {
  try {
    const result = await orderService.placeOrder(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function createBakongPayment(req, res, next) {
  try {
    const { orderId, totalAmount, customerName } = req.body || {};
    if (!orderId) {
      return res.status(400).json({ success: false, error: 'Missing orderId.' });
    }

    const order = orderRepository.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    if (order.payment_method !== 'KHQR') {
      return res.status(409).json({ success: false, error: 'Bakong payment is only available for KHQR orders.' });
    }

    const payment = await bakongService.createPaymentRequest({
      orderId,
      totalAmount: totalAmount || order.total_amount,
      customerName: customerName || order.customer_name,
    });

    res.json({ success: true, orderId, payment });
  } catch (err) {
    next(err);
  }
}

async function handleBakongWebhook(req, res, next) {
  try {
    const signature = req.headers['x-bakong-signature'] || req.headers['x-signature'] || req.headers['x-webhook-signature'];
    const rawBody = req.rawBody || JSON.stringify(req.body || {});

    if (!bakongService.verifyWebhookSignature(rawBody, signature)) {
      return res.status(401).json({ success: false, error: 'Unauthorized webhook signature.' });
    }

    const payload = req.body || {};
    const orderId = payload.orderId || payload.order_id || payload.reference || payload.data?.orderId || payload.data?.reference;
    const paymentState = String(payload.status || payload.state || payload.data?.status || 'PENDING').toUpperCase();

    if (!orderId) {
      return res.status(400).json({ success: false, error: 'Missing order reference in webhook payload.' });
    }

    const order = orderRepository.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found for webhook.' });
    }

    if (order.payment_method !== 'KHQR') {
      return res.status(409).json({ success: false, error: 'Bakong webhook cannot update a non-KHQR order.' });
    }

    const shouldConfirm = ['PAID', 'SUCCESS', 'CONFIRMED', 'COMPLETED'].includes(paymentState) || payload.success === true;

    if (shouldConfirm && order.status !== 'CONFIRMED') {
      const confirmed = orderService.confirmOrder(order.id);
      return res.json({ success: true, orderId: order.id, status: confirmed.status, message: 'Payment confirmed and order is now active.' });
    }

    res.json({ success: true, orderId: order.id, status: order.status, message: 'Payment is still pending verification.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCatalog,
  verifyIdentity,
  placeOrder,
  createBakongPayment,
  handleBakongWebhook,
};
