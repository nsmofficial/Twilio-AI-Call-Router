import { NextResponse } from 'next/server';
import { getTwiML } from '@/services/twilio';
import { logger } from '@/lib/logger';
import { processCallTranscriptAction } from '@/lib/actions';
import { agentService } from '@/services/agent';
import { callService } from '@/services/call';

export async function POST(request: Request) {
  const body = await request.formData();
  const callSid = body.get('CallSid') as string;
  const speechResult = body.get('SpeechResult') as string;
  const confidence = parseFloat(body.get('Confidence') as string);
  
  // Get the conversation history, or start a new one.
  const conversation = (body.get('conversation') as string || '') + ' ' + speechResult;

  logger.info('Gather result received', { callSid, speechResult, confidence, conversation });

  const twiml = await getTwiML(async response => {
    // We only proceed if we have a speech result with reasonable confidence.
    if (speechResult && confidence > 0.5) {
      logger.info(`Processing speech with AI...`);
      const aiResult = await processCallTranscriptAction(conversation);
      logger.info(`AI processing complete`, { aiResult });
      
      await callService.updateCall(callSid, {
        transcript: conversation,
        aiResult: aiResult as any, // Cast to any to avoid type issues with Prisma.JsonValue
      });
      
      const collectedInfo = aiResult.collectedInfo;

      // Determine the next step based on AI analysis
      const isReadyForHuman = collectedInfo && !collectedInfo.error && collectedInfo.readyForHuman;
      const needsMoreInfo = collectedInfo && !collectedInfo.error && !isReadyForHuman;
      const hasAiError = !collectedInfo || collectedInfo.error;

      if (isReadyForHuman) {
        // AI has all info and is ready to transfer.
        if (collectedInfo.response) {
          response.say({ voice: 'Google.en-US-Standard-C' }, collectedInfo.response);
        }
        
        await callService.updateCall(callSid, { status: 'connecting' });
        const availableAgent = await agentService.findAvailableAgent();
        logger.info(`Searching for available agent...`);

        if (availableAgent) {
          logger.info(`Connecting call ${callSid} to agent ${availableAgent.name}`);
          await agentService.setAgentStatus(availableAgent.id, 'busy');
          await callService.updateCall(callSid, { agentId: availableAgent.id });

          const dial = response.dial({
            action: `/api/twilio/dial-status?agentId=${availableAgent.id}`,
            method: 'POST',
          });
          dial.number(availableAgent.phoneNumber);
        } else {
          logger.warn(`No available agents for call ${callSid}.`);
          await callService.updateCall(callSid, { status: 'no-agents-available' });
          response.say({ voice: 'Google.en-US-Standard-C' },
            "I'm sorry, but all of our agents are currently busy. Please call back later."
          );
          response.hangup();
        }
      } else if (needsMoreInfo) {
        // AI needs more information. Ask the question and re-gather.
        logger.info(`AI needs more information. Re-gathering.`);
        await callService.updateCall(callSid, { status: 'in-progress-ai' });

        const gather = response.gather({
          input: ['speech'],
          action: `/api/twilio/gather?conversation=${encodeURIComponent(conversation)}`,
          speechTimeout: 'auto',
          speechModel: 'phone_call',
        });
        
        if (collectedInfo.response) {
          gather.say({ voice: 'Google.en-US-Standard-C' }, collectedInfo.response);
        } else {
          // Fallback response if AI somehow fails to generate one.
          gather.say({ voice: 'Google.en-US-Standard-C' }, "I'm sorry, can you please repeat that?");
        }
        
        // If the gather times out, it will fall through and the call will hang up. 
        // A more robust solution could redirect to a specific timeout handler.
        response.hangup();

      } else { // hasAiError
        // Handle the case where the AI itself had an error.
        await callService.updateCall(callSid, { status: 'ai-error' });
        logger.error(`AI processing failed.`, { error: collectedInfo?.error });
        response.say({ voice: 'Google.en-US-Standard-C' }, 
          "I'm sorry, we're experiencing a system error. Please try again later."
        );
        response.hangup();
      }
    } else {
      // Handle low-confidence speech.
      await callService.updateCall(callSid, { status: 'speech-unclear' });
      logger.info(`Speech result was unclear or not detected.`);
      response.say({ voice: 'Google.en-US-Standard-C' }, 
        "I'm sorry, I didn't catch that. Could you please repeat it?"
      );
      // Redirect back to gather, maintaining the conversation history.
      response.redirect(`/api/twilio/gather?conversation=${encodeURIComponent(conversation)}`);
    }
  });

  return new NextResponse(twiml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
    },
  });
} 