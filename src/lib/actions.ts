'use server';

import { collectCallerInformation, CollectCallerInformationInput, CollectCallerInformationOutput } from '@/ai/flows/collect-caller-information';
import { verifyCallerResponses, VerifyCallerResponsesInput, VerifyCallerResponsesOutput } from '@/ai/flows/verify-caller-responses';
import type { AISimulationResult } from '@/types';
import { logger } from './logger';

export async function processCallTranscriptAction(
  conversation: string
): Promise<AISimulationResult> {
  logger.info('Starting processCallTranscriptAction', { transcriptLength: conversation.length });
  const result: AISimulationResult = {};

  if (!process.env.GOOGLE_API_KEY) {
    const errorMessage = "AI features are disabled. GOOGLE_API_KEY is missing. Ensure it is set in your .env or .env.local file and restart the server.";
    logger.warn(errorMessage);
    return {
      error: "AI features are disabled. API key not found on the server.",
      collectedInfo: {
        error: "AI features are disabled. API key not found.",
        name: "N/A",
        age: 0,
        readyForHuman: false,
      },
      verificationInfo: {
        error: "AI features are disabled. API key not found.",
        isValid: false,
        confidenceScore: 0,
        reason: "API key not configured."
      }
    };
  }

  try {
    logger.info('Collecting caller information from conversation.');
    const collectionInput: CollectCallerInformationInput = { callTranscript: conversation };
    const collectedInfo: CollectCallerInformationOutput = await collectCallerInformation(collectionInput);
    result.collectedInfo = {
      name: collectedInfo.name,
      age: collectedInfo.age,
      readyForHuman: collectedInfo.readyForHuman,
      response: collectedInfo.response,
    };

    if (collectedInfo.readyForHuman && collectedInfo.name && collectedInfo.age) {
      try {
        logger.info('Verifying caller responses.', { name: collectedInfo.name, age: collectedInfo.age });
        const verificationInput: VerifyCallerResponsesInput = {
          name: collectedInfo.name,
          age: String(collectedInfo.age), // Schema expects string for age
        };
        const verificationInfo: VerifyCallerResponsesOutput = await verifyCallerResponses(verificationInput);
        result.verificationInfo = {
          isValid: verificationInfo.isValid,
          confidenceScore: verificationInfo.confidenceScore,
          reason: verificationInfo.reason,
        };
        logger.info('Verification successful.');
      } catch (verificationError: any) {
        logger.error('Verification AI Error:', { error: verificationError });
        result.verificationInfo = {
          error: verificationError.message || 'Failed to verify caller responses.',
        };
      }
    } else if (collectedInfo.readyForHuman) {
        logger.warn('Cannot proceed to verification: Name or age missing.', { collectedInfo });
        result.verificationInfo = {
            error: 'Cannot proceed to verification: Name or age missing despite IVR indicating readiness.',
            isValid: false,
        }
    }
    logger.info('Information collection successful.');

  } catch (collectionError: any) {
    logger.error('Information Collection AI Error:', { error: collectionError });
    result.collectedInfo = {
      error: collectionError.message || 'Failed to collect caller information.',
    };
    result.error = result.collectedInfo.error; // Overall error
  }

  logger.info('Finished processCallTranscriptAction.');
  return result;
}

