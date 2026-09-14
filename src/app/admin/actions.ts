"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySecret } from "@/lib/auth";
import { createSession, requireSession, clearSession } from "@/lib/session";
import {
  itemCvi,
  scaleCviAverage,
  scaleCviUniversalAgreement,
  cviStatus,
  mean,
} from "@/lib/scoring";
import { expertInviteEmailHtml } from "@/lib/email-templates";

export async function adminLogin(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== "ADMIN") return { ok: false, error: "Invalid credentials." };
  const valid = await verifySecret(password, user.passwordHash);
  if (!valid) return { ok: false, error: "Invalid credentials." };

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await createSession("ADMIN", user.id, user.email);
  return { ok: true };
}

export async function adminLogout() {
  await clearSession();
}

async function requireAdmin() {
  const session = await requireSession("ADMIN");
  if (!session) throw new Error("Not authenticated as admin.");
  return session;
}

export async function getDashboardData() {
  await requireAdmin();

  const [
    studentsEnrolled,
    consentCompleted,
    pretestSessions,
    posttestSessions,
    susResponses,
    appQualityParticipants,
    fullyCompleted,
    expertsCount,
    expertsSubmitted,
  ] = await Promise.all([
    prisma.participant.count(),
    prisma.consent.count(),
    prisma.assessmentSession.findMany({ where: { assessmentType: "PRETEST", completedAt: { not: null } } }),
    prisma.assessmentSession.findMany({ where: { assessmentType: "POSTTEST", completedAt: { not: null } } }),
    prisma.susResponse.findMany(),
    prisma.appQualityResponse.groupBy({ by: ["participantId"] }),
    prisma.participant.count({ where: { studyStatus: "COMPLETED" } }),
    prisma.expert.count(),
    prisma.expert.count({ where: { profileCompletedAt: { not: null } } }),
  ]);

  const meanPretest = mean(pretestSessions.map((s) => s.percentage ?? 0)) ?? 0;
  const meanPosttest = mean(posttestSessions.map((s) => s.percentage ?? 0)) ?? 0;
  const meanSus = mean(susResponses.map((s) => s.susScore)) ?? 0;

  const contentItems = await prisma.contentItem.findMany({ include: { ratings: true } });
  const itemCvis = contentItems
    .filter((c) => c.ratings.length > 0)
    .map((c) => itemCvi(c.ratings.map((r) => r.rating)));
  const scviAve = scaleCviAverage(itemCvis);

  return {
    summary: {
      studentsEnrolled,
      consentCompleted,
      pretestCompleted: pretestSessions.length,
      posttestCompleted: posttestSessions.length,
      usabilityCompleted: susResponses.length,
      appQualityCompleted: appQualityParticipants.length,
      fullyCompleted,
      expertsInvited: expertsCount,
      expertReviewsCompleted: expertsSubmitted,
    },
    stats: {
      meanPretest: Math.round(meanPretest * 10) / 10,
      meanPosttest: Math.round(meanPosttest * 10) / 10,
      knowledgeImprovement: Math.round((meanPosttest - meanPretest) * 10) / 10,
      meanSus: Math.round(meanSus * 10) / 10,
      scviAve: Math.round(scviAve * 100) / 100,
    },
  };
}

export async function getModuleScoreTrend() {
  await requireAdmin();
  const modules = ["GENERAL_PHARMACOLOGY", "ANS", "CARDIOVASCULAR", "ANTIMICROBIALS"] as const;
  const labels: Record<string, string> = {
    GENERAL_PHARMACOLOGY: "General Pharm",
    ANS: "ANS",
    CARDIOVASCULAR: "Cardiovascular",
    ANTIMICROBIALS: "Antimicrobials",
  };

  const results = [];
  for (const m of modules) {
    const responses = await prisma.assessmentResponse.findMany({
      where: { question: { module: m } },
      include: { session: true, question: true },
    });
    const pre = responses.filter((r) => r.session.assessmentType === "PRETEST");
    const post = responses.filter((r) => r.session.assessmentType === "POSTTEST");
    const preAcc = pre.length ? (pre.filter((r) => r.isCorrect).length / pre.length) * 100 : 0;
    const postAcc = post.length ? (post.filter((r) => r.isCorrect).length / post.length) * 100 : 0;
    results.push({ name: labels[m], pre: Math.round(preAcc), post: Math.round(postAcc) });
  }
  return results;
}

