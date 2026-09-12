import { ClientRedirect } from "@/components/pharma/client-redirect";
import { getExpertReviewData } from "../actions";
import { ReviewClient } from "./review-client";

export const dynamic = "force-dynamic";

export default async function ExpertReviewPage() {
  const data = await getExpertReviewData();
  if (!data) return <ClientRedirect to="/expert" />;

  return <ReviewClient data={data} />;
}
