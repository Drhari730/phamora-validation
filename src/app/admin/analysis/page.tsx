import { getAnalysisData } from "./actions";
import { AnalysisClient } from "./analysis-client";

export const dynamic = "force-dynamic";

export default async function AdminAnalysisPage() {
  const data = await getAnalysisData();
  return <AnalysisClient data={data} />;
}
