const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const requireAdmin = require('../middlewares/requireAdmin');
const { upload } = require('../services/image.service');

// Admin authentication
router.post('/login', adminController.login);

// Product management (Protected)
router.get('/products', requireAdmin, adminController.getProducts);
router.post('/products', requireAdmin, upload.single('photo'), adminController.upsertProduct);
router.delete('/products/:id', requireAdmin, adminController.deleteProduct);

// Order lifecycle management (Protected)
router.get('/orders', requireAdmin, adminController.getOrders);
router.post('/orders/:id/confirm', requireAdmin, adminController.confirmOrder);
router.post('/orders/:id/cancel', requireAdmin, adminController.cancelOrder);
router.post('/orders/:id/ship', requireAdmin, adminController.shipOrder);
router.post('/orders/:id/return', requireAdmin, adminController.returnOrder);

module.exports = router;
