import { CalendarRange, CheckCircle2, Info } from "lucide-react";
import { Logo } from "@/components/pharma/logo";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function StudyPeriodPage() {
  const settings = await prisma.studySettings.findUnique({ where: { id: "singleton" } });
  const dateFmt = (d: Date | null | undefined) =>
    d ? d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "TBD";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-2xl px-6 py-4">
          <Logo size="sm" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-success/10 text-success">
          <CheckCircle2 size={30} />
        </div>
        <h1 className="mb-2 font-heading text-2xl font-bold">
          Your Baseline Assessment is Complete
        </h1>
        <p className="mx-auto mb-10 max-w-md text-sm text-muted-foreground">
          Now use PHAMORA during the assigned study period. Your post-test and
          questionnaires will unlock automatically once the window ends.
        </p>

        <div className="mb-8 rounded-3xl border border-border bg-card p-6 text-left shadow-sm sm:p-8">
          <Badge className="mb-5 rounded-full border border-accent/25 bg-accent/10 text-accent">
            <span className="mr-1.5 inline-flex h-2 w-2 animate-pulse rounded-full bg-accent" />
            PHAMORA Learning Period Active
          </Badge>

          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-muted p-4">
              <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarRange size={13} /> Start Date
              </div>
              <p className="font-heading text-base font-bold">{dateFmt(settings?.studyPeriodStart)}</p>
            </div>
            <div className="rounded-2xl bg-muted p-4">
              <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarRange size={13} /> End Date
              </div>
              <p className="font-heading text-base font-bold">{dateFmt(settings?.studyPeriodEnd)}</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="mb-1 text-xs font-semibold text-muted-foreground">Expected duration of use</p>
            <p className="text-sm">2–4 weeks, at your own pace</p>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-secondary p-4">
            <Info size={16} className="mt-0.5 shrink-0 text-primary" />
            <p className="text-xs leading-relaxed text-secondary-foreground">
              Explore all four modules — General Pharmacology, ANS, Cardiovascular
              and Antimicrobials — at your own pace. There is no minimum usage
              requirement, but regular use will help you get the most from the
              app before your post-test.
            </p>
          </div>
        </div>

        <Link href="/student/dashboard">
          <Button variant="outline" className="rounded-full">
            Back to Dashboard
          </Button>
        </Link>
      </main>
    </div>
  );
}
