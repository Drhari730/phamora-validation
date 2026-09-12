"use client";

import { useMemo, useState } from "react";
import { AdminShell } from "@/components/pharma/admin-shell";
import { StatCard } from "@/components/pharma/stat-card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClipboardCheck, Gauge, ListChecks, MessageSquareText } from "lucide-react";
import type { getCviData } from "../actions";

type CviData = Awaited<ReturnType<typeof getCviData>>;
type Row = CviData["table"][number];

const moduleLabels: Record<string, string> = {
  GENERAL_PHARMACOLOGY: "General Pharmacology",
  ANS: "ANS",
  CARDIOVASCULAR: "Cardiovascular",
  ANTIMICROBIALS: "Antimicrobials",
};

const statusLabels: Record<string, string> = {
  ACCEPTED: "Accepted",
  REVIEW_RECOMMENDED: "Review Recommended",
  REVISION_REQUIRED: "Revision Required",
};

const statusTone: Record<string, string> = {
  ACCEPTED: "bg-success/15 text-success border-success/20",
  REVIEW_RECOMMENDED: "bg-warning/15 text-warning-foreground border-warning/25",
  REVISION_REQUIRED: "bg-destructive/10 text-destructive border-destructive/20",
};

export function CviClient({ data }: { data: CviData }) {
  const [moduleFilter, setModuleFilter] = useState("All");
  const [openItem, setOpenItem] = useState<Row | null>(null);

  const modules = ["All", ...Object.keys(moduleLabels)];
  const rows = useMemo(
    () => data.table.filter((r) => moduleFilter === "All" || r.module === moduleFilter),
    [data.table, moduleFilter]
  );

  return (
    <AdminShell>
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-6 py-4 backdrop-blur sm:px-8">
        <div>
          <h1 className="font-heading text-xl font-bold sm:text-2xl">CVI Review</h1>
          <p className="text-xs text-muted-foreground">Content Validity Index — item-level results</p>
        </div>
      </header>

      <main className="px-6 py-8 sm:px-8">
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="S-CVI/Ave" value={data.scviAve} icon={Gauge} tone="accent" />
          <StatCard label="S-CVI/UA" value={`${data.scviUa}%`} icon={ClipboardCheck} />
          <StatCard label="Items Accepted" value={data.accepted} icon={ListChecks} tone="success" />
          <StatCard label="Revision Required" value={data.revisionRequired} icon={MessageSquareText} tone="warning" />
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {modules.map((m) => (
            <button
              key={m}
              onClick={() => setModuleFilter(m)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                moduleFilter === m
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              {m === "All" ? "All" : moduleLabels[m]}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Content Item</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Experts Completed</TableHead>
                  <TableHead>I-CVI</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Comments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer hover:bg-secondary/60"
                    onClick={() => setOpenItem(row)}
                  >
                    <TableCell className="text-sm font-medium">{row.item}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{moduleLabels[row.module] ?? row.module}</TableCell>
                    <TableCell className="text-sm">{row.completed}</TableCell>
                    <TableCell className="font-mono text-sm font-semibold">{row.icvi.toFixed(3)}</TableCell>
                    <TableCell>
                      <Badge className={`rounded-full border text-xs ${statusTone[row.status]}`} variant="outline">
                        {statusLabels[row.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-primary underline-offset-2 hover:underline">
                      View {row.comments.length}
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                      No content items rated yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      <Sheet open={!!openItem} onOpenChange={(o) => !o && setOpenItem(null)}>
        <SheetContent className="w-full max-w-md">
          {openItem && (
            <>
              <SheetHeader>
                <SheetTitle className="font-heading">{openItem.item}</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 px-4 pb-6">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="rounded-full border-accent/30 bg-accent/10 text-accent">
                    {moduleLabels[openItem.module] ?? openItem.module}
                  </Badge>
                  <Badge className={`rounded-full border text-xs ${statusTone[openItem.status]}`} variant="outline">
                    {statusLabels[openItem.status]}
                  </Badge>
                </div>
                <div className="rounded-2xl bg-muted p-4 text-center">
                  <p className="font-heading text-2xl font-bold">{openItem.icvi.toFixed(3)}</p>
                  <p className="text-xs text-muted-foreground">Item-level CVI ({openItem.completed} experts)</p>
                </div>
                <p className="text-xs font-semibold text-muted-foreground">
                  Anonymised expert comments
                </p>
                <div className="flex flex-col gap-3">
                  {openItem.comments.length === 0 && (
                    <p className="text-sm text-muted-foreground">No comments left on this item.</p>
                  )}
                  {openItem.comments.map((c, i) => (
                    <div key={i} className="rounded-2xl border border-border p-4">
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">{c.label}</span>
                        <Badge variant="outline" className="rounded-full text-xs">
                          Rated {c.rating}/4
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground">{c.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AdminShell>
  );
}
