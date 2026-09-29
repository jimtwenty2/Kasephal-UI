export interface NotificationItem {
  notificationId: string;
  title: string;
  content: string;
  referenceType?: string | null;
  referenceId?: string | null;
  isRead: boolean;
  canRoute: boolean;
  createdAt: string;
}

export interface PaginationInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface NotificationResponse {
  items: NotificationItem[];
  pagination: PaginationInfo;
}

export interface GetNotificationsResult {
  success: boolean;
  message?: string;
  payload?: NotificationResponse;
}