'use strict';

/**
 * telegram.service.js
 * -------------------
 * Sends real-time Telegram notifications to the shop owner for:
 *   - New incoming orders (with [✅ Confirm] [❌ Cancel] inline keyboard)
 *   - Shipping confirmations
 *   - Order cancellations (from admin panel — info only)
 *
 * Uses long-polling mode (no public URL needed for local dev).
 * Gracefully no-ops if TELEGRAM_BOT_TOKEN or TELEGRAM_OWNER_CHAT_ID are missing.
 *
 * IMPORTANT: All public functions are fire-and-forget (return void, never throw).
 * Errors are logged but never propagate to the caller.
 */

const TelegramBot = require('node-telegram-bot-api');
const { TELEGRAM_BOT_TOKEN, TELEGRAM_OWNER_CHAT_ID } = require('../config');
const logger = require('../utils/logger');

// ─── Initialise Bot ──────────────────────────────────────────────────────────

let bot = null;

if (!TELEGRAM_BOT_TOKEN) {
  logger.warn('[Telegram] TELEGRAM_BOT_TOKEN not set — Telegram notifications disabled.');
} else if (!TELEGRAM_OWNER_CHAT_ID) {
  logger.warn('[Telegram] TELEGRAM_OWNER_CHAT_ID not set — Telegram notifications disabled.');
} else {
  try {
    // Long-polling mode: works without any public URL / tunnel
    bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

    // ── Inline-keyboard callback handler ─────────────────────────────────────
    // Triggered when the owner taps [✅ Confirm] or [❌ Cancel] inside Telegram.
    // Delegates to the order service (lazy-required to avoid circular imports).
    bot.on('callback_query', async (query) => {
      const chatId = query.message.chat.id.toString();
      const data   = query.data || '';

      // Security: only process callbacks from the owner's chat
      if (chatId !== TELEGRAM_OWNER_CHAT_ID) {
        await bot.answerCallbackQuery(query.id, { text: '⛔ Unauthorized.' }).catch(() => {});
        return;
      }

      const [action, orderId] = data.split(':'); // e.g. "confirm:ORD-123456"

      if (!orderId) {
        await bot.answerCallbackQuery(query.id, { text: '⚠️ Unknown action.' }).catch(() => {});
        return;
      }

      // Lazy-require to break circular dependency (telegram ↔ order)
      const orderService = require('./order.service');

      try {
        if (action === 'tg_confirm') {
          orderService.confirmOrder(orderId);
          await bot.answerCallbackQuery(query.id, { text: '✅ Order confirmed & stock decremented!' });
          // Edit the original message so the buttons disappear
          await bot.editMessageText(
            `✅ *Order ${orderId} CONFIRMED*\nStock decremented. Pack the items! 📦`,
            {
              chat_id: query.message.chat.id,
              message_id: query.message.message_id,
              parse_mode: 'Markdown',
            }
          ).catch(() => {}); // may fail if message is too old — that's fine

        } else if (action === 'tg_cancel') {
          orderService.cancelOrder(orderId);
          await bot.answerCallbackQuery(query.id, { text: '❌ Order cancelled.' });
          await bot.editMessageText(
            `❌ *Order ${orderId} CANCELLED*\nStock restored (if it was confirmed).`,
            {
              chat_id: query.message.chat.id,
              message_id: query.message.message_id,
              parse_mode: 'Markdown',
            }
          ).catch(() => {});

        } else {
          await bot.answerCallbackQuery(query.id, { text: '⚠️ Unknown action.' });
        }

      } catch (err) {
        logger.error('[Telegram] Callback handler error:', err.message);
        await bot.answerCallbackQuery(query.id, { text: `⚠️ Error: ${err.message}` }).catch(() => {});
      }
    });

    // ── Graceful polling-error recovery ──────────────────────────────────────
    bot.on('polling_error', (err) => {
      logger.error('[Telegram] Polling error:', err.code, err.message);
    });

    logger.info('[Telegram] Bot started in long-polling mode ✅');
  } catch (initErr) {
    logger.error('[Telegram] Failed to initialize bot:', initErr.message);
    bot = null;
  }
}

// ─── Helper ──────────────────────────────────────────────────────────────────

/**
 * Internal: safely send a message to the owner.
 * Returns null and logs on failure — never throws.
 */
async function _send(text, extra = {}) {
  if (!bot) return null;
  try {
    return await bot.sendMessage(TELEGRAM_OWNER_CHAT_ID, text, extra);
  } catch (err) {
    logger.error('[Telegram] sendMessage failed:', err.message);
    return null;
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Notify owner of a new incoming order.
 * Includes inline keyboard: [✅ Confirm & Pack] [❌ Cancel]
 *
 * @param {object} order       - order row from DB
 * @param {Array}  items       - array of { name, quantity, unit_price }
 */
async function notifyNewOrder(order, items) {
  if (!bot) return;

  try {
    const itemLines = items
      .map((i) => `  • ${i.name} ×${i.quantity} @ $${Number(i.unit_price).toFixed(2)}`)
      .join('\n');

    const totalKHR = (Number(order.total_amount) * 4100).toLocaleString();

    const text =
      `🛍️ *New Order — ${order.id}*\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `👤 *Customer:* ${order.customer_name || 'N/A'}\n` +
      `📞 *Phone:* ${order.phone || 'N/A'}\n` +
      `📍 *Address:* ${order.address || 'N/A'}\n` +
      (order.note ? `📝 *Note:* ${order.note}\n` : '') +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `${itemLines}\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `💰 *Total: $${Number(order.total_amount).toFixed(2)}* (${totalKHR} ៛)\n` +
      `⏰ Check Bakong app to confirm payment before tapping Confirm.`;

    const replyMarkup = {
      inline_keyboard: [[
        { text: '✅ Confirm & Pack', callback_data: `tg_confirm:${order.id}` },
        { text: '❌ Cancel',         callback_data: `tg_cancel:${order.id}` },
      ]],
    };

    await _send(text, { parse_mode: 'Markdown', reply_markup: replyMarkup });
    logger.info(`[Telegram] New order alert sent for ${order.id}`);
  } catch (err) {
    logger.error(`[Telegram] notifyNewOrder error for ${order.id}:`, err.message);
  }
}

/**
 * Notify owner that an order has been shipped (confirmation receipt).
 * @param {string} orderId
 */
async function notifyShipped(orderId) {
  if (!bot) return;
  await _send(
    `🚚 *Order ${orderId} marked as SHIPPED*\nCustomer has been notified via Messenger.`,
    { parse_mode: 'Markdown' }
  );
}

/**
 * Notify owner that an order was cancelled (admin panel action, info-only).
 * @param {string} orderId
 */
async function notifyCancelled(orderId) {
  if (!bot) return;
  await _send(`❌ *Order ${orderId} has been CANCELLED.*`, { parse_mode: 'Markdown' });
}

/**
 * Notify owner that a returned item's stock has been restored.
 * @param {string} orderId
 */
async function notifyReturned(orderId) {
  if (!bot) return;
  await _send(
    `📦 *Order ${orderId} marked as RETURNED.*\nStock has been restored to inventory.`,
    { parse_mode: 'Markdown' }
  );
}

/**
 * Stop the bot polling (called on graceful shutdown).
 */
function shutdown() {
  if (bot) {
    bot.stopPolling();
    logger.info('[Telegram] Bot polling stopped.');
  }
}

module.exports = {
  notifyNewOrder,
  notifyShipped,
  notifyCancelled,
  notifyReturned,
  shutdown,
};
