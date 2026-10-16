"use client";

import { Suspense, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, Microscope, UserPlus } from "lucide-react";
import { Logo } from "@/components/pharma/logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { loginWithInviteToken, registerExpert } from "./actions";

export function ExpertLoginForm({
  registrationOpen,
  codeRequired,
}: {
  registrationOpen: boolean;
  codeRequired: boolean;
}) {
  return (
    <Suspense fallback={null}>
      <Inner registrationOpen={registrationOpen} codeRequired={codeRequired} />
    </Suspense>
  );
}

function Inner({ registrationOpen, codeRequired }: { registrationOpen: boolean; codeRequired: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invalidInvite = searchParams.get("error") === "invalid_invite";
  const [mode, setMode] = useState<"register" | "invite">(registrationOpen ? "register" : "invite");
  const [token, setToken] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
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

  function handleRegister() {
    setError(null);
    startTransition(async () => {
      const result = await registerExpert({ name, email, code });
      if (result.ok) {
        router.push("/expert/profile");
      } else {
        setError(result.error);
      }
    });
  }

  const canRegister = name.trim().length >= 2 && email.includes("@") && (!codeRequired || code.trim().length > 0);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-accent/10 text-accent">
            <Microscope size={26} />
          </div>
          <Logo size="sm" className="mb-2" />
          <h1 className="font-heading text-xl font-bold">Expert Validation Portal</h1>
          <p className="mt-1 text-sm text-muted-foreground">Content Validity Index (CVI) panel access</p>
        </div>

        {registrationOpen && (
          <div className="mb-4 grid grid-cols-2 gap-1 rounded-full border border-border bg-card p-1 text-xs font-medium">
            {(
              [
                ["register", "New reviewer"],
                ["invite", "I have a link / key"],
              ] as const
            ).map(([m, label]) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={cn(
                  "rounded-full px-3 py-2 transition-colors",
                  mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          {mode === "register" ? (
            <>
              <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
                Enter your name and email to join the expert panel. We'll email you a personal link so you can
                return to your ratings any time.
              </p>
              <Label className="mb-2 text-sm font-medium">Full name</Label>
              <Input
                className="mb-4 rounded-xl"
                placeholder="e.g. Dr. A. Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Label className="mb-2 text-sm font-medium">Email</Label>
              <Input
                type="email"
                className="mb-4 rounded-xl"
                placeholder="you@institution.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {codeRequired && (
                <>
                  <Label className="mb-2 text-sm font-medium">Access code</Label>
                  <Input
                    className="mb-4 rounded-xl"
                    placeholder="Given by the investigator"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </>
              )}
              {error && <p className="mb-3 text-xs text-destructive">{error}</p>}
              <Button className="w-full gap-2 rounded-full" disabled={!canRegister || pending} onClick={handleRegister}>
                <UserPlus size={15} /> {pending ? "Registering…" : "Register & Start Review"}
              </Button>
            </>
          ) : (
            <>
              <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
                You should have received a personal invite link from the study investigator — opening it signs you
                in directly. If you were given an invite code instead, enter it below.
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
                <p className="mb-3 text-xs text-destructive">{error ?? "That invite link is no longer valid."}</p>
              )}
              <Button className="w-full rounded-full" disabled={!token || pending} onClick={handleEnter}>
                {pending ? "Verifying…" : "Enter Portal"}
              </Button>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {registrationOpen
            ? "Already registered? Use \"I have a link / key\" or open the personal link emailed to you."
            : "Access is by invitation only. Contact the investigator if you did not receive a link."}
        </p>
      </div>
    </div>
  );
}
