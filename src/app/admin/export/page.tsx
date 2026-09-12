"use client";

import { useState, useTransition } from "react";
import {
  Download,
  FileSpreadsheet,
  FileJson,
  FileText,
  Users,
  ListChecks,
  Rocket,
  Gauge,
  Sparkles,
  MessageSquareHeart,
  Microscope,
  ClipboardCheck,
  BookOpen,
} from "lucide-react";
import { AdminShell } from "@/components/pharma/admin-shell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { exportCsv, exportJson, exportXlsx, type DatasetKey } from "../actions";

const datasets: { key: DatasetKey; label: string; desc: string; icon: typeof Users }[] = [
  { key: "participants", label: "Complete Student Dataset", desc: "All participants, consent, profile & status", icon: Users },
  { key: "pretest", label: "Pre-Test Responses", desc: "Item-level responses, scores & timings", icon: ListChecks },
  { key: "posttest", label: "Post-Test Responses", desc: "Item-level responses, scores & timings", icon: Rocket },
  { key: "sus", label: "SUS Dataset", desc: "Raw item responses + calculated SUS score", icon: Gauge },
  { key: "appquality", label: "App Quality Dataset", desc: "uMARS subscale items & means", icon: Sparkles },
  { key: "feedback", label: "Qualitative Feedback", desc: "Open-ended responses, satisfaction rating", icon: MessageSquareHeart },
  { key: "expertcvi", label: "Expert CVI Dataset", desc: "Every expert rating & comment, raw", icon: Microscope },
  { key: "cvisummary", label: "CVI Summary", desc: "I-CVI, S-CVI/Ave, S-CVI/UA by item", icon: ClipboardCheck },
  { key: "codebook", label: "Codebook", desc: "Variable names, types & value labels", icon: BookOpen },
];

const formats = [
  { key: "csv", label: "CSV", icon: FileText },
  { key: "xlsx", label: "Excel (XLSX)", icon: FileSpreadsheet },
  { key: "json", label: "JSON", icon: FileJson },
] as const;

function downloadText(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadBase64(filename: string, base64: string) {
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  const blob = new Blob([arr], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminExportPage() {
  const [selected, setSelected] = useState<DatasetKey[]>(["participants", "pretest", "posttest"]);
  const [format, setFormat] = useState<(typeof formats)[number]["key"]>("xlsx");
  const [excludePilot, setExcludePilot] = useState(true);
  const [pending, startTransition] = useTransition();

  function toggle(key: DatasetKey) {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function handleExport() {
    startTransition(async () => {
      if (format === "xlsx") {
        const { filename, base64 } = await exportXlsx(selected, excludePilot);
        downloadBase64(filename, base64);
      } else if (format === "json") {
        const { filename, content } = await exportJson(selected, excludePilot);
        downloadText(filename, content, "application/json");
      } else {
        for (const key of selected) {
          const { filename, content } = await exportCsv(key, excludePilot);
          downloadText(filename, content, "text/csv");
        }
      }
    });
  }

  return (
    <AdminShell>
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 px-6 py-4 backdrop-blur sm:px-8">
        <h1 className="font-heading text-xl font-bold sm:text-2xl">Data Export</h1>
        <p className="text-xs text-muted-foreground">Research-ready datasets for statistical analysis</p>
      </header>

      <main className="px-6 py-8 sm:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="mb-3 text-sm font-semibold">Select datasets</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {datasets.map((d) => {
                const isSelected = selected.includes(d.key);
                return (
                  <button
                    key={d.key}
                    onClick={() => toggle(d.key)}
                    className={cn(
                      "flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30 hover:bg-secondary"
                    )}
                  >
                    <div
                      className={cn(
                        "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}
                    >
                      <d.icon size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{d.label}</p>
                      <p className="text-xs text-muted-foreground">{d.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold">Export options</h2>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Format</p>
              <div className="mb-5 flex flex-col gap-2">
                {formats.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFormat(f.key)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 text-sm transition-all",
                      format === f.key
                        ? "border-primary bg-primary/5 font-medium"
                        : "border-border text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    <f.icon size={15} />
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="mb-5 flex items-center justify-between rounded-xl bg-muted p-3">
                <div>
                  <p className="text-xs font-medium">Exclude pilot records</p>
                  <p className="text-[11px] text-muted-foreground">Recommended for final analysis</p>
                </div>
                <Switch checked={excludePilot} onCheckedChange={setExcludePilot} />
              </div>

              <Button
                className="w-full gap-2 rounded-full"
                disabled={selected.length === 0 || pending}
                onClick={handleExport}
              >
                <Download size={15} />
                {pending
                  ? "Preparing…"
                  : `Export ${selected.length} dataset${selected.length !== 1 ? "s" : ""}`}
              </Button>

              {format === "csv" && selected.length > 1 && (
                <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                  CSV downloads one file per dataset. Choose Excel to combine
                  them into a single multi-sheet workbook.
                </p>
              )}
              {format === "xlsx" && selected.length > 1 && (
                <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                  Each dataset will be written to its own sheet within a single
                  workbook.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </AdminShell>
  );
}
