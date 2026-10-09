'use strict';

const bakongService = require('../services/bakong.service');
const orderRepository = require('../repositories/order.repository');
const orderService = require('../services/order.service');
const logger = require('../utils/logger');

/**
 * POST /api/payments/generate-qr
 */
async function generateQr(req, res, next) {
  try {
    const {
      bakongAccountId,
      merchantName,
      amount,
      currency,
      billNumber,
      storeLabel,
      expiryMinutes,
      merchantCity,
      mobileNumber,
      type,
      merchantId,
      acquiringBank,
    } = req.body || {};

    if (amount == null || amount === '') {
      return res.status(400).json({ success: false, error: 'amount is required and must be a positive number.' });
    }
    if (!billNumber || !String(billNumber).trim()) {
      return res.status(400).json({
        success: false,
        error: 'billNumber is required (unique invoice / order reference).',
      });
    }

    const result = await bakongService.generateKhqr({
      bakongAccountId,
      merchantName,
      amount,
      currency: currency || 'USD',
      billNumber: String(billNumber).trim(),
      storeLabel,
      expiryMinutes: expiryMinutes || 15,
      merchantCity,
      mobileNumber,
      type,
      merchantId,
      acquiringBank,
    });

    return res.json(result);
  } catch (err) {
    logger.error('[Payments] generate-qr error:', err.message);
    if (
      err.message.includes('BAKONG_ACCOUNT_ID') ||
      err.message.includes('Invalid currency') ||
      err.message.includes('positive number') ||
      err.message.includes('Merchant KHQR requires')
    ) {
      return res.status(400).json({ success: false, error: err.message });
    }
    next(err);
  }
}

/**
 * POST /api/payments/check-status
 * Body: { md5, orderId? }
 */
async function checkStatus(req, res, next) {
  try {
    const { md5, orderId } = req.body || {};
    if (!md5 && !orderId) {
      return res.status(400).json({ success: false, error: 'md5 or orderId is required.' });
    }

    let order = null;
    if (orderId) {
      order = orderRepository.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found.' });
      }
    }

    if (!md5) {
      return res.json({
        success: true,
        paid: false,
        status: 'PENDING',
        orderStatus: order ? order.status : null,
        reason: 'No md5 provided. Automatic verification requires md5 from QR generation.',
      });
    }

    const check = await bakongService.checkPaymentByMd5(md5);

    if (check.paid && order && order.status === 'PENDING' && order.payment_method === 'KHQR') {
      try {
        const confirmed = orderService.confirmOrder(order.id);
        logger.info(`[Payments] Auto-confirmed order ${order.id} after Bakong payment verified.`);
        return res.json({
          success: true,
          paid: true,
          status: 'PAID',
          orderStatus: confirmed.status,
          orderId: order.id,
          autoConfirmed: true,
          message: 'Payment verified. Order confirmed and stock decremented.',
        });
      } catch (confirmErr) {
        logger.error(`[Payments] Auto-confirm failed for ${order.id}:`, confirmErr.message);
        return res.json({
          success: true,
          paid: true,
          status: 'PAID',
          orderStatus: order.status,
          orderId: order.id,
          autoConfirmed: false,
          reason: confirmErr.message,
          message: 'Payment detected but auto-confirm failed. Owner should confirm in Admin.',
        });
      }
    }

    return res.json({
      success: true,
      paid: !!check.paid,
      status: check.status,
      orderStatus: order ? order.status : null,
      orderId: order ? order.id : null,
      reason: check.reason || null,
      data: check.data || null,
    });
  } catch (err) {
    logger.error('[Payments] check-status error:', err.message);
    next(err);
  }
}

/**
 * GET /api/payments/order/:orderId
 */
async function getOrderPayment(req, res, next) {
  try {
    const { orderId } = req.params;
    const order = orderRepository.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    let payment = null;
    if (order.payment_method === 'KHQR' && order.status === 'PENDING') {
      try {
        payment = await bakongService.createPaymentRequest({
          orderId: order.id,
          totalAmount: order.total_amount,
          customerName: order.customer_name,
        });
      } catch (e) {
        logger.warn('[Payments] Re-generate QR failed:', e.message);
      }
    }

    return res.json({
      success: true,
      orderId: order.id,
      status: order.status,
      paymentMethod: order.payment_method,
      total: order.total_amount,
      customerName: order.customer_name,
      payment,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/payments/customer-paid
 * Customer tapped "I've paid" → notify owner on Telegram
 */
async function customerPaidNotify(req, res, next) {
  try {
    const { orderId } = req.body || {};
    if (!orderId) {
      return res.status(400).json({ success: false, error: 'orderId is required.' });
    }

    const order = orderRepository.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    logger.info(`[Payments] Customer marked paid for order ${orderId}`);

    try {
      const telegramService = require('../services/telegram.service');
      if (typeof telegramService.notifyCustomerPaidClaim === 'function') {
        await telegramService.notifyCustomerPaidClaim(order);
      }
    } catch (tgErr) {
      logger.warn('[Payments] Telegram paid-claim notify failed:', tgErr.message);
    }

    return res.json({
      success: true,
      message:
        'Thank you! The shop owner has been notified to verify your payment in Bakong. You will receive a Messenger update once confirmed.',
      orderId: order.id,
      status: order.status,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  generateQr,
  checkStatus,
  getOrderPayment,
  customerPaidNotify,
};