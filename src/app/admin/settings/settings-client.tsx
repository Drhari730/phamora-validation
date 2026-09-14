"use client";

import { useState, useTransition } from "react";
import { AdminShell } from "@/components/pharma/admin-shell";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Save, Check } from "lucide-react";
import { updateStudySettings } from "../actions";

function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-5 font-heading text-sm font-bold">{title}</h2>
      <div className="flex flex-col gap-5">{children}</div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

interface SettingsData {
  studyPeriodStart: string;
  studyPeriodEnd: string;
  studyInstructions: string;
  preTestOpen: boolean;
  postTestOpen: boolean;
  usabilityOpen: boolean;
  expertReviewOpen: boolean;
  randomizeQuestionOrder: boolean;
  randomizeOptionOrder: boolean;
  showSusScoreToStudent: boolean;
  consentVersion: string;
  ethicsApprovalRef: string;
}

export function SettingsClient({ initial }: { initial: SettingsData }) {
  const [form, setForm] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function set<K extends keyof SettingsData>(key: K, value: SettingsData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    startTransition(async () => {
      await updateStudySettings(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <AdminShell>
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-6 py-4 backdrop-blur sm:px-8">
        <div>
          <h1 className="font-heading text-xl font-bold sm:text-2xl">Settings</h1>
          <p className="text-xs text-muted-foreground">Study configuration</p>
        </div>
        <Button className="gap-2 rounded-full" disabled={pending} onClick={handleSave}>
          {saved ? <Check size={14} /> : <Save size={14} />}
          {pending ? "Saving…" : saved ? "Saved" : "Save Changes"}
        </Button>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-5 px-6 py-8 sm:px-8">
        <SettingsCard title="Study Period">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 text-sm font-medium">Start date</Label>
              <Input
                type="date"
                value={form.studyPeriodStart}
                onChange={(e) => set("studyPeriodStart", e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div>
              <Label className="mb-2 text-sm font-medium">End date</Label>
              <Input
                type="date"
                value={form.studyPeriodEnd}
                onChange={(e) => set("studyPeriodEnd", e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>
          <div>
            <Label className="mb-2 text-sm font-medium">Instructions shown to students</Label>
            <Textarea
              className="min-h-20 rounded-2xl"
              value={form.studyInstructions}
              onChange={(e) => set("studyInstructions", e.target.value)}
            />
          </div>
        </SettingsCard>

        <SettingsCard title="Study Stages">
          <ToggleRow
            label="Pre-Test open"
            description="Students can start the baseline knowledge assessment"
            checked={form.preTestOpen}
            onCheckedChange={(v) => set("preTestOpen", v)}
          />
          <ToggleRow
            label="Post-Test open"
            description="Unlocks the rotated knowledge assessment"
            checked={form.postTestOpen}
            onCheckedChange={(v) => set("postTestOpen", v)}
          />
          <ToggleRow
            label="Usability & App Quality open"
            description="Unlocks the SUS and uMARS-based questionnaires"
            checked={form.usabilityOpen}
            onCheckedChange={(v) => set("usabilityOpen", v)}
          />
          <ToggleRow
            label="Expert review open"
            description="Allows experts to submit CVI ratings"
            checked={form.expertReviewOpen}
            onCheckedChange={(v) => set("expertReviewOpen", v)}
          />
        </SettingsCard>

        <SettingsCard title="Assessment Behaviour">
          <ToggleRow
            label="Randomise question order"
            description="Each student sees questions in a different order"
            checked={form.randomizeQuestionOrder}
            onCheckedChange={(v) => set("randomizeQuestionOrder", v)}
          />
          <ToggleRow
            label="Randomise response order"
            description="Shuffles A/B/C/D options per question"
            checked={form.randomizeOptionOrder}
            onCheckedChange={(v) => set("randomizeOptionOrder", v)}
          />
          <ToggleRow
            label="Show SUS score to student"
            description="Reveals the calculated usability score after submission"
            checked={form.showSusScoreToStudent}
            onCheckedChange={(v) => set("showSusScoreToStudent", v)}
          />
        </SettingsCard>

        <SettingsCard title="Consent">
          <div>
            <Label className="mb-2 text-sm font-medium">Consent version</Label>
            <Input
              value={form.consentVersion}
              onChange={(e) => set("consentVersion", e.target.value)}
              className="w-32 rounded-xl"
            />
          </div>
          <div>
            <Label className="mb-2 text-sm font-medium">Ethics approval reference</Label>
            <Input
              value={form.ethicsApprovalRef}
              onChange={(e) => set("ethicsApprovalRef", e.target.value)}
              placeholder="e.g. MSRUAS-IEC/2026/042"
              className="rounded-xl"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Shown on the student consent page. Leave blank to show a generic
              "approval obtained" statement without a specific reference number.
            </p>
          </div>
        </SettingsCard>
      </main>
    </AdminShell>
  );
}
