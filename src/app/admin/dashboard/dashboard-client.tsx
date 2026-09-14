"use client";

import {
  Users,
  FileCheck2,
  ListChecks,
  Rocket,
  Gauge,
  Sparkles,
  CheckCircle2,
  Microscope,
  TrendingUp,
  Search,
  Bell,
  ClipboardList,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminShell } from "@/components/pharma/admin-shell";
import { StatCard } from "@/components/pharma/stat-card";
import { DotCell, statusTone } from "@/components/pharma/dot-cell";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { getDashboardData, getModuleScoreTrend, getSusDistribution, getStudentsTable } from "../actions";

type Summary = Awaited<ReturnType<typeof getDashboardData>>["summary"];
type Stats = Awaited<ReturnType<typeof getDashboardData>>["stats"];
type Trend = Awaited<ReturnType<typeof getModuleScoreTrend>>;
type SusDist = Awaited<ReturnType<typeof getSusDistribution>>;
type Students = Awaited<ReturnType<typeof getStudentsTable>>;

export function DashboardClient({
  summary,
  stats,
  trend,
  susDist,
  recentStudents,
}: {
  summary: Summary;
  stats: Stats;
  trend: Trend;
  susDist: SusDist;
  recentStudents: Students;
}) {
  const s = summary;

  return (
    <AdminShell>
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-6 py-4 backdrop-blur sm:px-8">
        <div>
          <h1 className="font-heading text-xl font-bold sm:text-2xl">Investigator Dashboard</h1>
          <p className="text-xs text-muted-foreground">
            PHAMORA Validation Study · live recruitment overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search participant ID…" className="w-56 rounded-full pl-9" />
          </div>
          <div className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card">
            <Bell size={15} className="text-muted-foreground" />
          </div>
        </div>
      </header>

      <main className="px-6 py-8 sm:px-8">
        <div className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <ClipboardList size={15} />
            </div>
            <div>
              <h3 className="font-heading text-sm font-bold">Study Design &amp; Sample Size Targets</h3>
              <p className="text-xs text-muted-foreground">
                Mixed-methods validation study — three components, each with its own recruitment target
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-muted p-4">
              <p className="mb-1 text-xs font-semibold text-foreground">A. Content Validity</p>
              <p className="mb-3 text-[11px] leading-relaxed text-muted-foreground">
                Expert CVI panel rating relevance of lessons, MCQs and monographs
              </p>
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="font-heading text-lg font-bold">{s.expertsInvited}</span>
                <span className="text-xs text-muted-foreground">of 8 target experts</span>
              </div>
              <Progress value={Math.min(100, (s.expertsInvited / 8) * 100)} className="h-1.5" />
            </div>

            <div className="rounded-xl bg-muted p-4">
              <p className="mb-1 text-xs font-semibold text-foreground">B. Usability &amp; Acceptability</p>
              <p className="mb-3 text-[11px] leading-relaxed text-muted-foreground">
                SUS + App Quality (uMARS), same cohort as Component C
              </p>
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="font-heading text-lg font-bold">{s.studentsEnrolled}</span>
                <span className="text-xs text-muted-foreground">of 40 target students</span>
              </div>
              <Progress value={Math.min(100, (s.studentsEnrolled / 40) * 100)} className="h-1.5" />
            </div>

            <div className="rounded-xl bg-muted p-4">
              <p className="mb-1 text-xs font-semibold text-foreground">C. Educational Effectiveness</p>
              <p className="mb-3 text-[11px] leading-relaxed text-muted-foreground">
                Single-group pre/post knowledge test, same cohort
              </p>
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="font-heading text-lg font-bold">{s.studentsEnrolled}</span>
                <span className="text-xs text-muted-foreground">of 35 minimum (40 recommended)</span>
              </div>
              <Progress value={Math.min(100, (s.studentsEnrolled / 35) * 100)} className="h-1.5" />
            </div>
          </div>

          <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
            Sample sizes: 6–10 experts is the standard, defensible CVI panel size (Lynn, 1986) — 8
            recommended. 35 students is the minimum for the single-group pre/post design at a medium
            effect size (d=0.5, α=0.05, 80% power); 40 is recommended to allow for attrition. A
            two-group design (intervention vs. control) would need ~110 total (55/arm) for the same
            effect size — not used here.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard label="Students Enrolled" value={s.studentsEnrolled} icon={Users} />
          <StatCard label="Consent Completed" value={s.consentCompleted} icon={FileCheck2} tone="accent" />
          <StatCard label="Pre-Test Completed" value={s.pretestCompleted} icon={ListChecks} tone="accent" />
          <StatCard label="Post-Test Completed" value={s.posttestCompleted} icon={Rocket} tone="warning" />
          <StatCard label="Usability Completed" value={s.usabilityCompleted} icon={Gauge} tone="warning" />
          <StatCard label="App Quality Completed" value={s.appQualityCompleted} icon={Sparkles} tone="warning" />
          <StatCard label="Fully Completed" value={s.fullyCompleted} icon={CheckCircle2} tone="success" />
          <StatCard label="Experts Invited" value={s.expertsInvited} icon={Microscope} />
          <StatCard
            label="Expert Reviews Done"
            value={`${s.expertReviewsCompleted}/${s.expertsInvited}`}
            icon={Microscope}
            tone="accent"
          />
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <SummaryStat label="Mean Pre-Test" value={`${stats.meanPretest}%`} />
          <SummaryStat label="Mean Post-Test" value={`${stats.meanPosttest}%`} />
          <SummaryStat
            label="Knowledge Improvement"
            value={`${stats.knowledgeImprovement >= 0 ? "+" : ""}${stats.knowledgeImprovement}%`}
            positive={stats.knowledgeImprovement >= 0}
          />
          <SummaryStat label="Mean SUS" value={stats.meanSus} />
          <SummaryStat label="S-CVI/Ave" value={stats.scviAve} />
        </div>

        <div className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-5">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-3">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-heading text-sm font-bold">Pre vs Post Mean Score by Module</h3>
                <p className="text-xs text-muted-foreground">Percent correct, all enrolled students</p>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                <TrendingUp size={12} /> {stats.knowledgeImprovement >= 0 ? "+" : ""}{stats.knowledgeImprovement}%
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={trend} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="pre" name="Pre-Test" fill="var(--chart-5)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="post" name="Post-Test" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
            <div className="mb-5">
              <h3 className="font-heading text-sm font-bold">SUS Score Distribution</h3>
              <p className="text-xs text-muted-foreground">n = {s.usabilityCompleted} respondents</p>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={susDist}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="range" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" name="Students" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h3 className="font-heading text-sm font-bold">Recent Participants</h3>
            <Badge variant="outline" className="rounded-full text-xs">
              {recentStudents.length} shown
            </Badge>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participant ID</TableHead>
                  <TableHead>Consent</TableHead>
                  <TableHead>Pre-Test</TableHead>
                  <TableHead>Post-Test</TableHead>
                  <TableHead>Improvement</TableHead>
                  <TableHead>SUS</TableHead>
                  <TableHead>App Quality</TableHead>
                  <TableHead>Feedback</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentStudents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                      No participants enrolled yet.
                    </TableCell>
                  </TableRow>
                )}
                {recentStudents.map((row) => (
                  <TableRow key={row.code}>
                    <TableCell className="font-mono text-xs font-medium">{row.code}</TableCell>
                    <TableCell><DotCell checked={row.consent} /></TableCell>
                    <TableCell className="text-sm">
                      {row.pretestScore !== null ? `${row.pretestScore}%` : "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {row.posttestScore !== null ? `${row.posttestScore}%` : "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {row.improvement !== null ? (
                        <span className={row.improvement >= 0 ? "text-success" : "text-destructive"}>
                          {row.improvement >= 0 ? "+" : ""}
                          {row.improvement}%
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{row.sus ?? "—"}</TableCell>
                    <TableCell><DotCell checked={row.appQuality} /></TableCell>
                    <TableCell><DotCell checked={row.feedback} /></TableCell>
                    <TableCell>
                      <Badge className={`rounded-full border text-xs ${statusTone[row.status]}`} variant="outline">
                        {row.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </AdminShell>
  );
}

function SummaryStat({
  label,
  value,
  positive = false,
}: {
  label: string;
  value: string | number;
  positive?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-sm">
      <p className={`font-heading text-2xl font-bold ${positive ? "text-success" : "text-foreground"}`}>
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
