// src/app/api/twilio/voice/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import Twilio from 'twilio';

export async function POST(request: NextRequest) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    console.error('Twilio Account SID or Auth Token is not configured in .env file.');
    return new NextResponse('Server configuration error: Twilio credentials missing.', { status: 500 });
  }

  const twilioSignature = request.headers.get('X-Twilio-Signature');
  const fullUrl = request.url; 

  const formData = await request.formData();
  const params: Record<string, string | undefined> = {};
  formData.forEach((value, key) => {
    if (typeof value === 'string') {
      params[key] = value;
    }
  });
  
  const validParams: Record<string, string> = {};
  for (const key in params) {
    if (typeof params[key] === 'string') {
      validParams[key] = params[key] as string;
    }
  }

  let isValidRequest = false;
  if (twilioSignature) {
    try {
        // Ensure the host in fullUrl matches what Twilio expects for validation, especially if behind proxies.
        // For Firebase Studio, the original request URL should be fine.
        isValidRequest = Twilio.validateRequest(authToken, twilioSignature, fullUrl, validParams);
    } catch (e) {
        console.error("Error during Twilio validation:", e);
        isValidRequest = false; // Treat validation error as invalid request
    }
  }

  if (!isValidRequest) {
    const warningMessage = `Twilio signature validation failed for URL: ${fullUrl}. Request might be spoofed or misconfigured.`;
    console.warn(warningMessage);
    console.warn('Received signature:', twilioSignature);
    console.warn('Received params for validation:', validParams);
    if (process.env.NODE_ENV === 'production') {
      return new NextResponse('Invalid Twilio signature.', { status: 403 });
    }
  }

  const VoiceResponse = Twilio.twiml.VoiceResponse;
  const twiml = new VoiceResponse();

  const gather = twiml.gather({
    input: 'speech', // Expect speech input
    action: '/api/twilio/handle-ivr-response', // Send the result to this new endpoint
    method: 'POST',
    speechTimeout: 'auto', // Let Twilio decide when the user stops speaking
    speechModel: 'experimental_conversations', // Use a model suited for conversational speech
    profanityFilter: true,
  });
  gather.say('Hello! Welcome to our AI powered call router. To get started, please tell me your full name and age.');

  // If <Gather> times out or no input is received
  twiml.say("Sorry, I didn't catch that. Please try calling again.");
  twiml.hangup();

  return new NextResponse(twiml.toString(), {
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}
