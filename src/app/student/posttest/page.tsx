import { KnowledgeTest } from "@/components/pharma/knowledge-test";
import { getAssessmentQuestions, submitAssessment } from "../actions";

export const dynamic = "force-dynamic";

export default async function PosttestPage() {
  const questions = await getAssessmentQuestions("POSTTEST");

  async function handleSubmit(
    answers: { questionId: string; selectedOption: string; flagged: boolean }[]
  ) {
    "use server";
    return submitAssessment("POSTTEST", answers);
  }

  return (
    <KnowledgeTest
      questions={questions}
      label="Post-Test · Rotated Knowledge Assessment"
      nextHref="/student/usability"
      submitLabel="Submit Post-Test"
      onSubmit={handleSubmit}
    />
  );
}
