"use client";

import { cn } from "@/lib/utils";

export function LikertScale({
  value,
  onChange,
  labels,
  compact = false,
}: {
  value?: number;
  onChange: (v: number) => void;
  labels: [string, string, string, string, string];
  compact?: boolean;
}) {
  return (
    <div className={cn("grid grid-cols-5 gap-1.5 sm:gap-2")}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={cn(
            "flex flex-col items-center gap-1.5 rounded-xl border-2 px-1 py-2.5 text-center transition-all",
            value === n
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border hover:border-primary/30 hover:bg-secondary"
          )}
        >
          <span
            className={cn(
              "grid h-6 w-6 place-items-center rounded-full text-xs font-bold",
              value === n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}
          >
            {n}
          </span>
          {!compact && (
            <span className="hidden text-[10px] leading-tight text-muted-foreground sm:block">
              {labels[n - 1]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
