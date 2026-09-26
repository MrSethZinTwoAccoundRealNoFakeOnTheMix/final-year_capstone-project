const { PAGE_TOKEN, BASE_URL, MESSENGER_RATE_LIMIT_MS } = require('../config');
const { buildItemElement, buildButtonTemplate, QUICK_REPLIES } = require('../templates/messengerCards');
const { generateSignedUrl } = require('./identity.service');
const locales = require('../templates/locales/en');
const logger = require('../utils/logger');

const GRAPH_API_URL = 'https://graph.facebook.com/v20.0/me/messages';

// Outbound rate limiting: 500-1000ms delay between consecutive messages to prevent Meta flag 1893063
const OUTBOUND_DELAY_MS = Math.max(500, MESSENGER_RATE_LIMIT_MS || 800);
const GLOBAL_MIN_INTERVAL_MS = 400; // minimum 400ms spacing between any outbound Graph API calls

let lastGlobalSendTime = 0;
const recipientQueues = new Map();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Enqueue an outbound message for a specific recipient, ensuring:
 * 1. Global pacing: at least 400ms between any 2 Graph API requests.
 * 2. Per-thread rate limiting: at least 500-1000ms delay between consecutive messages to the same PSID.
 * 3. Prevents Meta spam detection / OAuth error 10 (subcode 1893063).
 */
function enqueueMessage(recipientId, sendFn) {
  const previous = recipientQueues.get(recipientId) || Promise.resolve();

  const next = previous
    .then(async () => {
      const elapsedSinceGlobal = Date.now() - lastGlobalSendTime;
      if (elapsedSinceGlobal < GLOBAL_MIN_INTERVAL_MS) {
        await sleep(GLOBAL_MIN_INTERVAL_MS - elapsedSinceGlobal);
      }
      lastGlobalSendTime = Date.now();
      return sendFn();
    })
    .catch((err) => {
      logger.error(`[Messenger] Error in outbound queue for ${recipientId}:`, err.message || err);
      return null;
    })
    .finally(async () => {
      await sleep(OUTBOUND_DELAY_MS);
      if (recipientQueues.get(recipientId) === next) {
        recipientQueues.delete(recipientId);
      }
    });

  recipientQueues.set(recipientId, next);
  return next;
}

/**
 * Send an arbitrary message payload to a Facebook Messenger recipient.
 * Fire-and-forget: Catches and logs all errors, never throwing.
 * Automatically rate-limited and queued to prevent Meta anti-spam flags.
 */
async function sendRawMessage(recipientId, messagePayload, messagingType = 'RESPONSE') {
  if (!PAGE_TOKEN) {
    logger.warn('[Messenger] PAGE_TOKEN is not configured; skipping message send.');
    return;
  }

  return enqueueMessage(recipientId, async () => {
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
        if (data.error && data.error.error_subcode === 1893063) {
          logger.warn(`[Messenger] Meta temporary messaging restriction active (subcode 1893063) for ${recipientId}. Message not delivered.`);
        } else {
          logger.warn(`[Messenger] Graph API warning (${response.status}):`, data.error || data);
        }
      } else {
        logger.info(`[Messenger] Message sent successfully to ${recipientId}`);
      }
      return data;
    } catch (err) {
      logger.error('[Messenger] Network/fetch error while sending message:', err.message || err);
      return null;
    }
  });
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
      // Fallback: Query the Page's conversation thread participants for this PSID.
      // This succeeds even when direct /{psid} node lookup is restricted by Meta permissions or tester status.
      try {
        const convUrl = `https://graph.facebook.com/v20.0/me/conversations?user_id=${encodeURIComponent(psid)}&fields=participants&access_token=${PAGE_TOKEN}`;
        const convRes = await fetch(convUrl);
        if (convRes.ok) {
          const convData = await convRes.json();
          const conv = convData.data && convData.data[0];
          const participants = conv?.participants?.data || [];
          const userParticipant = participants.find((p) => p.id === psid);
          if (userParticipant && userParticipant.name) {
            const fallbackProfile = {
              name: userParticipant.name,
              first_name: null,
              last_name: null,
            };
            profileCache.set(psid, fallbackProfile);
            logger.info(`[Messenger] Resolved Facebook profile for PSID ${psid}: "${fallbackProfile.name}"`);
            return fallbackProfile;
          }
        }
      } catch (convErr) {
        logger.debug(`[Messenger] Conversation fallback lookup error for PSID ${psid}:`, convErr.message || convErr);
      }

      // Only log warning if BOTH direct lookup and conversation fallback failed
      const err = await res.json().catch(() => ({}));
      logger.warn(`[Messenger] Could not resolve profile for PSID ${psid}:`, err.error?.message || res.status);
      profileCache.set(psid, null);
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
    } else {
      profileCache.set(psid, null);
    }

    return profile;
  } catch (err) {
    logger.warn(`[Messenger] Network error fetching profile for PSID ${psid}:`, err.message || err);
    profileCache.set(psid, null);
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

