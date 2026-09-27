const app = require('./app');
const { PORT, NODE_ENV } = require('./config');
const db = require('./db');
const logger = require('./utils/logger');
const telegramService = require('./services/telegram.service');
const orderService = require('./services/order.service');

const server = app.listen(PORT, () => {
  logger.info(`✨ Luxe Jewelry server running on http://localhost:${PORT} [${NODE_ENV}]`);
});

// Run 7-day auto-delivery check on startup and periodically every 30 minutes
try {
  orderService.autoDeliverShippedOrders(7);
} catch (err) {
  logger.error('[Server] Initial auto-delivery check failed:', err.message);
}

const autoDeliverInterval = setInterval(() => {
  try {
    orderService.autoDeliverShippedOrders(7);
  } catch (err) {
    logger.error('[Server] Periodic auto-delivery check failed:', err.message);
  }
}, 30 * 60 * 1000);
autoDeliverInterval.unref();

/**
 * Graceful shutdown handler
 */
function shutdown(signal) {
  clearInterval(autoDeliverInterval);
  logger.info(`Received ${signal}. Initiating graceful shutdown...`);
  server.close(() => {
    logger.info('HTTP server closed.');
    try {
      telegramService.shutdown();
      db.close();
      logger.info('SQLite database connection closed.');
    } catch (err) {
      logger.error('Error closing database:', err);
    }
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forceful shutdown after timeout.');
    process.exit(1);
  }, 5000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = server;
