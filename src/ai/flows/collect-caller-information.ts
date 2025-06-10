
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
  name: z.string().describe('The caller’s name. Empty string if not found.'),
  age: z.number().describe('The caller’s age. 0 if not found or invalid.'),
  readyForHuman: z
    .boolean()
    .describe(
      'True if the caller has provided all necessary information (valid name and non-zero age) and is ready to be transferred to a human agent.'
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
Your primary task is to accurately extract the caller's name and age from the provided call transcript.
The transcript can be in various formats:
- Full sentences: "Hello, my name is John Doe and I am 30 years old."
- Short phrases: "I'm Jane, 25."
- Comma-separated: "Peter,45" or "Sarah , 22."
- Name and age: "David 50"
- Just name and age with minimal other text.

Key instructions:
1. Identify the caller's name. If no name is found, use an empty string for the 'name' field.
2. Identify the caller's age. It MUST be an integer. If no valid age is found, use 0 for the 'age' field.
3. Set 'readyForHuman' to true ONLY IF a plausible name (not an empty string) AND a valid, non-zero age have been successfully extracted. Otherwise, set 'readyForHuman' to false.
4. Try to ignore non-alphanumeric characters like periods or commas if they seem like typos or separators, unless they are part of a typical name.

Here is the current transcript of the call:
{{{callTranscript}}}

Output a JSON object strictly in the following format, ensuring 'age' is always an integer:
{
  "name": "string",
  "age": "integer",
  "readyForHuman": "boolean"
}
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
