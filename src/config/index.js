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

module.exports = {
  APP_SECRET:              process.env.APP_SECRET,
  PAGE_TOKEN:              process.env.APP_SESSION_TOKEN,  // Meta Page Access Token
  BASE_URL:                process.env.BASE_URL,
  VERIFY_TOKEN:            process.env.VERIFY_TOKEN,
  ADMIN_PASSWORD:          process.env.ADMIN_PASSWORD,
  NODE_ENV:                process.env.NODE_ENV || 'development',
  PORT:                    parseInt(process.env.PORT || '3000', 10),
  TELEGRAM_BOT_TOKEN:      process.env.TELEGRAM_BOT_TOKEN || '',
  TELEGRAM_OWNER_CHAT_ID:  process.env.TELEGRAM_OWNER_CHAT_ID || '',
};
