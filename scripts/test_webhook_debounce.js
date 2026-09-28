/**
 * Test script for explicit shop request debounce & in-flight concurrency lock
 */
const { handleEvent } = require('../src/controllers/webhook.controller');
const messengerService = require('../src/services/messenger.service');

console.log('🧪 Starting Webhook "Open Shop" Debounce Verification...\n');

let sendCount = 0;
const originalSend = messengerService.sendExplicitShopResponse;
messengerService.sendExplicitShopResponse = async (psid, url) => {
  sendCount++;
  // Simulate network latency of 50ms
  await new Promise((r) => setTimeout(r, 50));
};

(async () => {
  const testPsid = 'DEBOUNCE_TEST_' + Date.now();

  const makeReq = () => ({
    body: {
      object: 'page',
      entry: [
        {
          messaging: [
            {
              sender: { id: testPsid },
              postback: { payload: 'OPEN_SHOP' },
            },
          ],
        },
      ],
    },
  });

  const res = {
    status: () => ({ send: () => {} }),
    sendStatus: () => {},
  };

  // 1. Simulate 3 rapid clicks concurrently (within milliseconds of each other)
  console.log('1️⃣ Sending 3 concurrent "Open Shop" requests...');
  await Promise.all([
    handleEvent(makeReq(), res),
    handleEvent(makeReq(), res),
    handleEvent(makeReq(), res),
  ]);

  console.log(`   Total responses sent: ${sendCount}`);
  if (sendCount !== 1) {
    throw new Error(`Expected exactly 1 response sent, got ${sendCount}`);
  }
  console.log('✅ Rapid multi-tap successfully debounced to 1 response!');

  // Restore original
  messengerService.sendExplicitShopResponse = originalSend;

  console.log('\n🎉 ALL WEBHOOK DEBOUNCE TESTS PASSED 100%!\n');
  process.exit(0);
})().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
