"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Download } from "lucide-react";
import { AdminShell } from "@/components/pharma/admin-shell";
import { DotCell, statusTone } from "@/components/pharma/dot-cell";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { getStudentsTable } from "../actions";

type Row = Awaited<ReturnType<typeof getStudentsTable>>[number];

const filterTabs = ["All", "Not Started", "In Progress", "Completed"] as const;

export function StudentsClient({ rows }: { rows: Row[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filterTabs)[number]>("All");

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchesQuery = r.code.toLowerCase().includes(query.toLowerCase());
      const matchesFilter = filter === "All" || r.status === filter;
      return matchesQuery && matchesFilter;
    });
  }, [rows, query, filter]);

  return (
    <AdminShell>
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-6 py-4 backdrop-blur sm:px-8">
        <div>
          <h1 className="font-heading text-xl font-bold sm:text-2xl">Students</h1>
          <p className="text-xs text-muted-foreground">{rows.length} participants enrolled</p>
        </div>
        <Link href="/admin/export" className={cn(buttonVariants({ variant: "outline" }), "gap-2 rounded-full")}>
          <Download size={14} /> Export
        </Link>
      </header>

      <main className="px-6 py-8 sm:px-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search participant ID…"
              className="rounded-full pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {filterTabs.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === f
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-secondary"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participant ID</TableHead>
                  <TableHead>Consent</TableHead>
                  <TableHead>Pre-Test</TableHead>
                  <TableHead>Post-Test</TableHead>
                  <TableHead>SUS</TableHead>
                  <TableHead>App Quality</TableHead>
                  <TableHead>Feedback</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Completed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row) => (
                  <TableRow key={row.code} className="hover:bg-secondary/60">
                    <TableCell className="font-mono text-xs font-medium">
                      {row.code}
                      {row.isPilot && (
                        <Badge variant="outline" className="ml-2 rounded-full text-[10px]">
                          pilot
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell><DotCell checked={row.consent} /></TableCell>
                    <TableCell><DotCell checked={row.pretest} /></TableCell>
                    <TableCell><DotCell checked={row.posttest} /></TableCell>
                    <TableCell className="text-sm">{row.sus ?? "—"}</TableCell>
                    <TableCell><DotCell checked={row.appQuality} /></TableCell>
                    <TableCell><DotCell checked={row.feedback} /></TableCell>
                    <TableCell>
                      <Badge className={`rounded-full border text-xs ${statusTone[row.status]}`} variant="outline">
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{row.created}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{row.completed ?? "—"}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="py-10 text-center text-sm text-muted-foreground">
                      No participants match this search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </AdminShell>
  );
}
