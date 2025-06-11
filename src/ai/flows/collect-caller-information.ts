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
  name: z.string().describe('The caller\'s name. Empty string if not found.'),
  age: z.number().describe('The caller\'s age. 0 if not found or invalid.'),
  readyForHuman: z
    .boolean()
    .describe(
      'True if the caller has provided all necessary information (valid name and non-zero age) and is ready to be transferred to a human agent.'
    ),
  response: z.string().describe('The verbal response to say back to the caller. This should guide the user to the next step.'),
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
  prompt: `You are an AI-powered Interactive Voice Response (IVR) system for a top-tier financial services company. Your tone should be professional, clear, and helpful.
Your primary task is to accurately extract the caller's full name and age from the provided call transcript.

**Call Transcript Analysis:**
- The transcript may contain full sentences, short phrases, or just the raw information.
- Examples: "Hello, my name is John Doe and I am 30 years old.", "I'm Jane, 25.", "David 50".
- Identify the caller's name. If no name is found, use an empty string.
- Identify the caller's age as an integer. If no valid age is found, use 0.

**Conversational Logic:**
Your response MUST guide the conversation forward.

1.  **If BOTH name and age are found:**
    - Set 'readyForHuman' to true.
    - Set 'response' to: "Thank you. I have your name as [Name] and your age as [Age]. Please hold while we connect you to an agent."
2.  **If ONLY the name is found:**
    - Set 'readyForHuman' to false.
    - Set 'response' to: "Thank you, [Name]. And what is your age?"
3.  **If ONLY the age is found:**
    - Set 'readyForHuman' to false.
    - Set 'response' to: "I have your age as [Age]. Could you please provide your full name?"
4.  **If NEITHER name nor age is found:**
    - Set 'readyForHuman' to false.
    - Set 'response' to: "I'm sorry, I couldn't quite get that. Let's try one more time. Please state your full name and age."

**Current Transcript of the Call:**
{{{callTranscript}}}

**Output Instructions:**
Output a JSON object strictly in the following format. Ensure 'age' is an integer.

{
  "name": "string",
  "age": "integer",
  "readyForHuman": "boolean",
  "response": "string"
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
