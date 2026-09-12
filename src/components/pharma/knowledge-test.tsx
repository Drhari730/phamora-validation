"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Flag, ChevronLeft, ChevronRight, CloudCheck, CircleCheck } from "lucide-react";
import { Logo } from "@/components/pharma/logo";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface TestQuestion {
  id: string;
  module: string;
  text: string;
  options: { key: string; text: string }[];
}

export function KnowledgeTest({
  questions,
  label,
  nextHref,
  submitLabel,
  onSubmit,
}: {
  questions: TestQuestion[];
  label: string;
  nextHref: string;
  submitLabel: string;
  onSubmit: (
    answers: { questionId: string; selectedOption: string; flagged: boolean }[]
  ) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [reviewMode, setReviewMode] = useState(false);

  const total = questions.length;
  const question = questions[index];
  const answeredCount = Object.keys(answers).length;
  const progressPct = (answeredCount / total) * 100;

  const savedState = useMemo(() => {
    return answers[question.id] ? "saved" : "unsaved";
  }, [answers, question.id]);

  function selectOption(key: string) {
    setAnswers((prev) => ({ ...prev, [question.id]: key }));
  }

  function toggleFlag() {
    setFlagged((prev) => ({ ...prev, [question.id]: !prev[question.id] }));
  }

  if (reviewMode) {
    return (
      <ReviewScreen
        questions={questions}
        answers={answers}
        flagged={flagged}
        nextHref={nextHref}
        submitLabel={submitLabel}
        onSubmit={onSubmit}
        onEdit={(i) => {
          setIndex(i);
          setReviewMode(false);
        }}
        onBack={() => setReviewMode(false)}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Logo size="sm" />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CloudCheck
              size={15}
              className={savedState === "saved" ? "text-success" : "text-muted-foreground"}
            />
            {savedState === "saved" ? "Saved" : "Not yet answered"}
          </div>
        </div>
        <div className="mx-auto max-w-3xl px-6 pb-4">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{label}</span>
            <span>{answeredCount} of {total} answered</span>
          </div>
          <Progress value={progressPct} className="h-1.5" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <Badge variant="outline" className="rounded-full border-accent/30 bg-accent/10 text-accent">
            {question.module}
          </Badge>
          <span className="font-mono text-sm text-muted-foreground">
            Question {String(index + 1).padStart(2, "0")} of {total}
          </span>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <h2 className="mb-8 font-heading text-lg font-semibold leading-relaxed sm:text-xl">
            {question.text}
          </h2>

          <div className="flex flex-col gap-3">
            {question.options.map((opt) => {
              const selected = answers[question.id] === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => selectOption(opt.key)}
                  className={cn(
                    "flex items-center gap-4 rounded-2xl border-2 px-4 py-3.5 text-left text-sm transition-all duration-150",
                    selected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-background hover:border-primary/30 hover:bg-secondary"
                  )}
                >
                  <span
                    className={cn(
                      "grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 text-xs font-bold",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground"
                    )}
                  >
                    {opt.key}
                  </span>
                  <span className={selected ? "font-medium text-foreground" : "text-foreground"}>
                    {opt.text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="outline"
            className="rounded-full"
            disabled={index === 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
          >
            <ChevronLeft size={16} /> Previous
          </Button>

          <button
            onClick={toggleFlag}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium transition-colors",
              flagged[question.id]
                ? "border-warning/40 bg-warning/15 text-warning-foreground"
                : "border-border text-muted-foreground hover:bg-secondary"
            )}
          >
            <Flag size={13} />
            {flagged[question.id] ? "Flagged" : "Flag for Review"}
          </button>

          {index < total - 1 ? (
            <Button
              className="rounded-full"
              onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
            >
              Next <ChevronRight size={16} />
            </Button>
          ) : (
            <Button className="rounded-full" onClick={() => setReviewMode(true)}>
              Review Answers <ChevronRight size={16} />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}

function ReviewScreen({
  questions,
  answers,
  flagged,
  nextHref,
  submitLabel,
  onSubmit,
  onEdit,
  onBack,
}: {
  questions: TestQuestion[];
  answers: Record<string, string>;
  flagged: Record<string, boolean>;
  nextHref: string;
  submitLabel: string;
  onSubmit: (
    answers: { questionId: string; selectedOption: string; flagged: boolean }[]
  ) => Promise<{ ok: boolean; error?: string }>;
  onEdit: (index: number) => void;
  onBack: () => void;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const total = questions.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === total;

  async function handleSubmit() {
    setPending(true);
    setError(null);
    const payload = questions.map((q) => ({
      questionId: q.id,
      selectedOption: answers[q.id],
      flagged: Boolean(flagged[q.id]),
    }));
    const result = await onSubmit(payload);
    if (result.ok) {
      router.push(nextHref);
    } else {
      setError(result.error ?? "Something went wrong. Please try again.");
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl px-6 py-5">
          <Logo size="sm" />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="mb-2 font-heading text-2xl font-bold">Review Your Answers</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Check every question before you submit. Once submitted, this
          assessment locks and cannot be changed.
        </p>

        <div className="mb-8 grid grid-cols-4 gap-3 sm:grid-cols-6">
          {questions.map((q, i) => {
            const isAnswered = Boolean(answers[q.id]);
            const isFlagged = flagged[q.id];
            return (
              <button
                key={q.id}
                onClick={() => onEdit(i)}
                className={cn(
                  "relative grid aspect-square place-items-center rounded-xl border-2 text-sm font-semibold transition-colors",
                  isAnswered
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-destructive/40 bg-destructive/5 text-destructive"
                )}
              >
                {i + 1}
                {isFlagged && (
                  <Flag size={10} className="absolute -right-1 -top-1 fill-warning text-warning" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-border bg-secondary p-4 text-sm">
          <CircleCheck size={18} className={allAnswered ? "text-success" : "text-muted-foreground"} />
          <span>
            {allAnswered
              ? "All questions answered. Ready to submit."
              : `${total - answeredCount} question(s) still unanswered.`}
          </span>
        </div>

        {error && <p className="mb-4 text-center text-sm text-destructive">{error}</p>}
        <div className="flex items-center justify-between">
          <Button variant="outline" className="rounded-full" onClick={onBack} disabled={pending}>
            <ChevronLeft size={16} /> Back to Questions
          </Button>
          <Button
            className="rounded-full"
            disabled={!allAnswered || pending}
            onClick={handleSubmit}
          >
            {pending ? "Submitting…" : submitLabel}
          </Button>
        </div>
      </main>
    </div>
  );
}
