import { prisma } from "@/lib/prisma";

/** Next sequential PHA-STU-### code, e.g. PHA-STU-001, PHA-STU-002 … */
export async function nextParticipantCode(): Promise<string> {
  const count = await prisma.participant.count();
  return `PHA-STU-${String(count + 1).padStart(3, "0")}`;
}

/** Next sequential PHA-EXP-## code. */
export async function nextExpertCode(): Promise<string> {
  const experts = await prisma.expert.findMany({ select: { expertCode: true } });
  const highest = experts.reduce((max, e) => {
    const n = parseInt(e.expertCode.replace("PHA-EXP-", ""), 10);
    return Number.isNaN(n) ? max : Math.max(max, n);
  }, 0);
  return `PHA-EXP-${String(highest + 1).padStart(2, "0")}`;
}
