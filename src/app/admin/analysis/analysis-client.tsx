"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { AdminShell } from "@/components/pharma/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AnalysisData } from "./actions";

function fmt(v: number | null | undefined, dp = 2): string {
  return v === null || v === undefined ? "—" : v.toFixed(dp);
}

function fmtP(p: number | null | undefined): string {
  if (p === null || p === undefined) return "—";
  return p < 0.001 ? "< 0.001" : p.toFixed(3);
}

function dzLabel(d: number | null | undefined): string {
  if (d === null || d === undefined) return "";
  const a = Math.abs(d);
  return a >= 0.8 ? "large" : a >= 0.5 ? "medium" : a >= 0.2 ? "small" : "negligible";
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-heading text-lg font-bold">{title}</h2>
      {subtitle && <p className="mb-4 mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      {!subtitle && <div className="mb-4" />}
      {children}
    </section>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-border bg-card p-5 shadow-sm ${className}`}>{children}</div>;
}

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm">
      <p className="font-heading text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{children}</p>;
}

function summaryText(d: AnalysisData): string {
  const lines: string[] = [];
  lines.push(`PHAMORA validation: analysis summary (${new Date(d.generatedAt).toISOString().slice(0, 10)})`);
  lines.push(`Pilot participants excluded. Students in analysis: ${d.studentsTotal}. Experts: ${d.cvi.nExperts}.`);
  lines.push("");
  lines.push("CONTENT VALIDITY");
  lines.push(
    `S-CVI/Ave = ${fmt(d.cvi.sCviAve)}, S-CVI/UA = ${fmt(d.cvi.sCviUa)}, mean modified kappa = ${fmt(d.cvi.meanKappa)}, mean Aiken's V = ${fmt(d.cvi.meanAikenV)}` +
      (d.cvi.icc
        ? `, ICC(2,1) = ${fmt(d.cvi.icc.single)}, ICC(2,k) = ${fmt(d.cvi.icc.average)} (${d.cvi.completeExperts} experts).`
        : ".")
  );
  const k = d.knowledge.paired;
  lines.push("");
  lines.push("KNOWLEDGE (PRE/POST)");
  if (k) {
    lines.push(
      `n = ${k.n}. Pre ${fmt(k.meanPre, 1)} (SD ${fmt(k.sdPre, 1)}), post ${fmt(k.meanPost, 1)} (SD ${fmt(k.sdPost, 1)}). ` +
        `Mean gain ${fmt(k.meanDiff, 1)} points (95% CI ${fmt(k.ciLow, 1)} to ${fmt(k.ciHigh, 1)}); paired t(${k.df}) = ${fmt(k.t)}, p ${fmtP(k.p) === "< 0.001" ? "< 0.001" : "= " + fmtP(k.p)}; ` +
        `Wilcoxon p = ${fmtP(k.wilcoxonP)}; Cohen's dz = ${fmt(k.dz)} (95% CI ${fmt(k.dzCiLow)} to ${fmt(k.dzCiHigh)}); normalised gain = ${fmt(k.normalisedGain)}.`
    );
  } else lines.push("Not enough complete pre/post pairs yet.");
  for (const r of d.knowledge.reliability) {
    lines.push(`${r.label} KR-20 = ${fmt(r.alpha)} (${r.alphaLabel}; ${r.items} items, n = ${r.n}).`);
  }
  lines.push("");
  lines.push("USABILITY (SUS)");
  lines.push(
    `n = ${d.sus.n}, mean ${fmt(d.sus.mean, 1)} (SD ${fmt(d.sus.sd, 1)}), median ${fmt(d.sus.median, 1)}; Cronbach's alpha = ${fmt(d.sus.alpha)} (${d.sus.alphaLabel}).` +
      (d.sus.test ? ` Versus benchmark ${d.sus.benchmark}: t(${d.sus.test.df}) = ${fmt(d.sus.test.t)}, p ${fmtP(d.sus.test.p)}.` : "")
  );
  lines.push("");
  lines.push("APP QUALITY (uMARS)");
  for (const s of d.umars.sections) {
    lines.push(`${s.title}: mean ${fmt(s.mean)} (SD ${fmt(s.sd)}), alpha ${fmt(s.alpha)} (${s.alphaLabel}), n = ${s.n}.`);
  }
  lines.push(`Overall objective quality: mean ${fmt(d.umars.objectiveMean)} (SD ${fmt(d.umars.objectiveSd)}), n = ${d.umars.objectiveN}.`);
  return lines.join("\n");
}

