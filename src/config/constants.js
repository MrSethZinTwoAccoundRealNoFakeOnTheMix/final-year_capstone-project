module.exports = {
  // --- Order State Machine ---
  ORDER_STATUSES: ['PENDING', 'CONFIRMED', 'SHIPPED', 'CANCELLED', 'RETURNED'],

  // Stock decrement happens at: PENDING → CONFIRMED
  // Stock increment happens at: CONFIRMED → CANCELLED  or  SHIPPED → RETURNED

  // --- Currency ---
  EXCHANGE_RATE_KHR: 4100,   // 1 USD = 4,100 KHR (fixed)

  // --- Messenger ---
  // Cooldown before resending shop link to same PSID (prevents spam)
  // SHOP_LINK_COOLDOWN_MS: 6 * 60 * 60 * 1000, // 6 hours
  SHOP_LINK_COOLDOWN_MS: 60 * 1000,
  // --- Product SKU Prefixes ---
  SKU_PREFIXES: {
    Ring: 'RG',
    Necklace: 'NK',
    Bracelet: 'BR',
    Earring: 'ER',
  },

  // --- Image Optimization (Sharp) ---
  IMAGE_MAX_WIDTH: 800,   // px
  IMAGE_QUALITY: 80,    // WebP quality %

  // --- Rate Limiting ---
  RATE_LIMIT_ORDERS_PER_HOUR: 5,   // max order submissions per PSID per hour
  RATE_LIMIT_CATALOG_PER_MIN: 20,  // max catalog requests per IP per minute
};
