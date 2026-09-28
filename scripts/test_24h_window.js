/**
 * Test suite for Meta 24-hour window tracking & safe shipping notifications
 */
const db = require('../src/db');
const orderRepository = require('../src/repositories/order.repository');
const messengerService = require('../src/services/messenger.service');
const orderService = require('../src/services/order.service');
const productRepository = require('../src/repositories/product.repository');

console.log('🧪 Starting 24h Messaging Window Verification...\n');

// 1. Test interaction recording
const testPsid = 'TEST_PSID_' + Date.now();
orderRepository.recordCustomerInteraction(testPsid, 'Test User');

const interaction = orderRepository.getCustomerInteraction(testPsid);
console.log('1️⃣ Customer Interaction Recorded:');
console.log('   PSID:', interaction.psid);
console.log('   First interaction:', interaction.first_interaction_at);
console.log('   Last interaction:', interaction.last_interaction_at);

if (!interaction.last_interaction_at) throw new Error('last_interaction_at not set');

// 2. Check isWithin24HourWindow
const isFresh = messengerService.isWithin24HourWindow(testPsid);
console.log('2️⃣ Is fresh interaction within 24h?', isFresh);
if (!isFresh) throw new Error('Fresh interaction should be within 24h');

// 3. Simulate an expired interaction (> 24h ago)
db.prepare(`
  UPDATE facebook_profiles
  SET last_interaction_at = datetime('now', '-25 hours')
  WHERE psid = ?
`).run(testPsid);

const isExpired = messengerService.isWithin24HourWindow(testPsid);
console.log('3️⃣ Is interaction 25 hours ago expired?', !isExpired);
if (isExpired) throw new Error('25h old interaction should be expired');

// 4. Test shipOrder with expired 24h window
const testProdId = 'TEST_RING_' + Date.now();
productRepository.upsert({
  id: testProdId,
  name: 'Test Ring',
  category: 'Rings',
  import_price: 10,
  sell_price: 30,
  stock: 5,
  photo_url: '',
});

const testOrderId = 'ORD-TEST-' + Date.now();
orderRepository.create({
  orderId: testOrderId,
  psid: testPsid,
  totalAmount: 30,
  customerName: 'Test Customer',
  phone: '012345678',
  address: 'Phnom Penh',
  items: [{ productId: testProdId, quantity: 1, unit_price: 30 }],
});

// Confirm order
orderRepository.confirmOrder(testOrderId);

// Ship order async
(async () => {
  const result = await orderService.shipOrder(testOrderId);
  console.log('4️⃣ Order shipped result:');
  console.log('   Order Status:', result.status);
  console.log('   Notification sent:', result.notification.sent);
  console.log('   Notification reason:', result.notification.reason);

  if (result.status !== 'SHIPPED') throw new Error('Order should be marked as SHIPPED');
  if (result.notification.sent !== false) throw new Error('Notification should NOT be sent');
  if (result.notification.reason !== 'WINDOW_EXPIRED') throw new Error('Reason should be WINDOW_EXPIRED');

  // Verify findById returns interaction timestamps
  const foundOrder = orderRepository.findById(testOrderId);
  console.log('5️⃣ Order from DB has interaction timestamp:');
  console.log('   last_interaction_at:', foundOrder.last_interaction_at);
  if (!foundOrder.last_interaction_at) throw new Error('Order must include last_interaction_at');

  // Cleanup
  db.prepare('DELETE FROM orders WHERE id = ?').run(testOrderId);
  db.prepare('DELETE FROM order_items WHERE order_id = ?').run(testOrderId);
  db.prepare('DELETE FROM products WHERE id = ?').run(testProdId);
  db.prepare('DELETE FROM facebook_profiles WHERE psid = ?').run(testPsid);

  console.log('\n🎉 ALL 24-HOUR WINDOW & SAFE SHIPPING TESTS PASSED 100%!\n');
  process.exit(0);
})().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
