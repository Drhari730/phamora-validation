"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FormShell } from "@/components/pharma/form-shell";
import { LikertScale } from "@/components/pharma/likert-scale";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { submitSus } from "../actions";
import { SUS_ITEMS, LIKERT_AGREEMENT } from "@/lib/instruments";

export default function UsabilityPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [pending, startTransition] = useTransition();

  const answeredCount = Object.keys(answers).length;
  const complete = answeredCount === 10;

  function handleContinue() {
    startTransition(async () => {
      await submitSus({
        q1: answers[0], q2: answers[1], q3: answers[2], q4: answers[3], q5: answers[4],
        q6: answers[5], q7: answers[6], q8: answers[7], q9: answers[8], q10: answers[9],
      });
      router.push("/student/app-quality");
    });
  }

  return (
    <FormShell eyebrow="Step 6 of 8 · Usability Assessment" progressPct={(6 / 8) * 100} maxWidth="max-w-2xl">
      <h1 className="mb-2 font-heading text-2xl font-bold">System Usability Scale</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        For each statement, mark the response that best reflects your immediate
        reaction to using PHAMORA.
      </p>

      <div className="flex flex-col gap-4">
        {SUS_ITEMS.map((text, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="mb-4 text-sm font-medium leading-relaxed">
              <span className="mr-2 text-muted-foreground">{i + 1}.</span>
              {text}
            </p>
            <LikertScale
              value={answers[i]}
              onChange={(v) => setAnswers((p) => ({ ...p, [i]: v }))}
              labels={LIKERT_AGREEMENT}
            />
          </div>
        ))}
      </div>

      <Button
        className="mt-6 w-full rounded-full"
        size="lg"
        disabled={!complete || pending}
        onClick={handleContinue}
      >
        {pending ? "Saving…" : "Continue to App Quality"} <ChevronRight size={16} />
      </Button>
    </FormShell>
  );
}
