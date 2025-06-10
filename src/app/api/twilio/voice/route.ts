// src/app/api/twilio/voice/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import Twilio from 'twilio'; // Using 'Twilio' with a capital 'T' for the namespace/constructor

export async function POST(request: NextRequest) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    console.error('Twilio Account SID or Auth Token is not configured in .env file.');
    return new NextResponse('Server configuration error: Twilio credentials missing.', { status: 500 });
  }

  const twilioSignature = request.headers.get('X-Twilio-Signature');
  
  // The URL for validation should be the full URL Twilio is configured to POST to.
  // For local dev, this would be your ngrok URL.
  const fullUrl = request.url; // This is the URL of the current request.

  // Twilio sends data as x-www-form-urlencoded. Parse it.
  const formData = await request.formData();
  const params: Record<string, string | undefined> = {}; // Allow undefined for params
    formData.forEach((value, key) => {
    if (typeof value === 'string') {
      params[key] = value;
    } else {
      // Handle File case if necessary, or ensure only string values are expected.
      // For typical Twilio webhooks, values are strings.
      params[key] = undefined; // Or skip, or log a warning
    }
  });
  
  // Ensure params are Record<string, string> for validateRequest by filtering out undefined
  const validParams: Record<string, string> = {};
  for (const key in params) {
    if (typeof params[key] === 'string') {
      validParams[key] = params[key] as string;
    }
  }


  // Validate the request
  // In production, you should strictly enforce validation.
  // During development, if validation fails, log a warning but proceed to allow easier testing,
  // especially if ngrok URL or signature validation isn't perfectly set up yet.
  let isValidRequest = false;
  if (twilioSignature) {
    isValidRequest = Twilio.validateRequest(authToken, twilioSignature, fullUrl, validParams);
  }

  if (!isValidRequest) {
    const warningMessage = 'Twilio signature validation failed. Request might be spoofed or misconfigured (e.g., ngrok URL).';
    console.warn(warningMessage);
    if (process.env.NODE_ENV === 'production') {
      return new NextResponse('Invalid Twilio signature.', { status: 403 });
    }
    // In development, we log the warning but proceed.
  }

  const VoiceResponse = Twilio.twiml.VoiceResponse;
  const twiml = new VoiceResponse();

  twiml.say('Hello from your AI Call Router. We are currently setting up. Goodbye.');
  twiml.hangup();

  return new NextResponse(twiml.toString(), {
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}
