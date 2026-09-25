const db = require('../src/db');
const categoryRepository = require('../src/repositories/category.repository');
const productRepository = require('../src/repositories/product.repository');
const variantRepository = require('../src/repositories/variant.repository');
const adminController = require('../src/controllers/admin.controller');

async function testAll() {
  console.log('🧪 Starting Automated Redesign Verification...\n');

  // 1. Categories
  console.log('1️⃣ Testing Dynamic Categories:');
  const initialCats = categoryRepository.findAll();
  console.log(`- Found ${initialCats.length} categories.`);
  
  const testCatName = 'Test-Cat-' + Date.now();
  const createdCat = categoryRepository.create(testCatName);
  console.log(`- Created category: "${createdCat.name}" with prefix "${createdCat.prefix}"`);
  
  const fetchedCat = categoryRepository.findByName(testCatName);
  if (!fetchedCat) throw new Error('Category not found after create!');
  console.log('✅ Category creation & retrieval successful.');

  // 2. Standalone Product (Default stock 1, auto-prefix)
  console.log('\n2️⃣ Testing Standalone Product:');
  const sku1 = productRepository.upsert({
    category: testCatName,
    name: 'Standalone Test Hairpin',
    import_price: 3.5,
    sell_price: 10.0,
    stock: 1, // Default 1
    photo_url: 'https://example.com/standalone.jpg',
    has_variants: 0
  });
  console.log(`- Created standalone product: ${sku1}`);
  const p1 = productRepository.findById(sku1);
  if (p1.stock !== 1) throw new Error(`Expected stock 1, got ${p1.stock}`);
  if (p1.has_variants !== 0) throw new Error('Expected has_variants = 0');
  console.log('✅ Standalone product created with stock = 1.');

  // 3. Multi-Variant Product (SPU + SKU container model)
  console.log('\n3️⃣ Testing SPU + SKU Product Container with Variants:');
  const sku2 = productRepository.upsert({
    category: testCatName,
    name: 'Luxury Velvet Brooch Collection',
    import_price: 5.0,
    sell_price: 15.0,
    stock: 3, // 1 + 2 = 3
    photo_url: 'https://example.com/cover.jpg',
    has_variants: 1
  });
  console.log(`- Created container product: ${sku2}`);

  // Insert variants
  const variants = [
    { color_name: 'Crimson Red', import_price: 5.0, sell_price: 15.0, stock: 1, photo_url: 'https://example.com/red.jpg' },
    { color_name: 'Royal Blue', import_price: 5.0, sell_price: 15.0, stock: 2, photo_url: 'https://example.com/blue.jpg' }
  ];
  variantRepository.replaceForProduct(sku2, variants);
  const p2 = productRepository.findById(sku2);
  console.log(`- Attached variants. Total parent stock: ${p2.stock}, Variant count: ${p2.variant_list.length}`);
  if (p2.stock !== 3) throw new Error(`Expected parent stock 3, got ${p2.stock}`);
  if (p2.variant_list.length !== 2) throw new Error(`Expected 2 variants, got ${p2.variant_list.length}`);
  console.log('✅ Product container & child variants properly synchronized.');

  // 4. Quick Sell Deduct on Variant via Controller (Simulating Client API call)
  console.log('\n4️⃣ Testing Quick Sell Deduction via Admin Controller (String ID):');
  const redVariant = p2.variant_list.find(v => v.color_name === 'Crimson Red');
  console.log(`- Calling quickSellDeduct with variant ID "${redVariant.id}"`);

  let deductRes = null;
  const mockReq = { params: { id: sku2 }, body: { variant_id: redVariant.id } };
  const mockRes = {
    status: (code) => mockRes,
    json: (data) => { deductRes = data; return mockRes; }
  };

  adminController.quickSellDeduct(mockReq, mockRes, (err) => { throw err; });
  if (!deductRes || !deductRes.success) throw new Error('quickSellDeduct failed!');
  console.log(`- quickSellDeduct returned:`, deductRes);

  const p2AfterDeduct = productRepository.findById(sku2);
  const redAfter = p2AfterDeduct.variant_list.find(v => v.color_name === 'Crimson Red');
  console.log(`- Variant stock now: ${redAfter.stock}, Parent total stock now: ${p2AfterDeduct.stock}`);
  if (redAfter.stock !== 0) throw new Error(`Expected variant stock 0, got ${redAfter.stock}`);
  if (p2AfterDeduct.stock !== 2) throw new Error(`Expected parent stock 2, got ${p2AfterDeduct.stock}`);
  console.log('✅ Quick Sell variant deduction & parent stock sync via controller successful.');

  // 5. Quick Sell Restock / Undo via Controller
  console.log('\n5️⃣ Testing Quick Sell Restock / Undo via Admin Controller:');
  let restockRes = null;
  const mockRestockReq = { params: { id: sku2 }, body: { variant_id: redVariant.id } };
  const mockRestockRes = {
    status: (code) => mockRestockRes,
    json: (data) => { restockRes = data; return mockRestockRes; }
  };

  adminController.quickSellRestock(mockRestockReq, mockRestockRes, (err) => { throw err; });
  if (!restockRes || !restockRes.success) throw new Error('quickSellRestock failed!');
  console.log(`- quickSellRestock returned:`, restockRes);

  const p2AfterRestock = productRepository.findById(sku2);
  const redRestocked = p2AfterRestock.variant_list.find(v => v.color_name === 'Crimson Red');
  console.log(`- Restocked! Variant stock: ${redRestocked.stock}, Parent total stock: ${p2AfterRestock.stock}`);
  if (redRestocked.stock !== 1) throw new Error(`Expected variant stock 1, got ${redRestocked.stock}`);
  if (p2AfterRestock.stock !== 3) throw new Error(`Expected parent stock 3, got ${p2AfterRestock.stock}`);
  console.log('✅ Quick Sell restock / undo successful.');

  // 6. Cleanup test records
  console.log('\n6️⃣ Cleanup:');
  productRepository.remove(sku1);
  productRepository.remove(sku2);
  categoryRepository.remove(fetchedCat.id);
  console.log('✅ Cleanup completed cleanly.');

  console.log('\n🎉 ALL INTEGRATION TESTS PASSED 100%!\n');
}

testAll().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
