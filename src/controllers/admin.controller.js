const authService = require('../services/auth.service');
const productRepository = require('../repositories/product.repository');
const categoryRepository = require('../repositories/category.repository');
const variantRepository = require('../repositories/variant.repository');
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
    const { id, name, category, import_price, sell_price } = req.body;
    let photo_url = req.body.photo_url || '';
    const has_variants = req.body.has_variants === true || req.body.has_variants === 'true' || req.body.has_variants === 1;

    let color_variants = req.body.color_variants;
    if (typeof color_variants === 'string') {
      try { color_variants = JSON.parse(color_variants); } catch (e) { color_variants = []; }
    }
    if (!Array.isArray(color_variants)) color_variants = [];

    if (!name || !category || import_price == null || sell_price == null) {
      return res.status(400).json({ error: 'Missing required product fields.' });
    }

    // If an image was uploaded via multipart/form-data
    if (req.file && req.file.buffer) {
      photo_url = await imageService.processAndSave(req.file.buffer);
    } else if (id && !photo_url) {
      const existing = productRepository.findById(id);
      if (existing && existing.photo_url) {
        photo_url = existing.photo_url;
      }
    }

    // Default cover photo to first variant photo if not provided
    if (!photo_url && has_variants && color_variants.length > 0 && color_variants[0].photo_url) {
      photo_url = color_variants[0].photo_url;
    }

    // Calculate total stock
    let totalStock = Number(req.body.stock ?? 1);
    if (has_variants && color_variants.length > 0) {
      totalStock = color_variants.reduce((sum, v) => sum + Number(v.stock ?? 1), 0);
    }

    const sku = productRepository.upsert({
      id,
      name,
      category,
      import_price: Number(import_price),
      sell_price: Number(sell_price),
      stock: totalStock,
      photo_url,
      variants: req.body.variants || '',
      has_variants: has_variants && color_variants.length > 0 ? 1 : 0,
    });

    // Save child variants if enabled
    if (has_variants && color_variants.length > 0) {
      variantRepository.replaceForProduct(sku, color_variants);
    } else if (id) {
      variantRepository.deleteByProductId(sku);
    }

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

/**
 * Upload single image (for instant preview on main photo or variant photos)
 */
async function uploadImage(req, res, next) {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'No image file provided.' });
    }
    const photo_url = await imageService.processAndSave(req.file.buffer);
    res.json({ success: true, photo_url });
  } catch (err) {
    next(err);
  }
}

/**
 * Category Management
 */
function getCategories(req, res, next) {
  try {
    res.json(categoryRepository.findAll());
  } catch (err) {
    next(err);
  }
}

function createCategory(req, res, next) {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Category name is required.' });
    const result = categoryRepository.create(name);
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    if (err.message.includes('already exists')) {
      return res.status(409).json({ error: err.message });
    }
    next(err);
  }
}

function deleteCategory(req, res, next) {
  try {
    const result = categoryRepository.remove(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Category not found.' });
    res.json({ success: true });
  } catch (err) {
    if (err.message.includes('Cannot delete')) return res.status(409).json({ error: err.message });
    next(err);
  }
}

/**
 * Quick Sell: Deduct 1 unit from stock (supports simple products & specific variants)
 */
function quickSellDeduct(req, res, next) {
  try {
    const { id } = req.params;
    const variantId = req.body && req.body.variant_id;

    if (variantId) {
      const variant = variantRepository.findById(variantId);
      if (!variant || !variant.is_active) {
        return res.status(404).json({ error: 'Variant not found.' });
      }
      if (variant.stock <= 0) {
        return res.status(409).json({ error: 'Out of stock.' });
      }
      const result = variantRepository.decrementStock(variantId, 1);
      if (result.changes === 0) {
        return res.status(409).json({ error: 'Out of stock.' });
      }
      return res.json({ success: true, remaining: variant.stock - 1, variant_id: variantId });
    }

    const product = productRepository.findById(id);
    if (!product || !product.is_active) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    if (product.stock <= 0) {
      return res.status(409).json({ error: 'Out of stock.' });
    }
    const result = productRepository.decrementStock(id, 1);
    if (result.changes === 0) {
      return res.status(409).json({ error: 'Out of stock.' });
    }
    res.json({ success: true, remaining: product.stock - 1 });
  } catch (err) {
    next(err);
  }
}

/**
 * Quick Sell: Restock 1 unit (undo a Quick Sell deduction)
 */
function quickSellRestock(req, res, next) {
  try {
    const { id } = req.params;
    const variantId = req.body && req.body.variant_id;

    if (variantId) {
      const variant = variantRepository.findById(variantId);
      if (!variant || !variant.is_active) {
        return res.status(404).json({ error: 'Variant not found.' });
      }
      variantRepository.incrementStock(variantId, 1);
      return res.json({ success: true, remaining: variant.stock + 1, variant_id: variantId });
    }

    const product = productRepository.findById(id);
    if (!product || !product.is_active) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    productRepository.incrementStock(id, 1);
    res.json({ success: true, remaining: product.stock + 1 });
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
  uploadImage,
  getCategories,
  createCategory,
  deleteCategory,
  quickSellDeduct,
  quickSellRestock,
};

