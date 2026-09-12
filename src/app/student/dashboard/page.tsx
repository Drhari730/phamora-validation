import Link from "next/link";
import { redirect } from "next/navigation";
import {
  UserRound,
  ListChecks,
  BookOpenCheck,
  Rocket,
  Gauge,
  Sparkles,
  MessageSquareHeart,
  ArrowRight,
} from "lucide-react";
import { Logo } from "@/components/pharma/logo";
import { StatusPill, type JourneyStatus } from "@/components/pharma/status-pill";
import { JourneyTracker, type JourneyStep } from "@/components/pharma/journey-tracker";
import { Progress } from "@/components/ui/progress";
import { prisma } from "@/lib/prisma";
import { getParticipantState } from "../actions";

interface StageCard {
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  status: JourneyStatus;
  meta: string;
  href: string;
}

export default async function StudentDashboard() {
  const state = await getParticipantState();
  if (!state) redirect("/student/consent");

  const settings = await prisma.studySettings.findUnique({ where: { id: "singleton" } });

  const postTestUnlocked = state.pretestDone && Boolean(settings?.postTestOpen);
  const usabilityUnlocked = state.posttestDone && Boolean(settings?.usabilityOpen);
  const appQualityUnlocked = state.susDone;
  const feedbackUnlocked = state.appQualityDone;

  const stages: StageCard[] = [
    {
      title: "Baseline Profile",
      description: "Your MBBS year and prior pharmacology exposure.",
      icon: UserRound,
      status: state.profileDone ? "completed" : "active",
      meta: state.profileDone ? "Completed" : "Start here",
      href: "/student/profile",
    },
    {
      title: "Pre-Test",
      description: "Knowledge assessment across all four pharmacology modules.",
      icon: ListChecks,
      status: state.pretestDone ? "completed" : state.profileDone ? "active" : "locked",
      meta: state.pretestDone ? "Score recorded" : "Unlocks after profile",
      href: "/student/pretest",
    },
    {
      title: "PHAMORA Learning Period",
      description: "Use the app freely during the assigned study window.",
      icon: BookOpenCheck,
      status: state.posttestDone ? "completed" : state.pretestDone ? "active" : "locked",
      meta: settings?.studyPeriodEnd
        ? `Ends ${settings.studyPeriodEnd.toLocaleDateString()}`
        : "In progress",
      href: "/student/study-period",
    },
    {
      title: "Post-Test",
      description: "Rotated form of the knowledge assessment.",
      icon: Rocket,
      status: state.posttestDone ? "completed" : postTestUnlocked ? "active" : "locked",
      meta: state.posttestDone
        ? "Score recorded"
        : postTestUnlocked
        ? "Available now"
        : "Unlocks after study period",
      href: "/student/posttest",
    },
    {
      title: "Usability Assessment",
      description: "10-item System Usability Scale (SUS).",
      icon: Gauge,
      status: state.susDone ? "completed" : usabilityUnlocked ? "active" : "locked",
      meta: state.susDone ? "Completed" : usabilityUnlocked ? "Available now" : "Unlocks after Post-Test",
      href: "/student/usability",
    },
    {
      title: "App Quality",
      description: "Engagement, functionality, aesthetics & impact.",
      icon: Sparkles,
      status: state.appQualityDone ? "completed" : appQualityUnlocked ? "active" : "locked",
      meta: state.appQualityDone ? "Completed" : appQualityUnlocked ? "Available now" : "Unlocks after Usability",
      href: "/student/app-quality",
    },
    {
      title: "Feedback",
      description: "Open-ended reflections on your experience.",
      icon: MessageSquareHeart,
      status: state.feedbackDone ? "completed" : feedbackUnlocked ? "active" : "locked",
      meta: state.feedbackDone ? "Completed" : feedbackUnlocked ? "Final step" : "Unlocks after App Quality",
      href: "/student/feedback",
    },
  ];

  const completedCount = stages.filter((s) => s.status === "completed").length;

  const journey: JourneyStep[] = [
    { label: "Consent", status: state.consentDone ? "completed" : "current" },
    { label: "Baseline", status: state.profileDone ? "completed" : state.consentDone ? "current" : "upcoming" },
    { label: "Pre-Test", status: state.pretestDone ? "completed" : state.profileDone ? "current" : "upcoming" },
    { label: "PHAMORA Use", status: state.posttestDone ? "completed" : state.pretestDone ? "current" : "upcoming" },
    { label: "Post-Test", status: state.posttestDone ? "completed" : postTestUnlocked ? "current" : "upcoming" },
    { label: "Usability", status: state.susDone ? "completed" : usabilityUnlocked ? "current" : "upcoming" },
    { label: "Feedback", status: state.feedbackDone ? "completed" : feedbackUnlocked ? "current" : "upcoming" },
    { label: "Complete", status: state.studyStatus === "COMPLETED" ? "completed" : "upcoming" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 sm:pb-10">
      <header className="border-b border-border bg-card/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Logo size="sm" />
          <div className="flex items-center gap-3 rounded-full border border-border bg-secondary px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-success" />
            <span className="font-mono text-xs font-medium text-foreground">
              {state.participantCode}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pt-10">
        <div className="mb-10">
          <p className="text-sm font-medium text-accent">Hello 👋</p>
          <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Your PHAMORA Validation Journey
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Track your progress through the study. Each step unlocks once the
            previous one is complete.
          </p>
        </div>

        <div className="mb-10 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <span className="text-sm font-semibold">Overall progress</span>
            <span className="text-sm text-muted-foreground">
              {completedCount} of {stages.length} steps complete
            </span>
          </div>
          <Progress value={(completedCount / stages.length) * 100} className="mb-8 h-2" />
          <JourneyTracker steps={journey} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stages.map((stage) => {
            const isInteractive = stage.status !== "locked";
            const CardInner = (
              <div
                className={`group relative flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-all duration-300 ${
                  isInteractive
                    ? "hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/20"
                    : "opacity-70"
                }`}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div
                    className={`grid h-10 w-10 place-items-center rounded-xl ${
                      stage.status === "completed"
                        ? "bg-primary text-primary-foreground"
                        : stage.status === "active"
                        ? "bg-accent/15 text-accent"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <stage.icon size={18} strokeWidth={2} />
                  </div>
                  <StatusPill status={stage.status} />
                </div>
                <h3 className="mb-1 font-heading text-base font-bold">{stage.title}</h3>
                <p className="mb-4 flex-1 text-xs leading-relaxed text-muted-foreground">
                  {stage.description}
                </p>
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="text-[11px] text-muted-foreground">{stage.meta}</span>
                  {isInteractive && (
                    <ArrowRight
                      size={14}
                      className="text-primary opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                    />
                  )}
                </div>
              </div>
            );
            return isInteractive ? (
              <Link key={stage.title} href={stage.href}>
                {CardInner}
              </Link>
            ) : (
              <div key={stage.title}>{CardInner}</div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
