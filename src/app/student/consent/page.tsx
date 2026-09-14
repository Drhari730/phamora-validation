"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Clock, UserRoundCheck, Lock, LogOut, Mail } from "lucide-react";
import { Logo } from "@/components/pharma/logo";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { submitConsent } from "../actions";

const infoPoints = [
  {
    icon: Clock,
    title: "Duration",
    text: "About 20 minutes for the pre-test and profile, plus 15–20 minutes for the post-test and questionnaires after the study period.",
  },
  {
    icon: UserRoundCheck,
    title: "Voluntary participation",
    text: "Taking part is entirely optional and ungraded. It has no bearing on your academic standing.",
  },
  {
    icon: Lock,
    title: "Confidentiality",
    text: "You are identified only by an anonymous participant code. No names are collected or published.",
  },
  {
    icon: LogOut,
    title: "Right to withdraw",
    text: "You may stop at any point without giving a reason and without any consequence.",
  },
];

export default function ConsentPage() {
  const router = useRouter();
  const [read, setRead] = useState(false);
  const [agree, setAgree] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleAgree() {
    setError(null);
    startTransition(async () => {
      const result = await submitConsent({ informationRead: read, voluntaryAgree: agree });
      if (result.ok) {
        router.push("/student/profile");
      } else {
        setError(result.error ?? "Something went wrong. Please try again.");
      }
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-2xl px-6 py-4">
          <Logo size="sm" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-8 flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold">Participant Information &amp; Consent</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              PHAMORA Validation Study — please read before continuing.
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <h2 className="mb-2 font-heading text-base font-bold">Study Title</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Evaluation of Usability, Educational Effectiveness and Content Validity of the PHAMORA
            Pharmacology Learning Application among Undergraduate Health-Professions Students
            (MBBS, BDS, Pharmacy/Pharm.D, and Nursing).
          </p>

          <h2 className="mb-2 font-heading text-base font-bold">Purpose</h2>
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
            This study evaluates whether PHAMORA, an offline pharmacology learning app, is accurate,
            usable and effective for undergraduate pharmacology education across medical, dental,
            pharmacy and nursing programs. Your participation will help validate the app for wider
            curricular use.
          </p>

          <h2 className="mb-2 font-heading text-base font-bold">What participation involves</h2>
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
            You will complete a short baseline profile and a pre-test, use PHAMORA freely during a
            defined study period, then complete a post-test, a usability survey, an app-quality
            questionnaire and a brief feedback form.
          </p>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {infoPoints.map((p) => (
              <div key={p.title} className="rounded-2xl bg-muted p-4">
                <div className="mb-2 flex items-center gap-2">
                  <p.icon size={15} className="text-accent" />
                  <span className="text-xs font-semibold">{p.title}</span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">{p.text}</p>
              </div>
            ))}
          </div>

          <h2 className="mb-2 font-heading text-base font-bold">Investigator</h2>
          <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Mail size={14} />
            Dr. G. Hari Prakash, Principal Investigator — contact details provided by your institution.
          </div>

          <div className="rounded-2xl border border-dashed border-border p-4 text-xs text-muted-foreground">
            Ethics approval reference: <span className="font-mono">[institutional ethics committee approval number — placeholder]</span>
          </div>
        </div>

        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <label className="flex cursor-pointer items-start gap-3">
            <Checkbox checked={read} onCheckedChange={(v) => setRead(Boolean(v))} className="mt-0.5" />
            <span className="text-sm">
              I have read and understood the information above.
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <Checkbox checked={agree} onCheckedChange={(v) => setAgree(Boolean(v))} className="mt-0.5" />
            <span className="text-sm">
              I voluntarily agree to participate in this study.
            </span>
          </label>
        </div>

        {error && (
          <p className="mb-3 text-center text-sm text-destructive">{error}</p>
        )}
        <Button
          className="w-full rounded-full"
          size="lg"
          disabled={!read || !agree || pending}
          onClick={handleAgree}
        >
          {pending ? "Submitting…" : "I Agree & Continue"}
        </Button>
      </main>
    </div>
  );
}
