import { PrismaClient } from "@prisma/client";
import { hashSecret, generatePin, generateInviteToken } from "../src/lib/auth";
import { scoreSus } from "../src/lib/scoring";

const prisma = new PrismaClient();

const MODULES = ["GENERAL_PHARMACOLOGY", "ANS", "CARDIOVASCULAR", "ANTIMICROBIALS"] as const;

const QUESTION_BANK: {
  module: (typeof MODULES)[number];
  text: string;
  options: [string, string, string, string];
  correct: "A" | "B" | "C" | "D";
}[] = [
  {
    module: "GENERAL_PHARMACOLOGY",
    text: "A drug that binds to a receptor but produces no biological response, blocking the receptor from binding to an agonist, is best classified as a(n):",
    options: ["Partial agonist", "Competitive antagonist", "Inverse agonist", "Allosteric modulator"],
    correct: "B",
  },
  {
    module: "GENERAL_PHARMACOLOGY",
    text: "A drug with a narrow therapeutic index requires close monitoring primarily because:",
    options: ["It has a long half-life", "Its effective and toxic doses are close together", "It undergoes first-pass metabolism", "It is highly protein bound"],
    correct: "B",
  },
  {
    module: "GENERAL_PHARMACOLOGY",
    text: "First-order elimination kinetics means that:",
    options: ["A constant amount of drug is eliminated per unit time", "A constant fraction of drug is eliminated per unit time", "Elimination is independent of enzyme activity", "Half-life increases with dose"],
    correct: "B",
  },
  {
    module: "GENERAL_PHARMACOLOGY",
    text: "Bioavailability of an orally administered drug is primarily reduced by:",
    options: ["Renal clearance", "First-pass hepatic metabolism", "Plasma protein binding", "Volume of distribution"],
    correct: "B",
  },
  {
    module: "ANS",
    text: "Which receptor subtype mediates the bronchodilation produced by salbutamol?",
    options: ["Alpha-1 adrenergic", "Beta-1 adrenergic", "Beta-2 adrenergic", "Muscarinic M3"],
    correct: "C",
  },
  {
    module: "ANS",
    text: "Atropine is used to treat organophosphate poisoning primarily because it:",
    options: ["Reactivates acetylcholinesterase", "Blocks muscarinic receptors", "Blocks nicotinic receptors", "Inhibits acetylcholine synthesis"],
    correct: "B",
  },
  {
    module: "ANS",
    text: "Which of the following is a direct-acting cholinergic agonist used in glaucoma?",
    options: ["Pilocarpine", "Neostigmine", "Atropine", "Propranolol"],
    correct: "A",
  },
  {
    module: "ANS",
    text: "Phenylephrine produces mydriasis by acting on which receptor?",
    options: ["Alpha-1 adrenergic", "Alpha-2 adrenergic", "Beta-2 adrenergic", "Muscarinic M3"],
    correct: "A",
  },
  {
    module: "CARDIOVASCULAR",
    text: "Digoxin toxicity is most likely to be precipitated by which electrolyte disturbance?",
    options: ["Hyperkalemia", "Hypokalemia", "Hypercalcemia", "Hyponatremia"],
    correct: "B",
  },
  {
    module: "CARDIOVASCULAR",
    text: "Which class of antihypertensive is most likely to cause a dry, persistent cough as an adverse effect?",
    options: ["ACE inhibitors", "Calcium channel blockers", "Thiazide diuretics", "Beta-blockers"],
    correct: "A",
  },
  {
    module: "CARDIOVASCULAR",
    text: "Which drug is the first-line treatment for torsades de pointes?",
    options: ["Amiodarone", "Magnesium sulfate", "Lidocaine", "Verapamil"],
    correct: "B",
  },
  {
    module: "CARDIOVASCULAR",
    text: "Nitroglycerin relieves angina primarily by:",
    options: ["Increasing myocardial contractility", "Venodilation, reducing preload", "Increasing heart rate", "Coronary vasoconstriction"],
    correct: "B",
  },
  {
    module: "ANTIMICROBIALS",
    text: "Which mechanism best explains vancomycin's bactericidal activity against gram-positive organisms?",
    options: ["Inhibition of DNA gyrase", "Inhibition of cell-wall peptidoglycan synthesis", "Inhibition of 50S ribosomal subunit", "Disruption of folate synthesis"],
    correct: "B",
  },
  {
    module: "ANTIMICROBIALS",
    text: "A patient develops red-man syndrome shortly after an infusion. Which antibiotic is the most likely cause?",
    options: ["Ceftriaxone", "Vancomycin", "Azithromycin", "Ciprofloxacin"],
    correct: "B",
  },
  {
    module: "ANTIMICROBIALS",
    text: "Clavulanic acid is combined with amoxicillin primarily to:",
    options: ["Increase absorption", "Inhibit bacterial beta-lactamase", "Extend the half-life", "Reduce nephrotoxicity"],
    correct: "B",
  },
  {
    module: "ANTIMICROBIALS",
    text: "Which antibiotic class is contraindicated in children due to effects on cartilage development?",
    options: ["Macrolides", "Fluoroquinolones", "Penicillins", "Cephalosporins"],
    correct: "B",
  },
];

