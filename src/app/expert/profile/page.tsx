"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Logo } from "@/components/pharma/logo";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitExpertProfile } from "../actions";

function parseYears(range: string | undefined): number | undefined {
  if (!range) return undefined;
  const n = parseInt(range.replace(/[^\d]/g, ""), 10);
  return Number.isNaN(n) ? undefined : n;
}

export default function ExpertProfilePage() {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function set(key: string, v: string) {
    setValues((p) => ({ ...p, [key]: v }));
  }

  function handleContinue() {
    startTransition(async () => {
      await submitExpertProfile({
        designation: values.designation,
        department: values.department,
        speciality: values.speciality,
        yearsOfExperience: parseYears(values.yearsExperience),
        yearsOfTeachingExperience: parseYears(values.teachingExperience),
        medEdExperience: values.medEdExperience,
        institution: values.institution,
      });
      router.push("/expert/review");
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-2xl px-6 py-4">
          <Logo size="sm" />
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-2 font-heading text-2xl font-bold">Expert Profile</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          A brief professional profile — no personal identifiers are published
          with your ratings.
        </p>

        <div className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div>
            <Label className="mb-2 text-sm font-medium">Designation</Label>
            <Input
              className="rounded-xl"
              placeholder="e.g. Professor of Pharmacology"
              onChange={(e) => set("designation", e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-2 text-sm font-medium">Department</Label>
            <Input
              className="rounded-xl"
              placeholder="e.g. Department of Pharmacology"
              onChange={(e) => set("department", e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-2 text-sm font-medium">Speciality</Label>
            <Input
              className="rounded-xl"
              placeholder="e.g. Clinical Pharmacology"
              onChange={(e) => set("speciality", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 text-sm font-medium">Years of experience</Label>
              <Select onValueChange={(v) => set("yearsExperience", v as string)}>
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {["<5", "5–10", "11–15", "16–20", "20+"].map((o) => (
                    <SelectItem key={o} value={o}>
                      {o} years
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 text-sm font-medium">Teaching experience</Label>
              <Select onValueChange={(v) => set("teachingExperience", v as string)}>
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {["<5", "5–10", "11–15", "16–20", "20+"].map((o) => (
                    <SelectItem key={o} value={o}>
                      {o} years
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="mb-2 text-sm font-medium">Medical-education experience</Label>
            <Input
              className="rounded-xl"
              placeholder="e.g. Curriculum committee, 4 years"
              onChange={(e) => set("medEdExperience", e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-2 text-sm font-medium">Institution <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input
              className="rounded-xl"
              placeholder="e.g. M.S. Ramaiah University of Applied Sciences"
              onChange={(e) => set("institution", e.target.value)}
            />
          </div>
        </div>

        <Button
          className="mt-6 w-full rounded-full"
          size="lg"
          disabled={pending}
          onClick={handleContinue}
        >
          {pending ? "Saving…" : "Continue to Content Review"} <ChevronRight size={16} />
        </Button>
      </main>
    </div>
  );
}
