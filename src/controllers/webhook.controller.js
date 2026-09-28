const { VERIFY_TOKEN } = require('../config');
const { SHOP_LINK_COOLDOWN_MS } = require('../config/constants');
const identityService = require('../services/identity.service');
const messengerService = require('../services/messenger.service');
const orderRepository = require('../repositories/order.repository');
const logger = require('../utils/logger');

// In-memory timestamps for greeting vs explicit shop requests
const lastGreetingSentAt = new Map();
const lastExplicitShopSentAt = new Map();
// In-flight locks to prevent parallel duplicate webhook processing for the same PSID
const inFlightShopRequests = new Set();
const EXPLICIT_SHOP_DEBOUNCE_MS = 20000; // 20-second debounce against accidental multi-taps

/**
 * 1. Webhook Verification (Meta challenge endpoint)
 */
function verifyChallenge(req, res) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      logger.info('✅ Meta Webhook challenge verified successfully!');
      return res.status(200).send(challenge);
    } else {
      logger.warn('❌ Meta Webhook verification token mismatch.');
      return res.sendStatus(403);
    }
  }
  res.sendStatus(400);
}

/**
 * 2. Webhook Event Handler (Auto-reply with shop link or greeting)
 */
async function handleEvent(req, res) {
  const body = req.body;

  if (body.object === 'page') {
    // Meta requires 200 OK within 20 seconds
    res.status(200).send('EVENT_RECEIVED');

    if (!Array.isArray(body.entry)) return;

    for (const entry of body.entry) {
      const webhookEvent = entry.messaging ? entry.messaging[0] : null;
      if (!webhookEvent) continue;

      const senderPsid = webhookEvent.sender && webhookEvent.sender.id;
      if (!senderPsid) continue;

      // Ignore messages sent by the page itself (echoes)
      if (webhookEvent.message && webhookEvent.message.is_echo) {
        continue;
      }

      // Record customer interaction timestamp to track Meta 24-hour messaging window
      try {
        orderRepository.recordCustomerInteraction(senderPsid);
      } catch (e) {}

      // Pre-warm user profile in server RAM cache in the background (0ms delay when opening webview)
      messengerService.getUserProfile(senderPsid).catch(() => {});

      // Check text, postback, or quick reply action
      const userText = webhookEvent.message && webhookEvent.message.text
        ? webhookEvent.message.text.toLowerCase().trim()
        : '';
      const quickReplyPayload = webhookEvent.message && webhookEvent.message.quick_reply
        ? webhookEvent.message.quick_reply.payload
        : '';
      const isPostback = !!webhookEvent.postback;
      const postbackPayload = isPostback ? webhookEvent.postback.payload : '';
      const actionPayload = quickReplyPayload || postbackPayload;

      const isExplicitShopRequest =
        isPostback ||
        actionPayload === 'OPEN_SHOP' ||
        userText === 'shop' ||
        userText.includes('ចូលហាង') ||
        userText.includes('open shop');

      // 1. Explicit Shop Request (Debounced against accidental rapid multi-taps)
      if (isExplicitShopRequest) {
        const lastSent = lastExplicitShopSentAt.get(senderPsid) || 0;
        const isDebounced = Date.now() - lastSent < EXPLICIT_SHOP_DEBOUNCE_MS;
        const isInFlight = inFlightShopRequests.has(senderPsid);

        if (isDebounced || isInFlight) {
          logger.info(`⏳ Debounced duplicate shop request from PSID: ${senderPsid} (within ${EXPLICIT_SHOP_DEBOUNCE_MS}ms or in-flight). Skipping duplicate send.`);
          continue;
        }

        inFlightShopRequests.add(senderPsid);
        lastExplicitShopSentAt.set(senderPsid, Date.now());

        logger.info(`🛍️ Explicit shop request from PSID: ${senderPsid} (Trigger: "${actionPayload || userText}")`);

        try {
          const shopUrl = identityService.generateSignedUrl(senderPsid);
          await messengerService.sendExplicitShopResponse(senderPsid, shopUrl);
        } finally {
          inFlightShopRequests.delete(senderPsid);
        }
      }
      // 2. First interaction or after cooldown
      else {
        const lastSent = lastGreetingSentAt.get(senderPsid) || 0;
        const isCoolDownOver = Date.now() - lastSent > (SHOP_LINK_COOLDOWN_MS || 60000);
        if (isCoolDownOver) {
          logger.info(`👋 First interaction from PSID: ${senderPsid} (Trigger: "${userText || 'interaction'}")`);
          lastGreetingSentAt.set(senderPsid, Date.now());

          await messengerService.sendLightweightGreeting(senderPsid);
        }
      }
    }
  } else {
    res.sendStatus(404);
  }
}

module.exports = {
  verifyChallenge,
  handleEvent,
};
