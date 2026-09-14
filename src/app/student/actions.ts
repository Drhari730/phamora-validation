"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hashSecret, generatePin } from "@/lib/auth";
import { createSession, requireSession } from "@/lib/session";
import { nextParticipantCode } from "@/lib/ids";
import { percentageScore, scoreSus } from "@/lib/scoring";

async function getOrCreateParticipant() {
  const session = await requireSession("STUDENT");
  if (session) {
    const existing = await prisma.participant.findUnique({ where: { id: session.id } });
    if (existing) return existing;
  }
  const code = await nextParticipantCode();
  const pin = generatePin();
  const participant = await prisma.participant.create({
    data: { participantCode: code, pinHash: await hashSecret(pin) },
  });
  await createSession("STUDENT", participant.id, participant.participantCode);
  return participant;
}

async function currentParticipant() {
  const session = await requireSession("STUDENT");
  if (!session) return null;
  return prisma.participant.findUnique({ where: { id: session.id } });
}

export async function submitConsent(input: {
  informationRead: boolean;
  voluntaryAgree: boolean;
}) {
  if (!input.informationRead || !input.voluntaryAgree) {
    return { ok: false, error: "Both consent statements must be checked." };
  }
  const participant = await getOrCreateParticipant();
  await prisma.consent.upsert({
    where: { participantId: participant.id },
    update: { informationRead: input.informationRead, voluntaryAgree: input.voluntaryAgree },
    create: {
      participantId: participant.id,
      consentVersion: "v1.0",
      informationRead: input.informationRead,
      voluntaryAgree: input.voluntaryAgree,
    },
  });
  await prisma.participant.update({
    where: { id: participant.id },
    data: { studyStatus: "CONSENTED" },
  });
  revalidatePath("/student");
  return { ok: true, participantCode: participant.participantCode };
}

export async function submitProfile(input: {
  ageGroup?: string;
  gender?: string;
  program?: string;
  mbbsYear?: string;
  digitalToolUseFrequency?: string;
  priorPharmacologyExposure?: boolean;
  priorPharmacologyExam?: boolean;
  priorAppUse?: boolean;
}) {
  const participant = await currentParticipant();
  if (!participant) return { ok: false, error: "No active session. Please start from consent." };

  await prisma.baselineProfile.upsert({
    where: { participantId: participant.id },
    update: input,
    create: { participantId: participant.id, ...input },
  });
  revalidatePath("/student");
  return { ok: true };
}

export async function getAssessmentQuestions(assessmentType: "PRETEST" | "POSTTEST") {
  const settings = await prisma.studySettings.findUnique({ where: { id: "singleton" } });
  const questions = await prisma.question.findMany({ where: { active: true } });
  const ordered = settings?.randomizeQuestionOrder
    ? [...questions].sort(() => Math.random() - 0.5)
    : questions;

  return ordered.map((q) => ({
    id: q.id,
    module: formatModule(q.module),
    text: q.questionText,
    options: [
      { key: "A", text: q.optionA },
      { key: "B", text: q.optionB },
      { key: "C", text: q.optionC },
      { key: "D", text: q.optionD },
    ],
  }));
}

function formatModule(m: string) {
  return {
    GENERAL_PHARMACOLOGY: "General Pharmacology",
    ANS: "Autonomic Nervous System",
    CARDIOVASCULAR: "Cardiovascular",
    ANTIMICROBIALS: "Antimicrobials",
  }[m] ?? m;
}

