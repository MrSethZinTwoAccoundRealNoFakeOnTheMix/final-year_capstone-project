const productRepository = require('../repositories/product.repository');
const orderRepository = require('../repositories/order.repository');
const identityService = require('../services/identity.service');
const orderService = require('../services/order.service');
const messengerService = require('../services/messenger.service');
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

module.exports = {
  getCatalog,
  verifyIdentity,
  placeOrder,
};
