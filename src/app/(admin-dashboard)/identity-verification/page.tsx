import IdentityDashboard from "./IdentityDashboard";
import {
  getIdentityVerificationsService,
  getVerificationStatsService,
} from "@/services/admin/identityVerification.service";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [{ items, pagination }, stats] = await Promise.all([
    getIdentityVerificationsService({ page: 1, size: 100 }),
    getVerificationStatsService(),
  ]);

  return (
    <div className="min-h-scree p-8">
      <IdentityDashboard
        initialItems={items}
        initialPagination={pagination}
        initialStats={stats}
      />
    </div>
  );
}
