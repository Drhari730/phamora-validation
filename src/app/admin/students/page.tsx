import { getStudentsTable } from "../actions";
import { StudentsClient } from "./students-client";

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage() {
  const rows = await getStudentsTable();
  return <StudentsClient rows={rows} />;
}
