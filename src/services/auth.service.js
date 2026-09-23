const { APP_SECRET, ADMIN_PASSWORD } = require('../config');
const { createHmacSha256, timingSafeEqual } = require('../utils/crypto');

/**
 * Generate admin authorization token using HMAC-SHA256.
 * @returns {string} Hex token
 */
function generateAdminToken() {
  return createHmacSha256(APP_SECRET, `admin:${ADMIN_PASSWORD}`);
}

/**
 * Verify whether an admin token matches the expected HMAC-SHA256 token.
 * @param {string} token 
 * @returns {boolean}
 */
function verifyAdminToken(token) {
  if (!token) return false;
  const expectedToken = generateAdminToken();
  return timingSafeEqual(token, expectedToken);
}

/**
 * Check admin password directly.
 * @param {string} password 
 * @returns {boolean}
 */
function validatePassword(password) {
  if (!password) return false;
  return timingSafeEqual(password, ADMIN_PASSWORD);
}

module.exports = {
  generateAdminToken,
  verifyAdminToken,
  validatePassword,
};
