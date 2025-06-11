import { NextResponse } from 'next/server';
import { getTwiML } from '@/services/twilio';
import { logger } from '@/lib/logger';
import { callService } from '@/services/call';

export async function POST(request: Request) {
  const body = await request.formData();
  const callSid = body.get('CallSid') as string;
  const fromNumber = body.get('From') as string;
  const toNumber = body.get('To') as string;

  logger.info('Incoming call received', { callSid });
  await callService.createCall(callSid, fromNumber, toNumber);

  // In a real app, you would validate the Twilio signature here.
  // For simplicity, we are skipping it in this example.

  const twiml = await getTwiML(response => {
    const gather = response.gather({
      input: ['speech'],
      action: '/api/twilio/gather',
      speechTimeout: 'auto',
      speechModel: 'phone_call',
    });

    gather.say({ voice: 'Google.en-US-Standard-C' }, 
      'Hello! Welcome to the AI Call Center. Please state your full name and age.'
    );

    // If the caller doesn't say anything, redirect to the gather webhook with no speech result.
    // This allows the gather logic to handle the "no input" case.
    response.redirect('/api/twilio/gather');
  });

  return new NextResponse(twiml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}

