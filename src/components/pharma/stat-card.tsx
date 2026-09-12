import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  tone?: "default" | "accent" | "success" | "warning";
}) {
  const toneClasses = {
    default: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
  }[tone];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {Icon && (
          <div className={cn("grid h-8 w-8 place-items-center rounded-lg", toneClasses)}>
            <Icon size={15} />
          </div>
        )}
      </div>
      <p className="font-heading text-2xl font-bold tracking-tight">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>}
    </div>
  );
}
