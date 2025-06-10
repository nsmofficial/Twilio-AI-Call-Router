'use server';

/**
 * @fileOverview This flow collects caller information such as name and age using AI. It exports a function to initiate the information collection process.
 *
 * - collectCallerInformation - A function to start the information collection flow.
 * - CollectCallerInformationInput - The input type for the collectCallerInformation function.
 * - CollectCallerInformationOutput - The return type for the collectCallerInformation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CollectCallerInformationInputSchema = z.object({
  callTranscript: z
    .string()
    .describe('The transcript of the conversation so far with the caller.'),
});
export type CollectCallerInformationInput = z.infer<
  typeof CollectCallerInformationInputSchema
>;

const CollectCallerInformationOutputSchema = z.object({
  name: z.string().describe('The caller’s name.'),
  age: z.number().describe('The caller’s age.'),
  readyForHuman: z
    .boolean()
    .describe(
      'True if the caller has provided all necessary information and is ready to be transferred to a human agent.'
    ),
});
export type CollectCallerInformationOutput = z.infer<
  typeof CollectCallerInformationOutputSchema
>;

export async function collectCallerInformation(
  input: CollectCallerInformationInput
): Promise<CollectCallerInformationOutput> {
  return collectCallerInformationFlow(input);
}

const collectCallerInformationPrompt = ai.definePrompt({
  name: 'collectCallerInformationPrompt',
  input: {schema: CollectCallerInformationInputSchema},
  output: {schema: CollectCallerInformationOutputSchema},
  prompt: `You are an AI-powered Interactive Voice Response (IVR) system.
Your job is to collect the caller's name and age. Once you have collected this information, set readyForHuman to true.

Here is the current transcript of the call:
{{callTranscript}}

Extract the name and age from the transcript. If the name or age is not present, leave the field blank. Only set readyForHuman to true if both the name and age are present.

Output a JSON object containing the name, age, and readyForHuman fields. Ensure the age is an integer.
`,
});

const collectCallerInformationFlow = ai.defineFlow(
  {
    name: 'collectCallerInformationFlow',
    inputSchema: CollectCallerInformationInputSchema,
    outputSchema: CollectCallerInformationOutputSchema,
  },
  async input => {
    const {output} = await collectCallerInformationPrompt(input);
    return output!;
  }
);
