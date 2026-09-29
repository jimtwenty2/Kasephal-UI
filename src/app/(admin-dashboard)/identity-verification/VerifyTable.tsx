// VerifyTable.tsx
"use client";

import React from "react";
import { VariantType } from "../../../types/adminType";
import type { IdentityVerification } from "@/services/admin/identityVerification.service";
import { TableColumn } from "../_components/Table";
import Table from "../_components/Table";
import RoleStatus from "../_components/RoleStatus";
import AdminAvatar from "../_components/AdminAvatar";

type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED";

const statusStyles: Record<
  VerificationStatus,
  { bg: string; text: string; dot: string }
> = {
  PENDING: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    dot: "bg-yellow-400",
  },
  APPROVED: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  REJECTED: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" },
};

function StatusBadge({ status }: { status: VerificationStatus }) {
  const styles = statusStyles[status] ?? statusStyles.PENDING;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles.bg} ${styles.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

// Normalize role to lowercase for RoleStatus variant
// e.g. "FARMER" -> "farmer", "BUYER" -> "buyer"
function normalizeRole(role: string): string {
  return role.toLowerCase();
}

// Capitalize first letter only for display label
// e.g. "FARMER" -> "Farmer"
function formatRoleLabel(role: string): string {
  if (!role) return "";
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

// Get contact info - prefer phone number over email
function getContactDisplay(email?: string, phoneNumber?: string): string {
  if (phoneNumber && phoneNumber.trim()) {
    return phoneNumber;
  }
  if (email && email.trim()) {
    return email;
  }
  return "N/A";
}

interface VerifyTableProps {
  verifications: IdentityVerification[];
  onReview: (userId: string) => void;
}

const VerifyTable: React.FC<VerifyTableProps> = ({
  verifications,
  onReview,
}) => {
  const columns: TableColumn<IdentityVerification>[] = [
    {
      header: "ID",
      headerClassName: "w-[12%] px-3",
      cellClassName: "px-3",
      render: (v) => (
        <span className="font-medium text-description-text">
          #USER-{v.user_id.slice(-4).toUpperCase()}
        </span>
      ),
    },
    {
      header: "User Profile",
      headerClassName: "w-[26%] px-3",
      cellClassName: "px-3",
      render: (v) => {
        const contactDisplay = getContactDisplay(v.email, v.phoneNumber);
        return (
          <div className="flex items-center gap-3">
            {/* Avatar only — no text rendered outside the flex-col below */}
            <AdminAvatar src={v.profile} name={v.name} />
            {/* Name + contact (phone or email) — rendered ONCE here only */}
            <div className="flex min-w-0 max-w-[150px] flex-col">
              <span
                className="sub-title block truncate font-medium text-primary-heading"
                title={v.name}
              >
                {v.name}
              </span>
              <span
                className="sub-title block truncate text-description-text"
                title={contactDisplay}
              >
                {contactDisplay}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Document",
      headerClassName: "w-[13%] px-3",
      cellClassName: "px-3",
      render: (v) => (
        <span className="text-description-text text-xs font-medium">
          {v.documentType === "ID_CARD" ? "ID Card" : "Passport"}
        </span>
      ),
    },
    {
      header: "Role",
      headerClassName: "w-[12%] px-3",
      cellClassName: "px-3",
      render: (v) => (
        <RoleStatus
          label={formatRoleLabel(v.role)}
          variant={normalizeRole(v.role) as VariantType}
        />
      ),
    },
    {
      header: "Status",
      headerClassName: "w-[13%] px-3",
      cellClassName: "px-3",
      render: (v) => <StatusBadge status={v.status as VerificationStatus} />,
    },
    {
      header: "Submitted",
      headerClassName: "w-[15%] px-3",
      cellClassName: "px-3",
      render: (v) => (
        <span className="text-description-text">{v.submissionDate}</span>
      ),
    },
    {
      header: "Action",
      headerClassName: "w-[9%] px-3",
      cellClassName: "px-3",
      render: (v) => (
        <button
          onClick={() => onReview(v.user_id)}
          className="cursor-pointer bg-primary hover:bg-emerald-800 text-white font-medium px-3 py-1.5 rounded-full transition-colors"
        >
          {v.status === "PENDING" ? "Review" : "View"}
        </button>
      ),
    },
  ];

  return (
    <Table
      data={verifications}
      columns={columns}
      rowKeyField="user_id"
      wrapperClassName="overflow-hidden"
      tableClassName="w-full table-fixed text-left border-collapse"
    />
  );
};

export default VerifyTable;
