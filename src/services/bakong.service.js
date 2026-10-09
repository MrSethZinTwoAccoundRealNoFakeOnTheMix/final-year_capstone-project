/**
 * Bakong KHQR Service
 * ------------------
 * Generates dynamic Individual / Merchant KHQR payloads using the official
 * `bakong-khqr` package, then converts them to Base64 PNG QR images via `qrcode`.
 *
 * REQUIRED ENV (fill these yourself):
 *   BAKONG_ACCOUNT_ID   e.g. "yourname@acleda" or "merchant@sathapana"
 *   BAKONG_MERCHANT_NAME e.g. "JOMROUS JEWELRY"
 *   BAKONG_MERCHANT_CITY e.g. "Phnom Penh"
 *   BAKONG_DEV_TOKEN    (optional – only needed for deep-link / payment status APIs)
 *
 * Defaults:
 *   Currency .......... USD
 *   QR expiry ......... 15 minutes
 */

'use strict';

const crypto = require('crypto');
const QRCode = require('qrcode');
const { BakongKHQR, khqrData, IndividualInfo, MerchantInfo } = require('bakong-khqr');
const logger = require('../utils/logger');
const config = require('../config');

// ─── Defaults (safe to keep) ────────────────────────────────────────────────
const DEFAULT_CURRENCY = 'USD';          // Preferred currency
const DEFAULT_EXPIRY_MINUTES = 15;       // QR expires after 15 minutes
const DEFAULT_MERCHANT_CITY = 'Phnom Penh';
const DEFAULT_STORE_LABEL = 'Jomrous Jewelry';

// ─── Helpers ────────────────────────────────────────────────────────────────

function normalizeAmount(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Bakong payment amount must be a positive number.');
  }
  // USD supports 2 decimal places; KHR is whole riel
  return Number(amount.toFixed(2));
}

function resolveCurrency(input) {
  const c = String(input || DEFAULT_CURRENCY).toUpperCase().trim();
  if (c === 'USD' || c === 'KHR') return c;
  throw new Error(`Invalid currency "${input}". Allowed values: USD, KHR.`);
}

function getCurrencyCode(currency) {
  // bakong-khqr exposes numeric ISO codes via khqrData.currency
  return currency === 'KHR' ? khqrData.currency.khr : khqrData.currency.usd;
}

/**
 * Build a valid Bakong Account ID.
 * You MUST set BAKONG_ACCOUNT_ID in .env (e.g. "yourname@acleda").
 */
function getBakongAccountId(override) {
  const id = (override || config.BAKONG_ACCOUNT_ID || '').trim();
  if (!id || !id.includes('@')) {
    throw new Error(
      'BAKONG_ACCOUNT_ID is missing or invalid. ' +
      'Set it in .env to your Bakong account (e.g. "yourname@acleda" or "merchant@sathapana").'
    );
  }
  return id;
}

function getMerchantName(override) {
  return (override || config.BAKONG_MERCHANT_NAME || 'JOMROUS JEWELRY').trim().slice(0, 25);
}

function getMerchantCity(override) {
  return (override || config.BAKONG_MERCHANT_CITY || DEFAULT_MERCHANT_CITY).trim().slice(0, 15);
}

/**
 * Convert a KHQR payload string into a Base64 data-URL PNG image.
 */
async function toQrImageBase64(qrString) {
  const dataUrl = await QRCode.toDataURL(qrString, {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    margin: 2,
    width: 280,
    color: { dark: '#000000', light: '#ffffff' },
  });
  return dataUrl; // "data:image/png;base64,...."
}

// ─── Core Generation ────────────────────────────────────────────────────────

/**
 * Generate a dynamic Individual KHQR (most common for boutique / personal accounts).
 *
 * @param {Object} opts
 * @param {string}  [opts.bakongAccountId]  - Override env BAKONG_ACCOUNT_ID
 * @param {string}  [opts.merchantName]
 * @param {number}  opts.amount             - Positive amount
 * @param {string}  [opts.currency="USD"]   - "USD" | "KHR"
 * @param {string}  opts.billNumber         - Unique invoice / order reference
 * @param {string}  [opts.storeLabel]
 * @param {number}  [opts.expiryMinutes=15] - Minutes until QR expires
 * @param {string}  [opts.merchantCity]
 * @param {string}  [opts.mobileNumber]
 * @returns {Promise<{success, qrString, md5, qrImage, amount, currency, expiresAt, billNumber}>}
 */
