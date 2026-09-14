import { getQuestions, getContentItemsList } from "../actions";
import { InstrumentsClient } from "./instruments-client";

export const dynamic = "force-dynamic";

export default async function AdminInstrumentsPage() {
  const [questions, contentItems] = await Promise.all([getQuestions(), getContentItemsList()]);
  return <InstrumentsClient initialQuestions={questions} contentItems={contentItems} />;
}
