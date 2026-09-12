import { redirect } from "next/navigation";
import { getExpertReviewData } from "../actions";
import { ReviewClient } from "./review-client";

export const dynamic = "force-dynamic";

export default async function ExpertReviewPage() {
  const data = await getExpertReviewData();
  if (!data) redirect("/expert");

  return <ReviewClient data={data} />;
}
