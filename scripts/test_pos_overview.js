/**
 * Verification test for POS sales & stock persistence
 */
const db = require('../src/db');
const posRepository = require('../src/repositories/pos.repository');
const productRepository = require('../src/repositories/product.repository');

console.log('🧪 Starting POS Quick Sell & Overview verification test...\n');

// 1. Create a test product
const testProdId = 'POS-TEST-' + Date.now();
productRepository.upsert({
  id: testProdId,
  name: 'POS Test Diamond Ring',
  category: 'Rings',
  import_price: 50,
  sell_price: 120,
  stock: 10,
  photo_url: '',
  has_variants: false,
});

const initialProd = productRepository.findById(testProdId);
console.log(`1️⃣ Created test product ${testProdId} with stock: ${initialProd.stock}`);
if (initialProd.stock !== 10) throw new Error('Initial stock mismatch');

// 2. Perform POS Checkout via posRepository
const sale = posRepository.createSale({
  payment_method: 'CASH',
  items: [
    {
      productId: testProdId,
      name: 'POS Test Diamond Ring',
      qty: 2,
      price: 120,
    }
  ],
});

console.log(`2️⃣ Created POS sale ${sale.id}:`);
console.log(`   Total amount: $${sale.total_amount}`);
console.log(`   Total cost: $${sale.total_cost}`);
console.log(`   Item count: ${sale.item_count}`);

const afterSaleProd = productRepository.findById(testProdId);
console.log(`   Stock after sale: ${afterSaleProd.stock} (expected: 8)`);
if (afterSaleProd.stock !== 8) throw new Error('Stock deduction mismatch');
if (sale.total_amount !== 240) throw new Error('Total amount mismatch');
if (sale.total_cost !== 100) throw new Error('Total cost mismatch');

// 3. Verify in pos_sales and pos_sale_items
const foundSale = posRepository.findById(sale.id);
console.log(`3️⃣ Retrieved sale from database:`);
console.log(`   Sale status: ${foundSale.status}`);
console.log(`   Attached items: ${foundSale.items.length}`);
if (foundSale.items.length !== 1) throw new Error('Items attachment mismatch');
if (foundSale.items[0].quantity !== 2) throw new Error('Item quantity mismatch');

// 4. Test Undo / Restock
console.log(`4️⃣ Testing Undo / Restock:`);
const undoResult = posRepository.undoSale(sale.id);
console.log(`   Undo result:`, undoResult);

const afterUndoProd = productRepository.findById(testProdId);
console.log(`   Stock after undo: ${afterUndoProd.stock} (expected: 10)`);
if (afterUndoProd.stock !== 10) throw new Error('Stock restoration mismatch');

// 5. Cleanup
db.prepare('DELETE FROM pos_sale_items WHERE sale_id = ?').run(sale.id);
db.prepare('DELETE FROM pos_sales WHERE id = ?').run(sale.id);
db.prepare('DELETE FROM products WHERE id = ?').run(testProdId);
console.log('5️⃣ Cleaned up test data.');

console.log('\n🎉 ALL POS & OVERVIEW TESTS PASSED SUCCESSFULLY!\n');
