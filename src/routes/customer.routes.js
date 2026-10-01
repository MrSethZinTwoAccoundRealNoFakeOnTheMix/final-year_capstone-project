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

// Create a Bakong payment request for the current cart total
router.post('/bakong/create-payment', orderRateLimiter, customerController.createBakongPayment);

// Webhook used by the payment provider to confirm successful payment
router.post('/bakong/webhook', customerController.handleBakongWebhook);

module.exports = router;
