"use client";

import { useState, useTransition } from "react";
import { Mail, Microscope, Copy, Check, Plus } from "lucide-react";
import { AdminShell } from "@/components/pharma/admin-shell";
import { StatCard } from "@/components/pharma/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { inviteExpert } from "../actions";
import type { getExpertsTable } from "../actions";

type Row = Awaited<ReturnType<typeof getExpertsTable>>[number];

export function ExpertsClient({ rows, origin }: { rows: Row[]; origin: string }) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const totalAssigned = rows.reduce((a, e) => a + e.assigned, 0);
  const totalCompleted = rows.reduce((a, e) => a + e.completed, 0);
  const submitted = rows.filter((e) => e.submitted).length;

  function copyLink(token: string, code: string) {
    navigator.clipboard.writeText(`${origin}/expert/invite/${token}`);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  }

  return (
    <AdminShell>
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-6 py-4 backdrop-blur sm:px-8">
        <div>
          <h1 className="font-heading text-xl font-bold sm:text-2xl">Experts</h1>
          <p className="text-xs text-muted-foreground">Content Validity Index (CVI) panel</p>
        </div>
        <InviteDialog />
      </header>

      <main className="px-6 py-8 sm:px-8">
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Experts Invited" value={rows.length} icon={Microscope} />
          <StatCard label="Panels Submitted" value={`${submitted}/${rows.length}`} icon={Microscope} tone="accent" />
          <StatCard
            label="Overall Completion"
            value={totalAssigned ? `${Math.round((totalCompleted / totalAssigned) * 100)}%` : "0%"}
            tone="success"
          />
          <StatCard label="Items Rated" value={`${totalCompleted}/${totalAssigned}`} tone="warning" />
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expert ID</TableHead>
                  <TableHead>Discipline</TableHead>
                  <TableHead>Items Assigned</TableHead>
                  <TableHead>Items Completed</TableHead>
                  <TableHead>Completion</TableHead>
                  <TableHead>Invite Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((e) => {
                  const pct = e.assigned ? Math.round((e.completed / e.assigned) * 100) : 0;
                  return (
                    <TableRow key={e.code}>
                      <TableCell className="font-mono text-xs font-medium">{e.code}</TableCell>
                      <TableCell className="text-sm">{e.discipline}</TableCell>
                      <TableCell className="text-sm">{e.assigned}</TableCell>
                      <TableCell className="text-sm">{e.completed}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={pct} className="h-1.5 w-24" />
                          <span className="text-xs text-muted-foreground">{pct}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => copyLink(e.inviteToken, e.code)}
                          className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                        >
                          {copiedCode === e.code ? <Check size={13} /> : <Copy size={13} />}
                          {copiedCode === e.code ? "Copied" : "Copy link"}
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                      No experts invited yet.
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

function InviteDialog() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [speciality, setSpeciality] = useState("");
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("");
  const [result, setResult] = useState<{ expertCode: string; inviteToken: string } | null>(null);

  function handleInvite() {
    startTransition(async () => {
      const res = await inviteExpert({ speciality, designation, department });
      if (res.ok) setResult(res);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          setResult(null);
          setSpeciality("");
          setDesignation("");
          setDepartment("");
        }
      }}
    >
      <DialogTrigger render={<Button className="gap-2 rounded-full" />}>
        <Mail size={14} /> Invite Expert
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite an Expert</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 px-4 pb-4">
          {!result ? (
            <>
              <div>
                <Label className="mb-2 text-sm font-medium">Speciality</Label>
                <Input value={speciality} onChange={(e) => setSpeciality(e.target.value)} className="rounded-xl" placeholder="e.g. Pharmacology" />
              </div>
              <div>
                <Label className="mb-2 text-sm font-medium">Designation</Label>
                <Input value={designation} onChange={(e) => setDesignation(e.target.value)} className="rounded-xl" placeholder="e.g. Professor" />
              </div>
              <div>
                <Label className="mb-2 text-sm font-medium">Department</Label>
                <Input value={department} onChange={(e) => setDepartment(e.target.value)} className="rounded-xl" placeholder="e.g. Department of Pharmacology" />
              </div>
              <Button className="rounded-full" disabled={pending} onClick={handleInvite}>
                {pending ? "Creating…" : "Generate Invite Link"}
              </Button>
            </>
          ) : (
            <div className="rounded-2xl bg-secondary p-4 text-sm">
              <p className="mb-2 font-semibold">{result.expertCode} created.</p>
              <p className="mb-1 text-xs text-muted-foreground">Share this link with the expert:</p>
              <code className="block break-all rounded-lg bg-card p-2 text-xs">
                {typeof window !== "undefined" ? window.location.origin : ""}/expert/invite/{result.inviteToken}
              </code>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
