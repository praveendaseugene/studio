// tailor-resume.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow to tailor a resume to a specific job description.
 *
 * - tailorResumeToJobDescription -  A function that takes a resume and job description as input, and returns suggestions for tailoring the resume to the job description.
 * - TailorResumeInput - The input type for the tailorResumeToJobDescription function.
 * - TailorResumeOutput - The return type for the tailorResumeToJobDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TailorResumeInputSchema = z.object({
  resumeText: z.string().describe('The text content of the resume.'),
  jobDescription: z.string().describe('The job description to tailor the resume to.'),
});
export type TailorResumeInput = z.infer<typeof TailorResumeInputSchema>;

const TailorResumeOutputSchema = z.object({
  suggestions: z.string().describe('Suggestions for tailoring the resume to the job description.'),
});
export type TailorResumeOutput = z.infer<typeof TailorResumeOutputSchema>;

export async function tailorResumeToJobDescription(input: TailorResumeInput): Promise<TailorResumeOutput> {
  return tailorResumeFlow(input);
}

const tailorResumePrompt = ai.definePrompt({
  name: 'tailorResumePrompt',
  input: {schema: TailorResumeInputSchema},
  output: {schema: TailorResumeOutputSchema},
  prompt: `You are an expert resume writer. Given a resume and a job description, provide suggestions on how to tailor the resume to the job description. Focus on highlighting relevant skills and experiences, and adding keywords from the job description to the resume.

Resume:
{{resumeText}}

Job Description:
{{jobDescription}}`,
});

const tailorResumeFlow = ai.defineFlow(
  {
    name: 'tailorResumeFlow',
    inputSchema: TailorResumeInputSchema,
    outputSchema: TailorResumeOutputSchema,
  },
  async input => {
    const {output} = await tailorResumePrompt(input);
    return output!;
  }
);
