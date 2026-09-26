const assert = require('assert');
const productRepository = require('../src/repositories/product.repository');
const variantRepository = require('../src/repositories/variant.repository');
const orderRepository = require('../src/repositories/order.repository');
const orderService = require('../src/services/order.service');
const identityService = require('../src/services/identity.service');
const db = require('../src/db');

async function runCustomerTests() {
  console.log('🧪 Starting Customer Storefront Automated Verification...\n');

  // 1. Verify Public Catalog findAll()
  console.log('1️⃣ Verifying Public Catalog API:');
  const catalog = productRepository.findAll();
  assert(Array.isArray(catalog), 'Catalog must be an array');
  assert(catalog.length > 0, 'Catalog should have products');
  
  // Ensure import_price is NEVER exposed in findAll()
  for (const item of catalog) {
    assert.strictEqual(item.import_price, undefined, `import_price must not be present in public catalog on ${item.id}`);
    assert(Array.isArray(item.variant_list), `variant_list must be an array on ${item.id}`);
  }
  const productsWithVariants = catalog.filter((p) => p.variant_list.length > 0);
  console.log(`- Total products: ${catalog.length}`);
  console.log(`- Products with active styles: ${productsWithVariants.length}`);
  assert(productsWithVariants.length >= 2, 'Should have at least 2 seeded products with variants');
  console.log('✅ Public catalog findAll() hides import_price and includes variant_list.\n');

  // 2. Create a temporary product with 2 variants for end-to-end checkout & stock testing
  console.log('2️⃣ Testing Variant Checkout & Stock Lifecycle:');
  const testProductId = 'TEST-CUST-01';
  db.prepare('DELETE FROM order_items WHERE product_id = ?').run(testProductId);
  db.prepare('DELETE FROM product_variants WHERE product_id = ?').run(testProductId);
  db.prepare('DELETE FROM products WHERE id = ?').run(testProductId);

  db.prepare(`
    INSERT INTO products (id, name, category, import_price, sell_price, stock, photo_url, has_variants, is_active)
    VALUES (?, 'Customer Test Ring', 'Ring', 20, 50, 5, 'https://example.com/ring.jpg', 1, 1)
  `).run(testProductId);

  variantRepository.replaceForProduct(testProductId, [
    { color_name: 'Style 1 - Yellow Gold', import_price: 20, sell_price: 50, stock: 2, photo_url: 'https://example.com/v1.jpg' },
    { color_name: 'Style 2 - Platinum', import_price: 25, sell_price: 65, stock: 3, photo_url: 'https://example.com/v2.jpg' }
  ]);

  const pAfterVariants = productRepository.findById(testProductId);
  assert.strictEqual(pAfterVariants.stock, 5, 'Parent stock should be synced to 5 (2 + 3)');
  const variants = variantRepository.findByProductId(testProductId);
  const v1 = variants.find((v) => v.color_name.includes('Style 1'));
  const v2 = variants.find((v) => v.color_name.includes('Style 2'));
  assert(v1 && v2, 'Both variants must exist');
  console.log(`- Created ${testProductId} with V1 stock=${v1.stock}, V2 stock=${v2.stock}`);

  // Generate identity token for testing
  const psid = 'test_cust_psid_' + Date.now();
  const token = 'demo-bypass';

  // 3. Place order with Style 2 (Platinum - $65) for 2 pieces
  const orderRes = await orderService.placeOrder({
    psid,
    sig: token,
    items: [
      { productId: testProductId, variantId: v2.id, quantity: 2 }
    ],
    customer_name: 'Jane Doe',
    phone: '012345678',
    address: 'Phnom Penh St 2004',
    note: 'Ring size 6 please',
    payment_method: 'KHQR'
  });

  assert(orderRes.success, 'placeOrder should succeed');
  assert.strictEqual(orderRes.total, 130, 'Total should be 2 * $65 = $130');
  const orderId = orderRes.orderId;
  console.log(`- Order placed: ${orderId} (Total: $${orderRes.total})`);

  // Verify order items saved with variant details
  const order = orderRepository.findById(orderId);
  assert(order.items.length === 1, 'Should have 1 item');
  assert.strictEqual(order.items[0].variant_id, v2.id, 'order_items.variant_id must match v2');
  assert.strictEqual(order.items[0].unit_price, 65, 'Unit price must match variant sell price ($65)');
  console.log('✅ Order placed with exact variantId and unit_price.\n');

  // 4. Confirm Order (Stock should decrement from v2 and sync to parent)
  console.log('3️⃣ Confirming Order (Stock Decrement):');
  orderRepository.confirmOrder(orderId);
  const v2AfterConfirm = variantRepository.findById(v2.id);
  const parentAfterConfirm = productRepository.findById(testProductId);
  assert.strictEqual(v2AfterConfirm.stock, 1, 'v2 stock should be 3 - 2 = 1');
  assert.strictEqual(parentAfterConfirm.stock, 3, 'Parent stock should be 5 - 2 = 3');
  console.log(`- v2 stock decremented: 3 -> ${v2AfterConfirm.stock}`);
  console.log(`- Parent stock synced: 5 -> ${parentAfterConfirm.stock}`);
  console.log('✅ Stock atomically decremented from variant and parent.\n');

  // 5. Cancel Order (Stock should restore to variant and sync to parent)
  console.log('4️⃣ Cancelling Order (Stock Restoration):');
  orderRepository.cancelOrder(orderId);
  const v2AfterCancel = variantRepository.findById(v2.id);
  const parentAfterCancel = productRepository.findById(testProductId);
  assert.strictEqual(v2AfterCancel.stock, 3, 'v2 stock should be restored to 3');
  assert.strictEqual(parentAfterCancel.stock, 5, 'Parent stock should be restored to 5');
  console.log(`- v2 stock restored: 1 -> ${v2AfterCancel.stock}`);
  console.log(`- Parent stock restored: 3 -> ${parentAfterCancel.stock}`);
  console.log('✅ Stock atomically restored to variant and parent on cancellation.\n');

  // Cleanup
  db.prepare('DELETE FROM order_items WHERE order_id = ?').run(orderId);
  db.prepare('DELETE FROM orders WHERE id = ?').run(orderId);
  db.prepare('DELETE FROM product_variants WHERE product_id = ?').run(testProductId);
  db.prepare('DELETE FROM products WHERE id = ?').run(testProductId);

  console.log('🎉 ALL CUSTOMER STOREFRONT TESTS PASSED 100%!\n');
  process.exit(0);
}

runCustomerTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
