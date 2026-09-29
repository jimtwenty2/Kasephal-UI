"use client";
import React from "react";
import Table, { TableColumn } from "./../_components/Table";
import RoleStatus from "./../_components/RoleStatus";
import { User, VariantType } from "../../../types/adminType";
import AdminAvatar from "../_components/AdminAvatar";
interface UsersPageProps {
  users: User[];
  onViewDetail: (userId: string) => void;
}

const UsersPage: React.FC<UsersPageProps> = ({ users, onViewDetail }) => {
  const userColumns: TableColumn<User>[] = [
    {
      header: "No.",
      headerClassName: "w-[6%] px-2",
      cellClassName: "px-2",
      render: (_, idx) => (
        <span className="text-description-text font-medium">{idx + 1}</span>
      ),
    },
    {
      header: "Name & Profile",
      headerClassName: "w-[20%] px-2",
      cellClassName: "px-2",
      render: (user) => (
        <div className="flex items-center gap-3">
          <AdminAvatar src={user.profile} name={user.name} />
          <span
            className="text-primary-heading sub-title block min-w-0 max-w-[150px] truncate"
            title={user.name}
          >
            {user.name}
          </span>
        </div>
      ),
    },
    {
      header: "Email Address",
      headerClassName: "w-[23%] px-2",
      cellClassName: "px-2",
      render: (user) => (
        <span
          className="block max-w-[190px] truncate text-description-text"
          title={user.email}
        >
          {user.email}
        </span>
      ),
    },
    {
      header: "joined",
      headerClassName: "w-[15%] px-2",
      cellClassName: "px-2",
      render: (user) => (
        <span className="text-description-text">{user.regDate}</span>
      ),
    },
    {
      header: "Role",
      headerClassName: "w-[11%] px-2",
      cellClassName: "px-2",
      render: (user) => (
        <RoleStatus
          label={user.role}
          variant={user.role.toLowerCase() as VariantType}
        />
      ),
    },
    {
      header: "Status",
      headerClassName: "w-[10%] px-2",
      cellClassName: "px-2",
      render: (user) => (
        <RoleStatus
          label={user.status}
          variant={user.status.toLowerCase() as VariantType}
        />
      ),
    },
    {
      header: "Action",
      headerClassName: "w-[15%] px-2",
      cellClassName: "px-2",
      render: (user) => (
        <button
          onClick={() => onViewDetail(user.user_id)}
          className="cursor-pointer whitespace-nowrap rounded-full bg-primary px-3 py-1.5 text-white sub-title font-medium transition-colors hover:bg-[#09800F]"
        >
          View Detail
        </button>
      ),
    },
  ];

  return (
    <Table
      data={users}
      columns={userColumns}
      rowKeyField="user_id"
      wrapperClassName="overflow-hidden"
      tableClassName="w-full table-fixed text-left border-collapse"
    />
  );
};

export default UsersPage;
