const { URLSearchParams } = require('url');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// --- Configuration ---
const FROM_NUMBER = '+15551113333';
const TO_NUMBER = '+15554445555';
const FIRST_UTTERANCE = 'My name is Samantha.';
const SECOND_UTTERANCE = 'I am 42 years old.';

// --- Logger Setup ---
const logDirectory = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}
const logFileName = `test-run-multi-turn-${new Date().toISOString().replace(/:/g, '-')}.log`;
const logFilePath = path.join(logDirectory, logFileName);

function log(message) {
  console.log(message);
  fs.appendFileSync(logFilePath, `${new Date().toISOString()} - ${message}\n\n`);
}

async function getNgrokUrl() {
  log('Attempting to fetch ngrok URL from http://127.0.0.1:4040/api/tunnels');
  try {
    const response = await fetch('http://127.0.0.1:4040/api/tunnels');
    log('Fetch call completed. Response status: ' + response.status);

    if (!response.ok) {
      const errorText = await response.text();
      log('Ngrok API responded with non-OK status. Body: ' + errorText);
      throw new Error(`Ngrok API responded with status: ${response.status}`);
    }

    const data = await response.json();
    log('Successfully parsed JSON response from ngrok API.');
    const httpsTunnel = data.tunnels.find(tunnel => tunnel.proto === 'https');

    if (!httpsTunnel) {
      log('Could not find an HTTPS tunnel in the ngrok API response.');
      log('Full response data: ' + JSON.stringify(data, null, 2));
      throw new Error('No HTTPS tunnel found. Is `npm run dev` running?');
    }

    log('Found HTTPS tunnel: ' + httpsTunnel.public_url);
    return httpsTunnel.public_url;

  } catch (error) {
    log('❌ An error occurred inside getNgrokUrl. Details: ' + error.toString());
    if (error.cause) {
        log('Error Cause: ' + JSON.stringify(error.cause, null, 2));
    }
    // Use console.error for the final user-facing message
    console.error('❌ Error fetching ngrok URL. See detailed log file for more info: ' + logFilePath);
    process.exit(1);
  }
}

async function runTest() {
  const BASE_URL = await getNgrokUrl();
  // const BASE_URL = 'https://127.0.0.1:9003';
  log(`🚀 Starting MULTI-TURN call simulation for base URL: ${BASE_URL}`);
  const callSid = `CA_test_multi_${Date.now()}`;

  try {
    // --- Test Setup: Reset Agent Statuses ---
    log('--- Test Setup: Resetting all agent statuses to "available" ---');
    const { count } = await prisma.agent.updateMany({
      data: { status: 'available' },
    });
    log(`✅ Reset status for ${count} agent(s).`);

    // --- Step 1: Simulate Incoming Call ---
    log('--- Step 1: Simulating incoming call ---');
    const incomingCallParams = new URLSearchParams({ CallSid: callSid, From: FROM_NUMBER, To: TO_NUMBER });
    const incomingCallResponse = await fetch(`${BASE_URL}/api/twilio/incoming-call`, { method: 'POST', body: incomingCallParams });
    const incomingCallTwiML = await incomingCallResponse.text();
    log(`✅ Received TwiML:\n${incomingCallTwiML}`);
    if (!incomingCallTwiML.includes('<Gather')) throw new Error('Step 1 Failed: TwiML did not include <Gather>.');

    // --- Step 2: First Response (Name Only) ---
    log('--- Step 2: Simulating FIRST speech result (name only) ---');
    log(`💬 Sending utterance: "${FIRST_UTTERANCE}"`);
    const gatherParams1 = new URLSearchParams({ CallSid: callSid, SpeechResult: FIRST_UTTERANCE, Confidence: '0.98' });
    const gatherResponse1 = await fetch(`${BASE_URL}/api/twilio/gather`, { method: 'POST', body: gatherParams1 });
    const gatherTwiML1 = await gatherResponse1.text();
    log(`✅ Received TwiML:\n${gatherTwiML1}`);
    if (!gatherTwiML1.includes('<Gather')) {
      throw new Error("Step 2 Failed: TwiML did not include <Gather> to ask for more info.");
    }
    
    // Extract the conversation from the Gather action URL
    const gatherActionMatch = gatherTwiML1.match(/<Gather.*?action="[^"]+\?conversation=([^"]+)"/);
    if (!gatherActionMatch || !gatherActionMatch[1]) {
      throw new Error("Step 2 Failed: Could not extract conversation history from <Gather> action.");
    }
    const conversation = decodeURIComponent(gatherActionMatch[1]);
    log(`✅ Extracted conversation history: "${conversation}"`);


    // --- Step 3: Second Response (Age) ---
    log('--- Step 3: Simulating SECOND speech result (age) ---');
    log(`💬 Sending utterance: "${SECOND_UTTERANCE}"`);
    const gatherParams2 = new URLSearchParams({ 
        CallSid: callSid, 
        SpeechResult: SECOND_UTTERANCE, 
        Confidence: '0.96',
        conversation: conversation, // Pass the history back
    });
    const gatherResponse2 = await fetch(`${BASE_URL}/api/twilio/gather`, { method: 'POST', body: gatherParams2 });
    const gatherTwiML2 = await gatherResponse2.text();
    log(`✅ Received TwiML:\n${gatherTwiML2}`);
    if (!gatherTwiML2.includes('<Dial')) throw new Error('Step 3 Failed: TwiML did not include <Dial> verb.');
    log('✅ TwiML contains <Dial> verb as expected.');

    // --- Step 4: Simulate Call Cleanup ---
    log('--- Step 4: Simulating call cleanup ---');
    const dialActionMatch = gatherTwiML2.match(/<Dial.*?action="[^"]+\?agentId=([^"]+)"/);
    if (!dialActionMatch || !dialActionMatch[1]) {
      throw new Error("Step 4 Failed: Could not extract agentId from <Dial> action.");
    }
    const agentId = dialActionMatch[1];
    log(`📞 Simulating end of call for agent: ${agentId}`);

    const cleanupParams = new URLSearchParams({ 
      CallSid: callSid, 
      DialCallStatus: 'completed' 
    });
    const cleanupResponse = await fetch(`${BASE_URL}/api/twilio/dial-status?agentId=${agentId}`, { method: 'POST', body: cleanupParams });
    if (!cleanupResponse.ok) {
      throw new Error(`Step 4 Failed: Dial status webhook returned status ${cleanupResponse.status}`);
    }
    log(`✅ Agent status reset successfully.`);


    log('🎉 Multi-turn simulation finished successfully!');

  } catch (error) {
    log(`\n❌ Simulation Failed: ${error.message}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    log('🔌 Prisma client disconnected.');
  }
}

runTest(); 