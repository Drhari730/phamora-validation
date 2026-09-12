import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decode, SESSION_COOKIE_NAME, type SessionPayload } from "@/lib/session";

const STUDENT_GATED = [
  "/student/profile",
  "/student/pretest",
  "/student/study-period",
  "/student/posttest",
  "/student/usability",
  "/student/app-quality",
  "/student/feedback",
  "/student/dashboard",
  "/student/complete",
];

const EXPERT_GATED = ["/expert/profile", "/expert/review"];

const ADMIN_GATED = [
  "/admin/dashboard",
  "/admin/students",
  "/admin/experts",
  "/admin/cvi",
  "/admin/instruments",
  "/admin/export",
  "/admin/settings",
];

function session(request: NextRequest): SessionPayload | null {
  const raw = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;
  return decode(raw);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (STUDENT_GATED.some((p) => pathname.startsWith(p))) {
    const s = session(request);
    if (!s || s.role !== "STUDENT") {
      return NextResponse.redirect(new URL("/student/consent", request.url));
    }
  }

  if (EXPERT_GATED.some((p) => pathname.startsWith(p))) {
    const s = session(request);
    if (!s || s.role !== "EXPERT") {
      return NextResponse.redirect(new URL("/expert", request.url));
    }
  }

  if (ADMIN_GATED.some((p) => pathname.startsWith(p))) {
    const s = session(request);
    if (!s || s.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/expert/:path*", "/admin/:path*"],
};
