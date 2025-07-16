'use server';
/**
 * @fileOverview This file defines a Genkit flow to tailor a resume to a specific job description.
 *
 * - tailorResumeToJobDescription -  A function that takes a resume and job description as input, and returns suggestions for tailoring the resume to the job description.
 * - TailorResumeInput - The input type for the tailorResumeTo_jobDescription function.
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
  prompt: `You are an expert resume writer and career coach specializing in corporate and IT roles. Your task is to create a professional, visually appealing, and ATS-friendly resume based on the user's provided resume and a specific job description.

**Formatting and Design Guidelines:**
1.  **ATS-Friendly:** Use a clean, single-column layout. Use standard, readable fonts (like Arial, Helvetica). Do not use graphics, images, or text in headers/footers.
2.  **Professional Tone:** The language must be professional and action-oriented.
3.  **Layout & Readability:** Ensure clear headings, balanced white space, and a logical information hierarchy. Use simple dividers (like "---") between major sections.
4.  **No Colors:** Stick to black/dark gray text on a white background.

**Resume Structure:**
Generate the resume in the following order. If the user's resume doesn't contain a section, omit it unless it's critical for the job description.

**[Full Name]**
[Your Title, e.g., Senior Software Engineer]
[Phone Number] | [Email Address] | [LinkedIn Profile URL] | [Portfolio/GitHub URL]

**SUMMARY**
---
A concise, 2-4 sentence summary tailored to the job description, highlighting key qualifications, years of experience, and career goals.

**SKILLS**
---
-   **Languages:** [e.g., JavaScript, Python, Java]
-   **Frameworks/Libraries:** [e.g., React, Node.js, Django]
-   **Databases:** [e.g., PostgreSQL, MongoDB, MySQL]
-   **Tools/Platforms:** [e.g., Docker, Kubernetes, AWS, Git]

**EXPERIENCE**
---
**[Job Title]** | [Company Name] | [City, State]
[Month, Year] – [Month, Year or Present]
-   Start each bullet point with a strong action verb (e.g., "Engineered," "Managed," "Accelerated").
-   Focus on quantifiable achievements. How did you add value? (e.g., "Reduced API latency by 30%," "Increased user retention by 15%").
-   Directly address skills and responsibilities mentioned in the job description.

**CURRENT PROJECT IN PROGRESS** (Include if applicable)
---
**[Project Title]**
*Brief one-sentence project description.*
-   **Key Responsibilities:** [Detail your main duties and contributions]
-   **Technologies Used:** [List the tech stack for this project]

**PROJECTS**
---
**[Project Title]** | [Link to Project/Code]
-   Bullet point describing the project and your role.
-   Bullet point highlighting a key feature or technical challenge.

**EDUCATION**
---
**[Degree Name]** | [University Name] | [City, State]
[Graduation Month, Year]

**CERTIFICATIONS**
---
- [Certification Name] - [Issuing Organization] ([Year])
- [Another Certification] - [Issuing Organization] ([Year])

**LANGUAGES**
---
- [Language]: [Proficiency, e.g., Native, Fluent, Professional Working Proficiency]

---

**User's Information:**
{{#if resumeFile}}
**Resume File Content:**
{{media url=resumeFile}}
{{else}}
**Resume Text:**
{{resumeText}}
{{/if}}

**Target Job Description:**
{{jobDescription}}

**Your Task:**
1.  **Suggestions:** First, provide a brief paragraph with high-level suggestions for improvement, focusing on keyword alignment and impact.
2.  **Full Resume:** Second, generate the complete, tailored resume text in the `fullResume` field. Follow the structure and guidelines above precisely. Ensure the output is a single block of text, ready for copy-pasting.

Provide the response in the requested JSON format.`,
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
