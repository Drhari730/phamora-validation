import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  markOnly = false,
  size = "md",
  dark = false,
}: {
  className?: string;
  markOnly?: boolean;
  size?: "sm" | "md" | "lg";
  dark?: boolean;
}) {
  const dims = {
    sm: { box: 26, text: "text-base" },
    md: { box: 34, text: "text-lg" },
    lg: { box: 52, text: "text-2xl" },
  }[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/phamora-mark.svg"
        alt="PHAMORA"
        width={dims.box}
        height={dims.box}
        className="shrink-0"
        priority
      />
      {!markOnly && (
        <span
          className={cn(
            "font-heading font-bold tracking-tight",
            dims.text,
            dark ? "text-white" : "text-foreground"
          )}
        >
          PHAMORA
        </span>
      )}
    </div>
  );
}
