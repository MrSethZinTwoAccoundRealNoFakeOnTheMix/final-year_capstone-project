const app = require('./app');
const { PORT, NODE_ENV } = require('./config');
const db = require('./db');
const logger = require('./utils/logger');

const server = app.listen(PORT, () => {
  logger.info(`✨ Luxe Jewelry server running on http://localhost:${PORT} [${NODE_ENV}]`);
});

/**
 * Graceful shutdown handler
 */
function shutdown(signal) {
  logger.info(`Received ${signal}. Initiating graceful shutdown...`);
  server.close(() => {
    logger.info('HTTP server closed.');
    try {
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
