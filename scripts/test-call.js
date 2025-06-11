const { URLSearchParams } = require('url');

// --- Configuration ---
const FROM_NUMBER = '+15551112222';
const TO_NUMBER = '+15553334444';

// The simulated speech from the "caller"
const SIMULATED_SPEECH = 'My name is John Doe and I am thirty years old.';

/**
 * Fetches the public ngrok URL from the local ngrok agent API.
 * @returns {Promise<string>} The public https ngrok URL.
 */
async function getNgrokUrl() {
  try {
    // The ngrok agent exposes a local API that we can query to get the public URL
    const response = await fetch('http://127.0.0.1:4040/api/tunnels');
    if (!response.ok) {
      throw new Error(`Ngrok API responded with status: ${response.status}`);
    }
    const data = await response.json();
    const httpsTunnel = data.tunnels.find(tunnel => tunnel.proto === 'https');

    if (!httpsTunnel) {
      throw new Error('No HTTPS tunnel found. Is `npm run dev` running in another terminal?');
    }
    return httpsTunnel.public_url;

  } catch (error) {
    console.error('❌ Error fetching ngrok URL:', error.message);
    console.error('   Please make sure the dev server is running.');
    process.exit(1);
  }
}

async function runTest() {
  const BASE_URL = await getNgrokUrl();

  console.log(`🚀 Starting call simulation for base URL: ${BASE_URL}`);

  try {
    // --- Step 1: Simulate Incoming Call ---
    console.log('\n--- Step 1: Simulating incoming call to /api/twilio/incoming-call ---');
    const callSid = `CA_test_${Date.now()}`;
    
    const incomingCallParams = new URLSearchParams({
      CallSid: callSid,
      From: FROM_NUMBER,
      To: TO_NUMBER,
    });

    const incomingCallResponse = await fetch(`${BASE_URL}/api/twilio/incoming-call`, {
      method: 'POST',
      body: incomingCallParams,
    });

    const incomingCallTwiML = await incomingCallResponse.text();
    console.log('✅ Received TwiML Response:');
    console.log(incomingCallTwiML);

    if (!incomingCallTwiML.includes('<Gather')) {
      throw new Error('Test Failed: TwiML response did not include <Gather> verb.');
    }

    // --- Step 2: Simulate Speech Gather ---
    console.log('\n--- Step 2: Simulating speech result to /api/twilio/gather ---');
    const gatherParams = new URLSearchParams({
      CallSid: callSid,
      SpeechResult: SIMULATED_SPEECH,
      Confidence: '0.95',
    });

    const gatherResponse = await fetch(`${BASE_URL}/api/twilio/gather`, {
      method: 'POST',
      body: gatherParams,
    });

    const gatherTwiML = await gatherResponse.text();
    console.log('✅ Received TwiML Response:');
    console.log(gatherTwiML);

    if (!gatherTwiML.includes('Thank you')) {
        throw new Error('Test Failed: TwiML did not include expected "Thank you" confirmation.');
    }

    console.log('\n🎉 Simulation finished successfully!');

  } catch (error) {
    console.error('\n❌ Simulation Failed:', error.message);
    process.exit(1);
  }
}

runTest();
