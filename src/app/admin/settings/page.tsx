import { getStudySettings } from "../actions";
import { SettingsClient } from "./settings-client";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getStudySettings();

  return (
    <SettingsClient
      initial={{
        studyPeriodStart: settings?.studyPeriodStart?.toISOString().slice(0, 10) ?? "",
        studyPeriodEnd: settings?.studyPeriodEnd?.toISOString().slice(0, 10) ?? "",
        studyInstructions: settings?.studyInstructions ?? "",
        preTestOpen: settings?.preTestOpen ?? true,
        postTestOpen: settings?.postTestOpen ?? false,
        usabilityOpen: settings?.usabilityOpen ?? false,
        expertReviewOpen: settings?.expertReviewOpen ?? true,
        randomizeQuestionOrder: settings?.randomizeQuestionOrder ?? true,
        randomizeOptionOrder: settings?.randomizeOptionOrder ?? true,
        showSusScoreToStudent: settings?.showSusScoreToStudent ?? false,
        consentVersion: settings?.consentVersion ?? "v1.0",
        ethicsApprovalRef: settings?.ethicsApprovalRef ?? "",
      }}
    />
  );
}
