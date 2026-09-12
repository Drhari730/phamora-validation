import { CheckCircle2, PartyPopper } from "lucide-react";
import { Logo } from "@/components/pharma/logo";
import { getParticipantState } from "../actions";

const completedSteps = [
  { key: "consentDone", label: "Consent" },
  { key: "pretestDone", label: "Pre-Test" },
  { key: "posttestDone", label: "Post-Test" },
  { key: "susDone", label: "Usability" },
  { key: "appQualityDone", label: "App Quality" },
  { key: "feedbackDone", label: "Feedback" },
] as const;

export default async function CompletePage() {
  const state = await getParticipantState();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="mb-6 grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg">
        <PartyPopper size={34} />
      </div>
      <p className="mb-1 text-sm font-medium text-accent">PHAMORA Validation Study</p>
      <h1 className="mb-3 font-heading text-3xl font-bold tracking-tight">Thank You</h1>
      <p className="mb-8 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Your responses have been successfully submitted. Thank you for
        contributing to the evaluation of PHAMORA.
      </p>

      <div className="mb-8 w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
          <span className="text-xs text-muted-foreground">Participant ID</span>
          <span className="font-mono text-sm font-semibold">
            {state?.participantCode ?? "—"}
          </span>
        </div>
        <div className="flex flex-col gap-2.5 text-left">
          {completedSteps.map((s) => (
            <div key={s.key} className="flex items-center gap-2.5">
              <CheckCircle2
                size={16}
                className={state?.[s.key] ? "text-success" : "text-muted-foreground/40"}
              />
              <span className={`text-sm ${!state?.[s.key] ? "text-muted-foreground" : ""}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Logo size="sm" />
    </div>
  );
}
