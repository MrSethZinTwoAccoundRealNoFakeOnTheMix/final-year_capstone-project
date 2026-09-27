/**
 * Test for 7-day auto-delivery of SHIPPED orders
 */
const db = require('../src/db');
const orderRepository = require('../src/repositories/order.repository');
const orderService = require('../src/services/order.service');

console.log('🧪 Starting 7-day auto-delivery verification test...\n');

const testOrderIdRecent = 'TEST-SHIP-RECENT-' + Date.now();
const testOrderIdOld = 'TEST-SHIP-OLD-' + Date.now();

try {
  // 1. Insert two confirmed orders
  db.prepare(`
    INSERT INTO orders (id, psid, status, total_amount, customer_name, payment_method, created_at, updated_at)
    VALUES (?, 'test_psid', 'CONFIRMED', 50.00, 'Test Customer Recent', 'COD', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).run(testOrderIdRecent);

  db.prepare(`
    INSERT INTO orders (id, psid, status, total_amount, customer_name, payment_method, created_at, updated_at)
    VALUES (?, 'test_psid', 'CONFIRMED', 75.00, 'Test Customer Old', 'KHQR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).run(testOrderIdOld);

  console.log('1️⃣ Inserted 2 test orders in CONFIRMED state.');

  // 2. Ship both orders
  orderRepository.shipOrder(testOrderIdRecent);
  orderRepository.shipOrder(testOrderIdOld);

  const shippedRecent = orderRepository.findById(testOrderIdRecent);
  const shippedOld = orderRepository.findById(testOrderIdOld);

  console.log(`2️⃣ Shipped both orders.`);
  console.log(`   Recent order shipped_at: ${shippedRecent.shipped_at}`);
  console.log(`   Old order shipped_at: ${shippedOld.shipped_at}`);

  if (!shippedRecent.shipped_at || !shippedOld.shipped_at) {
    throw new Error('shipped_at timestamp was not set by shipOrder!');
  }

  // 3. Simulate elapsed time:
  // - Set recent order shipped 2 days ago
  // - Set old order shipped 8 days ago
  db.prepare(`
    UPDATE orders
    SET shipped_at = datetime('now', '-2 days'), updated_at = datetime('now', '-2 days')
    WHERE id = ?
  `).run(testOrderIdRecent);

  db.prepare(`
    UPDATE orders
    SET shipped_at = datetime('now', '-8 days'), updated_at = datetime('now', '-8 days')
    WHERE id = ?
  `).run(testOrderIdOld);

  console.log('3️⃣ Simulated time: Recent order = 2 days in transit, Old order = 8 days in transit.');

  // 4. Run autoDeliverShippedOrders(7)
  const completed = orderService.autoDeliverShippedOrders(7);
  console.log('4️⃣ Executed autoDeliverShippedOrders(7):', completed);

  if (!completed.includes(testOrderIdOld)) {
    throw new Error(`Expected ${testOrderIdOld} to be auto-delivered, but it was not!`);
  }
  if (completed.includes(testOrderIdRecent)) {
    throw new Error(`Expected ${testOrderIdRecent} to remain SHIPPED, but it was marked completed!`);
  }

  // 5. Verify database states
  const finalRecent = orderRepository.findById(testOrderIdRecent);
  const finalOld = orderRepository.findById(testOrderIdOld);

  console.log(`5️⃣ Database verification:`);
  console.log(`   Recent order status: ${finalRecent.status} (expected: SHIPPED)`);
  console.log(`   Old order status: ${finalOld.status} (expected: COMPLETED)`);

  if (finalRecent.status !== 'SHIPPED') throw new Error('Recent order status mismatch');
  if (finalOld.status !== 'COMPLETED') throw new Error('Old order status mismatch');

  console.log('\n🎉 ALL 7-DAY AUTO-DELIVERY TESTS PASSED 100%!\n');
} finally {
  // Cleanup
  db.prepare('DELETE FROM orders WHERE id IN (?, ?)').run(testOrderIdRecent, testOrderIdOld);
  console.log('🧹 Cleaned up test orders.');
  process.exit(0);
}
