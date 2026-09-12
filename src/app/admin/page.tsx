"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Mail, Lock } from "lucide-react";
import { Logo } from "@/components/pharma/logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { adminLogin } from "./actions";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSignIn() {
    setError(null);
    startTransition(async () => {
      const result = await adminLogin(email, password);
      if (result.ok) {
        router.push("/admin/dashboard");
      } else {
        setError(result.error ?? "Sign-in failed.");
      }
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-indigo/10 text-indigo">
            <ShieldCheck size={26} />
          </div>
          <Logo size="sm" className="mb-2" />
          <h1 className="font-heading text-xl font-bold">Investigator Login</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Admin access to the PHAMORA validation dataset
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <Label className="mb-2 text-sm font-medium">Email</Label>
          <div className="relative mb-4">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="rounded-xl pl-9"
              placeholder="investigator@institution.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Label className="mb-2 text-sm font-medium">Password</Label>
          <div className="relative mb-6">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="password"
              className="rounded-xl pl-9"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="mb-3 text-center text-sm text-destructive">{error}</p>}
          <Button
            className="w-full rounded-full"
            disabled={!email || !password || pending}
            onClick={handleSignIn}
          >
            {pending ? "Signing in…" : "Sign In"}
          </Button>
          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            Demo: admin@phamora.study / PhamoraAdmin@2026
          </p>
        </div>
      </div>
    </div>
  );
}
