"use server";

import { tailorResumeToJobDescription, TailorResumeInput, TailorResumeOutput } from "@/ai/flows/tailor-resume";

export async function generateSuggestions(input: TailorResumeInput): Promise<TailorResumeOutput> {
  try {
    const result = await tailorResumeToJobDescription(input);
    return result;
  } catch (error) {
    console.error("Error tailoring resume:", error);
    throw new Error("Failed to generate suggestions. Please try again.");
  }
}
