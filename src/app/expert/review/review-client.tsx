"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, CircleCheck, Smartphone } from "lucide-react";
import { Logo } from "@/components/pharma/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { submitCviRating } from "../actions";
import type { getExpertReviewData } from "../actions";

type ReviewData = NonNullable<Awaited<ReturnType<typeof getExpertReviewData>>>;

const ratingScale = [
  { value: 1, label: "Not Relevant" },
  { value: 2, label: "Needs Major Revision" },
  { value: 3, label: "Relevant, Minor Revision" },
  { value: 4, label: "Highly Relevant" },
];

const moduleLabels: Record<string, string> = {
  GENERAL_PHARMACOLOGY: "General Pharmacology",
  ANS: "ANS",
  CARDIOVASCULAR: "Cardiovascular",
  ANTIMICROBIALS: "Antimicrobials",
};

export function ReviewClient({ data }: { data: ReviewData }) {
  const [index, setIndex] = useState(0);
  const [items, setItems] = useState(data.items);
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const item = items[index];
  const total = items.length;

  function setRating(rating: number) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, rating } : it)));
    save({ contentItemId: item.id, rating, comment: item.comment });
  }

  function setComment(comment: string) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, comment } : it)));
  }

  function save(payload: { contentItemId: string; rating?: number; comment?: string }) {
    if (payload.rating === undefined) return;
    startTransition(async () => {
      await submitCviRating({
        contentItemId: payload.contentItemId,
        rating: payload.rating!,
        comment: payload.comment,
      });
      setSavedAt(Date.now());
    });
  }

  function handleNext() {
    if (item.rating !== undefined) {
      save({ contentItemId: item.id, rating: item.rating, comment: item.comment });
    }
    setIndex((i) => Math.min(total - 1, i + 1));
  }

  const moduleProgress = Object.entries(data.moduleProgress);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Logo size="sm" />
          <div className="rounded-full border border-border bg-secondary px-3 py-1.5 font-mono text-xs">
            {data.expertCode}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold">Welcome to PHAMORA Expert Validation</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Rate each content item for relevance to undergraduate pharmacology education.
          </p>
        </div>

        <Link
          href="/download"
          className="mb-8 flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-3.5 text-left transition-colors hover:bg-secondary"
        >
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent">
            <Smartphone size={14} />
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Optional: </span>
            try PHAMORA hands-on before rating (Android only) — no installation
            needed to complete your review.
          </p>
        </Link>

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {moduleProgress.map(([mod, p]) => (
            <div key={mod} className="rounded-2xl border border-border bg-card p-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">{moduleLabels[mod] ?? mod}</p>
              <p className="mb-2 font-heading text-lg font-bold">
                {p.done}
                <span className="text-sm font-normal text-muted-foreground">/{p.total}</span>
              </p>
              <Progress value={p.total ? (p.done / p.total) * 100 : 0} className="h-1.5" />
            </div>
          ))}
        </div>

        {total === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            No content items are available for review yet.
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <Badge variant="outline" className="rounded-full border-accent/30 bg-accent/10 text-accent">
                {moduleLabels[item.module] ?? item.module}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Item {index + 1} of {total}
              </span>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <Badge className="rounded-full bg-secondary text-secondary-foreground border border-border">
                  {item.contentType}
                </Badge>
              </div>
              <h2 className="mb-3 font-heading text-xl font-bold">{item.title}</h2>
              <div className="mb-8 rounded-2xl bg-muted p-5 text-sm leading-relaxed text-muted-foreground">
                {item.preview}
              </div>

              <p className="mb-4 text-sm font-semibold">
                How relevant is this content to undergraduate pharmacology education?
              </p>
              <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {ratingScale.map((r) => {
                  const selected = item.rating === r.value;
                  return (
                    <button
                      key={r.value}
                      onClick={() => setRating(r.value)}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-2xl border-2 px-3 py-4 text-center transition-all",
                        selected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/30 hover:bg-secondary"
                      )}
                    >
                      <span
                        className={cn(
                          "grid h-8 w-8 place-items-center rounded-full text-sm font-bold",
                          selected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {r.value}
                      </span>
                      <span className="text-xs font-medium leading-tight text-foreground">
                        {r.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <label className="mb-2 block text-sm font-semibold">
                Comments / Suggested Revision
              </label>
              <Textarea
                placeholder="Optional — note any wording, accuracy or scope concerns…"
                className="min-h-24 rounded-2xl"
                value={item.comment}
                onChange={(e) => setComment(e.target.value)}
                onBlur={() => item.rating !== undefined && save({ contentItemId: item.id, rating: item.rating, comment: item.comment })}
              />
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
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CircleCheck size={14} className={pending ? "text-muted-foreground" : "text-success"} />
                {pending ? "Saving…" : savedAt ? "Autosaved" : "Not yet rated"}
              </div>
              <Button
                className="rounded-full"
                disabled={index === total - 1 || item.rating === undefined}
                onClick={handleNext}
              >
                Save &amp; Next <ChevronRight size={16} />
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
