import React from "react";
import type { ReactNode } from "react";
import Filter from "./Filter";
import UsersTable from "../user-management/UsersTable";
import VerifyTable from "../identity-verification/VerifyTable";
import PolicyTable from "../policy-management/_components/PolicyTable";
import Pagination from "./Pagination";
import { User, Tab } from "../../../types/adminType";
import { Policy } from "../../../types/admin/policy";
import { IdentityVerification } from "@/services/admin/identityVerification.service";

interface TableSectionProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  users?: User[];
  verifications?: IdentityVerification[];
  policies?: Policy[];
  onViewDetail: (userId: string) => void;
  onReview?: (userId: string) => void;
  onPublish?: (policyId: string) => void;
  buttonLabel?: string;
  buttonIcon?: ReactNode;
  onButtonClick?: () => void;
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  searchPlacement?: "below" | "right";
}

const TableSection: React.FC<TableSectionProps> = ({
  tabs,
  activeTab,
  onTabChange,
  users,
  verifications,
  policies,
  onViewDetail,
  onReview,
  onPublish,
  buttonLabel,
  buttonIcon,
  onButtonClick,
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  searchQuery,
  onSearchChange,
  searchPlacement,
}) => {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
      <div className="mb-6">
        <Filter
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={onTabChange}
          buttonLabel={buttonLabel}
          buttonIcon={buttonIcon}
          onButtonClick={onButtonClick}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          searchPlacement={searchPlacement}
        />
      </div>

      {policies ? (
        <PolicyTable
          policies={policies}
          onReview={onReview ?? (() => {})}
          onPublish={onPublish ?? (() => {})}
        />
      ) : verifications ? (
        <VerifyTable
          verifications={verifications}
          onReview={onReview ?? (() => {})}
        />
      ) : (
        <UsersTable users={users ?? []} onViewDetail={onViewDetail} />
      )}

      <div className="mt-6">
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
};

export default TableSection;
