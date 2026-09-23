const productRepository = require('../repositories/product.repository');
const identityService = require('../services/identity.service');
const orderService = require('../services/order.service');

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
 * Identity verification API - checks signed webview token
 */
function verifyIdentity(req, res, next) {
  try {
    const { psid, sig } = req.query;
    if (!psid || !sig) {
      return res.json({ verified: false, reason: 'missing params' });
    }

    const check = identityService.verifyToken(psid, sig);
    res.json({
      verified: check.ok,
      psid: check.ok ? psid : null,
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
