import { prisma } from "@/lib/prisma";
import { ConsentForm } from "./consent-form";

export const dynamic = "force-dynamic";

export default async function ConsentPage() {
  const settings = await prisma.studySettings.findUnique({ where: { id: "singleton" } });
  return <ConsentForm ethicsRef={settings?.ethicsApprovalRef ?? null} />;
}