export function AnalysisClient({ data }: { data: AnalysisData }) {
  const [copied, setCopied] = useState(false);
  const k = data.knowledge.paired;
  const cvi = data.cvi;
  const strictNote = cvi.nExperts > 0 && cvi.nExperts <= 5;

  return (
    <AdminShell>
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-6 py-4 backdrop-blur sm:px-8">
        <div>
          <h1 className="font-heading text-xl font-bold sm:text-2xl">Analysis</h1>
          <p className="text-xs text-muted-foreground">Validity, reliability and effect statistics, live from current data</p>
        </div>
        <Button
          variant="outline"
          className="gap-2 rounded-full"
          onClick={() => {
            navigator.clipboard.writeText(summaryText(data));
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy summary"}
        </Button>
      </header>

      <main className="px-6 py-8 sm:px-8">
        <Card className="mb-8 text-xs leading-relaxed text-muted-foreground">
          Pilot/test participants are excluded. Everything recalculates from the current data each time you open this
          page. With small samples, reliability coefficients and p-values are unstable, so treat results as provisional
          until recruitment is complete (target 40 students, 8 experts). Participants in analysis:{" "}
          <strong className="text-foreground">{data.studentsTotal}</strong>.
        </Card>

        {/* ---------------- Experts ---------------- */}
        <Section
          title="1. Content validity (expert panel)"
          subtitle="I-CVI and S-CVI (Lynn, 1986; Polit & Beck, 2006), modified kappa (Polit, Beck & Owen, 2007), Aiken's V and inter-rater agreement."
        >
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <Metric label="Experts rating" value={String(cvi.nExperts)} />
            <Metric label="S-CVI/Ave" value={fmt(cvi.sCviAve)} hint="≥ 0.90 acceptable" />
            <Metric label="S-CVI/UA" value={fmt(cvi.sCviUa)} hint="≥ 0.80 desirable" />
            <Metric label="Mean modified κ*" value={fmt(cvi.meanKappa)} hint="> 0.74 excellent" />
            <Metric label="Mean Aiken's V" value={fmt(cvi.meanAikenV)} />
            <Metric
              label="ICC(2,k) agreement"
              value={cvi.icc ? fmt(cvi.icc.average) : "—"}
              hint={cvi.icc ? `${cvi.icc.averageLabel} · ${cvi.completeExperts} experts` : "needs ≥ 2 experts who finished all items"}
            />
          </div>
          {cvi.icc && (
            <p className="mb-3 text-xs text-muted-foreground">
              ICC(2,1) single-rater = {fmt(cvi.icc.single)} ({cvi.icc.singleLabel}); ICC(2,k) average-rater ={" "}
              {fmt(cvi.icc.average)} ({cvi.icc.averageLabel}). Two-way random effects, absolute agreement
              (Shrout &amp; Fleiss, 1979).
            </p>
          )}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Experts</TableHead>
                    <TableHead>I-CVI</TableHead>
                    <TableHead>Modified κ*</TableHead>
                    <TableHead>Aiken's V</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cvi.table.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="max-w-xs text-sm">{r.title}</TableCell>
                      <TableCell className="text-sm">{r.n}</TableCell>
                      <TableCell className="text-sm">{fmt(r.icvi)}</TableCell>
                      <TableCell className="text-sm">
                        {fmt(r.kappa)} <span className="text-xs text-muted-foreground">{r.kappaLabel}</span>
                      </TableCell>
                      <TableCell className="text-sm">{fmt(r.aikenV)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-full text-xs">
                          {r.status === "ACCEPTED" ? "Accepted" : r.status === "REVIEW_RECOMMENDED" ? "Review" : "Revise"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {cvi.table.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                        No expert ratings yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <Note>
            Items with I-CVI ≥ 0.78 are accepted (Polit &amp; Beck, 2006). Modified kappa adjusts I-CVI for chance
            agreement: κ* &gt; 0.74 excellent, 0.60–0.74 good, 0.40–0.59 fair.
            {strictNote &&
              ` With ${cvi.nExperts} experts, Lynn (1986) requires I-CVI = 1.00 (all experts agree); the 0.78 cut-off assumes six or more.`}
          </Note>
        </Section>

        {/* ---------------- Knowledge ---------------- */}
        <Section
          title="2. Educational effectiveness (pre/post knowledge test)"
          subtitle="Paired analysis of students who completed both tests."
        >
          {k ? (
            <>
              <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Metric label="Paired students" value={String(k.n)} />
                <Metric label="Pre-test, mean (SD)" value={`${fmt(k.meanPre, 1)} (${fmt(k.sdPre, 1)})`} hint="% correct" />
                <Metric label="Post-test, mean (SD)" value={`${fmt(k.meanPost, 1)} (${fmt(k.sdPost, 1)})`} hint="% correct" />
                <Metric
                  label="Mean gain (95% CI)"
                  value={`${k.meanDiff !== null && k.meanDiff >= 0 ? "+" : ""}${fmt(k.meanDiff, 1)}`}
                  hint={`${fmt(k.ciLow, 1)} to ${fmt(k.ciHigh, 1)}`}
                />
              </div>
              <Card>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-sm font-medium">Paired t-test</TableCell>
                      <TableCell className="text-sm">
                        t({k.df}) = {fmt(k.t)}, p {fmtP(k.p)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm font-medium">Wilcoxon signed-rank (non-parametric)</TableCell>
                      <TableCell className="text-sm">
                        p {fmtP(k.wilcoxonP)}
                        {k.wilcoxonNote && <span className="ml-2 text-xs text-muted-foreground">({k.wilcoxonNote})</span>}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm font-medium">Effect size, Cohen's dz (95% CI)</TableCell>
                      <TableCell className="text-sm">
                        {fmt(k.dz)} ({fmt(k.dzCiLow)} to {fmt(k.dzCiHigh)}){" "}
                        <span className="text-xs text-muted-foreground">{dzLabel(k.dz)}</span>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm font-medium">Normalised gain (Hake)</TableCell>
                      <TableCell className="text-sm">{fmt(k.normalisedGain)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Card>
            </>
          ) : (
            <Card className="text-sm text-muted-foreground">
              Needs at least 2 students with both a completed pre-test and post-test.
            </Card>
          )}

          <h3 className="mb-2 mt-6 text-sm font-semibold">Test reliability (KR-20)</h3>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>KR-20</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.knowledge.reliability.map((r) => (
                  <TableRow key={r.label}>
                    <TableCell className="text-sm">{r.label}</TableCell>
                    <TableCell className="text-sm">{r.n}</TableCell>
                    <TableCell className="text-sm">{r.items}</TableCell>
                    <TableCell className="text-sm">
                      {fmt(r.alpha)} <span className="text-xs text-muted-foreground">{r.alphaLabel}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Note>KR-20 equals Cronbach's alpha for right/wrong items. ≥ 0.70 is acceptable for group-level conclusions.</Note>

          <h3 className="mb-2 mt-6 text-sm font-semibold">MCQ item analysis</h3>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Pre difficulty</TableHead>
                    <TableHead>Pre discrimination</TableHead>
                    <TableHead>Post difficulty</TableHead>
                    <TableHead>Post discrimination</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.knowledge.itemAnalysis.map((r) => {
                    const flag = (d: number | null) => d !== null && d < 0.2;
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="max-w-sm text-xs">{r.text}</TableCell>
                        <TableCell className="text-sm">{fmt(r.preDifficulty)}</TableCell>
                        <TableCell className={`text-sm ${flag(r.preDiscrimination) ? "text-destructive" : ""}`}>
                          {fmt(r.preDiscrimination)}
                        </TableCell>
                        <TableCell className="text-sm">{fmt(r.postDifficulty)}</TableCell>
                        <TableCell className={`text-sm ${flag(r.postDiscrimination) ? "text-destructive" : ""}`}>
                          {fmt(r.postDiscrimination)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {data.knowledge.itemAnalysis.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                        No completed tests yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <Note>
            Difficulty = proportion answering correctly (0.30–0.80 is a good range). Discrimination = corrected
            item-total point-biserial correlation; values below 0.20 (red) suggest the item should be reviewed.
          </Note>
        </Section>

        {/* ---------------- SUS ---------------- */}
        <Section title="3. Usability (SUS)" subtitle="Brooke (1996); benchmark mean 68 (Sauro, 2011).">
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="Respondents" value={String(data.sus.n)} />
            <Metric label="Mean SUS (SD)" value={`${fmt(data.sus.mean, 1)} (${fmt(data.sus.sd, 1)})`} hint={`range ${fmt(data.sus.min, 0)}–${fmt(data.sus.max, 0)}`} />
            <Metric label="Above benchmark (68)" value={`${data.sus.aboveBenchmark}/${data.sus.n}`} />
            <Metric label="Cronbach's alpha" value={fmt(data.sus.alpha)} hint={data.sus.alphaLabel} />
          </div>
          {data.sus.test && (
            <p className="text-xs text-muted-foreground">
              One-sample t-test vs 68: t({data.sus.test.df}) = {fmt(data.sus.test.t)}, p {fmtP(data.sus.test.p)}; 95% CI
              for the mean {fmt(data.sus.test.ciLow, 1)} to {fmt(data.sus.test.ciHigh, 1)}.
            </p>
          )}
        </Section>

        {/* ---------------- uMARS ---------------- */}
        <Section title="4. App quality (uMARS)" subtitle="Stoyanov et al. (2016). Subscale scores are the mean of items (1–5).">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subscale</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>n</TableHead>
                    <TableHead>Mean</TableHead>
                    <TableHead>SD</TableHead>
                    <TableHead>Cronbach's α</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.umars.sections.map((s) => (
                    <TableRow key={s.key}>
                      <TableCell className="text-sm">{s.title}</TableCell>
                      <TableCell className="text-sm">{s.items}</TableCell>
                      <TableCell className="text-sm">{s.n}</TableCell>
                      <TableCell className="text-sm">{fmt(s.mean)}</TableCell>
                      <TableCell className="text-sm">{fmt(s.sd)}</TableCell>
                      <TableCell className="text-sm">
                        {fmt(s.alpha)} <span className="text-xs text-muted-foreground">{s.alphaLabel}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell className="text-sm font-semibold">Overall objective quality</TableCell>
                    <TableCell className="text-sm">16</TableCell>
                    <TableCell className="text-sm">{data.umars.objectiveN}</TableCell>
                    <TableCell className="text-sm font-semibold">{fmt(data.umars.objectiveMean)}</TableCell>
                    <TableCell className="text-sm">{fmt(data.umars.objectiveSd)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">—</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
          <Note>
            Overall objective quality = mean of the Engagement, Functionality, Aesthetics and Information subscale
            means. Subjective Quality items ask different questions with different response options, so its alpha is
            of limited meaning; report it descriptively.
          </Note>
        </Section>
      </main>
    </AdminShell>
  );
}
