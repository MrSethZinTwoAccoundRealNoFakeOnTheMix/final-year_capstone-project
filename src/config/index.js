require('dotenv').config();

const required = [
  'APP_SECRET',
  'APP_SESSION_TOKEN',
  'BASE_URL',
  'VERIFY_TOKEN',
  'ADMIN_PASSWORD',
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`[Config] Missing required environment variable: ${key}`);
  }
}

const ownerIds = [];
const ownerKeys = Object.keys(process.env).filter((key) =>
  /^TELEGRAM_OWNER_CHAT_ID(?:S|_?\d+)?$/i.test(key)
);

ownerKeys.sort((a, b) => {
  const getIndex = (k) => {
    const match = k.match(/(?:_|ID)(\d+)$/i);
    return match ? parseInt(match[1], 10) : 1;
  };
  return getIndex(a) - getIndex(b);
});

for (const key of ownerKeys) {
  const val = process.env[key];
  if (val) {
    const parts = val.split(/[,\s;]+/).map((s) => s.trim()).filter(Boolean);
    ownerIds.push(...parts);
  }
}
const TELEGRAM_OWNER_CHAT_IDS = [...new Set(ownerIds)];

module.exports = {
  APP_SECRET:              process.env.APP_SECRET,
  PAGE_TOKEN:              process.env.APP_SESSION_TOKEN,  // Meta Page Access Token
  BASE_URL:                process.env.BASE_URL,
  VERIFY_TOKEN:            process.env.VERIFY_TOKEN,
  ADMIN_PASSWORD:          process.env.ADMIN_PASSWORD,
  NODE_ENV:                process.env.NODE_ENV || 'development',
  PORT:                    parseInt(process.env.PORT || '3000', 10),
  TELEGRAM_BOT_TOKEN:      process.env.TELEGRAM_BOT_TOKEN || '',
  TELEGRAM_OWNER_CHAT_ID:  TELEGRAM_OWNER_CHAT_IDS[0] || '',
  TELEGRAM_OWNER_CHAT_IDS,
  MESSENGER_RATE_LIMIT_MS: parseInt(process.env.MESSENGER_RATE_LIMIT_MS || '800', 10),
  BAKONG_ENABLED:          process.env.BAKONG_ENABLED === 'true',
  BAKONG_API_URL:          process.env.BAKONG_API_URL || '',
  BAKONG_WEBHOOK_SECRET:   process.env.BAKONG_WEBHOOK_SECRET || '',
  BAKONG_CALLBACK_URL:      process.env.BAKONG_CALLBACK_URL || '',
  BAKONG_ACCOUNT_ID:     process.env.BAKONG_ACCOUNT_ID || '',
  BAKONG_MERCHANT_NAME:  process.env.BAKONG_MERCHANT_NAME || 'JOMROUS JEWELRY',
  BAKONG_MERCHANT_CITY:  process.env.BAKONG_MERCHANT_CITY || 'Phnom Penh',
  BAKONG_STORE_LABEL:    process.env.BAKONG_STORE_LABEL || 'Jomrous Jewelry',
  BAKONG_DEV_TOKEN:      process.env.BAKONG_DEV_TOKEN || '',
  BAKONG_MERCHANT_ID:    process.env.BAKONG_MERCHANT_ID || '',
  BAKONG_ACQUIRING_BANK: process.env.BAKONG_ACQUIRING_BANK || '',
};
