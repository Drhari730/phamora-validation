import { headers } from "next/headers";
import { getExpertsTable } from "../actions";
import { ExpertsClient } from "./experts-client";

export const dynamic = "force-dynamic";

export default async function AdminExpertsPage() {
  const rows = await getExpertsTable();
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";

  return <ExpertsClient rows={rows} origin={`${protocol}://${host}`} />;
}
