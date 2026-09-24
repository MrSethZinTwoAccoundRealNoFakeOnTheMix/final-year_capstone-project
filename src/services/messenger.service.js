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
    const itemElements = (items || []).slice(0, 10).map((it) => buildItemElement(it, shopUrl, BASE_URL));

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

// In-memory cache for user profile lookups (PSID -> { name, first_name, last_name })
const profileCache = new Map();

/**
 * Fetch Facebook user profile name by PSID via Graph API.
 * Results are cached in-memory to avoid redundant Graph API network calls.
 * @param {string} psid - Page Scoped User ID
 * @returns {Promise<{ name: string|null, first_name?: string, last_name?: string }|null>}
 */
async function getUserProfile(psid) {
  if (!psid) return null;
  if (profileCache.has(psid)) {
    return profileCache.get(psid);
  }

  if (!PAGE_TOKEN) {
    logger.warn('[Messenger] PAGE_TOKEN not configured; skipping profile lookup.');
    return null;
  }

  try {
    const url = `https://graph.facebook.com/v20.0/${encodeURIComponent(psid)}?fields=name,first_name,last_name&access_token=${PAGE_TOKEN}`;
    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      logger.warn(`[Messenger] Graph API profile lookup failed for PSID ${psid}:`, err.error?.message || res.status);
      return null;
    }

    const data = await res.json();
    const profile = {
      name: data.name || [data.first_name, data.last_name].filter(Boolean).join(' ') || null,
      first_name: data.first_name || null,
      last_name: data.last_name || null,
    };

    if (profile.name) {
      profileCache.set(psid, profile);
      logger.info(`[Messenger] Resolved Facebook profile for PSID ${psid}: "${profile.name}"`);
    }

    return profile;
  } catch (err) {
    logger.warn(`[Messenger] Network error fetching profile for PSID ${psid}:`, err.message || err);
    return null;
  }
}

module.exports = {
  sendRawMessage,
  sendOrderReceipt,
  sendShippingNotification,
  sendExplicitShopResponse,
  sendLightweightGreeting,
  getUserProfile,
};

