const crypto = require('crypto');

/**
 * Generate HMAC-SHA256 hex digest for data using secret.
 * @param {string} secret 
 * @param {string|Buffer} data 
 * @returns {string} hex digest
 */
function createHmacSha256(secret, data) {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Constant-time comparison between two strings or buffers.
 * Safely returns false if lengths mismatch instead of throwing.
 * @param {string|Buffer} a 
 * @param {string|Buffer} b 
 * @returns {boolean}
 */
function timingSafeEqual(a, b) {
  if (!a || !b) return false;
  const bufA = Buffer.isBuffer(a) ? a : Buffer.from(String(a));
  const bufB = Buffer.isBuffer(b) ? b : Buffer.from(String(b));

  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

module.exports = {
  createHmacSha256,
  timingSafeEqual,
};