export async function getSusDistribution() {
  await requireAdmin();
  const responses = await prisma.susResponse.findMany({ select: { susScore: true } });
  const buckets = [
    { range: "0-40", min: 0, max: 40 },
    { range: "41-55", min: 41, max: 55 },
    { range: "56-68", min: 56, max: 68 },
    { range: "69-80", min: 69, max: 80 },
    { range: "81-100", min: 81, max: 100 },
  ];
  return buckets.map((b) => ({
    range: b.range,
    count: responses.filter((r) => r.susScore >= b.min && r.susScore <= b.max).length,
  }));
}

export async function getStudentsTable() {
  await requireAdmin();
  const participants = await prisma.participant.findMany({
    include: {
      consent: true,
      assessmentSessions: true,
      susResponse: true,
      appQualityResponses: { take: 1 },
      feedback: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return participants.map((p) => {
    const pretest = p.assessmentSessions.find((s) => s.assessmentType === "PRETEST");
    const posttest = p.assessmentSessions.find((s) => s.assessmentType === "POSTTEST");
    return {
      code: p.participantCode,
      consent: Boolean(p.consent),
      pretest: Boolean(pretest?.completedAt),
      posttest: Boolean(posttest?.completedAt),
      sus: p.susResponse ? Math.round(p.susResponse.susScore) : null,
      appQuality: p.appQualityResponses.length > 0,
      feedback: Boolean(p.feedback),
      status:
        p.studyStatus === "COMPLETED"
          ? ("Completed" as const)
          : p.studyStatus === "NOT_STARTED"
          ? ("Not Started" as const)
          : ("In Progress" as const),
      created: p.createdAt.toISOString().slice(0, 10),
      completed: p.studyStatus === "COMPLETED" ? p.updatedAt.toISOString().slice(0, 10) : null,
      isPilot: p.isPilot,
    };
  });
}

export async function getExpertsTable() {
  await requireAdmin();
  const experts = await prisma.expert.findMany({
    include: { ratings: true },
    orderBy: { expertCode: "asc" },
  });
  const totalItems = await prisma.contentItem.count();

  return experts.map((e) => ({
    id: e.id,
    code: e.expertCode,
    email: e.email,
    discipline: e.speciality ?? "—",
    assigned: totalItems,
    completed: e.ratings.length,
    submitted: e.ratings.length >= totalItems ? e.ratings[e.ratings.length - 1]?.submittedAt.toISOString().slice(0, 10) ?? null : null,
    inviteToken: e.inviteToken,
  }));
}

export async function getCviData() {
  await requireAdmin();
  const items = await prisma.contentItem.findMany({
    include: { ratings: true },
    orderBy: { createdAt: "asc" },
  });

  const table = items.map((item) => {
    const ratings = item.ratings.map((r) => r.rating);
    const iCvi = itemCvi(ratings);
    return {
      id: item.id,
      item: item.contentTitle,
      module: item.module,
      completed: `${ratings.length}`,
      icvi: Math.round(iCvi * 1000) / 1000,
      status: ratings.length > 0 ? cviStatus(iCvi) : ("REVIEW_RECOMMENDED" as const),
      comments: item.ratings
        .filter((r) => r.comment)
        .map((r, i) => ({ label: `Expert #${i + 1}`, rating: r.rating, comment: r.comment! })),
    };
  });

  const itemCvis = items
    .filter((i) => i.ratings.length > 0)
    .map((i) => itemCvi(i.ratings.map((r) => r.rating)));

  return {
    table,
    scviAve: Math.round(scaleCviAverage(itemCvis) * 100) / 100,
    scviUa: Math.round(scaleCviUniversalAgreement(itemCvis) * 100),
    accepted: table.filter((t) => t.status === "ACCEPTED").length,
    revisionRequired: table.filter((t) => t.status === "REVISION_REQUIRED").length,
  };
}

export async function inviteExpert(input: {
  email?: string;
  speciality?: string;
  designation?: string;
  department?: string;
}) {
  await requireAdmin();
  const { nextExpertCode } = await import("@/lib/ids");
  const { generateInviteToken } = await import("@/lib/auth");
  const code = await nextExpertCode();
  const expert = await prisma.expert.create({
    data: {
      expertCode: code,
      inviteToken: generateInviteToken(),
      email: input.email,
      speciality: input.speciality,
      designation: input.designation,
      department: input.department,
    },
  });
  revalidatePath("/admin/experts");
  return { ok: true, id: expert.id, expertCode: expert.expertCode, inviteToken: expert.inviteToken };
}

function expertInviteEmailBody(link: string) {
  return `Dear Colleague,

You are invited to join the expert panel validating the content of PHAMORA, an offline pharmacology learning app for undergraduate health-professions students (MBBS, BDS, Pharmacy/Pharm.D, and Nursing), as part of a formal Content Validity Index (CVI) study.

Your task is to rate a set of lessons, MCQs and monographs (~10-30 minutes) for relevance to the undergraduate pharmacology curriculum. No installation or account is needed — everything happens through your personal review link below.

Your personal review link:
${link}

This link is unique to you — please do not share it. If you have any questions, feel free to reply to this email.

Thank you for contributing your expertise to this study.

Best regards,
Dr. G. Hari Prakash
Principal Investigator, PHAMORA Validation Study`;
}

export async function sendExpertInviteEmail(expertId: string, origin: string) {
  await requireAdmin();
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    return { ok: false, error: "Email sending isn't configured on this deployment yet." };
  }

  const expert = await prisma.expert.findUnique({ where: { id: expertId } });
  if (!expert) return { ok: false, error: "Expert not found." };
  if (!expert.email) return { ok: false, error: "This expert has no email on file." };

  const link = `${origin}/expert/invite/${expert.inviteToken}`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `PHAMORA Validation Study <${from}>`,
      to: [expert.email],
      subject: "Invitation: PHAMORA Expert Content Validation Panel",
      text: expertInviteEmailBody(link),
      html: expertInviteEmailHtml(link),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return { ok: false, error: `Resend API error (${res.status}): ${detail.slice(0, 200)}` };
  }

  revalidatePath("/admin/experts");
  return { ok: true };
}

// --- Question bank (Instruments) --------------------------------------------

export async function getQuestions() {
  await requireAdmin();
  return prisma.question.findMany({ orderBy: { createdAt: "asc" } });
}

export async function getContentItemsList() {
  await requireAdmin();
  return prisma.contentItem.findMany({ orderBy: { createdAt: "asc" } });
}

export async function toggleQuestionActive(id: string) {
  await requireAdmin();
  const q = await prisma.question.findUniqueOrThrow({ where: { id } });
  await prisma.question.update({ where: { id }, data: { active: !q.active } });
  revalidatePath("/admin/instruments");
}

export async function createQuestion(input: {
  module: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
}) {
  await requireAdmin();
  await prisma.question.create({ data: input });
  revalidatePath("/admin/instruments");
  return { ok: true };
}

// --- Settings ----------------------------------------------------------

export async function getStudySettings() {
  await requireAdmin();
  return prisma.studySettings.findUnique({ where: { id: "singleton" } });
}

export async function updateStudySettings(input: {
  studyPeriodStart?: string;
  studyPeriodEnd?: string;
  studyInstructions?: string;
  preTestOpen?: boolean;
  postTestOpen?: boolean;
  usabilityOpen?: boolean;
  expertReviewOpen?: boolean;
  randomizeQuestionOrder?: boolean;
  randomizeOptionOrder?: boolean;
  showSusScoreToStudent?: boolean;
  consentVersion?: string;
  ethicsApprovalRef?: string;
}) {
  await requireAdmin();
  await prisma.studySettings.update({
    where: { id: "singleton" },
    data: {
      ...input,
      studyPeriodStart: input.studyPeriodStart ? new Date(input.studyPeriodStart) : undefined,
      studyPeriodEnd: input.studyPeriodEnd ? new Date(input.studyPeriodEnd) : undefined,
    },
  });
  revalidatePath("/admin/settings");
  return { ok: true };
}

// --- Export --------------------------------------------------------------

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(","));
  }
  return lines.join("\n");
}

