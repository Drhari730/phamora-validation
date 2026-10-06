"use client";

import { useState, useTransition } from "react";
import { Mail, Microscope, Copy, Check, Send, Loader2, Pencil, Trash2, MessageCircle } from "lucide-react";
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
import { inviteExpert, sendExpertInviteEmail, updateExpertContact, deleteExpert } from "../actions";
import type { getExpertsTable } from "../actions";

type Row = Awaited<ReturnType<typeof getExpertsTable>>[number];

function inviteEmailDraft(link: string) {
  const subject = "Invitation: PHAMORA Expert Content Validation Panel";
  const body = `Dear Colleague,

You are invited to join the expert panel validating the content of PHAMORA, an offline pharmacology learning app for undergraduate health-professions students (MBBS, BDS, Pharmacy/Pharm.D, and Nursing), as part of a formal Content Validity Index (CVI) study.

Your task is to rate a set of lessons, MCQs and monographs (~10-30 minutes) for relevance to the undergraduate pharmacology curriculum. No installation or account is needed — everything happens through your personal review link below.

Your personal review link:
${link}

This link is unique to you — please do not share it. If you have any questions, feel free to reply to this email.

Thank you for contributing your expertise to this study.

Best regards,
Dr. G. Hari Prakash
Principal Investigator, PHAMORA Validation Study`;
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function whatsappInviteUrl(link: string, name?: string | null) {
  const text = `Hello ${name ?? "Sir/Madam"},

I am Dr. G. Hari Prakash. I would be grateful for your expert review of PHAMORA, an offline pharmacology learning app for undergraduate students (MBBS, BDS, Pharmacy/Pharm.D, Nursing), as part of a Content Validity Index (CVI) study.

It takes about 10-30 minutes: you rate each lesson/MCQ/monograph for relevance. No account or password is needed, and your ratings autosave, so you can pause and resume.

Your personal review link (please don't share it):
${link}

Thank you for your time and expertise.
Dr. G. Hari Prakash
PHAMORA Validation Study`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function ExpertsClient({
  rows,
  origin,
  emailConfigured,
}: {
  rows: Row[];
  origin: string;
  emailConfigured: boolean;
}) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [sentCode, setSentCode] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendingCode, setSendingCode] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const totalAssigned = rows.reduce((a, e) => a + e.assigned, 0);
  const totalCompleted = rows.reduce((a, e) => a + e.completed, 0);
  const submitted = rows.filter((e) => e.submitted).length;

  function copyLink(token: string, code: string) {
    navigator.clipboard.writeText(`${origin}/expert/invite/${token}`);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  }

  function sendNow(id: string, code: string) {
    setSendError(null);
    setSendingCode(code);
    startTransition(async () => {
      const res = await sendExpertInviteEmail(id, origin);
      setSendingCode(null);
      if (res.ok) {
        setSentCode(code);
        setTimeout(() => setSentCode(null), 2500);
      } else {
        setSendError(`${code}: ${res.error}`);
        setTimeout(() => setSendError(null), 4000);
      }
    });
  }

  return (
    <AdminShell>
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-6 py-4 backdrop-blur sm:px-8">
        <div>
          <h1 className="font-heading text-xl font-bold sm:text-2xl">Experts</h1>
          <p className="text-xs text-muted-foreground">Content Validity Index (CVI) panel</p>
        </div>
        <InviteDialog origin={origin} emailConfigured={emailConfigured} />
      </header>

      <main className="px-6 py-8 sm:px-8">
        {sendError && (
          <div className="mb-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
            Couldn't send — {sendError}
          </div>
        )}
        <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="mb-3 text-sm font-semibold">How to add and invite a reviewer</p>
          <ol className="grid gap-3 text-xs text-muted-foreground sm:grid-cols-4">
            <li><strong className="text-foreground">1. Invite Expert</strong> (top right): enter their name, email and speciality, then Generate Invite Link.</li>
            <li><strong className="text-foreground">2. Send it</strong>: use Send (email from the portal), WhatsApp (opens a ready message), Draft (your own mail app) or Copy.</li>
            <li><strong className="text-foreground">3. Track progress</strong>: the Completion bar fills as they rate items. Their ratings autosave.</li>
            <li><strong className="text-foreground">4. Fix or remove</strong>: the pencil edits name or email; Delete removes the invitation and its link.</li>
          </ol>
        </div>

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
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Invited</TableHead>
                  <TableHead>Discipline</TableHead>
                  <TableHead>Items Assigned</TableHead>
                  <TableHead>Items Completed</TableHead>
                  <TableHead>Completion</TableHead>
                  <TableHead>Invite</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((e) => {
                  const pct = e.assigned ? Math.round((e.completed / e.assigned) * 100) : 0;
                  const link = `${origin}/expert/invite/${e.inviteToken}`;
                  return (
                    <TableRow key={e.code}>
                      <TableCell className="font-mono text-xs font-medium">{e.code}</TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-2">
                          <span className={e.name ? "font-medium" : "text-muted-foreground"}>{e.name ?? "—"}</span>
                          <EditContactDialog row={e} />
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {e.email ? (
                          <span className="break-all">{e.email}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{e.invited}</TableCell>
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
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => copyLink(e.inviteToken, e.code)}
                            className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                          >
                            {copiedCode === e.code ? <Check size={13} /> : <Copy size={13} />}
                            {copiedCode === e.code ? "Copied" : "Copy"}
                          </button>
                          <a
                            href={
                              e.email
                                ? inviteEmailDraft(link).replace("mailto:?", `mailto:${encodeURIComponent(e.email)}?`)
                                : inviteEmailDraft(link)
                            }
                            className="flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
                          >
                            <Mail size={13} /> Draft
                          </a>
                          <a
                            href={whatsappInviteUrl(link, e.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs font-medium text-success hover:underline"
                          >
                            <MessageCircle size={13} /> WhatsApp
                          </a>
                          {emailConfigured && e.email && (
                            <button
                              onClick={() => sendNow(e.id, e.code)}
                              disabled={sendingCode === e.code}
                              className="flex items-center gap-1.5 text-xs font-medium text-success hover:underline disabled:opacity-50"
                            >
                              {sendingCode === e.code ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : sentCode === e.code ? (
                                <Check size={13} />
                              ) : (
                                <Send size={13} />
                              )}
                              {sendingCode === e.code ? "Sending" : sentCode === e.code ? "Sent" : "Send"}
                            </button>
                          )}
                          <DeleteExpertDialog row={e} />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
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

function DeleteExpertDialog({ row }: { row: Row }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function confirmDelete() {
    startTransition(async () => {
      const res = await deleteExpert(row.id);
      if (res.ok) setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            aria-label={`Delete invitation ${row.code}`}
            className="flex items-center gap-1.5 text-xs font-medium text-destructive hover:underline"
          />
        }
      >
        <Trash2 size={13} /> Delete
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete invitation {row.code}?</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 px-4 pb-4">
          <p className="text-sm text-muted-foreground">
            This permanently removes {row.name ?? row.email ?? row.code} and their invite link — the link will stop
            working immediately.
            {row.completed > 0 && (
              <strong className="mt-2 block text-destructive">
                They have already rated {row.completed} item{row.completed === 1 ? "" : "s"}; those ratings will be
                deleted from the CVI data too.
              </strong>
            )}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 rounded-full" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button variant="destructive" className="flex-1 rounded-full" onClick={confirmDelete} disabled={pending}>
              {pending ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditContactDialog({ row }: { row: Row }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(row.name ?? "");
  const [email, setEmail] = useState(row.email ?? "");
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const res = await updateExpertContact({ id: row.id, name, email });
      if (res.ok) setOpen(false);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) {
          setName(row.name ?? "");
          setEmail(row.email ?? "");
        }
      }}
    >
      <DialogTrigger
        render={
          <button
            aria-label={`Edit contact for ${row.code}`}
            className="text-muted-foreground transition-colors hover:text-primary"
          />
        }
      >
        <Pencil size={12} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit contact — {row.code}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 px-4 pb-4">
          <div>
            <Label className="mb-2 text-sm font-medium">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" placeholder="e.g. Dr. A. Kumar" />
          </div>
          <div>
            <Label className="mb-2 text-sm font-medium">Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl" placeholder="expert@institution.edu" />
          </div>
          <Button className="rounded-full" disabled={pending} onClick={save}>
            {pending ? "Saving…" : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InviteDialog({ origin, emailConfigured }: { origin: string; emailConfigured: boolean }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendErr, setSendErr] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("");
  const [result, setResult] = useState<{ id: string; expertCode: string; inviteToken: string } | null>(null);
  const [copied, setCopied] = useState(false);

  function handleInvite() {
    startTransition(async () => {
      const res = await inviteExpert({ name, email, speciality, designation, department });
      if (res.ok) setResult(res);
    });
  }

  function reset() {
    setResult(null);
    setName("");
    setEmail("");
    setSpeciality("");
    setDesignation("");
    setDepartment("");
    setCopied(false);
    setSending(false);
    setSent(false);
    setSendErr(null);
  }

  function sendNow() {
    if (!result) return;
    setSending(true);
    setSendErr(null);
    startTransition(async () => {
      const res = await sendExpertInviteEmail(result.id, origin);
      setSending(false);
      if (res.ok) setSent(true);
      else setSendErr(res.error ?? "Failed to send.");
    });
  }

  const link = result ? `${origin}/expert/invite/${result.inviteToken}` : "";

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
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
                <Label className="mb-2 text-sm font-medium">Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" placeholder="e.g. Dr. A. Kumar" />
              </div>
              <div>
                <Label className="mb-2 text-sm font-medium">
                  Email <span className="font-normal text-muted-foreground">(optional, for a ready-to-send invite)</span>
                </Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl" placeholder="expert@institution.edu" />
              </div>
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
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl bg-secondary p-4 text-sm">
                <p className="mb-2 font-semibold">{result.expertCode} created.</p>
                <code className="block break-all rounded-lg bg-card p-2 text-xs">{link}</code>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-2 rounded-full"
                  onClick={() => {
                    navigator.clipboard.writeText(link);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy Link"}
                </Button>
                <a
                  href={
                    email
                      ? inviteEmailDraft(link).replace("mailto:?", `mailto:${encodeURIComponent(email)}?`)
                      : inviteEmailDraft(link)
                  }
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                  <Send size={14} /> Open Email Draft
                </a>
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Opens a pre-filled email in your own mail app{email ? ` addressed to ${email}` : ""} —
                nothing is sent automatically.
              </p>

              {emailConfigured && email && (
                <div className="rounded-2xl border border-border p-4">
                  <p className="mb-3 text-xs text-muted-foreground">
                    Or have the portal send it directly to <strong className="text-foreground">{email}</strong>:
                  </p>
                  <Button
                    variant="outline"
                    className="w-full gap-2 rounded-full"
                    disabled={sending || sent}
                    onClick={sendNow}
                  >
                    {sent ? <Check size={14} /> : <Send size={14} />}
                    {sending ? "Sending…" : sent ? "Sent" : "Send Invite Now"}
                  </Button>
                  {sendErr && <p className="mt-2 text-xs text-destructive">{sendErr}</p>}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