export async function submitAssessment(
  assessmentType: "PRETEST" | "POSTTEST",
  answers: { questionId: string; selectedOption: string; flagged: boolean; responseTimeSeconds?: number }[]
) {
  const participant = await currentParticipant();
  if (!participant) return { ok: false, error: "No active session." };

  const existing = await prisma.assessmentSession.findUnique({
    where: { participantId_assessmentType: { participantId: participant.id, assessmentType } },
  });
  if (existing?.completedAt) {
    return { ok: false, error: "This assessment has already been submitted and is locked." };
  }

  const questions = await prisma.question.findMany({
    where: { id: { in: answers.map((a) => a.questionId) } },
  });
  const questionMap = new Map(questions.map((q) => [q.id, q]));

  let correct = 0;
  const responseRows = answers.map((a) => {
    const q = questionMap.get(a.questionId);
    const isCorrect = q ? q.correctOption === a.selectedOption : false;
    if (isCorrect) correct++;
    return {
      questionId: a.questionId,
      selectedOption: a.selectedOption,
      correctOption: q?.correctOption ?? "A",
      isCorrect,
      flagged: a.flagged,
      answeredAt: new Date(),
      responseTimeSeconds: a.responseTimeSeconds,
    };
  });

  const session = await prisma.assessmentSession.upsert({
    where: { participantId_assessmentType: { participantId: participant.id, assessmentType } },
    update: {
      completedAt: new Date(),
      score: correct,
      totalQuestions: answers.length,
      percentage: percentageScore(correct, answers.length),
    },
    create: {
      participantId: participant.id,
      assessmentType,
      completedAt: new Date(),
      score: correct,
      totalQuestions: answers.length,
      percentage: percentageScore(correct, answers.length),
    },
  });

  await prisma.assessmentResponse.deleteMany({ where: { sessionId: session.id } });
  await prisma.assessmentResponse.createMany({
    data: responseRows.map((r) => ({ ...r, sessionId: session.id })),
  });

  await prisma.participant.update({
    where: { id: participant.id },
    data: { studyStatus: assessmentType === "PRETEST" ? "PRETEST_DONE" : "POSTTEST_DONE" },
  });

  revalidatePath("/student");
  return { ok: true, score: correct, total: answers.length };
}

export async function submitSus(items: {
  q1: number; q2: number; q3: number; q4: number; q5: number;
  q6: number; q7: number; q8: number; q9: number; q10: number;
}) {
  const participant = await currentParticipant();
  if (!participant) return { ok: false, error: "No active session." };

  const susScore = scoreSus(items);
  await prisma.susResponse.upsert({
    where: { participantId: participant.id },
    update: { ...items, susScore },
    create: { participantId: participant.id, ...items, susScore },
  });
  await prisma.participant.update({
    where: { id: participant.id },
    data: { studyStatus: "USABILITY_DONE" },
  });
  revalidatePath("/student");
  return { ok: true, susScore };
}

export async function submitAppQuality(
  responses: { section: string; itemId: string; itemLabel: string; response: number }[]
) {
  const participant = await currentParticipant();
  if (!participant) return { ok: false, error: "No active session." };

  await prisma.$transaction([
    prisma.appQualityResponse.deleteMany({ where: { participantId: participant.id } }),
    prisma.appQualityResponse.createMany({
      data: responses.map((r) => ({ ...r, participantId: participant.id })),
    }),
  ]);
  await prisma.participant.update({
    where: { id: participant.id },
    data: { studyStatus: "APP_QUALITY_DONE" },
  });
  revalidatePath("/student");
  return { ok: true };
}

export async function submitFeedback(input: {
  likes?: string;
  difficulties?: string;
  usefulFeature?: string;
  improvementFeature?: string;
  suggestedFeature?: string;
  otherSuggestions?: string;
  overallSatisfaction?: number;
}) {
  const participant = await currentParticipant();
  if (!participant) return { ok: false, error: "No active session." };

  await prisma.feedback.upsert({
    where: { participantId: participant.id },
    update: input,
    create: { participantId: participant.id, ...input },
  });
  await prisma.participant.update({
    where: { id: participant.id },
    data: { studyStatus: "COMPLETED" },
  });
  revalidatePath("/student");
  return { ok: true, participantCode: participant.participantCode };
}

export async function getParticipantState() {
  const participant = await currentParticipant();
  if (!participant) return null;

  const [consent, profile, pretest, posttest, sus, appQualityCount, feedback] = await Promise.all([
    prisma.consent.findUnique({ where: { participantId: participant.id } }),
    prisma.baselineProfile.findUnique({ where: { participantId: participant.id } }),
    prisma.assessmentSession.findUnique({
      where: { participantId_assessmentType: { participantId: participant.id, assessmentType: "PRETEST" } },
    }),
    prisma.assessmentSession.findUnique({
      where: { participantId_assessmentType: { participantId: participant.id, assessmentType: "POSTTEST" } },
    }),
    prisma.susResponse.findUnique({ where: { participantId: participant.id } }),
    prisma.appQualityResponse.count({ where: { participantId: participant.id } }),
    prisma.feedback.findUnique({ where: { participantId: participant.id } }),
  ]);

  return {
    participantCode: participant.participantCode,
    studyStatus: participant.studyStatus,
    consentDone: Boolean(consent),
    profileDone: Boolean(profile),
    pretestDone: Boolean(pretest?.completedAt),
    posttestDone: Boolean(posttest?.completedAt),
    susDone: Boolean(sus),
    appQualityDone: appQualityCount > 0,
    feedbackDone: Boolean(feedback),
  };
}
