"use client";

import { useState, useTransition } from "react";

import StatsCard from "../_components/StatsCard";
import TableSection from "../_components/TableSection";
import UserDetailModal from "./UserDetailModal";
import ChangeGovernmentPwModal from "../identity-verification/ChangeGovermentPwModal";
import { LayoutGrid, Tractor, Store, Contact, KeyRound, Loader2 } from "lucide-react";
import type { User, Tab } from "../../../types/adminType";
import {
  getAllTheUsers,
  getUserByIdAction,
  getUsersByRoleAction,
  updateUserStatusAction,
} from "@/action/admin/usermanagement.action";
import { toAdminUser, toApiUserStatus } from "@/lib/adminUserAdapter";
import { showApiSuccess } from "@/lib/apiToast";

type UpdateStatusPayload = {
  userId: string;
  status: User["status"];
  reason: string;
};
type StatCardData = {
  title: string;
  count: number;
  badgeText: string;
  badgeType?: "info" | "warning" | "banned";
};

function getStatusToastMessage(userName: string, status: string) {
  switch (status) {
    case "Active":
      return `${userName}'s account has been reactivated. They can access the platform again.`;
    case "Suspended":
      return `${userName}'s account has been suspended. Their access is now restricted.`;
    case "Banned":
      return `${userName}'s account has been banned. They can no longer access the platform.`;
    default:
      return `${userName}'s account status has been updated to ${status}.`;
  }
}

interface UserManagementClientProps {
  users: User[];
  stats: StatCardData[];
  initialTotalItems: number;
  initialPage: number;
  itemsPerPage: number;
  initialError?: string;
}

export default function UserManagementClient({
  users: initialUsers,
  stats,
  initialTotalItems,
  initialPage,
  itemsPerPage,
  initialError,
}: UserManagementClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [totalItems, setTotalItems] = useState(initialTotalItems);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [error, setError] = useState(initialError);
  const [isPending, startTransition] = useTransition();

  const tabs: Tab[] = [
    { id: "all", label: "All Users", icon: <LayoutGrid size={18} /> },
    { id: "farmer", label: "Farmers", icon: <Tractor size={18} /> },
    { id: "buyer", label: "Buyers", icon: <Store size={18} /> },
    { id: "government", label: "Government", icon: <Contact size={18} /> },
  ];

  const fetchUsers = (tabId: string, page: number) => {
    startTransition(() => {
      void (async () => {
        const params = { page, size: itemsPerPage };
        const result =
          tabId === "all"
            ? await getAllTheUsers(params)
            : await getUsersByRoleAction(
                tabId as "farmer" | "buyer" | "government",
                params,
              );

        setUsers(result.data.users.map(toAdminUser));
        setTotalItems(result.data.totalItems);
        setCurrentPage(result.data.page);
        setError(result.error);
      })();
    });
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    fetchUsers(tabId, 1);
  };

  const handlePageChange = (page: number) => {
    fetchUsers(activeTab, page);
  };

  const handleViewDetail = (userId: string) => {
    setSelectedUser(users.find((item) => item.user_id === userId) ?? null);

    startTransition(() => {
      void (async () => {
        const result = await getUserByIdAction(userId);
        if (result.success && result.data) {
          setSelectedUser(toAdminUser(result.data));
        }
      })();
    });
  };

  const handleUpdateStatus = ({
    userId,
    status,
    reason,
  }: UpdateStatusPayload) => {
    startTransition(() => {
      void (async () => {
        const result = await updateUserStatusAction({
          userId,
          status: toApiUserStatus(status),
          reason,
        });

        if (!result.success) {
          setError(result.error);
          return;
        }

        const updatedUser = result.data ? toAdminUser(result.data) : null;
        const nextStatus = updatedUser?.status ?? status;
        const userName =
          updatedUser?.name ??
          users.find((user) => user.user_id === userId)?.name ??
          "User";

        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.user_id === userId
              ? { ...user, ...(updatedUser ?? {}), status: nextStatus }
              : user,
          ),
        );

        setSelectedUser((prevUser) =>
          prevUser?.user_id === userId
            ? { ...prevUser, ...(updatedUser ?? {}), status: nextStatus }
            : prevUser,
        );
        setError(result.error);
        showApiSuccess(
          "User status updated",
          getStatusToastMessage(userName, nextStatus),
        );
      })();
    });
  };

  return (
    <div className="min-h-screen p-8">
      <div className="mb-8 flex flex-wrap gap-4">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="relative">
        <div
          className={`transition-opacity duration-200 ${
            isPending ? "pointer-events-none opacity-50" : "opacity-100"
          }`}
        >
          <TableSection
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            users={users}
            onViewDetail={handleViewDetail}
            buttonLabel="Set New Password for Government"
            buttonIcon={<KeyRound size={16} />}
            onButtonClick={() => setIsPasswordModalOpen(true)}
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </div>

        {isPending && (
          <div className="absolute inset-0 flex items-start justify-center pt-24">
            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-description-text shadow-md">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Loading...
            </div>
          </div>
        )}
      </div>

      {error && !isPending && (
        <p className="mt-4 text-sm text-red-500">{error}</p>
      )}

      <UserDetailModal
        isOpen={!!selectedUser}
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onUpdateStatus={handleUpdateStatus}
      />

      <ChangeGovernmentPwModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
}
