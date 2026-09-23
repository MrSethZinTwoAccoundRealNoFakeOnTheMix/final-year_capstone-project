const { APP_SECRET } = require('../config');
const { createHmacSha256, timingSafeEqual } = require('../utils/crypto');
const logger = require('../utils/logger');

/**
 * Middleware to verify X-Hub-Signature-256 header sent by Meta Webhooks.
 */
function verifyWebhookSignature(req, res, next) {
  const signature = req.headers['x-hub-signature-256'];

  if (!signature) {
    logger.warn('[Webhook] Missing X-Hub-Signature-256 header');
    return res.status(403).json({ error: 'Missing X-Hub-Signature-256 header' });
  }

  const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body || {}));
  const expectedHash = createHmacSha256(APP_SECRET, rawBody);
  const expectedSignature = `sha256=${expectedHash}`;

  if (!timingSafeEqual(signature, expectedSignature)) {
    logger.warn('[Webhook] Signature mismatch');
    return res.status(403).json({ error: 'Invalid webhook signature' });
  }

  next();
}

module.exports = verifyWebhookSignature;
