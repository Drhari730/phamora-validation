import Link from "next/link";
import {
  Smartphone,
  Download,
  ShieldAlert,
  ArrowRight,
  GraduationCap,
  Microscope,
  ChevronRight,
} from "lucide-react";
import { Logo } from "@/components/pharma/logo";
import { Badge } from "@/components/ui/badge";

const studentSteps = [
  {
    title: "Download the APK",
    text: "Tap the download button below on your Android phone. Your browser may warn that APK files can be harmful — this is normal for any app installed outside the Play Store.",
  },
  {
    title: "Allow installation from this source",
    text: "When you open the downloaded file, Android will ask to allow installs from your browser/file manager. Tap Settings → allow this source, then go back and install.",
  },
  {
    title: "Open PHAMORA and explore",
    text: "Use the app freely during your assigned study period — General Pharmacology, ANS, Cardiovascular and Antimicrobials are all included.",
  },
  {
    title: "Come back to this portal",
    text: "Your post-test, usability survey, app-quality questionnaire and feedback are all completed here, not in the app.",
  },
];

const expertSteps = [
  {
    title: "No installation required for review",
    text: "Every lesson, MCQ and monograph you're asked to rate is shown directly inside the Expert Portal, so you can complete your CVI review without installing anything.",
  },
  {
    title: "Optional: try the app hands-on",
    text: "If you'd like to experience PHAMORA as a student would before rating its content, you're welcome to install the same Android APK below.",
  },
  {
    title: "Return to your invite link",
    text: "Your personal review link (sent by the investigator) takes you straight back to your CVI rating panel at any time.",
  },
];

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Logo size="sm" />
          <Badge variant="outline" className="gap-1.5 rounded-full border-accent/30 bg-accent/10 text-accent">
            <Smartphone size={12} /> Android only
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-10 text-center">
          <h1 className="mb-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Download PHAMORA
          </h1>
          <p className="mx-auto max-w-lg text-sm text-muted-foreground">
            The offline pharmacology learning app being evaluated in this study.
            This is an Android APK — it is not available for iPhone/iOS, and not
            distributed through the Play Store.
          </p>
        </div>

        <div className="mb-10 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                <Smartphone size={26} />
              </div>
              <div>
                <p className="font-heading text-lg font-bold">PHAMORA.apk</p>
                <p className="text-xs text-muted-foreground">Version 1.0.0 · 62 MB · Android 8.0+</p>
              </div>
            </div>
            <a
              href="/downloads/PHAMORA.apk"
              download
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download size={16} /> Download for Android
            </a>
          </div>
          <div className="flex items-start gap-3 rounded-2xl bg-warning/10 p-4">
            <ShieldAlert size={16} className="mt-0.5 shrink-0 text-warning-foreground" />
            <p className="text-xs leading-relaxed text-warning-foreground">
              <strong>Android devices only.</strong> This app cannot be installed
              on iPhone, iPad, or any iOS device. There is currently no iOS
              version of PHAMORA.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                <GraduationCap size={17} />
              </div>
              <h2 className="font-heading text-base font-bold">For Students</h2>
            </div>
            <ol className="flex flex-col gap-4">
              {studentSteps.map((s, i) => (
                <li key={s.title} className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{s.title}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link
              href="/student/consent"
              className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              Go to Student Validation <ArrowRight size={14} />
            </Link>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent/10 text-accent">
                <Microscope size={17} />
              </div>
              <h2 className="font-heading text-base font-bold">For Experts</h2>
            </div>
            <ol className="flex flex-col gap-4">
              {expertSteps.map((s, i) => (
                <li key={s.title} className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{s.title}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link
              href="/expert"
              className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
            >
              Go to Expert Portal <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
