// src/app/api/twilio/handle-ivr-response/route.ts
'use server';
import { type NextRequest, NextResponse } from 'next/server';
import Twilio from 'twilio';
import { collectCallerInformation, CollectCallerInformationInput, CollectCallerInformationOutput } from '@/ai/flows/collect-caller-information';
import { verifyCallerResponses, VerifyCallerResponsesInput, VerifyCallerResponsesOutput } from '@/ai/flows/verify-caller-responses';

export async function POST(request: NextRequest) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const googleApiKey = process.env.GOOGLE_API_KEY;

  const VoiceResponse = Twilio.twiml.VoiceResponse;
  const twiml = new VoiceResponse();

  if (!accountSid || !authToken) {
    console.error('Twilio Account SID or Auth Token is not configured.');
    twiml.say('Server configuration error. Please contact support.');
    twiml.hangup();
    return new NextResponse(twiml.toString(), { headers: { 'Content-Type': 'text/xml' }, status: 500 });
  }

  if (!googleApiKey) {
    console.error('Google API Key is not configured.');
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
    const warningMessage = `Twilio signature validation failed for IVR response at URL: ${fullUrl}.`;
    console.warn(warningMessage);
    if (process.env.NODE_ENV === 'production') {
      twiml.say('An error occurred. Please try again.');
      twiml.hangup();
      return new NextResponse(twiml.toString(), { headers: { 'Content-Type': 'text/xml' }, status: 403 });
    }
  }

  const speechResult = params.SpeechResult; // Transcribed text from the caller
  const confidence = params.Confidence ? parseFloat(params.Confidence) : 0;

  if (!speechResult) {
    twiml.say('Sorry, I couldn\'t hear what you said. Please try calling again.');
    twiml.hangup();
    return new NextResponse(twiml.toString(), { headers: { 'Content-Type': 'text/xml' } });
  }

  console.log(`Received speech: "${speechResult}" with confidence: ${confidence}`);

  try {
    const collectionInput: CollectCallerInformationInput = { callTranscript: speechResult };
    const collectedInfo: CollectCallerInformationOutput = await collectCallerInformation(collectionInput);

    if (collectedInfo.readyForHuman && collectedInfo.name && collectedInfo.age > 0) {
      twiml.say(`Thanks, I have your name as ${collectedInfo.name} and age as ${collectedInfo.age}. Let me verify this.`);
      
      const verificationInput: VerifyCallerResponsesInput = {
        name: collectedInfo.name,
        age: String(collectedInfo.age), // Schema expects string
      };
      const verificationInfo: VerifyCallerResponsesOutput = await verifyCallerResponses(verificationInput);

      if (verificationInfo.isValid) {
        twiml.say('Great! Your information has been verified. We will now connect you to an available agent.');
        // In a real scenario, you'd use <Dial> here to connect to an agent/queue.
        // For now, we'll just hang up.
        // Example: const dial = twiml.dial(); dial.client('some_agent_id');
      } else {
        twiml.say(`Sorry, we couldn't verify your information. Reason: ${verificationInfo.reason}. Please try calling again later.`);
      }
    } else {
      twiml.say('Sorry, I couldn\'t quite get all your details. Please try calling again and clearly state your name and age.');
    }
  } catch (error: any) {
    console.error('AI processing error:', error);
    twiml.say('There was an issue processing your request with our AI. Please try again later.');
  }

  twiml.hangup();
  return new NextResponse(twiml.toString(), {
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}
