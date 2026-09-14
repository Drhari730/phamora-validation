"use client";

import { useState, useTransition } from "react";
import { Plus, FileQuestion, Gauge, Sparkles, ClipboardCheck, Lock } from "lucide-react";
import { AdminShell } from "@/components/pharma/admin-shell";
import { StatCard } from "@/components/pharma/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toggleQuestionActive, createQuestion } from "../actions";
import { SUS_ITEMS, LIKERT_AGREEMENT, APP_QUALITY_SECTIONS, CVI_RATING_SCALE } from "@/lib/instruments";

interface Question {
  id: string;
  module: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  active: boolean;
  version: string;
}

interface ContentItem {
  id: string;
  module: string;
  contentType: string;
  contentTitle: string;
  contentText: string;
  active: boolean;
}

const moduleLabels: Record<string, string> = {
  GENERAL_PHARMACOLOGY: "General Pharmacology",
  ANS: "ANS",
  CARDIOVASCULAR: "Cardiovascular",
  ANTIMICROBIALS: "Antimicrobials",
};

export function InstrumentsClient({
  initialQuestions,
  contentItems,
}: {
  initialQuestions: Question[];
  contentItems: ContentItem[];
}) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [, startTransition] = useTransition();
  const active = questions.filter((q) => q.active).length;

  function toggleActive(id: string) {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, active: !q.active } : q)));
    startTransition(async () => {
      await toggleQuestionActive(id);
    });
  }

  return (
    <AdminShell>
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 px-6 py-4 backdrop-blur sm:px-8">
        <h1 className="font-heading text-xl font-bold sm:text-2xl">Instruments</h1>
        <p className="text-xs text-muted-foreground">
          All measures used in this study — question bank is editable; SUS,
          App Quality and CVI wording are standardized and shown for reference.
        </p>
      </header>

      <main className="px-6 py-8 sm:px-8">
        <Tabs defaultValue="questions">
          <TabsList variant="line" className="mb-6 border-b border-border">
            <TabsTrigger value="questions" className="gap-1.5">
              <FileQuestion size={14} /> Question Bank
            </TabsTrigger>
            <TabsTrigger value="sus" className="gap-1.5">
              <Gauge size={14} /> SUS Scale
            </TabsTrigger>
            <TabsTrigger value="appquality" className="gap-1.5">
              <Sparkles size={14} /> App Quality
            </TabsTrigger>
            <TabsTrigger value="cvi" className="gap-1.5">
              <ClipboardCheck size={14} /> CVI Content
            </TabsTrigger>
          </TabsList>

          <TabsContent value="questions">
            <div className="mb-6 flex items-center justify-between">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard label="Total Questions" value={questions.length} icon={FileQuestion} />
                <StatCard label="Active" value={active} tone="success" />
                <StatCard label="Inactive" value={questions.length - active} tone="warning" />
                <StatCard label="Version" value="v1" tone="accent" />
              </div>
            </div>
            <div className="mb-4 flex justify-end gap-2">
              <AddQuestionDialog onCreated={(q) => setQuestions((prev) => [...prev, q])} />
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">ID</TableHead>
                      <TableHead>Module</TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead className="w-20">Correct</TableHead>
                      <TableHead className="w-24">Active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.map((q) => (
                      <TableRow key={q.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">{q.id.slice(0, 8)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="rounded-full border-accent/30 bg-accent/10 text-xs text-accent">
                            {moduleLabels[q.module] ?? q.module}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-md truncate text-sm">{q.questionText}</TableCell>
                        <TableCell className="font-mono text-sm font-semibold">{q.correctOption}</TableCell>
                        <TableCell>
                          <Switch checked={q.active} onCheckedChange={() => toggleActive(q.id)} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sus">
            <LockedNotice text="Standard Brooke (1996) wording — reproduced verbatim so published scoring benchmarks stay valid." />
            <div className="mb-4 rounded-2xl bg-muted p-4 text-xs text-muted-foreground">
              Scale: 1 Strongly Disagree · 2 Disagree · 3 Neutral · 4 Agree · 5 Strongly Agree.
              Score = (sum of odd-item scores + sum of even-item scores) × 2.5, where odd items
              score (response−1) and even items score (5−response).
            </div>
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead className="w-24">Scoring</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SUS_ITEMS.map((text, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="text-sm">{text}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {i % 2 === 0 ? "odd (r−1)" : "even (5−r)"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Reference
              citations={[
                "Brooke, J. (1996). SUS: A “quick and dirty” usability scale. In P. W. Jordan et al. (Eds.), Usability Evaluation in Industry. Taylor & Francis.",
                "Sauro, J. (2011). A Practical Guide to the System Usability Scale. Measuring Usability LLC. (Published benchmark mean = 68)",
              ]}
            />
          </TabsContent>

          <TabsContent value="appquality">
            <LockedNotice text="Reconstructed from the published uMARS structure (Stoyanov et al., 2016) plus its Perceived Impact extension." />
            <div className="flex flex-col gap-5">
              {APP_QUALITY_SECTIONS.map((section) => (
                <div key={section.key} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                  <div className="flex items-center justify-between border-b border-border px-5 py-3">
                    <h3 className="font-heading text-sm font-bold">{section.title}</h3>
                    <Badge variant="outline" className="rounded-full text-xs">
                      {section.labels === LIKERT_AGREEMENT ? "Agreement scale" : "Quality scale"}
                    </Badge>
                  </div>
                  <Table>
                    <TableBody>
                      {section.items.map((text, i) => (
                        <TableRow key={i}>
                          <TableCell className="w-8 text-xs text-muted-foreground">{i + 1}</TableCell>
                          <TableCell className="text-sm">{text}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
            <Reference
              citations={[
                "Stoyanov, S. R., Hides, L., Kavanagh, D. J., & Wilson, H. (2016). Development and validation of the User Version of the Mobile Application Rating Scale (uMARS). JMIR mHealth and uHealth, 4(2), e72.",
              ]}
            />
          </TabsContent>

          <TabsContent value="cvi">
            <LockedNotice text="Content items experts rate for relevance. Add or retire items via the database — this is a read-only reference of what's currently active." />
            <div className="mb-4 flex flex-wrap gap-3">
              {CVI_RATING_SCALE.map((r) => (
                <div key={r.value} className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/10 font-bold text-primary">{r.value}</span>
                  {r.label}
                </div>
              ))}
            </div>
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Preview</TableHead>
                    <TableHead className="w-20">Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contentItems.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="text-sm font-medium">{c.contentTitle}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-full border-accent/30 bg-accent/10 text-xs text-accent">
                          {moduleLabels[c.module] ?? c.module}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs capitalize text-muted-foreground">{c.contentType}</TableCell>
                      <TableCell className="max-w-sm truncate text-xs text-muted-foreground">{c.contentText}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`rounded-full text-xs ${c.active ? "border-success/30 bg-success/10 text-success" : ""}`}>
                          {c.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {contentItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                        No content items yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <Reference
              citations={[
                "Lynn, M. R. (1986). Determination and quantification of content validity index. Nursing Research, 35(6), 382-386.",
                "Polit, D. F., Beck, C. T., & Owen, S. V. (2007). Is the CVI an acceptable indicator of content validity? Research in Nursing & Health, 30(4), 459-467.",
              ]}
            />
          </TabsContent>
        </Tabs>
      </main>
    </AdminShell>
  );
}

function Reference({ citations }: { citations: string[] }) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-border p-4">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Reference{citations.length > 1 ? "s" : ""}
      </p>
      <ul className="flex flex-col gap-1.5">
        {citations.map((c, i) => (
          <li key={i} className="text-xs leading-relaxed text-muted-foreground">
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
}

function LockedNotice({ text }: { text: string }) {
  return (
    <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-dashed border-border bg-secondary/50 p-4">
      <Lock size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
      <p className="text-xs leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}

function AddQuestionDialog({ onCreated }: { onCreated: (q: Question) => void }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    module: "GENERAL_PHARMACOLOGY",
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOption: "A",
  });

  const complete =
    form.questionText && form.optionA && form.optionB && form.optionC && form.optionD;

  function handleCreate() {
    startTransition(async () => {
      await createQuestion(form);
      onCreated({ id: `new-${Date.now()}`, active: true, version: "v1", ...form });
      setOpen(false);
      setForm({ module: "GENERAL_PHARMACOLOGY", questionText: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: "A" });
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button className="gap-2 rounded-full" onClick={() => setOpen(true)}>
        <Plus size={14} /> Add Question
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Question</DialogTitle>
        </DialogHeader>
        <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto px-4 pb-4">
          <div>
            <Label className="mb-2 text-sm font-medium">Module</Label>
            <Select value={form.module} onValueChange={(v) => setForm((f) => ({ ...f, module: v as string }))}>
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(moduleLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-2 text-sm font-medium">Question text</Label>
            <Textarea
              className="rounded-xl"
              value={form.questionText}
              onChange={(e) => setForm((f) => ({ ...f, questionText: e.target.value }))}
            />
          </div>
          {(["A", "B", "C", "D"] as const).map((key) => (
            <div key={key}>
              <Label className="mb-2 text-sm font-medium">Option {key}</Label>
              <Input
                className="rounded-xl"
                value={form[`option${key}` as keyof typeof form]}
                onChange={(e) => setForm((f) => ({ ...f, [`option${key}`]: e.target.value }))}
              />
            </div>
          ))}
          <div>
            <Label className="mb-2 text-sm font-medium">Correct option</Label>
            <Select value={form.correctOption} onValueChange={(v) => setForm((f) => ({ ...f, correctOption: v as string }))}>
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["A", "B", "C", "D"].map((k) => (
                  <SelectItem key={k} value={k}>
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="rounded-full" disabled={!complete || pending} onClick={handleCreate}>
            {pending ? "Saving…" : "Add Question"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
