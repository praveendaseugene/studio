import { ResumeOptimizer } from "@/components/resume-optimizer";
import { LogoIcon } from "@/components/icons";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl">
        <header className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex items-center gap-3">
             <LogoIcon className="h-10 w-10 text-primary" />
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
              CV Optimizer Pro
            </h1>
          </div>
          <p className="max-w-2xl text-muted-foreground md:text-xl">
            Paste a job description and your resume to receive AI-powered suggestions for landing your next role.
          </p>
        </header>
        <ResumeOptimizer />
      </div>
    </main>
  );
}
