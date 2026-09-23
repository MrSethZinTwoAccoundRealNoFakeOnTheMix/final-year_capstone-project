const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');
const verifyWebhookSignature = require('../middlewares/verifyWebhookSignature');

// Meta Messenger webhook challenge verification
router.get('/webhook', webhookController.verifyChallenge);

// Meta Messenger incoming event handler with signature verification
router.post('/webhook', verifyWebhookSignature, webhookController.handleEvent);

module.exports = router;
