import twilio from 'twilio';
import type { Twilio } from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
  throw new Error('Twilio credentials are not defined in environment variables.');
}

const twilioClient: Twilio = twilio(accountSid, authToken);

export const VoiceResponse = twilio.twiml.VoiceResponse;

export default twilioClient;

export async function getTwiML(callback: (response: twilio.twiml.VoiceResponse) => void | Promise<void>): Promise<string> {
  const response = new VoiceResponse();
  await callback(response);
  return response.toString();
} 