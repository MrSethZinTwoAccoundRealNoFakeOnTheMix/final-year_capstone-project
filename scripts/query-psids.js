#!/usr/bin/env node
/**
 * scripts/query-psids.js
 * 
 * Production-tested script to query Facebook Messenger PSIDs, Facebook names,
 * last customer interaction timestamps, and 24-hour messaging window status.
 *
 * Usage:
 *   node scripts/query-psids.js
 *   npm run query:psids
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { PAGE_TOKEN, APP_SECRET, BASE_URL } = require('../src/config');
const { generateSignedUrl } = require('../src/services/identity.service');

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

async function queryMessengerPSIDs() {
  if (!PAGE_TOKEN) {
    console.error('❌ Error: APP_SESSION_TOKEN / PAGE_TOKEN is missing in .env');
    process.exit(1);
  }

  // 1. Fetch Page ID from token debug endpoint or conversations
  let pageId = null;
  try {
    const debugUrl = `https://graph.facebook.com/debug_token?input_token=${PAGE_TOKEN}&access_token=${PAGE_TOKEN}`;
    const debugRes = await fetch(debugUrl);
    const debugData = await debugRes.json();
    if (debugData?.data?.profile_id) {
      pageId = debugData.data.profile_id;
    }
  } catch (_) {
    // Non-fatal, will fallback to filtering participants
  }

  // 2. Query all conversations with participants and recent messages
  const convUrl = `https://graph.facebook.com/v20.0/me/conversations?fields=id,updated_time,participants,messages.limit(10){id,created_time,from,message}&access_token=${PAGE_TOKEN}`;
  
  const convRes = await fetch(convUrl);
  const convData = await convRes.json();

  if (convData.error) {
    console.error('❌ Graph API Error:', convData.error.message);
    process.exit(1);
  }

  const conversations = convData.data || [];
  if (conversations.length === 0) {
    console.log('ℹ️ No Messenger conversations found on this Page.');
    return;
  }

  const now = Date.now();
  const summaryTable = [];

  for (const conv of conversations) {
    // Identify customer participant (skip page self-ID)
    const participants = conv.participants?.data || [];
    const customer = pageId
      ? participants.find((p) => p.id !== pageId)
      : participants[0];

    if (!customer) continue;

    const psid = customer.id;

    // Fetch individual profile details (name, first_name, last_name)
    let fbName = customer.name;
    try {
      const profileRes = await fetch(`https://graph.facebook.com/v20.0/${psid}?fields=name,first_name,last_name&access_token=${PAGE_TOKEN}`);
      const profile = await profileRes.json();
      if (profile.name) fbName = profile.name;
    } catch (_) {
      // Use name from conversation if individual fetch fails
    }

    // Determine the user's latest incoming message (window reset point)
    const messages = conv.messages?.data || [];
    const lastUserMessage = messages.find((m) => m.from && m.from.id === psid);
    
    // Use last user message timestamp if present, otherwise conversation updated_time
    const lastInteractionIso = lastUserMessage?.created_time || conv.updated_time;
    const lastInteractionMs = new Date(lastInteractionIso).getTime();
    const elapsedMs = Math.max(0, now - lastInteractionMs);

    const isExpired = elapsedMs > TWENTY_FOUR_HOURS_MS;
    const remainingMs = Math.max(0, TWENTY_FOUR_HOURS_MS - elapsedMs);
    const hoursRemaining = (remainingMs / (1000 * 60 * 60)).toFixed(1);
    const hoursElapsed = (elapsedMs / (1000 * 60 * 60)).toFixed(1);

    const signedUrl = generateSignedUrl(psid, BASE_URL);

    summaryTable.push({
      PSID: psid,
      'FB Name': fbName,
      '24h Status': isExpired ? '❌ Expired' : '🟢 Active',
      'Remaining': isExpired ? '0h (Blocked)' : `${hoursRemaining}h left`,
      'Last Seen': `${hoursElapsed}h ago`,
      'Signed Webview URL': signedUrl,
    });
  }

  console.log('\n=== Luxe Jewelry Messenger PSID Directory ===\n');
  console.table(summaryTable.map(({ 'Signed Webview URL': _, ...rest }) => rest));

  console.log('\n--- Direct Webview Links ---');
  summaryTable.forEach((row, i) => {
    console.log(`[${i + 1}] ${row['FB Name']} (${row.PSID}):\n    ${row['Signed Webview URL']}\n`);
  });
}

queryMessengerPSIDs().catch((err) => {
  console.error('Fatal error running query:', err);
  process.exit(1);
});
