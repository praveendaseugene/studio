"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FileDown,
  FileText,
  Loader2,
  Wand2,
  Paperclip,
  BookUser,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { generateSuggestions } from "@/app/actions";
import type { TailorResumeOutput } from "@/ai/flows/tailor-resume";

const formSchema = z.object({
  jobDescription: z.string().min(50, "Job description is too short.").max(15000, "Job description is too long."),
  resumeText: z.string().min(50, "Resume text is too short.").max(15000, "Resume is too long."),
});

type FormValues = z.infer<typeof formSchema>;

export function ResumeOptimizer() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TailorResumeOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobDescription: "",
      resumeText: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await generateSuggestions(values);
      setResult(response);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "An unexpected error occurred.";
      setError(errorMsg);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  const handleDownload = (format: "txt" | "doc") => {
    if (!result?.suggestions) return;
    
    let content = result.suggestions;
    let mimeType = '';
    let filename = 'optimized-resume-suggestions';

    if (format === 'txt') {
        mimeType = 'text/plain;charset=utf-8';
        filename += '.txt';
    } else { // doc
        mimeType = 'application/msword';
        filename += '.doc';
        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Resume Suggestions</title></head><body>";
        const footer = "</body></html>";
        content = header + result.suggestions.replace(/\n/g, '<br />') + footer;
    }

    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-2">
      <Card className="border-2 border-dashed">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Your Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="jobDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-base">
                      <Paperclip className="h-4 w-4" />
                      Job Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste the job description here..."
                        className="min-h-[200px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="resumeText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-base">
                      <BookUser className="h-4 w-4" />
                      Your Current Resume
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste your current resume text here..."
                        className="min-h-[200px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Generate Suggestions
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="flex flex-col">
        {isLoading && (
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        )}
        {error && !isLoading && (
           <Alert variant="destructive">
             <AlertTitle>Optimization Failed</AlertTitle>
             <AlertDescription>{error}</AlertDescription>
           </Alert>
        )}
        {!isLoading && !result && !error && (
            <Card className="flex h-full flex-col items-center justify-center border-2 border-dashed bg-card/50">
                <CardContent className="text-center">
                    <Wand2 className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-lg text-muted-foreground">
                        Your AI-tailored resume suggestions will appear here.
                    </p>
                </CardContent>
            </Card>
        )}
        {result && !isLoading && (
          <Card className="bg-gradient-to-br from-card to-secondary/20">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">
                AI-Powered Resume Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap rounded-md bg-secondary/30 p-4 font-body text-foreground">
                    {result.suggestions}
                </div>
            </CardContent>
            <CardFooter className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">Download your suggestions:</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleDownload('txt')}>
                  <FileText className="mr-2 h-4 w-4" />
                  .txt
                </Button>
                <Button variant="outline" onClick={() => handleDownload('doc')}>
                  <FileText className="mr-2 h-4 w-4" />
                  .doc
                </Button>
                <Button variant="outline" disabled>
                  <FileDown className="mr-2 h-4 w-4" />
                  .pdf (soon)
                </Button>
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
