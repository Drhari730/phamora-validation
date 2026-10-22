"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { APP_QUALITY_SECTIONS } from "@/lib/instruments";
import { itemCvi, scaleCviAverage, scaleCviUniversalAgreement, cviStatus } from "@/lib/scoring";
import {
  aikenV,
  avg,
  cronbachAlpha,
  icc2,
  interpretAlpha,
  interpretIcc,
  interpretKappa,
  median,
  modifiedKappa,
  oneSampleT,
  pairedAnalysis,
  pearson,
  sd,
  sum,
} from "@/lib/stats";

const SUS_BENCHMARK = 68;
const OBJECTIVE_SECTIONS = ["engagement", "functionality", "aesthetics", "information"];

async function requireAdmin() {
  const session = await requireSession("ADMIN");
  if (!session) throw new Error("Not authenticated as admin.");
}

function round(v: number | null, dp = 3): number | null {
  return v === null || Number.isNaN(v) ? null : Math.round(v * 10 ** dp) / 10 ** dp;
}

export async function getAnalysisData() {
  await requireAdmin();

  const [participants, contentItems, questions] = await Promise.all([
    prisma.participant.findMany({
      where: { isPilot: false },
      include: {
        assessmentSessions: { include: { responses: true } },
        susResponse: true,
        appQualityResponses: true,
      },
    }),
    prisma.contentItem.findMany({
      where: { active: true },
      include: { ratings: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.question.findMany(),
  ]);
  const questionMap = new Map(questions.map((q) => [q.id, q]));

  // ---------------- Knowledge test (pre/post) ----------------
  const pairs = participants
    .map((p) => {
      const pre = p.assessmentSessions.find((s) => s.assessmentType === "PRETEST" && s.completedAt);
      const post = p.assessmentSessions.find((s) => s.assessmentType === "POSTTEST" && s.completedAt);
      return pre && post ? { pre: pre.percentage ?? 0, post: post.percentage ?? 0 } : null;
    })
    .filter((x): x is { pre: number; post: number } => x !== null);
  const paired = pairedAnalysis(
    pairs.map((x) => x.pre),
    pairs.map((x) => x.post)
  );

  function testReliability(type: "PRETEST" | "POSTTEST") {
    const sessions = participants
      .map((p) => p.assessmentSessions.find((s) => s.assessmentType === type && s.completedAt))
      .filter((s): s is NonNullable<typeof s> => Boolean(s));
    if (sessions.length === 0) return { n: 0, items: 0, alpha: null as number | null, itemStats: new Map<string, { difficulty: number; discrimination: number | null }>() };

    let common = new Set(sessions[0].responses.map((r) => r.questionId));
    for (const s of sessions) {
      const ids = new Set(s.responses.map((r) => r.questionId));
      common = new Set([...common].filter((id) => ids.has(id)));
    }
    const ids = [...common];
    const matrix = sessions.map((s) => {
      const byQ = new Map(s.responses.map((r) => [r.questionId, r.isCorrect ? 1 : 0]));
      return ids.map((id) => byQ.get(id) ?? 0);
    });

    const itemStats = new Map<string, { difficulty: number; discrimination: number | null }>();
    ids.forEach((id, j) => {
      const col = matrix.map((r) => r[j]);
      const rest = matrix.map((r) => sum(r) - r[j]);
      itemStats.set(id, { difficulty: sum(col) / col.length, discrimination: pearson(col, rest) });
    });

    return { n: sessions.length, items: ids.length, alpha: cronbachAlpha(matrix), itemStats };
  }

  const preRel = testReliability("PRETEST");
  const postRel = testReliability("POSTTEST");
  const allQuestionIds = new Set([...preRel.itemStats.keys(), ...postRel.itemStats.keys()]);
  const itemAnalysis = [...allQuestionIds].map((id) => {
    const q = questionMap.get(id);
    const a = preRel.itemStats.get(id);
    const b = postRel.itemStats.get(id);
    return {
      id,
      module: q?.module ?? "",
      text: q?.questionText ?? id,
      preDifficulty: round(a?.difficulty ?? null, 2),
      preDiscrimination: round(a?.discrimination ?? null, 2),
      postDifficulty: round(b?.difficulty ?? null, 2),
      postDiscrimination: round(b?.discrimination ?? null, 2),
    };
  });

  // ---------------- SUS ----------------
  const susRows = participants.map((p) => p.susResponse).filter((s): s is NonNullable<typeof s> => Boolean(s));
  const susScores = susRows.map((s) => s.susScore);
  const susMatrix = susRows.map((s) => {
    const raw = [s.q1, s.q2, s.q3, s.q4, s.q5, s.q6, s.q7, s.q8, s.q9, s.q10];
    return raw.map((v, i) => (i % 2 === 0 ? v - 1 : 5 - v));
  });
  const susAlpha = cronbachAlpha(susMatrix);
  const susVsBenchmark = oneSampleT(susScores, SUS_BENCHMARK);

  // ---------------- uMARS ----------------
  const umars = APP_QUALITY_SECTIONS.map((section) => {
    const itemIds = section.items.map((_, i) => `${section.key}_${i}`);
    const perParticipant = participants
      .map((p) => {
        const byId = new Map(p.appQualityResponses.map((r) => [r.itemId, r.response]));
        return itemIds.every((id) => byId.has(id)) ? itemIds.map((id) => byId.get(id)!) : null;
      })
      .filter((x): x is number[] => x !== null);
    const means = perParticipant.map((r) => sum(r) / r.length);
    return {
      key: section.key,
      title: section.title,
      items: section.items.length,
      n: perParticipant.length,
      mean: round(avg(means), 2),
      sd: round(sd(means), 2),
      alpha: round(cronbachAlpha(perParticipant)),
      alphaLabel: interpretAlpha(cronbachAlpha(perParticipant)),
      means,
      perParticipant,
    };
  });
  // Overall objective quality: mean of the four objective subscale means per participant.
  const objectiveMeans: number[] = [];
  for (let i = 0; i < participants.length; i++) {
    const p = participants[i];
    const byId = new Map(p.appQualityResponses.map((r) => [r.itemId, r.response]));
    const subs = APP_QUALITY_SECTIONS.filter((s) => OBJECTIVE_SECTIONS.includes(s.key)).map((s) => {
      const vals = s.items.map((_, j) => byId.get(`${s.key}_${j}`));
      return vals.every((v) => v !== undefined) ? sum(vals as number[]) / vals.length : null;
    });
    if (subs.every((x) => x !== null)) objectiveMeans.push(sum(subs as number[]) / subs.length);
  }

  // ---------------- Expert CVI ----------------
  const ratedItems = contentItems.filter((i) => i.ratings.length > 0);
  const expertIds = new Set(contentItems.flatMap((i) => i.ratings.map((r) => r.expertId)));
  const nExperts = expertIds.size;

  const cviTable = ratedItems.map((item) => {
    const ratings = item.ratings.map((r) => r.rating);
    const nRel = ratings.filter((r) => r >= 3).length;
    const icvi = itemCvi(ratings);
    const kappa = modifiedKappa(ratings.length, nRel);
    return {
      id: item.id,
      title: item.contentTitle,
      module: item.module,
      n: ratings.length,
      icvi: round(icvi, 2),
      kappa: round(kappa, 2),
      kappaLabel: interpretKappa(kappa),
      aikenV: round(aikenV(ratings), 2),
      status: cviStatus(icvi),
    };
  });
  const icvis = ratedItems.map((i) => itemCvi(i.ratings.map((r) => r.rating)));
  const kappas = cviTable.map((r) => r.kappa).filter((k): k is number => k !== null);
  const aikens = cviTable.map((r) => r.aikenV).filter((v): v is number => v !== null);

  // ICC on the experts who rated every active item.
  const itemCount = contentItems.length;
  const completeExperts = [...expertIds].filter(
    (eid) => contentItems.filter((i) => i.ratings.some((r) => r.expertId === eid)).length === itemCount
  );
  const iccMatrix =
    completeExperts.length >= 2 && itemCount >= 2
      ? contentItems.map((i) => completeExperts.map((eid) => i.ratings.find((r) => r.expertId === eid)!.rating))
      : null;
  const icc = iccMatrix ? icc2(iccMatrix) : null;

  return {
    generatedAt: new Date().toISOString(),
    studentsTotal: participants.length,
    knowledge: {
      pairedN: pairs.length,
      paired: paired && {
        ...paired,
        meanPre: round(paired.meanPre, 1),
        sdPre: round(paired.sdPre, 1),
        meanPost: round(paired.meanPost, 1),
        sdPost: round(paired.sdPost, 1),
        meanDiff: round(paired.meanDiff, 1),
        sdDiff: round(paired.sdDiff, 1),
        ciLow: round(paired.ciLow, 1),
        ciHigh: round(paired.ciHigh, 1),
        t: round(paired.t, 2),
        p: paired.p,
        dz: round(paired.dz, 2),
        dzCiLow: round(paired.dzCiLow, 2),
        dzCiHigh: round(paired.dzCiHigh, 2),
        wilcoxonP: paired.wilcoxonP,
        normalisedGain: round(paired.normalisedGain, 2),
      },
      reliability: [
        { label: "Pre-test", n: preRel.n, items: preRel.items, alpha: round(preRel.alpha), alphaLabel: interpretAlpha(preRel.alpha) },
        { label: "Post-test", n: postRel.n, items: postRel.items, alpha: round(postRel.alpha), alphaLabel: interpretAlpha(postRel.alpha) },
      ],
      itemAnalysis,
    },
    sus: {
      n: susScores.length,
      mean: round(avg(susScores), 1),
      sd: round(sd(susScores), 1),
      median: round(median(susScores), 1),
      min: susScores.length ? Math.min(...susScores) : null,
      max: susScores.length ? Math.max(...susScores) : null,
      aboveBenchmark: susScores.filter((s) => s > SUS_BENCHMARK).length,
      benchmark: SUS_BENCHMARK,
      alpha: round(susAlpha),
      alphaLabel: interpretAlpha(susAlpha),
      test: susVsBenchmark && {
        t: round(susVsBenchmark.t, 2),
        df: susVsBenchmark.df,
        p: susVsBenchmark.p,
        ciLow: round(susVsBenchmark.ciLow, 1),
        ciHigh: round(susVsBenchmark.ciHigh, 1),
      },
    },
    umars: {
      sections: umars.map(({ means: _m, perParticipant: _p, ...rest }) => rest),
      objectiveN: objectiveMeans.length,
      objectiveMean: round(avg(objectiveMeans), 2),
      objectiveSd: round(sd(objectiveMeans), 2),
    },
    cvi: {
      nExperts,
      nItems: itemCount,
      nRatedItems: ratedItems.length,
      sCviAve: round(scaleCviAverage(icvis), 2),
      sCviUa: round(scaleCviUniversalAgreement(icvis), 2),
      meanKappa: round(avg(kappas), 2),
      meanAikenV: round(avg(aikens), 2),
      completeExperts: completeExperts.length,
      icc: icc && {
        single: round(icc.single, 2),
        average: round(icc.average, 2),
        singleLabel: interpretIcc(icc.single),
        averageLabel: interpretIcc(icc.average),
      },
      table: cviTable,
    },
  };
}

export type AnalysisData = Awaited<ReturnType<typeof getAnalysisData>>;
