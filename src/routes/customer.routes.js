const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { orderRateLimiter, catalogRateLimiter } = require('../middlewares/rateLimiter');

// Public catalog
router.get('/products', catalogRateLimiter, customerController.getCatalog);

// Verify signed PSID identity link
router.get('/identity', customerController.verifyIdentity);

// Place an order (protected by rate limiter)
router.post('/orders', orderRateLimiter, customerController.placeOrder);

module.exports = router;
