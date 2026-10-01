const crypto = require('crypto');
const logger = require('../utils/logger');
const config = require('../config');

function normalizeAmount(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Bakong payment amount must be a positive number.');
  }
  return Number(amount.toFixed(2));
}

function buildLocalDemoPayment({ orderId, totalAmount, customerName = 'Customer' }) {
  const amount = normalizeAmount(totalAmount);
  const amountKHR = Math.round(amount * 4100);
  const safeName = String(customerName || 'Customer').replace(/\|/g, ' ').replace(/\s+/g, ' ').trim() || 'Customer';
  const merchantRef = String(orderId || 'JOMROUS').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 32) || 'JOMROUS';
  const qrPayload = `KHQR|JOMROUS|${safeName}|${amountKHR}|${merchantRef}`;

  return {
    enabled: false,
    demo: true,
    provider: 'BAKONG_DEMO',
    orderId,
    amount,
    amountKHR,
    merchantId: config.BAKONG_MERCHANT_ID || 'DEMO_MERCHANT',
    qrPayload,
    qrCode: qrPayload,
    status: 'PENDING',
    paymentStatus: 'PENDING',
    message: 'Demo QR generated locally. Replace with real Bakong API credentials to enable live payment verification.',
  };
}

async function createPaymentRequest({ orderId, totalAmount, customerName }) {
  const amount = normalizeAmount(totalAmount);
  const merchantEnabled = Boolean(config.BAKONG_ENABLED);
  const hasApiCredentials = Boolean(config.BAKONG_API_URL && config.BAKONG_API_TOKEN && config.BAKONG_MERCHANT_ID);

  if (!merchantEnabled || !hasApiCredentials) {
    logger.warn('[Bakong] Missing live merchant config; returning local demo QR payload.');
    return buildLocalDemoPayment({ orderId, totalAmount: amount, customerName });
  }

  const callbackUrl = config.BAKONG_CALLBACK_URL || `${config.BASE_URL.replace(/\/$/, '')}/api/bakong/webhook`;
  const requestBody = {
    merchantId: config.BAKONG_MERCHANT_ID,
    orderId,
    amount,
    currency: 'USD',
    description: `JOMROUS order ${orderId}`,
    customerName: customerName || 'Customer',
    callbackUrl,
  };

  const response = await fetch(`${config.BAKONG_API_URL.replace(/\/$/, '')}/payments/qr`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${config.BAKONG_API_TOKEN}`,
    },
    body: JSON.stringify(requestBody),
  });

  const responseText = await response.text();
  let payload = {};
  try {
    payload = responseText ? JSON.parse(responseText) : {};
  } catch (err) {
    logger.error('[Bakong] Received non-JSON response from provider:', responseText);
    throw new Error('Bakong provider returned an invalid response.');
  }

  if (!response.ok) {
    const message = payload.message || payload.error || `Bakong API returned ${response.status}`;
    throw new Error(message);
  }

  return {
    enabled: true,
    demo: false,
    provider: 'BAKONG',
    orderId,
    amount,
    merchantId: config.BAKONG_MERCHANT_ID,
    qrPayload: payload.qrPayload || payload.qr_code || payload.qrcode || payload.data?.qrPayload || payload.data?.qrCode || '',
    qrCode: payload.qrCode || payload.qr_code || payload.data?.qrCode || payload.data?.qrPayload || '',
    status: 'PENDING',
    paymentStatus: 'PENDING',
    message: payload.message || 'Bakong QR generated successfully.',
    raw: payload,
  };
}

function verifyWebhookSignature(rawBody, signature) {
  if (!config.BAKONG_WEBHOOK_SECRET) {
    return true;
  }

  const expected = crypto.createHmac('sha256', config.BAKONG_WEBHOOK_SECRET)
    .update(typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody || {}))
    .digest('hex');

  const provided = String(signature || '').replace(/^sha256=/i, '').trim();
  if (!provided) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(provided, 'hex'));
  } catch (err) {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
  }
}

module.exports = {
  createPaymentRequest,
  buildLocalDemoPayment,
  verifyWebhookSignature,
};
