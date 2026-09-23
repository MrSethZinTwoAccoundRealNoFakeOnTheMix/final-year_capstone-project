const {
  RATE_LIMIT_ORDERS_PER_HOUR,
  RATE_LIMIT_CATALOG_PER_MIN,
} = require('../config/constants');
const logger = require('../utils/logger');

// In-memory sliding window store: key -> Array of timestamp numbers
const rateLimitMap = new Map();

/**
 * Clean up entries older than 2 hours periodically
 */
setInterval(() => {
  const now = Date.now();
  const maxWindow = 2 * 60 * 60 * 1000;
  for (const [key, timestamps] of rateLimitMap.entries()) {
    const valid = timestamps.filter((t) => now - t < maxWindow);
    if (valid.length === 0) {
      rateLimitMap.delete(key);
    } else {
      rateLimitMap.set(key, valid);
    }
  }
}, 10 * 60 * 1000).unref(); // unref so it won't hold the event loop open on process exit

/**
 * Generic sliding window rate limiter generator
 */
function createRateLimiter({ windowMs, maxRequests, getKey, errorMessage }) {
  return (req, res, next) => {
    const now = Date.now();
    const key = getKey(req);

    if (!key) return next();

    const timestamps = rateLimitMap.get(key) || [];
    const recent = timestamps.filter((t) => now - t < windowMs);

    if (recent.length >= maxRequests) {
      logger.warn(`[RateLimiter] Rate limit exceeded for key: ${key}`);
      return res.status(429).json({ error: errorMessage });
    }

    recent.push(now);
    rateLimitMap.set(key, recent);
    next();
  };
}

/**
 * Rate limiter for placing orders: max 5 per hour per PSID (or IP fallback)
 */
const orderRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: RATE_LIMIT_ORDERS_PER_HOUR || 5,
  getKey: (req) => {
    const psid = req.body && req.body.psid;
    return psid ? `order:psid:${psid}` : `order:ip:${req.ip}`;
  },
  errorMessage: 'Too many orders placed. Please try again later.',
});

/**
 * Rate limiter for catalog browsing: max 20 per minute per IP
 */
const catalogRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: RATE_LIMIT_CATALOG_PER_MIN || 20,
  getKey: (req) => `catalog:ip:${req.ip}`,
  errorMessage: 'Too many requests. Please slow down.',
});

module.exports = {
  orderRateLimiter,
  catalogRateLimiter,
};
