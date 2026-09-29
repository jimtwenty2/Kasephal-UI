import PolicyDashboard from "./_components/PolicyDashboard";
import { getPoliciesService } from "@/services/admin/policy.service";
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const policies = await getPoliciesService();
  return (
    <div className="p-8 min-h-screen">
      <PolicyDashboard initialPolicies={policies} />
    </div>
  );
}
