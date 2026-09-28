/**
 * Test script for explicit shop request debounce & in-flight concurrency lock
 */
const { handleEvent } = require('../src/controllers/webhook.controller');
const messengerService = require('../src/services/messenger.service');

console.log('🧪 Starting Webhook "Open Shop" Debounce Verification...\n');

let shopSendCount = 0;
let greetingSendCount = 0;
const originalShopSend = messengerService.sendExplicitShopResponse;
const originalGreetingSend = messengerService.sendLightweightGreeting;

messengerService.sendExplicitShopResponse = async (psid, url) => {
  shopSendCount++;
  // Simulate network latency of 50ms
  await new Promise((r) => setTimeout(r, 50));
};

messengerService.sendLightweightGreeting = async (psid) => {
  greetingSendCount++;
  await new Promise((r) => setTimeout(r, 20));
};

(async () => {
  const testPsid = 'DEBOUNCE_TEST_' + Date.now();

  const makeShopReq = () => ({
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

  const makeGreetingReq = (text = 'hi') => ({
    body: {
      object: 'page',
      entry: [
        {
          messaging: [
            {
              sender: { id: testPsid },
              message: { text },
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

  // 1. Customer says "hi" -> lightweight greeting
  console.log('1️⃣ Customer sends "hi"...');
  await handleEvent(makeGreetingReq('hi'), res);
  if (greetingSendCount !== 1) {
    throw new Error(`Expected greeting count 1, got ${greetingSendCount}`);
  }
  console.log('✅ Lightweight greeting sent!');

  // 2. Customer immediately taps "OPEN_SHOP" quick reply pill (<1 sec after "hi")
  console.log('2️⃣ Customer immediately taps "Open Shop" quick reply pill...');
  await handleEvent(makeShopReq(), res);
  if (shopSendCount !== 1) {
    throw new Error(`Expected shop response count 1, got ${shopSendCount}. Bug: greeting blocked explicit shop request!`);
  }
  console.log('✅ Explicit shop response sent immediately after greeting (not blocked by greeting timestamp)!');

  // 3. Customer accidentally taps 3 times in rapid succession (concurrent) on a fresh session
  console.log('3️⃣ Customer rapidly clicks "Open Shop" 3 times concurrently...');
  const multiTapPsid = 'RAPID_TAP_' + Date.now();
  const makeMultiTapReq = () => ({
    body: {
      object: 'page',
      entry: [
        {
          messaging: [
            {
              sender: { id: multiTapPsid },
              postback: { payload: 'OPEN_SHOP' },
            },
          ],
        },
      ],
    },
  });

  const shopBeforeMultiTap = shopSendCount;
  await Promise.all([
    handleEvent(makeMultiTapReq(), res),
    handleEvent(makeMultiTapReq(), res),
    handleEvent(makeMultiTapReq(), res),
  ]);

  const multiTapSent = shopSendCount - shopBeforeMultiTap;
  console.log(`   Rapid multi-tap responses sent: ${multiTapSent}`);
  if (multiTapSent !== 1) {
    throw new Error(`Expected exactly 1 response sent for rapid multi-tap, got ${multiTapSent}`);
  }
  console.log('✅ Rapid multi-tap successfully debounced to 1 response!');

  // 4. Verify that after 2.6 seconds, another shop request is accepted
  console.log('4️⃣ Waiting 2.6s to verify debounce expiration...');
  await new Promise((r) => setTimeout(r, 2600));
  await handleEvent(makeMultiTapReq(), res);
  const afterCooldownSent = shopSendCount - shopBeforeMultiTap;
  if (afterCooldownSent !== 2) {
    throw new Error(`Expected total 2 responses after cooldown, got ${afterCooldownSent}`);
  }
  console.log('✅ Shop request successfully allowed after 2.5s debounce expires!');

  // Restore originals
  messengerService.sendExplicitShopResponse = originalShopSend;
  messengerService.sendLightweightGreeting = originalGreetingSend;

  console.log('\n🎉 ALL WEBHOOK DEBOUNCE & GREETING TESTS PASSED 100%!\n');
  process.exit(0);
})().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

