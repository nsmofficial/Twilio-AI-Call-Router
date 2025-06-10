
'use server';

/**
 * @fileOverview A flow to verify the caller's responses using AI to confirm if the information provided is valid
 * and qualifies for human agent handover, ensuring efficient call routing.
 *
 * - verifyCallerResponses - A function that handles the verification process.
 * - VerifyCallerResponsesInput - The input type for the verifyCallerResponses function.
 * - VerifyCallerResponsesOutput - The return type for the verifyCallerResponses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyCallerResponsesInputSchema = z.object({
  name: z.string().describe('The name of the caller.'),
  age: z.string().describe('The age of the caller (as a string). An age of "0" indicates it was not extracted properly in a previous step.'),
});
export type VerifyCallerResponsesInput = z.infer<typeof VerifyCallerResponsesInputSchema>;

const VerifyCallerResponsesOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the provided information is valid and qualifies for human agent handover.'),
  confidenceScore: z.number().describe('A score indicating the confidence level of the verification (0-1).'),
  reason: z.string().describe('The reason for the verification result.'),
});
export type VerifyCallerResponsesOutput = z.infer<typeof VerifyCallerResponsesOutputSchema>;

export async function verifyCallerResponses(input: VerifyCallerResponsesInput): Promise<VerifyCallerResponsesOutput> {
  return verifyCallerResponsesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'verifyCallerResponsesPrompt',
  input: {schema: VerifyCallerResponsesInputSchema},
  output: {schema: VerifyCallerResponsesOutputSchema},
  prompt: `You are an AI agent responsible for verifying caller-provided information.
Your goal is to determine if the extracted name and age are plausible and qualify the caller for handover to a human agent.

Evaluate the following information:
- Name: {{{name}}}
- Age: {{{age}}} (This is provided as a string. An age of "0" indicates the age was not successfully extracted in a prior step.)

Criteria for validity:
- The name should appear to be a genuine name (not gibberish or empty).
- The age should represent a plausible human age (e.g., greater than 0 and less than 120). An age of "0" is considered invalid as it means the age was not properly provided or extracted.

Based on these criteria:
- Set 'isValid' to true if both name and age are plausible according to the criteria. Otherwise, set it to false.
- Provide a 'confidenceScore' (0 to 1) for your assessment.
- Include a 'reason' explaining your decision, especially if 'isValid' is false.

Output your response as a JSON object in the specified schema.
  `,
});

const verifyCallerResponsesFlow = ai.defineFlow(
  {
    name: 'verifyCallerResponsesFlow',
    inputSchema: VerifyCallerResponsesInputSchema,
    outputSchema: VerifyCallerResponsesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
