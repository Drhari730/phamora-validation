import Link from "next/link";
import {
  GraduationCap,
  Microscope,
  ShieldCheck,
  ArrowRight,
  Pill,
  BarChart3,
  ClipboardCheck,
  Smartphone,
} from "lucide-react";
import { Logo } from "@/components/pharma/logo";
import { Badge } from "@/components/ui/badge";

const accessCards = [
  {
    href: "/student/consent",
    icon: GraduationCap,
    title: "Student Validation",
    description:
      "Complete the pre/post knowledge test, usability survey and feedback as part of the study cohort.",
    cta: "Begin as Student",
    accent: "from-primary to-primary/70",
  },
  {
    href: "/expert",
    icon: Microscope,
    title: "Expert Validation",
    description:
      "Rate PHAMORA's pharmacology content for relevance and accuracy as part of the CVI expert panel.",
    cta: "Enter Expert Portal",
    accent: "from-accent to-accent/70",
  },
  {
    href: "/admin",
    icon: ShieldCheck,
    title: "Investigator Login",
    description:
      "Monitor recruitment, review CVI results and export research-ready datasets for analysis.",
    cta: "Investigator Sign In",
    accent: "from-indigo to-primary",
  },
];

const stats = [
  { label: "Validation components", value: "3", icon: ClipboardCheck },
  { label: "Pharmacology modules", value: "4", icon: Pill },
  { label: "Auto-scored instruments", value: "5", icon: BarChart3 },
];

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      {/* ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-32 h-[32rem] w-[32rem] rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute top-1/3 -left-32 h-[28rem] w-[28rem] rounded-full bg-primary/8 blur-3xl" />
      </div>

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 sm:px-8">
        <Logo />
        <Badge
          variant="outline"
          className="hidden rounded-full border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground sm:flex"
        >
          Digital Health Research · MSRUAS
        </Badge>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 sm:px-8">
        <section className="flex flex-col items-center gap-6 pt-12 pb-16 text-center sm:pt-20 sm:pb-24">
          <Badge className="rounded-full bg-secondary px-3.5 py-1.5 text-xs font-medium text-secondary-foreground border border-border">
            Research-grade validation portal
          </Badge>
          <h1 className="max-w-3xl font-heading text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-6xl">
            PHAMORA
            <span className="mt-2 block bg-gradient-to-r from-indigo via-primary to-accent bg-clip-text text-transparent">
              Digital Validation Study
            </span>
          </h1>
          <p className="max-w-xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
            Evaluation of usability, educational effectiveness and content
            validity of the PHAMORA pharmacology learning application.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-card border border-border shadow-sm">
                  <s.icon size={16} className="text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-heading text-lg font-bold leading-none">
                    {s.value}
                  </div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 pb-24 sm:grid-cols-3 sm:gap-6">
          {accessCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group relative flex flex-col rounded-3xl border border-border bg-card p-7 shadow-[0_1px_2px_rgba(16,24,43,0.04),0_12px_32px_-16px_rgba(16,24,43,0.12)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_1px_2px_rgba(16,24,43,0.04),0_24px_48px_-16px_rgba(16,24,43,0.18)]"
            >
              <div
                className={`mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${card.accent} text-primary-foreground shadow-sm transition-transform duration-300 group-hover:scale-110`}
              >
                <card.icon size={22} strokeWidth={2} />
              </div>
              <h3 className="mb-2 font-heading text-xl font-bold text-foreground">
                {card.title}
              </h3>
              <p className="mb-8 flex-1 text-sm leading-relaxed text-muted-foreground">
                {card.description}
              </p>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                {card.cta}
                <ArrowRight
                  size={15}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </div>
            </Link>
          ))}
        </section>

        <section className="pb-24">
          <Link
            href="/download"
            className="group mx-auto flex max-w-2xl items-center justify-between gap-4 rounded-2xl border border-border bg-card px-6 py-4 shadow-sm transition-colors hover:border-accent/30 hover:bg-secondary"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                <Smartphone size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold">Download PHAMORA to test on your device</p>
                <p className="text-xs text-muted-foreground">Android only · install &amp; setup instructions included</p>
              </div>
            </div>
            <ArrowRight size={16} className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </Link>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-6 pb-8 sm:px-8">
        <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© 2026 PHAMORA Validation Study. Data collected under institutional ethics approval.</p>
          <p>Confidential research instrument — not for public distribution.</p>
        </div>
      </footer>
    </div>
  );
}
