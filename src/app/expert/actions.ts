"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSession, requireSession } from "@/lib/session";
import { nextExpertCode } from "@/lib/ids";
import { generateInviteToken } from "@/lib/auth";
import { expertInviteEmailHtml } from "@/lib/email-templates";

export async function getExpertRegistrationInfo() {
  const settings = await prisma.studySettings.findUnique({ where: { id: "singleton" } });
  return {
    open: Boolean(settings?.expertSelfRegistration),
    codeRequired: Boolean(settings?.expertRegistrationCode?.trim()),
  };
}

async function emailPersonalLink(email: string, link: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `PHAMORA Validation Study <${from}>`,
        to: [email],
        subject: "Your PHAMORA expert review link",
        text: `Thank you for joining the PHAMORA expert panel.\n\nYour personal review link (keep it to return to your ratings any time):\n${link}\n\nDr. G. Hari Prakash\nPrincipal Investigator, PHAMORA Validation Study`,
        html: expertInviteEmailHtml(link),
      }),
    });
  } catch {
    // Registration must never fail because of email.
  }
}

export async function registerExpert(input: { name: string; email: string; code?: string }) {
  const settings = await prisma.studySettings.findUnique({ where: { id: "singleton" } });
  if (!settings?.expertSelfRegistration) {
    return { ok: false as const, error: "Self-registration is closed. Please use the personal link sent by the investigator." };
  }
  const requiredCode = settings.expertRegistrationCode?.trim();
  if (requiredCode && (input.code ?? "").trim().toLowerCase() !== requiredCode.toLowerCase()) {
    return { ok: false as const, error: "That access code is not correct." };
  }

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  if (name.length < 2) return { ok: false as const, error: "Please enter your name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false as const, error: "Please enter a valid email address." };
  }

  const existing = await prisma.expert.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
  if (existing) {
    return {
      ok: false as const,
      error: "This email is already registered. Use your personal review link, or ask the investigator to resend it.",
    };
  }

  const expert = await prisma.expert.create({
    data: { expertCode: await nextExpertCode(), inviteToken: generateInviteToken(), name, email },
  });
  await createSession("EXPERT", expert.id, expert.expertCode);

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  await emailPersonalLink(email, `${protocol}://${host}/expert/invite/${expert.inviteToken}`);

  return { ok: true as const };
}

export async function loginWithInviteToken(token: string) {
  const expert = await prisma.expert.findUnique({ where: { inviteToken: token } });
  if (!expert) return { ok: false as const };
  await createSession("EXPERT", expert.id, expert.expertCode);
  return { ok: true as const, profileComplete: Boolean(expert.profileCompletedAt) };
}

async function currentExpert() {
  const session = await requireSession("EXPERT");
  if (!session) return null;
  return prisma.expert.findUnique({ where: { id: session.id } });
}

export async function submitExpertProfile(input: {
  designation?: string;
  department?: string;
  speciality?: string;
  yearsOfExperience?: number;
  yearsOfTeachingExperience?: number;
  medEdExperience?: string;
  institution?: string;
}) {
  const expert = await currentExpert();
  if (!expert) return { ok: false, error: "No active session." };

  await prisma.expert.update({
    where: { id: expert.id },
    data: { ...input, profileCompletedAt: new Date() },
  });
  return { ok: true };
}

export async function getExpertReviewData() {
  const expert = await currentExpert();
  if (!expert) return null;

  const [items, ratings] = await Promise.all([
    prisma.contentItem.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } }),
    prisma.expertCviRating.findMany({ where: { expertId: expert.id } }),
  ]);
  const ratingMap = new Map(ratings.map((r) => [r.contentItemId, r]));

  const moduleProgress: Record<string, { done: number; total: number }> = {};
  for (const item of items) {
    moduleProgress[item.module] ??= { done: 0, total: 0 };
    moduleProgress[item.module].total++;
    if (ratingMap.has(item.id)) moduleProgress[item.module].done++;
  }

  return {
    expertCode: expert.expertCode,
    items: items.map((item) => ({
      id: item.id,
      module: item.module,
      contentType: item.contentType,
      title: item.contentTitle,
      preview: item.contentText,
      rating: ratingMap.get(item.id)?.rating,
      comment: ratingMap.get(item.id)?.comment ?? "",
    })),
    moduleProgress,
  };
}

export async function submitCviRating(input: { contentItemId: string; rating: number; comment?: string }) {
  const expert = await currentExpert();
  if (!expert) return { ok: false, error: "No active session." };

  await prisma.expertCviRating.upsert({
    where: { expertId_contentItemId: { expertId: expert.id, contentItemId: input.contentItemId } },
    update: { rating: input.rating, comment: input.comment },
    create: {
      expertId: expert.id,
      contentItemId: input.contentItemId,
      rating: input.rating,
      comment: input.comment,
    },
  });
  return { ok: true };
}
