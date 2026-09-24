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
const { TELEGRAM_BOT_TOKEN, TELEGRAM_OWNER_CHAT_IDS, BASE_URL } = require('../config');
const messengerService = require('./messenger.service');
const logger = require('../utils/logger');

// ─── Initialise Bot ──────────────────────────────────────────────────────────

let bot = null;

if (!TELEGRAM_BOT_TOKEN) {
  logger.warn('[Telegram] TELEGRAM_BOT_TOKEN not set — Telegram notifications disabled.');
} else if (!TELEGRAM_OWNER_CHAT_IDS || TELEGRAM_OWNER_CHAT_IDS.length === 0) {
  logger.warn('[Telegram] No TELEGRAM_OWNER_CHAT_ID configured — Telegram notifications disabled.');
} else {
  try {
    // Long-polling mode: works without any public URL / tunnel
    bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

    // ── Command Handlers (/start, /menu) ─────────────────────────────────────
    bot.onText(/\/start|\/menu/, async (msg) => {
      const chatId = msg.chat.id.toString();
      if (!TELEGRAM_OWNER_CHAT_IDS.includes(chatId)) {
        return bot.sendMessage(
          chatId,
          `⛔ Unauthorized access.\nYour Chat ID is: \`${chatId}\`\nPlease add this ID to .env as TELEGRAM_OWNER_CHAT_ID or TELEGRAM_OWNER_CHAT_ID_2.`,
          { parse_mode: 'Markdown' }
        );
      }

      return bot.sendMessage(
        chatId,
        `👋 *Welcome to Luxe Jewelry Owner Panel* 💍\n\n` +
        `✅ *Authorized Owner:* Chat ID \`${chatId}\`\n\n` +
        `📱 *Features Enabled:*\n` +
        `• Real-time new order alerts with instant 1-tap actions\n` +
        `• Multi-stage order lifecycle: Confirm ➔ Ship ➔ Deliver/Return\n` +
        `• Automatic stock synchronization with database\n\n` +
        `🌐 *Web Links:*\n` +
        `• Store: ${BASE_URL}\n` +
        `• Admin Panel: ${BASE_URL}/admin.html`,
        { parse_mode: 'Markdown' }
      );
    });

// ─── Format & Meta Helpers ──────────────────────────────────────────────────

function formatPhnomPenhTime(date = new Date()) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Phnom_Penh',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

async function getOrderMeta(orderId) {
  let order = null;
  try {
    const orderRepository = require('../repositories/order.repository');
    order = orderRepository.findById(orderId);
  } catch (err) {
    logger.warn(`[Telegram] Could not find order ${orderId} in repository:`, err.message);
  }

  let fbDisplay = 'N/A';
  let custDisplay = 'N/A';
  let totalDisplay = '';

  if (order) {
    if (order.psid) {
      try {
        const profile = await messengerService.getUserProfile(order.psid);
        if (profile && profile.name) {
          fbDisplay = profile.name.replace(/[*_`\[]/g, '');
        } else {
          fbDisplay = `PSID: ${order.psid.slice(0, 6)}…${order.psid.slice(-4)}`;
        }
      } catch (err) {
        fbDisplay = `PSID: ${order.psid.slice(0, 6)}…${order.psid.slice(-4)}`;
      }
    } else {
      fbDisplay = 'Guest / No PSID';
    }

    const cleanCustName = (order.customer_name || 'N/A').replace(/[*_`\[]/g, '');
    custDisplay = order.phone ? `${cleanCustName} (${order.phone})` : cleanCustName;

    if (order.total_amount != null) {
      const totalKHR = (Number(order.total_amount) * 4100).toLocaleString();
      totalDisplay = `$${Number(order.total_amount).toFixed(2)} (${totalKHR} ៛)`;
    }
  }

  const timestamp = formatPhnomPenhTime();

  return {
    order,
    fbDisplay,
    custDisplay,
    totalDisplay,
    timestamp,
  };
}

    // ── Inline-keyboard callback handler ─────────────────────────────────────
    // Dynamic multi-stage order lifecycle:
    // PENDING   → [✅ Confirm & Pack] [❌ Cancel]
    // CONFIRMED → [🚚 Mark as Shipped] [❌ Cancel & Restock]
    // SHIPPED   → [🎉 Delivered / Completed] [📦 Return & Restock (Refund)]
    bot.on('callback_query', async (query) => {
      const chatId = query.message.chat.id.toString();
      const data   = query.data || '';

      // Security: only process callbacks from authorized owners
      if (!TELEGRAM_OWNER_CHAT_IDS.includes(chatId)) {
        await bot.answerCallbackQuery(query.id, { text: '⛔ Unauthorized.' }).catch(() => {});
        return;
      }

      const [action, orderId] = data.split(':'); // e.g. "tg_confirm:ORD-123456"

      if (!orderId) {
        await bot.answerCallbackQuery(query.id, { text: '⚠️ Unknown action.' }).catch(() => {});
        return;
      }

      // Lazy-require to break circular dependency (telegram ↔ order)
      const orderService = require('./order.service');

      try {
        const meta = await getOrderMeta(orderId);

        if (action === 'tg_confirm') {
          orderService.confirmOrder(orderId);
          await bot.answerCallbackQuery(query.id, { text: '✅ Order confirmed & stock decremented!' });

          // Transition to CONFIRMED stage: show [🚚 Mark as Shipped] & [❌ Cancel & Restock]
          await bot.editMessageText(
            `✅ *Order ${orderId} CONFIRMED*\n` +
            `━━━━━━━━━━━━━━━━━━━\n` +
            `🌐 *Facebook:* ${meta.fbDisplay}\n` +
            `👤 *Customer:* ${meta.custDisplay}\n` +
            (meta.totalDisplay ? `💰 *Total:* ${meta.totalDisplay}\n` : '') +
            `🕒 *Confirmed At:* ${meta.timestamp}\n` +
            `━━━━━━━━━━━━━━━━━━━\n` +
            `📦 *Status:* Stock decremented. Items packed.\n` +
            `👉 When handed to delivery driver, tap *Mark as Shipped*:`,
            {
              chat_id: query.message.chat.id,
              message_id: query.message.message_id,
              parse_mode: 'Markdown',
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: '🚚 Mark as Shipped', callback_data: `tg_ship:${orderId}` },
                    { text: '❌ Cancel & Restock', callback_data: `tg_cancel:${orderId}` },
                  ],
                ],
              },
            }
          ).catch(() => {});

        } else if (action === 'tg_ship') {
          orderService.shipOrder(orderId);
          await bot.answerCallbackQuery(query.id, { text: '🚚 Order marked as SHIPPED! Customer notified via Messenger.' });

          // Transition to SHIPPED stage: show [🎉 Delivered] & [📦 Return & Restock]
          await bot.editMessageText(
            `🚚 *Order ${orderId} SHIPPED*\n` +
            `━━━━━━━━━━━━━━━━━━━\n` +
            `🌐 *Facebook:* ${meta.fbDisplay}\n` +
            `👤 *Customer:* ${meta.custDisplay}\n` +
            (meta.totalDisplay ? `💰 *Total:* ${meta.totalDisplay}\n` : '') +
            `🕒 *Shipped At:* ${meta.timestamp}\n` +
            `━━━━━━━━━━━━━━━━━━━\n` +
            `🛵 *Status:* Package is in transit with delivery driver.\n` +
            `💬 Customer notified via Messenger.\n` +
            `👉 Once delivery is completed or if package is returned:`,
            {
              chat_id: query.message.chat.id,
              message_id: query.message.message_id,
              parse_mode: 'Markdown',
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: '🎉 Delivered / Completed', callback_data: `tg_complete:${orderId}` },
                    { text: '📦 Return & Restock (Refund)', callback_data: `tg_return:${orderId}` },
                  ],
                ],
              },
            }
          ).catch(() => {});

        } else if (action === 'tg_complete') {
          await bot.answerCallbackQuery(query.id, { text: '🎉 Order marked as Completed!' });

          // Final Completed stage: remove buttons
          await bot.editMessageText(
            `🎉 *Order ${orderId} COMPLETED!*\n` +
            `━━━━━━━━━━━━━━━━━━━\n` +
            `🌐 *Facebook:* ${meta.fbDisplay}\n` +
            `👤 *Customer:* ${meta.custDisplay}\n` +
            (meta.totalDisplay ? `💰 *Total:* ${meta.totalDisplay}\n` : '') +
            `🕒 *Completed At:* ${meta.timestamp}\n` +
            `━━━━━━━━━━━━━━━━━━━\n` +
            `✅ Customer received package and payment settled. Finished! ✨`,
            {
              chat_id: query.message.chat.id,
              message_id: query.message.message_id,
              parse_mode: 'Markdown',
            }
          ).catch(() => {});

        } else if (action === 'tg_return') {
          orderService.returnOrder(orderId);
          await bot.answerCallbackQuery(query.id, { text: '📦 Order RETURNED. Stock restored to inventory!' });

          // Final Returned stage: remove buttons
          await bot.editMessageText(
            `📦 *Order ${orderId} RETURNED / REFUNDED*\n` +
            `━━━━━━━━━━━━━━━━━━━\n` +
            `🌐 *Facebook:* ${meta.fbDisplay}\n` +
            `👤 *Customer:* ${meta.custDisplay}\n` +
            (meta.totalDisplay ? `💰 *Total:* ${meta.totalDisplay}\n` : '') +
            `🕒 *Returned At:* ${meta.timestamp}\n` +
            `━━━━━━━━━━━━━━━━━━━\n` +
            `🔄 Package returned by driver. Stock automatically restored to inventory in database!`,
            {
              chat_id: query.message.chat.id,
              message_id: query.message.message_id,
              parse_mode: 'Markdown',
            }
          ).catch(() => {});

        } else if (action === 'tg_cancel') {
          orderService.cancelOrder(orderId);
          await bot.answerCallbackQuery(query.id, { text: '❌ Order cancelled.' });

          // Cancelled stage: remove buttons
          await bot.editMessageText(
            `❌ *Order ${orderId} CANCELLED*\n` +
            `━━━━━━━━━━━━━━━━━━━\n` +
            `🌐 *Facebook:* ${meta.fbDisplay}\n` +
            `👤 *Customer:* ${meta.custDisplay}\n` +
            (meta.totalDisplay ? `💰 *Total:* ${meta.totalDisplay}\n` : '') +
            `🕒 *Cancelled At:* ${meta.timestamp}\n` +
            `━━━━━━━━━━━━━━━━━━━\n` +
            `Order has been cancelled. Stock restored if previously confirmed.`,
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
 * Internal: safely send a message to all configured owners.
 * Returns null and logs on failure — never throws.
 */
async function _send(text, extra = {}) {
  if (!bot || !TELEGRAM_OWNER_CHAT_IDS.length) return null;

  const results = await Promise.allSettled(
    TELEGRAM_OWNER_CHAT_IDS.map(async (chatId) => {
      try {
        return await bot.sendMessage(chatId, text, extra);
      } catch (err) {
        logger.error(`[Telegram] sendMessage failed for ${chatId}:`, err.message);
        return null;
      }
    })
  );

  return results[0] ? results[0].value : null;
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
    // 1. Fetch Facebook profile name by PSID if available
    let fbName = null;
    if (order.psid) {
      try {
        const profile = await messengerService.getUserProfile(order.psid);
        if (profile && profile.name) {
          fbName = profile.name;
        }
      } catch (err) {
        logger.warn(`[Telegram] Could not fetch FB name for PSID ${order.psid}:`, err.message);
      }
    }

    const fbDisplay = fbName
      ? fbName.replace(/[*_`\[]/g, '')
      : (order.psid ? `PSID: ${order.psid.slice(0, 6)}…${order.psid.slice(-4)}` : 'Guest / No PSID');

    const itemLines = items
      .map((i) => `  • ${i.name} ×${i.quantity} @ $${Number(i.unit_price).toFixed(2)}`)
      .join('\n');

    const totalKHR = (Number(order.total_amount) * 4100).toLocaleString();
    const isKhqr = (order.payment_method || 'KHQR').toUpperCase() === 'KHQR';
    const paymentLabel = isKhqr ? '📲 Bakong KHQR (Prepaid Scan)' : '💬 Other / Discuss with Customer';
    const paymentNotice = isKhqr
      ? '⏰ Check Bakong app to confirm payment before tapping Confirm.'
      : '💬 Discuss & agree on payment (transfer/deposit/delivery) with customer in chat before confirming.';

    const text =
      `🛍️ *New Order — ${order.id}*\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `🌐 *Facebook:* ${fbDisplay}\n\n` +
      `👤 *Customer:* ${order.customer_name || 'N/A'}\n` +
      `📞 *Phone:* ${order.phone || 'N/A'}\n` +
      `📍 *Address:* ${order.address || 'N/A'}\n` +
      `💳 *Payment:* ${paymentLabel}\n` +
      (order.note ? `📝 *Note:* ${order.note}\n` : '') +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `${itemLines}\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `💰 *Total: $${Number(order.total_amount).toFixed(2)}* (${totalKHR} ៛)\n` +
      `${paymentNotice}`;

    const replyMarkup = {
      inline_keyboard: [[
        { text: '✅ Confirm & Pack', callback_data: `tg_confirm:${order.id}` },
        { text: '❌ Cancel',         callback_data: `tg_cancel:${order.id}` },
      ]],
    };

    await _send(text, { parse_mode: 'Markdown', reply_markup: replyMarkup });
    logger.info(`[Telegram] New order alert sent for ${order.id} (${isKhqr ? 'KHQR' : 'OTHER'})`);
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
  try {
    const meta = await getOrderMeta(orderId);
    await _send(
      `🚚 *Order ${orderId} marked as SHIPPED*\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `🌐 *Facebook:* ${meta.fbDisplay}\n` +
      `👤 *Customer:* ${meta.custDisplay}\n` +
      (meta.totalDisplay ? `💰 *Total:* ${meta.totalDisplay}\n` : '') +
      `🕒 *Shipped At:* ${meta.timestamp}\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `💬 Customer has been notified via Messenger.`,
      { parse_mode: 'Markdown' }
    );
  } catch (err) {
    logger.error(`[Telegram] notifyShipped error for ${orderId}:`, err.message);
  }
}

/**
 * Notify owner that an order was cancelled (admin panel action, info-only).
 * @param {string} orderId
 */
async function notifyCancelled(orderId) {
  if (!bot) return;
  try {
    const meta = await getOrderMeta(orderId);
    await _send(
      `❌ *Order ${orderId} CANCELLED*\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `🌐 *Facebook:* ${meta.fbDisplay}\n` +
      `👤 *Customer:* ${meta.custDisplay}\n` +
      (meta.totalDisplay ? `💰 *Total:* ${meta.totalDisplay}\n` : '') +
      `🕒 *Cancelled At:* ${meta.timestamp}\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `Order has been cancelled via admin panel.`,
      { parse_mode: 'Markdown' }
    );
  } catch (err) {
    logger.error(`[Telegram] notifyCancelled error for ${orderId}:`, err.message);
  }
}

/**
 * Notify owner that a returned item's stock has been restored.
 * @param {string} orderId
 */
async function notifyReturned(orderId) {
  if (!bot) return;
  try {
    const meta = await getOrderMeta(orderId);
    await _send(
      `📦 *Order ${orderId} marked as RETURNED*\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `🌐 *Facebook:* ${meta.fbDisplay}\n` +
      `👤 *Customer:* ${meta.custDisplay}\n` +
      (meta.totalDisplay ? `💰 *Total:* ${meta.totalDisplay}\n` : '') +
      `🕒 *Returned At:* ${meta.timestamp}\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `Stock has been restored to inventory in database.`,
      { parse_mode: 'Markdown' }
    );
  } catch (err) {
    logger.error(`[Telegram] notifyReturned error for ${orderId}:`, err.message);
  }
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