const CONTENT_ITEMS: {
  module: (typeof MODULES)[number];
  contentType: string;
  contentTitle: string;
  contentText: string;
}[] = [
  { module: "ANS", contentType: "lesson", contentTitle: "Adrenergic Agonists", contentText: "Covers direct-acting adrenergic agonists (adrenaline, noradrenaline, isoprenaline, dobutamine, salbutamol) with receptor-selectivity table and clinical use cases." },
  { module: "ANTIMICROBIALS", contentType: "mcq", contentTitle: "MCQ 14 — Beta-lactamase inhibitors", contentText: "Single-best-answer item testing recognition of clavulanic acid's mechanism when co-administered with amoxicillin." },
  { module: "CARDIOVASCULAR", contentType: "monograph", contentTitle: "Digoxin Monograph", contentText: "Mechanism, pharmacokinetics, therapeutic index, toxicity signs and management, and key drug interactions for digoxin." },
  { module: "ANS", contentType: "mcq", contentTitle: "ANS MCQ 14 — Cholinergic agonists", contentText: "Tests recognition of pilocarpine as a direct-acting cholinergic agonist used in glaucoma management." },
  { module: "ANTIMICROBIALS", contentType: "mcq", contentTitle: "Antibiotic Question 21", contentText: "Tests mechanism of vancomycin-associated red-man syndrome and its distinction from a true allergic reaction." },
  { module: "GENERAL_PHARMACOLOGY", contentType: "lesson", contentTitle: "General Pharmacokinetics Lesson", contentText: "First-order vs zero-order kinetics, bioavailability, first-pass metabolism, and clinical implications of narrow therapeutic index drugs." },
  { module: "CARDIOVASCULAR", contentType: "monograph", contentTitle: "Beta-blockers Monograph", contentText: "Cardioselectivity, mechanism in heart failure and hypertension, contraindications, and key adverse effects of beta-blockers." },
  { module: "GENERAL_PHARMACOLOGY", contentType: "case", contentTitle: "Case: Drug Interaction in Polypharmacy", contentText: "A clinical vignette exploring CYP450-mediated interactions in an elderly patient on multiple medications." },
  { module: "CARDIOVASCULAR", contentType: "mcq", contentTitle: "MCQ — Torsades de Pointes Management", contentText: "Tests first-line pharmacological management of torsades de pointes." },
  { module: "ANTIMICROBIALS", contentType: "monograph", contentTitle: "Fluoroquinolones Monograph", contentText: "Mechanism, spectrum, and the cartilage-toxicity contraindication in paediatric populations." },
];

const EXPERTS = [
  { discipline: "Pharmacology", designation: "Professor of Pharmacology" },
  { discipline: "Pharmacology", designation: "Associate Professor of Pharmacology" },
  { discipline: "Pharmacology", designation: "Assistant Professor of Pharmacology" },
  { discipline: "Clinical Pharmacology", designation: "Consultant Clinical Pharmacologist" },
  { discipline: "Medical Education", designation: "Professor of Medical Education" },
  { discipline: "Pharmacology", designation: "Professor of Pharmacology" },
  { discipline: "Internal Medicine", designation: "Professor of Internal Medicine" },
  { discipline: "Pharmacology", designation: "Associate Professor of Pharmacology" },
];

function randChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function likert(bias: number[] = [1, 2, 8, 24, 20]): number {
  // Weighted toward Agree/Strongly Agree by default, mirroring a well-received app.
  const pool: number[] = [];
  bias.forEach((weight, i) => {
    for (let w = 0; w < weight; w++) pool.push(i + 1);
  });
  return randChoice(pool);
}

