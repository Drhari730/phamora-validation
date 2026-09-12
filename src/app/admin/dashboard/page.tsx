import { getDashboardData, getModuleScoreTrend, getSusDistribution, getStudentsTable } from "../actions";
import { DashboardClient } from "./dashboard-client";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [{ summary, stats }, trend, susDist, students] = await Promise.all([
    getDashboardData(),
    getModuleScoreTrend(),
    getSusDistribution(),
    getStudentsTable(),
  ]);

  return (
    <DashboardClient
      summary={summary}
      stats={stats}
      trend={trend}
      susDist={susDist}
      recentStudents={students.slice(0, 8)}
    />
  );
}