export type DatasetKey =
  | "participants"
  | "pretest"
  | "posttest"
  | "sus"
  | "appquality"
  | "feedback"
  | "expertcvi"
  | "cvisummary"
  | "codebook";

const DATASET_LABELS: Record<DatasetKey, string> = {
  participants: "Participants",
  pretest: "Pre-Test",
  posttest: "Post-Test",
  sus: "SUS",
  appquality: "App Quality",
  feedback: "Feedback",
  expertcvi: "Expert CVI",
  cvisummary: "CVI Summary",
  codebook: "Codebook",
};

const CODEBOOK: Record<string, unknown>[] = [
  { variable: "participant_code", type: "string", label: "Anonymous participant ID, e.g. PHA-STU-001" },
  { variable: "study_status", type: "categorical", label: "Journey stage: NOT_STARTED…COMPLETED" },
  { variable: "age_group", type: "categorical", label: "Self-reported age band" },
  { variable: "program", type: "categorical", label: "Course: MBBS | BDS | B.Pharm | Pharm.D | B.Sc Nursing | Other" },
  { variable: "year_of_study", type: "categorical", label: "Year of study within the program" },
  { variable: "module", type: "categorical", label: "GENERAL_PHARMACOLOGY | ANS | CARDIOVASCULAR | ANTIMICROBIALS" },
  { variable: "selected_response", type: "string (A-D)", label: "Option selected by the participant" },
  { variable: "correct_response", type: "string (A-D)", label: "Correct option for the item" },
  { variable: "is_correct", type: "boolean", label: "Whether the response matched the key" },
  { variable: "session_percentage", type: "float 0-100", label: "Percent correct for the assessment session" },
  { variable: "q1..q10", type: "integer 1-5", label: "Raw SUS item responses (Brooke, 1996)" },
  { variable: "sus_score", type: "float 0-100", label: "Calculated System Usability Scale score" },
  { variable: "section", type: "categorical", label: "uMARS section: ENGAGEMENT…PERCEIVED_IMPACT" },
  { variable: "response", type: "integer 1-5", label: "uMARS / feedback item response" },
  { variable: "rating", type: "integer 1-4", label: "Expert CVI relevance rating" },
  { variable: "i_cvi", type: "float 0-1", label: "Item-level Content Validity Index" },
  { variable: "overall_satisfaction", type: "integer 1-5", label: "Overall satisfaction with PHAMORA" },
];

