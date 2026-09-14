"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  LayoutDashboard,
  Users,
  Microscope,
  ClipboardCheck,
  FileQuestion,
  Download,
  Settings,
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/pharma/logo";
import { cn } from "@/lib/utils";
import { adminLogout } from "@/app/admin/actions";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/experts", label: "Experts", icon: Microscope },
  { href: "/admin/cvi", label: "CVI Review", icon: ClipboardCheck },
  { href: "/admin/instruments", label: "Instruments", icon: FileQuestion },
  { href: "/admin/export", label: "Data Export", icon: Download },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await adminLogout();
      router.push("/admin");
      router.refresh();
    });
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-sidebar px-4 py-6 text-sidebar-foreground lg:flex">
        <div className="mb-8 px-2">
          <Logo size="sm" dark />
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                )}
              >
                <item.icon size={17} strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex items-center gap-3 rounded-xl border border-sidebar-border px-3 py-2.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">
            PI
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold">Dr. G. Hari Prakash</p>
            <p className="truncate text-[11px] text-sidebar-foreground/60">Principal Investigator</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={pending}
            aria-label="Sign out"
            className="shrink-0 text-sidebar-foreground/50 transition-colors hover:text-sidebar-foreground disabled:opacity-50"
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>
      <div className="flex-1 lg:pl-64">{children}</div>
    </div>
  );
}
