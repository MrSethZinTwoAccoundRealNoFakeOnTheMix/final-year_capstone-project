const { APP_SECRET, BASE_URL, NODE_ENV } = require('../config');
const { createHmacSha256, timingSafeEqual } = require('../utils/crypto');

/**
 * Generate a signed webview URL with HMAC-SHA256 signature for a PSID.
 * @param {string} psid - Meta Messenger Page-Scoped User ID
 * @param {string} [customBaseUrl] - Optional base URL override
 * @returns {string} Fully qualified signed URL
 */
function generateSignedUrl(psid, customBaseUrl) {
  const sig = createHmacSha256(APP_SECRET, psid);
  const base = (customBaseUrl || BASE_URL).replace(/\/+$/, '');
  return `${base}/webview?psid=${encodeURIComponent(psid)}&sig=${sig}`;
}

/**
 * Verify HMAC-SHA256 signature for a given PSID.
 * In development mode, allows 'demo-bypass' as valid signature.
 * @param {string} psid 
 * @param {string} sig 
 * @returns {{ ok: boolean, reason?: string }}
 */
function verifyToken(psid, sig) {
  if (!psid || !sig) {
    return { ok: false, reason: 'missing_params' };
  }

  // Developer bypass: active ONLY in non-production environments
  if (NODE_ENV !== 'production' && sig === 'demo-bypass') {
    return { ok: true };
  }

  const expectedSig = createHmacSha256(APP_SECRET, psid);
  const isValid = timingSafeEqual(sig, expectedSig);

  if (!isValid) {
    return { ok: false, reason: 'invalid_signature' };
  }

  return { ok: true };
}

module.exports = {
  generateSignedUrl,
  verifyToken,
};
