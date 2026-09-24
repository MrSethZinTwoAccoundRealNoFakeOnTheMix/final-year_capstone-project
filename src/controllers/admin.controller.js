const authService = require('../services/auth.service');
const productRepository = require('../repositories/product.repository');
const orderService = require('../services/order.service');
const imageService = require('../services/image.service');

/**
 * Admin Login: validates password, returns HMAC token
 */
function login(req, res) {
  const { password } = req.body;
  if (!password || !authService.validatePassword(password)) {
    return res.status(401).json({ error: 'Incorrect admin password.' });
  }

  const token = authService.generateAdminToken();
  res.json({ success: true, token });
}

/**
 * Get all products with cost and profit margin for admin dashboard
 */
function getProducts(req, res, next) {
  try {
    const products = productRepository.findAllAdmin();
    res.json(products);
  } catch (err) {
    next(err);
  }
}

/**
 * Add or update product, optionally processing uploaded image
 */
async function upsertProduct(req, res, next) {
  try {
    const { id, name, category, import_price, sell_price, stock, variants } = req.body;
    let photo_url = req.body.photo_url || '';

    if (!name || !category || import_price == null || sell_price == null) {
      return res.status(400).json({ error: 'Missing required product fields.' });
    }

    // If an image was uploaded via multipart/form-data
    if (req.file && req.file.buffer) {
      photo_url = await imageService.processAndSave(req.file.buffer);
    } else if (id && !photo_url) {
      // Retain existing photo if updating an existing product and no replacement image or URL was provided
      const existing = productRepository.findById(id);
      if (existing && existing.photo_url) {
        photo_url = existing.photo_url;
      }
    }

    const sku = productRepository.upsert({
      id,
      name,
      category,
      import_price: Number(import_price),
      sell_price: Number(sell_price),
      stock: stock != null ? Number(stock) : 0,
      photo_url,
      variants: variants || '',
    });

    res.json({ success: true, id: sku, photo_url });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a product by ID (SKU)
 */
function deleteProduct(req, res, next) {
  try {
    const result = productRepository.remove(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.json({ success: true, message: `Product ${req.params.id} deleted.` });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all orders with line items
 */
function getOrders(req, res, next) {
  try {
    const orders = orderService.getAllOrders();
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

/**
 * Confirm order and decrement stock atomically
 */
function confirmOrder(req, res, next) {
  try {
    const order = orderService.confirmOrder(req.params.id);
    res.json({
      success: true,
      message: `Order ${req.params.id} confirmed and stock decremented.`,
      order,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Cancel order and restore stock if previously confirmed
 */
function cancelOrder(req, res, next) {
  try {
    const order = orderService.cancelOrder(req.params.id);
    res.json({
      success: true,
      message: `Order ${req.params.id} has been marked as CANCELLED.`,
      order,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Mark order as SHIPPED
 */
function shipOrder(req, res, next) {
  try {
    const order = orderService.shipOrder(req.params.id);
    res.json({
      success: true,
      message: `Order ${req.params.id} has been marked as SHIPPED.`,
      order,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Mark order as RETURNED and restore stock
 */
function returnOrder(req, res, next) {
  try {
    const order = orderService.returnOrder(req.params.id);
    res.json({
      success: true,
      message: `Order ${req.params.id} has been marked as RETURNED and stock restored.`,
      order,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Mark order as COMPLETED (Delivered successfully)
 */
function completeOrder(req, res, next) {
  try {
    const order = orderService.completeOrder(req.params.id);
    res.json({
      success: true,
      message: `Order ${req.params.id} has been marked as COMPLETED.`,
      order,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update delivery type / payment method on order
 */
function updateDeliveryType(req, res, next) {
  try {
    const deliveryType = req.body.delivery_type || req.body.payment_method;
    const order = orderService.updateDeliveryType(req.params.id, deliveryType);
    res.json({
      success: true,
      message: `Order ${req.params.id} delivery type set to ${order.payment_method}.`,
      order,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  login,
  getProducts,
  upsertProduct,
  deleteProduct,
  getOrders,
  confirmOrder,
  cancelOrder,
  shipOrder,
  returnOrder,
  completeOrder,
  updateDeliveryType,
};

