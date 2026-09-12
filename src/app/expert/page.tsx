"use client";

import { Suspense, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, Microscope } from "lucide-react";
import { Logo } from "@/components/pharma/logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { loginWithInviteToken } from "./actions";

export default function ExpertLoginPage() {
  return (
    <Suspense fallback={null}>
      <ExpertLoginForm />
    </Suspense>
  );
}

function ExpertLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invalidInvite = searchParams.get("error") === "invalid_invite";
  const [token, setToken] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleEnter() {
    setError(null);
    startTransition(async () => {
      const result = await loginWithInviteToken(token.trim());
      if (result.ok) {
        router.push(result.profileComplete ? "/expert/review" : "/expert/profile");
      } else {
        setError("That invite code was not recognised. Check the link your investigator sent you.");
      }
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-accent/10 text-accent">
            <Microscope size={26} />
          </div>
          <Logo size="sm" className="mb-2" />
          <h1 className="font-heading text-xl font-bold">Expert Validation Portal</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Content Validity Index (CVI) panel access
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
            You should have received a personal invite link from the study
            investigator — opening it signs you in directly. If you were
            given an invite code instead, enter it below.
          </p>
          <Label className="mb-2 text-sm font-medium">Invite code</Label>
          <div className="relative mb-4">
            <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="rounded-xl pl-9 font-mono text-xs"
              placeholder="Paste your invite code"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>
          {(error || invalidInvite) && (
            <p className="mb-3 text-xs text-destructive">
              {error ?? "That invite link is no longer valid."}
            </p>
          )}
          <Button className="w-full rounded-full" disabled={!token || pending} onClick={handleEnter}>
            {pending ? "Verifying…" : "Enter Portal"}
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Access is by invitation only. Contact the investigator if you did not
          receive a link.
        </p>
      </div>
    </div>
  );
}
