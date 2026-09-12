import { Check, Lock, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export type JourneyStatus = "completed" | "active" | "locked" | "available";

const config: Record<
  JourneyStatus,
  { label: string; icon: React.ReactNode; classes: string }
> = {
  completed: {
    label: "Completed",
    icon: <Check size={12} strokeWidth={3} />,
    classes: "bg-success/15 text-success border-success/20",
  },
  active: {
    label: "Active",
    icon: <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
    </span>,
    classes: "bg-accent/10 text-accent border-accent/25",
  },
  locked: {
    label: "Locked",
    icon: <Lock size={11} strokeWidth={2.5} />,
    classes: "bg-muted text-muted-foreground border-border",
  },
  available: {
    label: "Available",
    icon: <Clock size={12} strokeWidth={2.5} />,
    classes: "bg-warning/15 text-warning-foreground border-warning/25",
  },
};

export function StatusPill({
  status,
  label,
  className,
}: {
  status: JourneyStatus;
  label?: string;
  className?: string;
}) {
  const c = config[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        c.classes,
        className
      )}
    >
      {c.icon}
      {label ?? c.label}
    </span>
  );
}
