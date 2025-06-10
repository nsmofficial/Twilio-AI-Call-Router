
'use server';

import { collectCallerInformation, CollectCallerInformationInput, CollectCallerInformationOutput } from '@/ai/flows/collect-caller-information';
import { verifyCallerResponses, VerifyCallerResponsesInput, VerifyCallerResponsesOutput } from '@/ai/flows/verify-caller-responses';
import type { AISimulationResult } from '@/types';

export async function processCallTranscriptAction(
  callTranscript: string
): Promise<AISimulationResult> {
  const result: AISimulationResult = {};

  if (!process.env.GOOGLE_API_KEY) {
    const errorMessage = "AI Simulation Disabled: GOOGLE_API_KEY is missing. Please add it to your .env file to enable AI features.";
    console.warn(errorMessage);
    return {
      error: errorMessage,
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
    const collectionInput: CollectCallerInformationInput = { callTranscript };
    const collectedInfo: CollectCallerInformationOutput = await collectCallerInformation(collectionInput);
    result.collectedInfo = {
      name: collectedInfo.name,
      age: collectedInfo.age,
      readyForHuman: collectedInfo.readyForHuman,
    };

    if (collectedInfo.readyForHuman && collectedInfo.name && collectedInfo.age) {
      try {
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
      } catch (verificationError: any) {
        console.error('Verification AI Error:', verificationError);
        result.verificationInfo = {
          error: verificationError.message || 'Failed to verify caller responses.',
        };
      }
    } else if (collectedInfo.readyForHuman) {
        result.verificationInfo = {
            error: 'Cannot proceed to verification: Name or age missing despite IVR indicating readiness.',
            isValid: false,
        }
    }

  } catch (collectionError: any) {
    console.error('Information Collection AI Error:', collectionError);
    result.collectedInfo = {
      error: collectionError.message || 'Failed to collect caller information.',
    };
    result.error = result.collectedInfo.error; // Overall error
  }

  return result;
}

