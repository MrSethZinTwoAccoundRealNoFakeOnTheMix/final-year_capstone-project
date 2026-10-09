/**
 * Payments Routes
 * ---------------
 * POST /api/payments/generate-qr  → generate Bakong KHQR + Base64 image
 */

'use strict';

const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/payments.controller');
const { orderRateLimiter } = require('../middlewares/rateLimiter');

router.post('/generate-qr', orderRateLimiter, paymentsController.generateQr);
router.post('/check-status', orderRateLimiter, paymentsController.checkStatus);
router.get('/order/:orderId', paymentsController.getOrderPayment);
router.post('/customer-paid', orderRateLimiter, paymentsController.customerPaidNotify);

module.exports = router;