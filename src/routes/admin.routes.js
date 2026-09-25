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

// Image Upload (Protected - for instant photo preview on variants & products)
router.post('/upload-image', requireAdmin, upload.single('image'), adminController.uploadImage);

// Category management (Protected)
router.get('/categories', requireAdmin, adminController.getCategories);
router.post('/categories', requireAdmin, adminController.createCategory);
router.delete('/categories/:id', requireAdmin, adminController.deleteCategory);

// Quick Sell: in-person stock deduction (no order created, supports variants)
router.post('/products/:id/deduct', requireAdmin, adminController.quickSellDeduct);
router.post('/products/:id/restock', requireAdmin, adminController.quickSellRestock);

// Order lifecycle management (Protected)
router.get('/orders', requireAdmin, adminController.getOrders);
router.post('/orders/:id/confirm', requireAdmin, adminController.confirmOrder);
router.post('/orders/:id/cancel', requireAdmin, adminController.cancelOrder);
router.post('/orders/:id/ship', requireAdmin, adminController.shipOrder);
router.post('/orders/:id/return', requireAdmin, adminController.returnOrder);
router.post('/orders/:id/complete', requireAdmin, adminController.completeOrder);
router.patch('/orders/:id/delivery-type', requireAdmin, adminController.updateDeliveryType);

module.exports = router;
