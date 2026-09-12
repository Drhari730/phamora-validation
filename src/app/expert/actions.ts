"use server";

import { prisma } from "@/lib/prisma";
import { createSession, requireSession } from "@/lib/session";

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
