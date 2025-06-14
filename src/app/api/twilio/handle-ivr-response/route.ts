
// src/app/api/twilio/handle-ivr-response/route.ts
'use server';
import { type NextRequest, NextResponse } from 'next/server';
import Twilio from 'twilio';
import { collectCallerInformation, CollectCallerInformationInput, CollectCallerInformationOutput } from '@/ai/flows/collect-caller-information';
import { verifyCallerResponses, VerifyCallerResponsesInput, VerifyCallerResponsesOutput } from '@/ai/flows/verify-caller-responses';

export async function POST(request: NextRequest) {
  console.log('Attempting to handle /api/twilio/handle-ivr-response');

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const googleApiKey = process.env.GOOGLE_API_KEY;

  console.log(`TWILIO_ACCOUNT_SID is present: ${!!accountSid}`);
  console.log(`TWILIO_AUTH_TOKEN is present: ${!!authToken}`);
  console.log(`GOOGLE_API_KEY is present: ${!!googleApiKey}`);
  
  const VoiceResponse = Twilio.twiml.VoiceResponse;
  const twiml = new VoiceResponse();

  if (!accountSid || !authToken) {
    console.error('Critical Error: Twilio Account SID or Auth Token is not configured in .env file or not loaded. Please check configuration and restart the server.');
    twiml.say('Server configuration error. Please contact support.');
    twiml.hangup();
    return new NextResponse(twiml.toString(), { headers: { 'Content-Type': 'text/xml' }, status: 500 });
  }

  if (!googleApiKey) {
    console.error('Critical Error: Google API Key (GOOGLE_API_KEY) is not configured in .env file or not loaded. Please check configuration and restart the server.');
    twiml.say('AI services are temporarily unavailable. Please try again later.');
    twiml.hangup();
    return new NextResponse(twiml.toString(), { headers: { 'Content-Type': 'text/xml' }, status: 500 });
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
        isValidRequest = Twilio.validateRequest(authToken, twilioSignature, fullUrl, validParams);
    } catch (e) {
        console.error("Error during Twilio validation:", e);
        isValidRequest = false; 
    }
  }

  if (!isValidRequest) {
    const warningMessage = `Twilio signature validation failed for IVR response at URL: ${fullUrl}. This might be due to proxying in cloud IDEs.`;
    console.warn(warningMessage);
    if (process.env.NODE_ENV === 'production') {
      twiml.say('An error occurred with request validation. Please try again.');
      twiml.hangup();
      return new NextResponse(twiml.toString(), { headers: { 'Content-Type': 'text/xml' }, status: 403 });
    } else {
      console.warn('Proceeding with request despite Twilio signature validation failure (NODE_ENV is not production).');
    }
  }

  const speechResult = params.SpeechResult; 
  const confidence = params.Confidence ? parseFloat(params.Confidence) : 0;

  if (!speechResult) {
    console.log('No SpeechResult parameter received from Twilio.');
    twiml.say('Sorry, I couldn\'t hear what you said. Please try calling again.');
    twiml.hangup();
    return new NextResponse(twiml.toString(), { headers: { 'Content-Type': 'text/xml' } });
  }

  console.log(`Received speech from Twilio: "${speechResult}" (Confidence: ${confidence})`);

  try {
    console.log('Starting AI processing of speech result...');
    const collectionInput: CollectCallerInformationInput = { callTranscript: speechResult };
    const collectedInfo: CollectCallerInformationOutput = await collectCallerInformation(collectionInput);
    console.log('AI Information Collection result:', JSON.stringify(collectedInfo, null, 2));

    if (collectedInfo.readyForHuman && collectedInfo.name && collectedInfo.age > 0) {
      twiml.say(`Thanks, I have your name as ${collectedInfo.name} and age as ${collectedInfo.age}. Let me verify this.`);
      
      const verificationInput: VerifyCallerResponsesInput = {
        name: collectedInfo.name,
        age: String(collectedInfo.age), 
      };
      console.log('Attempting AI response verification with input:', JSON.stringify(verificationInput, null, 2));
      const verificationInfo: VerifyCallerResponsesOutput = await verifyCallerResponses(verificationInput);
      console.log('AI Verification result:', JSON.stringify(verificationInfo, null, 2));

      if (verificationInfo.isValid) {
        twiml.say('Great! Your information has been verified. We will now connect you to an available agent.');
        // For now, we'll just hang up.
      } else {
        twiml.say(`Sorry, we couldn't verify your information. Reason: ${verificationInfo.reason}. Please try calling again later.`);
      }
    } else {
      console.log('AI determined information was not sufficient or not ready for human agent.');
      twiml.say('Sorry, I couldn\'t quite get all your details. Please try calling again and clearly state your name and age.');
    }
  } catch (error: any) {
    console.error('Unhandled error during AI processing in /api/twilio/handle-ivr-response:', error);
    twiml.say('There was an unexpected issue processing your request with our AI system. Please try again later.');
    twiml.hangup();
    return new NextResponse(twiml.toString(), { headers: { 'Content-Type': 'text/xml' }, status: 500 });
  }

  twiml.hangup();
  return new NextResponse(twiml.toString(), {
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}
