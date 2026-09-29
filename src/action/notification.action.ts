"use server";

import { GetNotificationsResult } from "@/types/notifications";
import {
  deleteAllNotificationsService,
  deleteNotificationService,
  getNotificationsService,
  getUnreadNotificationCountService,
  markAllNotificationsAsReadService,
  markNotificationAsReadService,
} from "@/services/notification.service";

export async function getNotificationsAction(
  page: number,
  pageSize: number,
): Promise<GetNotificationsResult> {
  try {
    return await getNotificationsService(page, pageSize);
  } catch (error) {
    console.error("Get notifications failed:", error);

    return {
      success: false,
      message: "Failed to fetch notifications",
    };
  }
}

export async function getUnreadNotificationCountAction() {
  try {
    return await getUnreadNotificationCountService();
  } catch (error) {
    console.error("Get unread count failed:", error);

    return {
      success: false,
      message: "Failed to fetch unread count",
      payload: 0,
    };
  }
}

export async function markNotificationAsReadAction(notificationId: string) {
  try {
    await markNotificationAsReadService(notificationId);

    return {
      success: true,
      message: "Notification marked as read",
    };
  } catch (error) {
    console.error("Mark notification failed:", error);

    return {
      success: false,
      message: "Failed to mark notification as read",
    };
  }
}

export async function markAllNotificationsAsReadAction() {
  try {
    await markAllNotificationsAsReadService();

    return {
      success: true,
      message: "All notifications marked as read",
    };
  } catch (error) {
    console.error("Mark all notifications failed:", error);

    return {
      success: false,
      message: "Failed to mark all notifications as read",
    };
  }
}

export async function deleteNotificationAction(notificationId: string) {
  try {
    await deleteNotificationService(notificationId);

    return {
      success: true,
      message: "Notification deleted",
    };
  } catch (error) {
    console.error("Delete notification failed:", error);

    return {
      success: false,
      message: "Failed to delete notification",
    };
  }
}

export async function deleteAllNotificationsAction() {
  try {
    await deleteAllNotificationsService();

    return {
      success: true,
      message: "All notifications deleted",
    };
  } catch (error) {
    console.error("Delete all notifications failed:", error);

    return {
      success: false,
      message: "Failed to delete all notifications",
    };
  }
}
