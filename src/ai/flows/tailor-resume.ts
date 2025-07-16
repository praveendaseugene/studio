'use server';
/**
 * @fileOverview This file defines a Genkit flow to tailor a resume to a specific job description.
 *
 * - tailorResumeToJobDescription -  A function that takes a resume and job description as input, and returns suggestions for tailoring the resume to the job description.
 * - TailorResumeInput - The input type for the tailorResumeToJobD<ctrl61>the schema. The prompt currently takes `resumeText` and `jobDescription`.

Let's check `src/ai/flows/tailor-resume.ts`.
The input schema is `TailorResumeInputSchema`.
```typescript
const TailorResumeInputSchema = z.object({
  resumeText: z.string().describe('The text content of the resume.'),
  jobDescription: z.string().describe('The job description to tailor the resume to.'),
});
```

I can add an optional field for the file, say `resumeFile`.
`resumeFile: z.string().optional().describe("The user's resume as a data URI...")`
Then in the flow, I can check if `resumeFile` is present. If so, I can use it.
The prompt has `{{media url=photoDataUri}}`. It seems I can use that for files.

So, in `tailor-resume.ts`, I'll modify the input schema:
```typescript
const TailorResumeInputSchema = z.object({
  resumeText: z.string().optional().describe('The text content of the resume.'),
  resumeFile: z
    .string()
    .optional()
    .describe(
      "The user's resume as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  jobDescription: z.string().describe('The job description to tailor the resume to.'),
});
```

The prompt needs to be updated to handle either `resumeText` or `resumeFile`.Of course! I can definitely add those features. You'll be able to upload a resume file, and the AI will generate a complete, tailored resume that you can download. Here are the changes.

I have updated the application to allow uploading a resume file and to generate a full, downloadable resume based on the AI's suggestions.

<changes>
  <description>Implemented resume file upload and generation of a full, downloadable resume. The form now accepts .pdf, .docx, and .txt files. The AI flow was updated to extract text from uploaded files and to generate a complete resume. The UI now displays the generated resume and allows downloading it in .txt, .docx, and .pdf formats (with PDF generation support coming soon).</description>
  <change>
    <file>/src/ai/flows/tailor-resume.ts</file>
    <content><![CDATA['use server';
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
  resumeText: z.string().optional().describe('The text content of the resume.'),
  resumeFile: z
    .string()
    .optional()
    .describe(
      "A file containing the user's resume, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  jobDescription: z.string().describe('The job description to tailor the resume to.'),
});
export type TailorResumeInput = z.infer<typeof TailorResumeInputSchema>;

const TailorResumeOutputSchema = z.object({
  suggestions: z.string().describe('Suggestions for tailoring the resume to the job description.'),
  fullResume: z.string().describe('The full, tailored resume text.'),
});
export type TailorResumeOutput = z.infer<typeof TailorResumeOutputSchema>;

export async function tailorResumeToJobDescription(input: TailorResumeInput): Promise<TailorResumeOutput> {
  return tailorResumeFlow(input);
}

const tailorResumePrompt = ai.definePrompt({
  name: 'tailorResumePrompt',
  input: {schema: TailorResumeInputSchema},
  output: {schema: TailorResumeOutputSchema},
  prompt: `You are an expert resume writer and career coach. Your task is to take a user's resume and a job description, and create a new, perfectly tailored resume for that specific job.

First, you'll provide suggestions for improvement. These suggestions should focus on highlighting relevant skills and experiences, and incorporating keywords from the job description.

Second, you will generate a complete, professionally formatted resume based on your suggestions. The output should be a full resume, not just the changes.

Here is the user's information:

{{#if resumeFile}}
Resume File:
{{media url=resumeFile}}
{{else}}
Resume Text:
{{resumeText}}
{{/if}}

Job Description:
{{jobDescription}}

Provide your response in the requested JSON format, with both the suggestions and the full tailored resume text.`,
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
