const productRepository = require('../repositories/product.repository');

/**
 * Decrement product stock atomically with concurrency guard.
 * Throws an error if stock is insufficient.
 * @param {string} id - Product SKU
 * @param {number} qty - Quantity to decrement
 */
function atomicDecrement(id, qty) {
  const result = productRepository.decrementStock(id, qty);
  if (result.changes === 0) {
    const error = new Error(`Insufficient stock for product ${id}.`);
    error.status = 409;
    throw error;
  }
  return true;
}

/**
 * Increment product stock (e.g., when an order is cancelled or returned).
 * @param {string} id - Product SKU
 * @param {number} qty - Quantity to increment
 */
function increment(id, qty) {
  productRepository.incrementStock(id, qty);
  return true;
}

module.exports = {
  atomicDecrement,
  increment,
};
