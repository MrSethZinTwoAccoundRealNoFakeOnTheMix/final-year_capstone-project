const express = require('express');
const router = express.Router();
// test
const customerRoutes = require('./customer.routes');
const adminRoutes = require('./admin.routes');
const webhookRoutes = require('./webhook.routes');
const paymentsRoutes = require('./payments.routes');   // ← ADD

// Mount route groups
router.use('/api', customerRoutes);
router.use('/api/admin', adminRoutes);
router.use('/', webhookRoutes);
router.use('/api/payments', paymentsRoutes);           // ← ADD


router.customerRoutes = customerRoutes;
router.adminRoutes = adminRoutes;
router.webhookRoutes = webhookRoutes;

module.exports = router;