async function generateIndividualKhqr(opts = {}) {
  const amount = normalizeAmount(opts.amount);
  const currency = resolveCurrency(opts.currency);
  const billNumber = String(opts.billNumber || `INV-${Date.now()}`).slice(0, 25);
  const storeLabel = String(opts.storeLabel || config.BAKONG_STORE_LABEL || DEFAULT_STORE_LABEL).slice(0, 25);
  const expiryMinutes = Number(opts.expiryMinutes) > 0 ? Number(opts.expiryMinutes) : DEFAULT_EXPIRY_MINUTES;
  const expiresAt = Date.now() + expiryMinutes * 60 * 1000;

  const bakongAccountId = getBakongAccountId(opts.bakongAccountId);
  const merchantName = getMerchantName(opts.merchantName);
  const merchantCity = getMerchantCity(opts.merchantCity);

  const optionalData = {
    currency: getCurrencyCode(currency),
    amount,
    billNumber,
    storeLabel,
    expirationTimestamp: expiresAt,
    merchantCategoryCode: '5944', // Jewelry / watches / clocks (ISO 18245)
  };

  if (opts.mobileNumber) {
    optionalData.mobileNumber = String(opts.mobileNumber).replace(/\D/g, '').slice(0, 15);
  }

  // IndividualInfo(bakongAccountID, merchantName, merchantCity, optionalData)
  // NOTE: currency goes inside optionalData, NOT as a positional argument.
  // (Passing it positionally shifted every field and produced a QR that scans
  // but that banking apps refuse to pay.)
  const individualInfo = new IndividualInfo(
    bakongAccountId,
    merchantName,
    merchantCity,
    optionalData
  );

  const khqr = new BakongKHQR();
  const response = khqr.generateIndividual(individualInfo);

  if (!response || response.status?.code !== 0) {
    const msg = response?.status?.message || 'Failed to generate Individual KHQR.';
    logger.error('[Bakong] generateIndividual failed:', msg, response);
    throw new Error(msg);
  }

  const qrString = response.data?.qr || response.qr || '';
  const md5 = response.data?.md5 || response.md5 || crypto.createHash('md5').update(qrString).digest('hex');

  if (!qrString) {
    throw new Error('bakong-khqr returned an empty QR string.');
  }

  const qrImage = await toQrImageBase64(qrString);

  logger.info(`[Bakong] Generated Individual KHQR for ${billNumber} | ${amount} ${currency} | expires in ${expiryMinutes}m`);

  return {
    success: true,
    qrString,
    md5,
    qrImage,
    amount,
    currency,
    billNumber,
    storeLabel,
    merchantName,
    expiresAt: new Date(expiresAt).toISOString(),
    expiryMinutes,
    type: 'individual',
  };
}

/**
 * Generate a dynamic Merchant KHQR (requires merchantId + acquiringBank).
 * Use this only if you have a registered Bakong Merchant account.
 */
