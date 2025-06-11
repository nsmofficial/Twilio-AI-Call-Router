import { NextResponse } from 'next/server';
import { getTwiML } from '@/services/twilio';
import { logger } from '@/lib/logger';
import { agentService } from '@/services/agent';
import { callService } from '@/services/call';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');

  const body = await request.formData();
  const callStatus = body.get('DialCallStatus') as string;
  const callSid = body.get('CallSid') as string;
  const recordingUrl = body.get('RecordingUrl') as string;

  if (!agentId) {
    logger.error('Dial status callback received without agentId.');
    return new NextResponse(null, { status: 400 });
  }

  logger.info(`Dial status for agent ${agentId}: ${callStatus}`);
  
  // Set the agent's status back to available regardless of the call outcome (e.g., completed, no-answer, busy).
  // More complex logic could be added here to handle different statuses differently.
  await agentService.setAgentStatus(agentId, 'available');
  
  await callService.updateCall(callSid, {
    status: callStatus,
    recordingUrl,
  });

  const twiml = await getTwiML(response => {
    // The call is over, so we just return an empty response.
    // This webhook is purely for the side-effect of updating the agent's status.
  });

  return new NextResponse(twiml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
    },
  });
} 