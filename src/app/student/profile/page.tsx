"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FormShell } from "@/components/pharma/form-shell";
import { submitProfile } from "../actions";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const fields = [
  { key: "ageGroup", label: "Age group", options: ["18–20", "21–23", "24–26", "27+"] },
  { key: "gender", label: "Gender", options: ["Male", "Female", "Prefer not to say"] },
  { key: "mbbsYear", label: "MBBS year / semester", options: ["2nd Year", "3rd Year", "Final Year", "Internship"] },
  { key: "digitalToolUseFrequency", label: "How often do you use digital learning tools?", options: ["Daily", "A few times a week", "Rarely", "Never"] },
];

const yesNoFields = [
  { key: "priorPharmacologyExposure", label: "Have you previously studied pharmacology?" },
  { key: "priorPharmacologyExam", label: "Have you completed a pharmacology examination?" },
  { key: "priorAppUse", label: "Have you used a medical-learning app before?" },
];

export default function ProfilePage() {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  const totalFields = fields.length + yesNoFields.length;
  const filled = Object.keys(values).length;
  const complete = filled === totalFields;

  function handleContinue() {
    startTransition(async () => {
      await submitProfile({
        ageGroup: values.ageGroup,
        gender: values.gender,
        mbbsYear: values.mbbsYear,
        digitalToolUseFrequency: values.digitalToolUseFrequency,
        priorPharmacologyExposure: values.priorPharmacologyExposure === "yes",
        priorPharmacologyExam: values.priorPharmacologyExam === "yes",
        priorAppUse: values.priorAppUse === "yes",
      });
      router.push("/student/pretest");
    });
  }

  return (
    <FormShell eyebrow="Step 2 of 8 · Baseline Profile" progressPct={(2 / 8) * 100}>
      <h1 className="mb-2 font-heading text-2xl font-bold">A Few Questions About You</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        This helps us understand the study cohort. Nothing here identifies you personally.
      </p>

      <div className="flex flex-col gap-6 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        {fields.map((f) => (
          <div key={f.key}>
            <Label className="mb-2 text-sm font-medium">{f.label}</Label>
            <Select onValueChange={(v) => setValues((p) => ({ ...p, [f.key]: v as string }))}>
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {f.options.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}

        {yesNoFields.map((f) => (
          <div key={f.key}>
            <Label className="mb-3 block text-sm font-medium">{f.label}</Label>
            <RadioGroup
              className="flex gap-3"
              onValueChange={(v) => setValues((p) => ({ ...p, [f.key]: v }))}
            >
              <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                <RadioGroupItem value="yes" /> Yes
              </label>
              <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                <RadioGroupItem value="no" /> No
              </label>
            </RadioGroup>
          </div>
        ))}
      </div>

      <Button
        className="mt-6 w-full rounded-full"
        size="lg"
        disabled={!complete || pending}
        onClick={handleContinue}
      >
        {pending ? "Saving…" : "Continue to Pre-Test"} <ChevronRight size={16} />
      </Button>
    </FormShell>
  );
}