async function generateMerchantKhqr(opts = {}) {
  const amount = normalizeAmount(opts.amount);
  const currency = resolveCurrency(opts.currency);
  const billNumber = String(opts.billNumber || `INV-${Date.now()}`).slice(0, 25);
  const storeLabel = String(opts.storeLabel || config.BAKONG_STORE_LABEL || DEFAULT_STORE_LABEL).slice(0, 25);
  const expiryMinutes = Number(opts.expiryMinutes) > 0 ? Number(opts.expiryMinutes) : DEFAULT_EXPIRY_MINUTES;
  const expiresAt = Date.now() + expiryMinutes * 60 * 1000;

  const bakongAccountId = getBakongAccountId(opts.bakongAccountId);
  const merchantName = getMerchantName(opts.merchantName);
  const merchantCity = getMerchantCity(opts.merchantCity);
  const merchantId = opts.merchantId || config.BAKONG_MERCHANT_ID;
  const acquiringBank = opts.acquiringBank || config.BAKONG_ACQUIRING_BANK;

  if (!merchantId || !acquiringBank) {
    throw new Error(
      'Merchant KHQR requires merchantId and acquiringBank. ' +
      'Set BAKONG_MERCHANT_ID and BAKONG_ACQUIRING_BANK in .env, or pass them in the request body.'
    );
  }

  const optionalData = {
    currency: getCurrencyCode(currency),
    amount,
    billNumber,
    storeLabel,
    expirationTimestamp: expiresAt,
    merchantCategoryCode: '5944',
  };

  // MerchantInfo(bakongAccountID, merchantName, merchantCity, merchantId, acquiringBank, optionalData)
  const merchantInfo = new MerchantInfo(
    bakongAccountId,
    merchantName,
    merchantCity,
    merchantId,
    acquiringBank,
    optionalData
  );

  const khqr = new BakongKHQR();
  const response = khqr.generateMerchant(merchantInfo);

  if (!response || response.status?.code !== 0) {
    const msg = response?.status?.message || 'Failed to generate Merchant KHQR.';
    logger.error('[Bakong] generateMerchant failed:', msg, response);
    throw new Error(msg);
  }

  const qrString = response.data?.qr || response.qr || '';
  const md5 = response.data?.md5 || response.md5 || crypto.createHash('md5').update(qrString).digest('hex');

  if (!qrString) {
    throw new Error('bakong-khqr returned an empty QR string.');
  }

  const qrImage = await toQrImageBase64(qrString);

  logger.info(`[Bakong] Generated Merchant KHQR for ${billNumber} | ${amount} ${currency}`);

  return {
    success: true,
    qrString,
    md5,
    qrImage,
    amount,
    currency,
    billNumber,
    storeLabel,
    merchantName,
    expiresAt: new Date(expiresAt).toISOString(),
    expiryMinutes,
    type: 'merchant',
  };
}

/**
 * Demo KHQR when BAKONG_ACCOUNT_ID is not set.
 * Still returns a scannable Base64 QR image so the UI is never blank.
 */
async function generateDemoKhqr(opts = {}) {
  const amount = normalizeAmount(opts.amount);
  const currency = resolveCurrency(opts.currency || 'USD');
  const billNumber = String(opts.billNumber || `INV-${Date.now()}`).slice(0, 25);
  const amountKHR = Math.round(amount * 4100);
  const merchantName = getMerchantName(opts.merchantName);
  const qrPayload = `KHQR|${merchantName}|${amount}|${currency}|${billNumber}|${amountKHR}`;
  const md5 = crypto.createHash('md5').update(qrPayload).digest('hex');
  const qrImage = await toQrImageBase64(qrPayload);
  const expiryMinutes = Number(opts.expiryMinutes) > 0 ? Number(opts.expiryMinutes) : DEFAULT_EXPIRY_MINUTES;
  const expiresAt = Date.now() + expiryMinutes * 60 * 1000;

  logger.warn('[Bakong] BAKONG_ACCOUNT_ID not set — returning DEMO QR image. Set it in .env for live KHQR.');

  return {
    success: true,
    demo: true,
    qrString: qrPayload,
    md5,
    qrImage,
    amount,
    currency,
    billNumber,
    storeLabel: opts.storeLabel || DEFAULT_STORE_LABEL,
    merchantName,
    expiresAt: new Date(expiresAt).toISOString(),
    expiryMinutes,
    type: 'demo',
    message: 'Demo QR (set BAKONG_ACCOUNT_ID in .env for a real Bakong KHQR).',
  };
}

/**
 * High-level entry used by the payment route and by order.service.
 * Prefers Individual KHQR. Falls back to demo QR (with image) if credentials missing.
 */
