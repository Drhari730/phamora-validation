import { getQuestions } from "../actions";
import { InstrumentsClient } from "./instruments-client";

export const dynamic = "force-dynamic";

export default async function AdminInstrumentsPage() {
  const questions = await getQuestions();
  return <InstrumentsClient initialQuestions={questions} />;
}
