const { PAGE_TOKEN, BASE_URL } = require('../config');
const { buildItemElement, buildButtonTemplate, QUICK_REPLIES } = require('../templates/messengerCards');
const { generateSignedUrl } = require('./identity.service');
const locales = require('../templates/locales/en');
const logger = require('../utils/logger');

const GRAPH_API_URL = 'https://graph.facebook.com/v20.0/me/messages';

/**
 * Send an arbitrary message payload to a Facebook Messenger recipient.
 * Fire-and-forget: Catches and logs all errors, never throwing.
 */
async function sendRawMessage(recipientId, messagePayload, messagingType = 'RESPONSE') {
  if (!PAGE_TOKEN) {
    logger.warn('[Messenger] PAGE_TOKEN is not configured; skipping message send.');
    return;
  }

  try {
    const response = await fetch(`${GRAPH_API_URL}?access_token=${PAGE_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: recipientId },
        messaging_type: messagingType,
        message: messagePayload,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      logger.warn(`[Messenger] Graph API warning (${response.status}):`, data.error || data);
    } else {
      logger.info(`[Messenger] Message sent successfully to ${recipientId}`);
    }
    return data;
  } catch (err) {
    logger.error('[Messenger] Network/fetch error while sending message:', err.message || err);
  }
}

/**
 * Send order receipt: generic template carousel + text summary.
 * Fire-and-forget.
 * @param {string} psid 
 * @param {Object} order 
 * @param {Array} items 
 */
async function sendOrderReceipt(psid, order, items) {
  if (!psid) return;

  try {
    const shopUrl = generateSignedUrl(psid, BASE_URL);
    const itemElements = (items || []).slice(0, 10).map((it) => buildItemElement(it, shopUrl));

    // 1. Send items carousel if items exist
    if (itemElements.length > 0) {
      await sendRawMessage(psid, {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: itemElements,
          },
        },
      });
    }

    // 2. Send text summary
    const summaryText = locales.orderReceipt(order);
    await sendRawMessage(psid, { text: summaryText });

    logger.info(`[Messenger] Sent order receipt for order ${order.id} to ${psid}`);
  } catch (err) {
    logger.error('[Messenger] Failed to send order receipt:', err.message || err);
  }
}

/**
 * Send shipping notification to customer.
 * Fire-and-forget.
 * Note: If the 24-hour standard messaging window has expired, Graph API returns an error,
 * which is caught and logged gracefully without throwing.
 * @param {string} psid 
 * @param {string} orderId 
 */
async function sendShippingNotification(psid, orderId) {
  if (!psid) return;

  try {
    const messageText = locales.shippingNotification(orderId);
    await sendRawMessage(psid, { text: messageText });
    logger.info(`[Messenger] Sent shipping notification for order ${orderId} to ${psid}`);
  } catch (err) {
    logger.error(`[Messenger] Failed to send shipping notification for order ${orderId}:`, err.message || err);
  }
}

/**
 * Send bilingual guide + webview button when user explicitly requests shop.
 * @param {string} psid 
 * @param {string} shopUrl 
 */
async function sendExplicitShopResponse(psid, shopUrl) {
  try {
    // 1. Send bilingual guide text
    await sendRawMessage(psid, { text: locales.shopGuide });

    // 2. Send Button template card with Quick Reply pill
    const buttonCard = buildButtonTemplate(
      locales.openShopPromptText,
      shopUrl,
      locales.openShopButtonText
    );
    await sendRawMessage(psid, buttonCard);

    logger.info(`[Messenger] Sent explicit shop response to ${psid}`);
  } catch (err) {
    logger.error(`[Messenger] Failed to send explicit shop response to ${psid}:`, err.message || err);
  }
}

/**
 * Send lightweight welcome greeting with Quick Reply pill on initial interaction.
 * @param {string} psid 
 */
async function sendLightweightGreeting(psid) {
  try {
    await sendRawMessage(psid, {
      text: locales.welcomeGreeting,
      quick_replies: QUICK_REPLIES,
    });
    logger.info(`[Messenger] Sent lightweight greeting to ${psid}`);
  } catch (err) {
    logger.error(`[Messenger] Failed to send lightweight greeting to ${psid}:`, err.message || err);
  }
}

module.exports = {
  sendRawMessage,
  sendOrderReceipt,
  sendShippingNotification,
  sendExplicitShopResponse,
  sendLightweightGreeting,
};
