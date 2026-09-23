const express = require('express');
const router = express.Router();

const customerRoutes = require('./customer.routes');
const adminRoutes = require('./admin.routes');
const webhookRoutes = require('./webhook.routes');

// Mount route groups
router.use('/api', customerRoutes);
router.use('/api/admin', adminRoutes);
router.use('/', webhookRoutes);

router.customerRoutes = customerRoutes;
router.adminRoutes = adminRoutes;
router.webhookRoutes = webhookRoutes;

module.exports = router;
