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

First, you'll provide brief suggestions for improvement. These suggestions should focus on highlighting relevant skills and experiences, and incorporating keywords from the job description.

Second, you will generate a complete, professionally formatted resume based on your suggestions. The resume must be ATS-friendly, professional, and visually appealing. The output should be a full resume, not just the changes.

Use the following structure and formatting for the generated resume:

[Your Name]
[Phone Number] | [Email Address] | [LinkedIn Profile URL (optional)] | [Portfolio/Website URL (optional)]

PROFESSIONAL SUMMARY
---
A brief, 2-3 sentence summary that highlights your key qualifications and aligns with the target job description.

SKILLS
---
- Skill 1
- Skill 2
- Skill 3
(List relevant technical and soft skills, tailored to the job)

EXPERIENCE
---
**[Job Title]** | [Company Name] | [City, State]
[Month, Year] – [Month, Year or Present]
- Use action verbs to start each bullet point. Describe your accomplishments, not just your duties. Quantify your achievements with numbers and data whenever possible.
- Tailor each point to match the requirements in the job description.
- Example: "Led a team of 5 engineers to develop a new feature that increased user engagement by 15%."

**[Previous Job Title]** | [Company Name] | [City, State]
[Month, Year] – [Month, Year]
- Accomplishment-driven bullet point.
- Another accomplishment-driven bullet point.

EDUCATION
---
**[Degree Name]** | [University Name] | [City, State]
[Graduation Month, Year]

---

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

Provide your response in the requested JSON format, with both the suggestions and the full tailored resume text using the professional format described above. Ensure the fullResume field contains the complete, ready-to-use resume.`,
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

    