async function generateKhqr(opts = {}) {
  // A demo QR is NOT a valid KHQR: it can be scanned but never paid.
  // Only allow it outside production so customers never get a dead QR.
  const allowDemo = config.NODE_ENV !== 'production';

  const accountId = (opts.bakongAccountId || config.BAKONG_ACCOUNT_ID || '').trim();
  if (!accountId || !accountId.includes('@')) {
    if (allowDemo) return generateDemoKhqr(opts);
    throw new Error('BAKONG_ACCOUNT_ID is missing or invalid. Set it in .env (e.g. "yourname@acleda").');
  }

  const hasMerchantCreds =
    (opts.merchantId || config.BAKONG_MERCHANT_ID) &&
    (opts.acquiringBank || config.BAKONG_ACQUIRING_BANK);

  try {
    if (opts.type === 'merchant' || (opts.type !== 'individual' && hasMerchantCreds)) {
      return await generateMerchantKhqr(opts);
    }
    return await generateIndividualKhqr(opts);
  } catch (err) {
    logger.error('[Bakong] Live KHQR generation failed:', err.message);
    if (allowDemo) {
      logger.warn('[Bakong] Falling back to DEMO QR (development only).');
      return generateDemoKhqr(opts);
    }
    throw err;
  }
}

// ─── Legacy compatibility (used by existing order.service) ──────────────────

/**
 * Called by order.service when a KHQR order is placed.
 * Returns a shape compatible with the old demo response so the rest of the
 * pipeline continues to work.
 */
async function createPaymentRequest({ orderId, totalAmount, customerName }) {
  try {
    const result = await generateKhqr({
      amount: totalAmount,
      currency: 'USD',
      billNumber: orderId,
      storeLabel: DEFAULT_STORE_LABEL,
      merchantName: getMerchantName(),
    });

    return {
      enabled: !result.demo,
      demo: !!result.demo,
      provider: result.demo ? 'BAKONG_DEMO' : 'BAKONG',
      orderId,
      amount: result.amount,
      amountKHR: Math.round(result.amount * 4100),
      qrPayload: result.qrString,
      qrCode: result.qrString,
      qrImage: result.qrImage,
      md5: result.md5,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      expiresAt: result.expiresAt,
      message: 'Bakong KHQR generated successfully.',
    };
  } catch (err) {
    // Graceful fallback so checkout never hard-crashes if credentials are missing
    logger.error('[Bakong] Live KHQR generation failed for order', orderId, ':', err.message);

    // Production: never hand the customer a QR that cannot be paid.
    if (config.NODE_ENV === 'production') {
      return {
        enabled: false,
        demo: false,
        provider: 'BAKONG',
        orderId,
        amount: Number(totalAmount),
        amountKHR: Math.round(Number(totalAmount) * 4100),
        qrPayload: '',
        qrCode: '',
        qrImage: null,
        md5: null,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        message: 'KHQR is temporarily unavailable. The shop owner will contact you to arrange payment.',
      };
    }

    const demo = await generateDemoKhqr({
      amount: totalAmount,
      currency: 'USD',
      billNumber: orderId,
      merchantName: customerName,
    });

    return {
      enabled: false,
      demo: true,
      provider: 'BAKONG_DEMO',
      orderId,
      amount: demo.amount,
      amountKHR: Math.round(demo.amount * 4100),
      qrPayload: demo.qrString,
      qrCode: demo.qrString,
      qrImage: demo.qrImage,
      md5: demo.md5,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      message:
        'Demo QR (Bakong credentials not configured). ' +
        'Set BAKONG_ACCOUNT_ID in .env to enable live KHQR. ' +
        err.message,
    };
  }
}

function verifyWebhookSignature(rawBody, signature) {
  if (!config.BAKONG_WEBHOOK_SECRET) return true;
  const expected = crypto
    .createHmac('sha256', config.BAKONG_WEBHOOK_SECRET)
    .update(typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody || {}))
    .digest('hex');
  const provided = String(signature || '').replace(/^sha256=/i, '').trim();
  if (!provided) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(provided, 'hex'));
  } catch {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
  }
}

module.exports = {
  generateKhqr,
  generateIndividualKhqr,
  generateMerchantKhqr,
  createPaymentRequest,
  verifyWebhookSignature,
  DEFAULT_CURRENCY,
  DEFAULT_EXPIRY_MINUTES,
};