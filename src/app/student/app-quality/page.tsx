"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FormShell } from "@/components/pharma/form-shell";
import { LikertScale } from "@/components/pharma/likert-scale";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { submitAppQuality } from "../actions";

const qualityLikert: [string, string, string, string, string] = [
  "Inadequate",
  "Poor",
  "Acceptable",
  "Good",
  "Excellent",
];

const agreementLikert: [string, string, string, string, string] = [
  "Strongly Disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly Agree",
];

const sections = [
  {
    key: "engagement",
    title: "Engagement",
    labels: qualityLikert,
    items: [
      "Entertainment — Is PHAMORA fun/engaging to use? Does it use gamification (streaks, badges, progress) effectively?",
      "Interest — Was the content presented in an interesting way?",
      "Customization — Does the app adapt to your own progress/performance (e.g., spaced-repetition flashcards, stats)?",
      "Interactivity — Does it prompt input, give feedback, track progress, or notify you appropriately?",
      "Target group — Is the content appropriate and pitched correctly for undergraduate medical students?",
    ],
  },
  {
    key: "functionality",
    title: "Functionality",
    labels: qualityLikert,
    items: [
      "Performance — Do the app's features (quizzes, search, flashcards) work accurately and load quickly?",
      "Ease of use — Is it easy to learn how to use PHAMORA, with clear menus/labels?",
      "Navigation — Is it easy to move between lessons, quizzes, cases, and monographs?",
      "Gestural design — Are taps/swipes/scrolls consistent and intuitive throughout the app?",
    ],
  },
  {
    key: "aesthetics",
    title: "Aesthetics",
    labels: qualityLikert,
    items: [
      "Layout — Are graphics and menus well organized and sized appropriately?",
      "Graphics — Is the visual quality of icons/illustrations/charts good?",
      "Visual appeal — Overall, how good does PHAMORA look?",
    ],
  },
  {
    key: "information",
    title: "Information Quality",
    labels: qualityLikert,
    items: [
      "Quality of information — Is the pharmacology content correct, well written, and clinically relevant?",
      "Quantity of information — Is the amount of content in each lesson/monograph appropriate (not too little/too much)?",
      "Visual information — Are charts, tables and mechanism diagrams clear and well designed?",
      "Goal clarity — Does each lesson/case have a clear, specific learning objective?",
    ],
  },
  {
    key: "subjective",
    title: "Subjective Quality",
    labels: qualityLikert,
    items: [
      "Would you recommend PHAMORA to fellow medical students?",
      "How many times do you think you would use PHAMORA in the next 12 months?",
      "Would you pay for this app? (rate perceived value even if free)",
      "Overall star rating you would give PHAMORA.",
    ],
  },
  {
    key: "impact",
    title: "Perceived Learning Impact",
    labels: agreementLikert,
    items: [
      "Using PHAMORA increased my awareness of key pharmacology concepts.",
      "Using PHAMORA increased my knowledge of drug mechanisms/interactions/ADRs.",
      "PHAMORA changed my attitude toward the importance of pharmacology in clinical practice.",
      "Using PHAMORA increased my confidence in applying pharmacology to clinical (case-based) reasoning.",
      "I intend to keep using PHAMORA for exam preparation / clinical rotations.",
      "Overall, PHAMORA is likely to improve learning outcomes compared to my usual study methods.",
    ],
  },
];

export default function AppQualityPage() {
  const router = useRouter();
  const [sectionIndex, setSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [pending, startTransition] = useTransition();

  const section = sections[sectionIndex];
  const sectionAnswered = section.items.every((_, i) => answers[`${section.key}_${i}`] !== undefined);
  const isLast = sectionIndex === sections.length - 1;

  function handleFinish() {
    startTransition(async () => {
      const responses = sections.flatMap((s) =>
        s.items.map((text, i) => ({
          section: s.key.toUpperCase() === "IMPACT" ? "PERCEIVED_IMPACT" : s.key.toUpperCase() === "INFORMATION" ? "INFORMATION_QUALITY" : s.key.toUpperCase(),
          itemId: `${s.key}_${i}`,
          itemLabel: text,
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
        {sections.map((s, i) => (
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
        {section.items.map((text, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="mb-4 text-sm font-medium leading-relaxed">{text}</p>
            <LikertScale
              value={answers[`${section.key}_${i}`]}
              onChange={(v) =>
                setAnswers((p) => ({ ...p, [`${section.key}_${i}`]: v }))
              }
              labels={section.labels}
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
            onClick={() => setSectionIndex((i) => Math.min(sections.length - 1, i + 1))}
          >
            Next Section <ChevronRight size={16} />
          </Button>
        )}
      </div>
    </FormShell>
  );
}
