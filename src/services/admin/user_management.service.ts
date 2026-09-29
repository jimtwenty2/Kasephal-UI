import "server-only";

import headerToken from "@/lib/headerToken";
import {
  PaginatedUsers,
  User,
  UserManagementStats,
  UserManagementStatsResponse,
  UserResponse,
  UserRoleFilter,
  UserStatus,
  UpdateUserStatusResponse,
  VerificationStats,
  VerificationStatsResponse,
  UsersResponse,
} from "@/types/admin/userAll";
import type { UserProfilePayload } from "@/types/user";


const ROLE_API_VALUES: Record<UserRoleFilter, string> = {
  farmer: "FARMER",
  buyer: "BUYER",
  government: "GOVERNMENT",
};

function mergeUserProfile(user: User, profile: UserProfilePayload | null): User {
  if (!profile) return user;

  return {
    ...user,
    email: user.email ?? profile.basicInfo?.email ?? null,
    phoneNumber: user.phoneNumber ?? profile.basicInfo?.phoneNumber ?? null,
    profileUrl: user.profileUrl ?? profile.basicInfo?.profileUrl ?? null,
    bio: user.bio ?? profile.basicInfo?.bio ?? null,
    personalInfo: {
      ...(user.personalInfo ?? {}),
      ...(profile.personalInfo ?? {}),
    },
  };
}

async function getProfileByUserId(userId: string): Promise<UserProfilePayload | null> {
  try {
    const headers = await headerToken();
    const res = await fetch(
      `${process.env.NEXT_BASE_API_URL}/profile/${userId}`,
      {
        headers,
        cache: "no-store",
      },
    );

    if (!res.ok) return null;

    const data = await res.json();
    return data.payload ?? null;
  } catch {
    return null;
  }
}

function getUsersFromPayload(data: UsersResponse): User[] {
  if (Array.isArray(data.payload)) return data.payload;

  return (
    data.payload.content ??
    data.payload.data ??
    data.payload.items ??
    data.payload.users ??
    []
  );
}

function getFallbackTotalItems(page: number, size: number, users: User[]) {
  const displayedItems = (page - 1) * size + users.length;

  return users.length === size ? displayedItems + 1 : displayedItems;
}

function getTotalItems(
  data: UsersResponse,
  users: User[],
  page: number,
  size: number,
) {
  if (!Array.isArray(data.payload)) {
    return (
      data.payload.pagination?.totalElements ??
      data.payload.pagination?.totalItems ??
      data.payload.totalElements ??
      data.payload.totalItems ??
      data.payload.total ??
      data.payload.count ??
      getFallbackTotalItems(page, size, users)
    );
  }

  return (
    data.totalElements ??
    data.totalItems ??
    data.total ??
    data.count ??
    getFallbackTotalItems(page, size, users)
  );
}

async function fetchUsers(
  endpoint: string,
  page: number = 1,
  size: number = 10,
): Promise<PaginatedUsers> {
  const headers = await headerToken();
  const url = new URL(`${process.env.NEXT_BASE_API_URL}${endpoint}`);

  url.searchParams.set("page", String(page));
  url.searchParams.set("size", String(size));

  const res = await fetch(url.toString(), {
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }

  const data: UsersResponse = await res.json();
  const users = getUsersFromPayload(data);

  return {
    users,
    totalItems: getTotalItems(data, users, page, size),
    page,
    size,
  };
}

export async function getUsers(
  page: number = 1,
  size: number = 10,
): Promise<PaginatedUsers> {
  return fetchUsers("/users", page, size);
}

export async function getUsersByRole(
  role: UserRoleFilter,
  page: number = 1,
  size: number = 10,
): Promise<PaginatedUsers> {
  return fetchUsers(
    `/users?role=${ROLE_API_VALUES[role]}`,
    page,
    size,
  );
}

export async function getFarmersAndBuyers(
  page: number = 1,
  size: number = 10,
): Promise<PaginatedUsers> {
  return fetchUsers("/users/farmers-and-buyers", page, size);
}

export async function getUserManagementStats(): Promise<UserManagementStats> {
  const headers = await headerToken();
  const res = await fetch(`${process.env.NEXT_BASE_API_URL}/users/stats`, {
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch user management statistics");
  }

  const data: UserManagementStatsResponse = await res.json();

  return data.payload;
}

export async function getVerificationStats(): Promise<VerificationStats> {
  const headers = await headerToken();
  const res = await fetch(
    `${process.env.NEXT_BASE_API_URL}/users/verification-stats`,
    {
      headers,
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch identity verification statistics");
  }

  const data: VerificationStatsResponse = await res.json();

  return data.payload;
}

export async function getUserById(userId: string): Promise<User> {
  const headers = await headerToken();

  const res = await fetch(
    `${process.env.NEXT_BASE_API_URL}/users/${userId}`,
    {
      headers,
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch user");
  }

  const data: UserResponse = await res.json();
  const profile = await getProfileByUserId(userId);

  return mergeUserProfile(data.payload, profile);
}

export async function updateUserStatus(
  userId: string,
  status: UserStatus,
  reason?: string,
): Promise<User | null> {
  const headers = await headerToken();

  const res = await fetch(
    `${process.env.NEXT_BASE_API_URL}/users/${userId}/status`,
    {
      method: "PATCH",
      headers,
      cache: "no-store",
      body: JSON.stringify({
        status,
        ...(reason ? { reason } : {}),
      }),
    },
  );

  if (!res.ok) {
    throw new Error("Failed to update user status");
  }

  const data: UpdateUserStatusResponse = await res.json();

  return data.payload ?? null;
}
