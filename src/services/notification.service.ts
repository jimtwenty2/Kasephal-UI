import headerToken from "@/lib/headerToken";
import { ApiResponse } from "@/types/api-response";
import {
  GetNotificationsResult,
} from "@/types/notifications";

export async function getNotificationsService(
  page: number = 1,
  size: number = 10,
): Promise<GetNotificationsResult> {
  const headers = await headerToken();

  const res = await fetch(
    `${process.env.NEXT_BASE_API_URL}/notifications?page=${page}&size=${size}`,
    {
      method: "GET",
      headers,
      cache: "no-store",
    },
  );

  if (!res.ok) throw new Error("Failed to fetch notifications");

  return (await res.json()) as GetNotificationsResult;
}

export async function getUnreadNotificationCountService() {
  const headers = await headerToken();

  const res = await fetch(
    `${process.env.NEXT_BASE_API_URL}/notifications/unread-count`,
    {
      method: "GET",
      headers,
      cache: "no-store",
    },
  );

  if (!res.ok) throw new Error("Failed to fetch unread count");

  return (await res.json()) as ApiResponse<number>;
}

export async function markNotificationAsReadService(notificationId: string) {
  const headers = await headerToken();

  const res = await fetch(
    `${process.env.NEXT_BASE_API_URL}/notifications/${notificationId}/read`,
    {
      method: "PATCH",
      headers,
      cache: "no-store",
    },
  );

  if (!res.ok) throw new Error("Failed to mark notification as read");
}

export async function markAllNotificationsAsReadService() {
  const headers = await headerToken();

  const res = await fetch(
    `${process.env.NEXT_BASE_API_URL}/notifications/read-all`,
    {
      method: "PATCH",
      headers,
      cache: "no-store",
    },
  );

  if (!res.ok) throw new Error("Failed to mark all notifications as read");
}

export async function deleteNotificationService(notificationId: string) {
  const headers = await headerToken();

  const res = await fetch(
    `${process.env.NEXT_BASE_API_URL}/notifications/${notificationId}`,
    {
      method: "DELETE",
      headers,
      cache: "no-store",
    },
  );

  if (!res.ok) throw new Error("Failed to delete notification");
}

export async function deleteAllNotificationsService() {
  const headers = await headerToken();

  const res = await fetch(
    `${process.env.NEXT_BASE_API_URL}/notifications/delete-all`,
    {
      method: "DELETE",
      headers,
      cache: "no-store",
    },
  );

  if (!res.ok) throw new Error("Failed to delete all notifications");
}
