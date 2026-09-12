export const statusTone: Record<string, string> = {
  Completed: "bg-success/15 text-success border-success/20",
  "In Progress": "bg-warning/15 text-warning-foreground border-warning/25",
  "Not Started": "bg-muted text-muted-foreground border-border",
};

export function DotCell({ checked }: { checked: boolean }) {
  return (
    <span
      className={`inline-grid h-5 w-5 place-items-center rounded-full ${
        checked ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
      }`}
    >
      {checked ? (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d="M1.5 5.5L4 8L8.5 2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <span className="h-0.5 w-2 rounded-full bg-current" />
      )}
    </span>
  );
}
