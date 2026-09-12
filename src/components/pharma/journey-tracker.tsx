import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface JourneyStep {
  label: string;
  status: "completed" | "current" | "upcoming";
}

export function JourneyTracker({
  steps,
  className,
}: {
  steps: JourneyStep[];
  className?: string;
}) {
  return (
    <div className={cn("flex w-full items-center", className)}>
      {steps.map((step, i) => (
        <div key={step.label} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-xs font-semibold transition-colors",
                step.status === "completed" &&
                  "border-primary bg-primary text-primary-foreground",
                step.status === "current" &&
                  "border-accent bg-accent/10 text-accent",
                step.status === "upcoming" &&
                  "border-border bg-card text-muted-foreground"
              )}
            >
              {step.status === "completed" ? (
                <Check size={15} strokeWidth={3} />
              ) : (
                i + 1
              )}
            </div>
            <span
              className={cn(
                "hidden text-center text-[11px] font-medium sm:block max-w-[5.5rem] leading-tight",
                step.status === "current" ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "mx-1.5 h-0.5 flex-1 rounded-full transition-colors",
                step.status === "completed" ? "bg-primary" : "bg-border"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
