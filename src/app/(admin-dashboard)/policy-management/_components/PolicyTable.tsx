import React from "react";
import { Policy } from "@/types/admin/policy";
import { VariantType } from "../../../../types/adminType";
import { TableColumn } from "../../_components/Table";
import Table from "../../_components/Table";
import RoleStatus from "../../_components/RoleStatus";

interface PolicyTableProps {
  policies: Policy[];
  onReview: (policyId: string) => void;
  onPublish: (policyId: string) => void;
}

function formatPolicyDisplayId(id: string): string {
  const compactId = id.replace(/-/g, "");
  const suffix = compactId.slice(-4).toUpperCase();

  return `#POL-${suffix || "----"}`;
}

const PolicyTable: React.FC<PolicyTableProps> = ({
  policies,
  onReview,
  onPublish,
}) => {
  const columns: TableColumn<Policy>[] = [
    {
      header: "ID",
      render: (policy) => (
        <span className="text-m font-semibold text-muted">
          {formatPolicyDisplayId(policy.policyId)}
        </span>
      ),
    },
    {
      header: "Title",
      render: (policy) => (
        <div className="w-[440px] max-w-full">
          <div className="flex flex-col min-w-0">
            <span className="table-title font-semibold text-primary-heading truncate block">
              {policy.title}
            </span>
            <span className="text-description-text sub-title mt-0.5 line-clamp-2 overflow-hidden text-ellipsis whitespace-normal break-words">
              {policy.content}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Date",
      render: (policy) => (
        <span className="text-primary-heading text-m font-semibold">
          {policy.publishedAt
            ? new Date(policy.publishedAt).toLocaleDateString("en-CA")
            : "—"}
        </span>
      ),
    },
    {
      header: "Status",
      render: (policy) => (
        <RoleStatus
          label={policy.status}
          variant={policy.status.toLowerCase() as VariantType}
        />
      ),
    },
    {
      header: "Action",
      render: (policy) => (
        <div className="flex items-center gap-2">
          {/* Edit — only shown for DRAFT policies */}
          {policy.status === "DRAFT" && (
            <button
              onClick={() => onReview(policy.policyId)}
              className="bg-primary hover:bg-emerald-800 cursor-pointer text-white sub-title px-3 py-1.5 rounded-full transition-colors"
            >
              Edit
            </button>
          )}

          {/* Publish — only shown for DRAFT policies */}
          {policy.status === "DRAFT" && (
            <button
              onClick={() => onPublish(policy.policyId)}
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white sub-title px-3 py-1.5 rounded-full transition-colors"
            >
              Publish
            </button>
          )}
        </div>
      ),
    },
  ];

  return <Table data={policies} columns={columns} rowKeyField="policyId" />;
};

export default PolicyTable;
