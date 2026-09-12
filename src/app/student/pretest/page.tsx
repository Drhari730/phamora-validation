import { KnowledgeTest } from "@/components/pharma/knowledge-test";
import { getAssessmentQuestions, submitAssessment } from "../actions";

export const dynamic = "force-dynamic";

export default async function PretestPage() {
  const questions = await getAssessmentQuestions("PRETEST");

  async function handleSubmit(
    answers: { questionId: string; selectedOption: string; flagged: boolean }[]
  ) {
    "use server";
    return submitAssessment("PRETEST", answers);
  }

  return (
    <KnowledgeTest
      questions={questions}
      label="Pre-Test · Baseline Knowledge Assessment"
      nextHref="/student/study-period"
      submitLabel="Submit Pre-Test"
      onSubmit={handleSubmit}
    />
  );
}
