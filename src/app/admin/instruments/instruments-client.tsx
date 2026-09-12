"use client";

import { useState, useTransition } from "react";
import { Plus, FileQuestion } from "lucide-react";
import { AdminShell } from "@/components/pharma/admin-shell";
import { StatCard } from "@/components/pharma/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

const moduleLabels: Record<string, string> = {
  GENERAL_PHARMACOLOGY: "General Pharmacology",
  ANS: "ANS",
  CARDIOVASCULAR: "Cardiovascular",
  ANTIMICROBIALS: "Antimicrobials",
};

export function InstrumentsClient({ initialQuestions }: { initialQuestions: Question[] }) {
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
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-6 py-4 backdrop-blur sm:px-8">
        <div>
          <h1 className="font-heading text-xl font-bold sm:text-2xl">Instruments</h1>
          <p className="text-xs text-muted-foreground">Question bank for pre/post-test assessments</p>
        </div>
        <AddQuestionDialog onCreated={(q) => setQuestions((prev) => [...prev, q])} />
      </header>

      <main className="px-6 py-8 sm:px-8">
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total Questions" value={questions.length} icon={FileQuestion} />
          <StatCard label="Active" value={active} tone="success" />
          <StatCard label="Inactive" value={questions.length - active} tone="warning" />
          <StatCard label="Version" value="v1" tone="accent" />
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
      </main>
    </AdminShell>
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
