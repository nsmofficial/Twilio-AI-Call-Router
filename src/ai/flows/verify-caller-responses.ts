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
  age: z.string().describe('The age of the caller.'),
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
  prompt: `You are an AI agent verifying caller responses to determine if they are valid and qualify for human agent handover.

  Evaluate the following information provided by the caller:
  - Name: {{{name}}}
  - Age: {{{age}}}

  Based on the provided information, determine if the responses are valid and if the caller should be transferred to a human agent.

  {{#if name}}
  {{/if}}

  Return a confidence score between 0 and 1, where 1 indicates high confidence in the verification result.
  Provide a reason for the verification result.
  Output should be in JSON format.
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
