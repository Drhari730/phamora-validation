"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FormShell } from "@/components/pharma/form-shell";
import { LikertScale } from "@/components/pharma/likert-scale";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { submitAppQuality } from "../actions";
import { APP_QUALITY_SECTIONS } from "@/lib/instruments";

export default function AppQualityPage() {
  const router = useRouter();
  const [sectionIndex, setSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [pending, startTransition] = useTransition();

  const section = APP_QUALITY_SECTIONS[sectionIndex];
  const sectionAnswered = section.items.every((_, i) => answers[`${section.key}_${i}`] !== undefined);
  const isLast = sectionIndex === APP_QUALITY_SECTIONS.length - 1;

  function handleFinish() {
    startTransition(async () => {
      const responses = APP_QUALITY_SECTIONS.flatMap((s) =>
        s.items.map((item, i) => ({
          section: s.dbSection,
          itemId: `${s.key}_${i}`,
          itemLabel: item.text,
          response: answers[`${s.key}_${i}`],
        }))
      );
      await submitAppQuality(responses);
      router.push("/student/feedback");
    });
  }

  return (
    <FormShell
      eyebrow="Step 7 of 8 · App Quality Assessment"
      progressPct={(7 / 8) * 100}
      maxWidth="max-w-2xl"
    >
      <h1 className="mb-2 font-heading text-2xl font-bold">App Quality &amp; Learning Impact</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Rate PHAMORA across six short sections. Each takes under a minute.
      </p>

      <div className="mb-8 flex flex-wrap gap-2">
        {APP_QUALITY_SECTIONS.map((s, i) => (
          <button
            key={s.key}
            onClick={() => setSectionIndex(i)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              i === sectionIndex
                ? "border-primary bg-primary text-primary-foreground"
                : answers[`${s.key}_0`] !== undefined
                ? "border-success/30 bg-success/10 text-success"
                : "border-border text-muted-foreground hover:bg-secondary"
            )}
          >
            {s.title}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {section.items.map((item, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="mb-4 text-sm font-medium leading-relaxed">{item.text}</p>
            <LikertScale
              value={answers[`${section.key}_${i}`]}
              onChange={(v) =>
                setAnswers((p) => ({ ...p, [`${section.key}_${i}`]: v }))
              }
              labels={item.labels ?? section.labels}
            />
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button
          variant="outline"
          className="rounded-full"
          disabled={sectionIndex === 0}
          onClick={() => setSectionIndex((i) => Math.max(0, i - 1))}
        >
          <ChevronLeft size={16} /> Previous Section
        </Button>
        {isLast ? (
          <Button
            className="rounded-full"
            disabled={!sectionAnswered || pending}
            onClick={handleFinish}
          >
            {pending ? "Saving…" : "Continue to Feedback"} <ChevronRight size={16} />
          </Button>
        ) : (
          <Button
            className="rounded-full"
            disabled={!sectionAnswered}
            onClick={() => setSectionIndex((i) => Math.min(APP_QUALITY_SECTIONS.length - 1, i + 1))}
          >
            Next Section <ChevronRight size={16} />
          </Button>
        )}
      </div>
    </FormShell>
  );
}
