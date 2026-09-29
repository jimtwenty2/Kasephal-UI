import UserManagementClient from "./UserManagement";
import {
  getAllTheUsers,
  getUserManagementStatsAction,
} from "@/action/admin/usermanagement.action";
import { toAdminUser } from "@/lib/adminUserAdapter";

export const dynamic = "force-dynamic";

const ITEMS_PER_PAGE = 8;

function formatTwoDecimals(value: number) {
  return value.toFixed(2);
}

function buildStats(stats: {
  activeBans: number;
  appealsPending: number;
  avgResponseTimeDays: number;
  monthlyGrowthPercentage: number;
  pendingUsers: number;
  totalUsers: number;
}) {
  return [
    {
      title: "Total Users",
      count: stats.totalUsers,
      badgeText: `${stats.monthlyGrowthPercentage >= 0 ? "+" : ""}${formatTwoDecimals(stats.monthlyGrowthPercentage)}% this month`,
      badgeType: "info" as const,
    },
    {
      title: "Pending Verification",
      count: stats.pendingUsers,
      badgeText: `Avg. response time: ${formatTwoDecimals(stats.avgResponseTimeDays)} days`,
      badgeType: "warning" as const,
    },
    {
      title: "Active Bans",
      count: stats.activeBans,
      badgeText: `${stats.appealsPending} appeals pending`,
      badgeType: "banned" as const,
    },
  ];
}

export default async function UserManagementPage() {
  const [usersResult, statsResult] = await Promise.all([
    getAllTheUsers({ page: 1, size: ITEMS_PER_PAGE }),
    getUserManagementStatsAction(),
  ]);

  return (
    <UserManagementClient
      users={usersResult.data.users.map(toAdminUser)}
      stats={buildStats(
        statsResult.data ?? {
          activeBans: 0,
          appealsPending: 0,
          avgResponseTimeDays: 0,
          monthlyGrowthPercentage: 0,
          pendingUsers: 0,
          totalBuyers: 0,
          totalFarmers: 0,
          totalUsers: usersResult.data.totalItems,
        },
      )}
      initialTotalItems={usersResult.data.totalItems}
      initialPage={usersResult.data.page}
      itemsPerPage={ITEMS_PER_PAGE}
      initialError={usersResult.error ?? statsResult.error}
    />
  );
}