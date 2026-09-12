import { getCviData } from "../actions";
import { CviClient } from "./cvi-client";

export const dynamic = "force-dynamic";

export default async function AdminCviPage() {
  const data = await getCviData();
  return <CviClient data={data} />;
}