async function getDatasetRows(key: DatasetKey, excludePilot: boolean): Promise<Record<string, unknown>[]> {
  switch (key) {
    case "participants": {
      const rows = await prisma.participant.findMany({
        where: excludePilot ? { isPilot: false } : {},
        include: { profile: true, consent: true },
      });
      return rows.map((p) => ({
        participant_code: p.participantCode,
        study_status: p.studyStatus,
        academic_year: p.academicYear ?? "",
        age_group: p.profile?.ageGroup ?? "",
        gender: p.profile?.gender ?? "",
        program: p.profile?.program ?? "",
        year_of_study: p.profile?.mbbsYear ?? "",
        consent_version: p.consent?.consentVersion ?? "",
        consent_timestamp: p.consent?.consentTimestamp.toISOString() ?? "",
        created_at: p.createdAt.toISOString(),
      }));
    }
    case "pretest":
    case "posttest": {
      const type = key === "pretest" ? "PRETEST" : "POSTTEST";
      const sessions = await prisma.assessmentSession.findMany({
        where: { assessmentType: type, ...(excludePilot ? { isPilot: false } : {}) },
        include: { participant: true, responses: { include: { question: true } } },
      });
      const rows: Record<string, unknown>[] = [];
      for (const s of sessions) {
        for (const r of s.responses) {
          rows.push({
            participant_code: s.participant.participantCode,
            assessment_type: s.assessmentType,
            module: r.question.module,
            question_id: r.questionId,
            selected_response: r.selectedOption,
            correct_response: r.correctOption,
            is_correct: r.isCorrect,
            response_time_seconds: r.responseTimeSeconds ?? "",
            session_score: s.score,
            session_percentage: s.percentage,
          });
        }
      }
      return rows;
    }
    case "sus": {
      const rows = await prisma.susResponse.findMany({ include: { participant: true } });
      return rows
        .filter((r) => !excludePilot || !r.participant.isPilot)
        .map((r) => ({
          participant_code: r.participant.participantCode,
          q1: r.q1, q2: r.q2, q3: r.q3, q4: r.q4, q5: r.q5,
          q6: r.q6, q7: r.q7, q8: r.q8, q9: r.q9, q10: r.q10,
          sus_score: r.susScore,
        }));
    }
    case "appquality": {
      const rows = await prisma.appQualityResponse.findMany({ include: { participant: true } });
      return rows
        .filter((r) => !excludePilot || !r.participant.isPilot)
        .map((r) => ({
          participant_code: r.participant.participantCode,
          section: r.section,
          item_id: r.itemId,
          item_label: r.itemLabel,
          response: r.response,
        }));
    }
    case "feedback": {
      const rows = await prisma.feedback.findMany({ include: { participant: true } });
      return rows
        .filter((r) => !excludePilot || !r.participant.isPilot)
        .map((r) => ({
          participant_code: r.participant.participantCode,
          likes: r.likes ?? "",
          difficulties: r.difficulties ?? "",
          useful_feature: r.usefulFeature ?? "",
          improvement_feature: r.improvementFeature ?? "",
          suggested_feature: r.suggestedFeature ?? "",
          other_suggestions: r.otherSuggestions ?? "",
          overall_satisfaction: r.overallSatisfaction ?? "",
        }));
    }
    case "expertcvi": {
      const rows = await prisma.expertCviRating.findMany({
        include: { expert: true, contentItem: true },
      });
      return rows.map((r) => ({
        expert_code: r.expert.expertCode,
        content_item: r.contentItem.contentTitle,
        module: r.contentItem.module,
        rating: r.rating,
        comment: r.comment ?? "",
        submitted_at: r.submittedAt.toISOString(),
      }));
    }
    case "cvisummary": {
      const data = await getCviData();
      return data.table.map((t) => ({
        content_item: t.item,
        module: t.module,
        experts_completed: t.completed,
        i_cvi: t.icvi,
        status: t.status,
      }));
    }
    case "codebook":
      return CODEBOOK;
  }
}

