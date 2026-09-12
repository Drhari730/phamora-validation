"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FormShell } from "@/components/pharma/form-shell";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LikertScale } from "@/components/pharma/likert-scale";
import { CheckCircle2 } from "lucide-react";
import { submitFeedback } from "../actions";

const openQuestions = [
  { key: "likes", label: "What did you like most about PHAMORA?" },
  { key: "difficulties", label: "What difficulties did you experience?" },
  { key: "usefulFeature", label: "Which feature was most useful?" },
  { key: "improvementFeature", label: "Which feature requires improvement?" },
  { key: "suggestedFeature", label: "What feature would you like added?" },
  { key: "otherSuggestions", label: "Any other suggestions?" },
];

const satisfactionLabels: [string, string, string, string, string] = [
  "Very Dissatisfied",
  "Dissatisfied",
  "Neutral",
  "Satisfied",
  "Very Satisfied",
];

export default function FeedbackPage() {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>({});
  const [satisfaction, setSatisfaction] = useState<number>();
  const [pending, startTransition] = useTransition();

  function handleSubmit() {
    startTransition(async () => {
      await submitFeedback({ ...values, overallSatisfaction: satisfaction });
      router.push("/student/complete");
    });
  }

  return (
    <FormShell eyebrow="Step 8 of 8 · Final Feedback" progressPct={100} maxWidth="max-w-2xl">
      <h1 className="mb-2 font-heading text-2xl font-bold">A Few Last Thoughts</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Optional, but your candid feedback shapes future improvements to PHAMORA.
      </p>

      <div className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        {openQuestions.map((q) => (
          <div key={q.key}>
            <Label className="mb-2 text-sm font-medium">{q.label}</Label>
            <Textarea
              className="min-h-20 rounded-2xl"
              placeholder="Optional…"
              value={values[q.key] ?? ""}
              onChange={(e) => setValues((p) => ({ ...p, [q.key]: e.target.value }))}
            />
          </div>
        ))}

        <div>
          <Label className="mb-3 block text-sm font-medium">
            Overall, how satisfied are you with PHAMORA?
          </Label>
          <LikertScale value={satisfaction} onChange={setSatisfaction} labels={satisfactionLabels} />
        </div>
      </div>

      <Button className="mt-6 w-full rounded-full" size="lg" disabled={pending} onClick={handleSubmit}>
        <CheckCircle2 size={16} /> {pending ? "Submitting…" : "Submit & Finish"}
      </Button>
    </FormShell>
  );
}