async function main() {
  console.log("Seeding PHAMORA Validation Portal…");
  const seedDemoData = process.env.SEED_DEMO_DATA === "true";

  // --- Study settings ------------------------------------------------------
  await prisma.studySettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      consentVersion: "v1.0",
      consentBody: "Standard PHAMORA validation study consent.",
      studyPeriodStart: new Date("2026-08-18"),
      studyPeriodEnd: new Date("2026-09-25"),
      studyInstructions: "Explore all four modules at your own pace during the study window.",
      preTestOpen: true,
      postTestOpen: true,
      usabilityOpen: true,
      expertReviewOpen: true,
    },
  });

  // --- Admin account -----------------------------------------------------
  // In production, set ADMIN_EMAIL / ADMIN_PASSWORD so the real credential
  // never has to be the publicly-documented demo one. Without them, and
  // outside demo mode, a random password is generated and printed once.
  const adminEmail = process.env.ADMIN_EMAIL || "admin@phamora.study";
  const adminPassword =
    process.env.ADMIN_PASSWORD ||
    (seedDemoData ? "PhamoraAdmin@2026" : generateInviteToken().slice(0, 20));
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await hashSecret(adminPassword),
        role: "ADMIN",
      },
    });
    console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
    console.log("^ Record this now — it is not shown again.");
  } else {
    console.log(`Admin account ${adminEmail} already exists — leaving password unchanged.`);
  }

  // --- Question bank -----------------------------------------------------
  const existingQuestions = await prisma.question.count();
  let questionIds: string[] = [];
  if (existingQuestions === 0) {
    const created = await Promise.all(
      QUESTION_BANK.map((q) =>
        prisma.question.create({
          data: {
            module: q.module,
            questionText: q.text,
            optionA: q.options[0],
            optionB: q.options[1],
            optionC: q.options[2],
            optionD: q.options[3],
            correctOption: q.correct,
          },
        })
      )
    );
    questionIds = created.map((q) => q.id);
  } else {
    questionIds = (await prisma.question.findMany({ select: { id: true } })).map((q) => q.id);
  }

  // --- Content items (CVI) ------------------------------------------------
  if ((await prisma.contentItem.count()) === 0) {
    await prisma.contentItem.createMany({
      data: CONTENT_ITEMS.map((c) => ({
        module: c.module,
        contentType: c.contentType,
        contentTitle: c.contentTitle,
        contentText: c.contentText,
      })),
    });
  }
  const contentItems = await prisma.contentItem.findMany();

  // --- Experts (demo only — in production, invite real experts from
  // /admin/experts instead of seeding fake ones) --------------------------
  if (seedDemoData && (await prisma.expert.count()) === 0) {
    for (let i = 0; i < EXPERTS.length; i++) {
      const code = `PHA-EXP-${String(i + 1).padStart(2, "0")}`;
      const expert = await prisma.expert.create({
        data: {
          expertCode: code,
          inviteToken: generateInviteToken(),
          designation: EXPERTS[i].designation,
          speciality: EXPERTS[i].discipline,
          department: "Department of Pharmacology",
          yearsOfExperience: 8 + i,
          yearsOfTeachingExperience: 5 + i,
          profileCompletedAt: i < 6 ? new Date() : null,
        },
      });

      // First 6 experts have submitted full CVI panels; the rest are pending.
      if (i < 6) {
        for (const item of contentItems) {
          const rating = Math.random() < 0.85 ? randChoice([3, 4, 4, 4]) : randChoice([1, 2]);
          await prisma.expertCviRating.create({
            data: {
              expertId: expert.id,
              contentItemId: item.id,
              rating,
              comment: rating <= 2 ? "Consider revising for clarity and current guidelines." : null,
            },
          });
        }
      } else if (i === 6) {
        // partially complete panel
        for (const item of contentItems.slice(0, 4)) {
          await prisma.expertCviRating.create({
            data: {
              expertId: expert.id,
              contentItemId: item.id,
              rating: randChoice([3, 4]),
            },
          });
        }
      }
    }
  }

  // --- Demo participants (local/dev only — never seed fake participants
  // into a real study database) --------------------------------------------
  if (seedDemoData && (await prisma.participant.count()) === 0) {
    for (let i = 1; i <= 3; i++) {
      const code = `PHA-STU-${String(i).padStart(3, "0")}`;
      const pin = generatePin();
      const participant = await prisma.participant.create({
        data: {
          participantCode: code,
          pinHash: await hashSecret(pin),
          academicYear: randChoice(["2nd Year", "3rd Year", "Final Year"]),
          studyStatus: "COMPLETED",
        },
      });

      await prisma.consent.create({
        data: {
          participantId: participant.id,
          consentVersion: "v1.0",
          informationRead: true,
          voluntaryAgree: true,
        },
      });

      await prisma.baselineProfile.create({
        data: {
          participantId: participant.id,
          ageGroup: randChoice(["18–20", "21–23", "24–26"]),
          mbbsYear: randChoice(["2nd Year", "3rd Year", "Final Year"]),
          priorPharmacologyExposure: true,
          priorPharmacologyExam: randChoice([true, false]),
          priorAppUse: randChoice([true, false]),
          digitalToolUseFrequency: randChoice(["Daily", "A few times a week"]),
        },
      });

      // Pre-test: ~60% correct
      const preSession = await prisma.assessmentSession.create({
        data: {
          participantId: participant.id,
          assessmentType: "PRETEST",
          completedAt: new Date(),
          totalQuestions: questionIds.length,
        },
      });
      let preCorrect = 0;
      for (const qId of questionIds) {
        const q = await prisma.question.findUniqueOrThrow({ where: { id: qId } });
        const isCorrect = Math.random() < 0.6;
        if (isCorrect) preCorrect++;
        const selected = isCorrect
          ? q.correctOption
          : randChoice(["A", "B", "C", "D"].filter((o) => o !== q.correctOption));
        await prisma.assessmentResponse.create({
          data: {
            sessionId: preSession.id,
            questionId: qId,
            selectedOption: selected,
            correctOption: q.correctOption,
            isCorrect,
            answeredAt: new Date(),
            responseTimeSeconds: 20 + Math.floor(Math.random() * 40),
          },
        });
      }
      await prisma.assessmentSession.update({
        where: { id: preSession.id },
        data: { score: preCorrect, percentage: (preCorrect / questionIds.length) * 100 },
      });

      // Post-test: ~80% correct
      const postSession = await prisma.assessmentSession.create({
        data: {
          participantId: participant.id,
          assessmentType: "POSTTEST",
          completedAt: new Date(),
          totalQuestions: questionIds.length,
        },
      });
      let postCorrect = 0;
      for (const qId of questionIds) {
        const q = await prisma.question.findUniqueOrThrow({ where: { id: qId } });
        const isCorrect = Math.random() < 0.8;
        if (isCorrect) postCorrect++;
        const selected = isCorrect
          ? q.correctOption
          : randChoice(["A", "B", "C", "D"].filter((o) => o !== q.correctOption));
        await prisma.assessmentResponse.create({
          data: {
            sessionId: postSession.id,
            questionId: qId,
            selectedOption: selected,
            correctOption: q.correctOption,
            isCorrect,
            answeredAt: new Date(),
            responseTimeSeconds: 15 + Math.floor(Math.random() * 30),
          },
        });
      }
      await prisma.assessmentSession.update({
        where: { id: postSession.id },
        data: { score: postCorrect, percentage: (postCorrect / questionIds.length) * 100 },
      });

      // SUS
      const susItems = {
        q1: likert(), q2: likert([15, 15, 5, 3, 2]), q3: likert(),
        q4: likert([15, 15, 5, 3, 2]), q5: likert(), q6: likert([15, 15, 5, 3, 2]),
        q7: likert(), q8: likert([15, 15, 5, 3, 2]), q9: likert(), q10: likert([15, 15, 5, 3, 2]),
      };
      await prisma.susResponse.create({
        data: {
          participantId: participant.id,
          ...susItems,
          susScore: scoreSus(susItems),
        },
      });

      // App quality (26 items across 6 sections)
      const sections: { key: string; count: number }[] = [
        { key: "ENGAGEMENT", count: 5 },
        { key: "FUNCTIONALITY", count: 4 },
        { key: "AESTHETICS", count: 3 },
        { key: "INFORMATION_QUALITY", count: 4 },
        { key: "SUBJECTIVE_QUALITY", count: 4 },
        { key: "PERCEIVED_IMPACT", count: 6 },
      ];
      for (const section of sections) {
        for (let n = 0; n < section.count; n++) {
          await prisma.appQualityResponse.create({
            data: {
              participantId: participant.id,
              section: section.key,
              itemId: `${section.key.toLowerCase()}_${n}`,
              itemLabel: `${section.key} item ${n + 1}`,
              response: likert(),
            },
          });
        }
      }

      await prisma.feedback.create({
        data: {
          participantId: participant.id,
          likes: "The flashcards and spaced repetition were genuinely helpful.",
          difficulties: "A few images loaded slowly on an older phone.",
          usefulFeature: "Clinical case module",
          improvementFeature: "Search could be faster",
          suggestedFeature: "Dark mode",
          overallSatisfaction: randChoice([4, 5]),
        },
      });

      console.log(`Participant ${code} seeded (PIN: ${pin})`);
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