export async function exportCsv(key: DatasetKey, excludePilot: boolean) {
  await requireAdmin();
  const rows = await getDatasetRows(key, excludePilot);
  return { filename: `phamora_${key}.csv`, content: toCsv(rows) };
}

export async function exportJson(keys: DatasetKey[], excludePilot: boolean) {
  await requireAdmin();
  if (keys.length === 1) {
    const rows = await getDatasetRows(keys[0], excludePilot);
    return { filename: `phamora_${keys[0]}.json`, content: JSON.stringify(rows, null, 2) };
  }
  const payload: Record<string, Record<string, unknown>[]> = {};
  for (const key of keys) {
    payload[key] = await getDatasetRows(key, excludePilot);
  }
  return { filename: "phamora_export.json", content: JSON.stringify(payload, null, 2) };
}

export async function exportXlsx(keys: DatasetKey[], excludePilot: boolean) {
  await requireAdmin();
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "PHAMORA Validation Portal";

  for (const key of keys) {
    const rows = await getDatasetRows(key, excludePilot);
    const sheet = workbook.addWorksheet(DATASET_LABELS[key].slice(0, 31));
    if (rows.length > 0) {
      sheet.columns = Object.keys(rows[0]).map((k) => ({ header: k, key: k, width: 20 }));
      sheet.addRows(rows);
      sheet.getRow(1).font = { bold: true };
    } else {
      sheet.addRow(["No data"]);
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return {
    filename: "phamora_export.xlsx",
    base64: Buffer.from(buffer).toString("base64"),
  };
}
