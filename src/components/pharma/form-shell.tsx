"use client";

import { CloudCheck } from "lucide-react";
import { Logo } from "@/components/pharma/logo";
import { Progress } from "@/components/ui/progress";

export function FormShell({
  eyebrow,
  saved = true,
  progressPct,
  children,
  maxWidth = "max-w-2xl",
}: {
  eyebrow: string;
  saved?: boolean;
  progressPct?: number;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className={`mx-auto flex ${maxWidth} items-center justify-between px-6 py-4`}>
          <Logo size="sm" />
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CloudCheck size={15} className={saved ? "text-success" : "text-muted-foreground"} />
            {saved ? "Saved" : "Saving…"}
          </div>
        </div>
        {progressPct !== undefined && (
          <div className={`mx-auto ${maxWidth} px-6 pb-4`}>
            <div className="mb-2 text-xs text-muted-foreground">{eyebrow}</div>
            <Progress value={progressPct} className="h-1.5" />
          </div>
        )}
      </header>
      <main className={`mx-auto w-full ${maxWidth} flex-1 px-6 py-10`}>{children}</main>
    </div>
  );
}
