"use server";

import {
  getFarmersAndBuyers,
  getUserById,
  getUserManagementStats,
  getUsers,
  getUsersByRole,
  getVerificationStats,
  updateUserStatus,
} from "@/services/admin/user_management.service";
import {
  PaginatedUsers,
  User,
  UserManagementStats,
  UserRoleFilter,
  UserStatus,
  VerificationStats,
} from "@/types/admin/userAll";
import { ActionResponse} from "@/utils/apiResponseAction";
import { revalidatePath } from "next/cache";

type GetUsersParams = {
  page: number;
  size: number;
};

const emptyUsersPage = (params: GetUsersParams): PaginatedUsers => ({
  users: [],
  totalItems: 0,
  page: params.page,
  size: params.size,
});

export async function getAllTheUsers(
  params: GetUsersParams,
): Promise<ActionResponse<PaginatedUsers>> {
  try {
    const users = await getUsers( params.page,params.size);
    return {
      success: true,
      data: users,
    };
  } catch (error) {
    return {
      success: false,
      data: emptyUsersPage(params),
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch users",
    };
  }
}

export async function getUsersByRoleAction(
  role: UserRoleFilter,
  params: GetUsersParams,
): Promise<ActionResponse<PaginatedUsers>> {
  try {
    const users = await getUsersByRole(role, params.page, params.size);

    return {
      success: true,
      data: users,
    };
  } catch (error) {
    return {
      success: false,
      data: emptyUsersPage(params),
      error:
        error instanceof Error
          ? error.message
          : `Failed to fetch ${role} users`,
    };
  }
}

export async function getFarmersAndBuyersAction(
  params: GetUsersParams,
): Promise<ActionResponse<PaginatedUsers>> {
  try {
    const users = await getFarmersAndBuyers(params.page, params.size);

    return {
      success: true,
      data: users,
    };
  } catch (error) {
    return {
      success: false,
      data: emptyUsersPage(params),
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch farmers and buyers",
    };
  }
}

export async function getUserByIdAction( userId: string): Promise<ActionResponse<User | null>> {
  try {
    const user = await getUserById(userId);

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch user",
    };
  }
}

export async function getUserManagementStatsAction(): Promise<
  ActionResponse<UserManagementStats | null>
> {
  try {
    return {
      success: true,
      data: await getUserManagementStats(),
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch user management statistics",
    };
  }
}

export async function getVerificationStatsAction(): Promise<
  ActionResponse<VerificationStats | null>
> {
  try {
    return {
      success: true,
      data: await getVerificationStats(),
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch identity verification statistics",
    };
  }
}

export async function updateUserStatusAction({
  userId,
  status,
  reason,
}: {
  userId: string;
  status: UserStatus;
  reason?: string;
}): Promise<ActionResponse<User | null>> {
  try {
    const user = await updateUserStatus(userId, status, reason);

    revalidatePath("/user-management");
    revalidatePath("/identity-verification");

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update user status",
    };
  }
}