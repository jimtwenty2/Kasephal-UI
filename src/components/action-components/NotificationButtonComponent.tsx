"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BellIcon } from "@heroicons/react/24/outline";
import { Trash2 } from "lucide-react";
import {
  deleteAllNotificationsAction,
  deleteNotificationAction,
  getNotificationsAction,
  markAllNotificationsAsReadAction,
  markNotificationAsReadAction,
} from "@/action/notification.action";
import { getContractByIdService } from "@/action/contract.action";
import { getOrderChatRoomIdAction } from "@/action/order.action";
import { createNotificationSocket } from "@/lib/notification-socket";
import { getNotificationReferenceIcon } from "@/lib/notificationIcons";
import { pushToast } from "@/lib/toastStore";
import { NotificationItem } from "@/types/notifications";
import { useDismissibleDropdown } from "@/hooks/useDismissibleDropdown";

const NOTIFICATIONS_BATCH_SIZE = 5;
const toastedNotificationIds = new Set<string>();

type NotificationButtonComponentProps = {
  variant?: "main" | "admin";
};

// Maps a notification's referenceType to the correct route, using its referenceId.
// Only types with a confirmed [id] detail page are included.
// Anything not listed here falls back to /notifications.
const notificationRouteMap: Record<string, (referenceId: string, role?: string, item?: NotificationItem) => string> = {
  CROP_PRODUCT: (id) => `/listing-product/${id}`,
  CROP_DEMAND: (id) => `/listing-crop-demands/${id}`,
  OFFER: (id) => `/listing-crop-demands/${id}#farmer-offers`,
  DELIVERY: (id, role, item) => {
    if (isOrderDecisionNotification(item)) return `/order-history/${id}`;

    const normalizedRole = String(role ?? "").toLowerCase();
    const deliveryRole = normalizedRole === "farmer" ? "farmer" : "buyer";
    return `/delivery?role=${deliveryRole}&orderId=${id}`;
  },
  CONTRACT: (id, _role, item) =>
    isContractChatNotification(item)
      ? `/chat?chatRoomId=${id}`
      : `/digital-contract/${id}`,
  FOLLOWER: (id) => `/other-profile/${id}`,
  CHAT_ROOM: (id) => `/chat?chatRoomId=${id}`,
  IDENTITY_VERIFICATION: (id, role) => {
    const normalizedRole = String(role ?? "").toLowerCase();
    return normalizedRole === "admin"
      ? `/identity-verification?identityDocumentId=${id}`
      : "/own-profile";
  },
  PAYMENT: (id) => `/order-history/${id}`,
  REVIEW: (id) => `/review/${id}`,
  REPORT: (id) => `/report/${id}`,
};

function normalizedNotificationTitle(item?: NotificationItem) {
  return item?.title?.trim().toLowerCase() ?? "";
}

function isContractChatNotification(item?: NotificationItem) {
  const title = normalizedNotificationTitle(item);
  return [
    "contract accepted",
    "contract rejected",
    "contract order ready",
    "offer accepted",
    "offered accepted",
    "order accepted",
    "order created",
  ].includes(title);
}

function isOrderDecisionNotification(item?: NotificationItem) {
  const title = normalizedNotificationTitle(item);
  return title === "order accepted by farmer" || title === "order rejected by farmer";
}
function getNotificationRoute(item: NotificationItem, userRole?: string): string | null {
  if (!item.referenceType || !item.referenceId) return null;
  const buildPath = notificationRouteMap[item.referenceType.toUpperCase()];
  return buildPath ? buildPath(item.referenceId, userRole, item) : null;
}

async function getNotificationNavigationPath(
  item: NotificationItem,
  userRole?: string,
): Promise<string | null> {
  if (!item.referenceType || !item.referenceId) return null;

  if (
    item.referenceType.toUpperCase() === "CONTRACT" &&
    isContractChatNotification(item)
  ) {
    const contract = await getContractByIdService(item.referenceId).catch(
      () => null,
    );
    if (contract?.chatRoomId) {
      return `/chat?chatRoomId=${encodeURIComponent(contract.chatRoomId)}`;
    }

    const orderChatRoomId = await getOrderChatRoomIdAction(
      item.referenceId,
    ).catch(() => null);
    if (orderChatRoomId) {
      return `/chat?chatRoomId=${encodeURIComponent(orderChatRoomId)}`;
    }
  }

  return getNotificationRoute(item, userRole);
}

function NotificationSkeletonBlock({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-full bg-[#E8EEE9] ${className}`}
      aria-hidden="true"
    />
  );
}

function NotificationItemSkeleton() {
  return (
    <div className="flex min-h-21.5 items-start rounded-2xl border border-[#EEF2F6] bg-white px-3.5 py-3 shadow-sm">
      <NotificationSkeletonBlock className="mr-3 h-9 w-9 shrink-0 rounded-xl" />

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <NotificationSkeletonBlock className="h-4 w-2/3 rounded-md" />
          <NotificationSkeletonBlock className="h-2 w-2 shrink-0" />
        </div>
        <NotificationSkeletonBlock className="h-3 w-full rounded-md" />
        <NotificationSkeletonBlock className="h-3 w-5/6 rounded-md" />
        <NotificationSkeletonBlock className="h-3 w-24 rounded-md" />
      </div>

      <NotificationSkeletonBlock className="ml-3 h-7 w-7 shrink-0 rounded-lg" />
    </div>
  );
}

function NotificationListSkeleton() {
  return (
    <div
      className="space-y-3"
      aria-label="Loading notifications"
      role="status"
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <NotificationItemSkeleton key={index} />
      ))}
    </div>
  );
}

function toNotificationItem(value: unknown): NotificationItem | null {
  if (typeof value !== "object" || value === null) return null;

  const record = value as Record<string, unknown>;
  const notificationId =
    typeof record.notificationId === "string"
      ? record.notificationId
      : typeof record.id === "string"
        ? record.id
        : null;

  if (!notificationId) return null;

  const referenceType =
    typeof record.referenceType === "string" ? record.referenceType : null;
  const referenceId =
    typeof record.referenceId === "string" ? record.referenceId : null;

  return {
    notificationId,
    title:
      typeof record.title === "string"
        ? record.title
        : typeof record.notificationTitle === "string"
          ? record.notificationTitle
          : "New notification",
    content:
      typeof record.content === "string"
        ? record.content
        : typeof record.message === "string"
          ? record.message
          : typeof record.body === "string"
            ? record.body
            : "",
    referenceType,
    referenceId,
    isRead: Boolean(record.isRead ?? record.read),
    canRoute: Boolean(record.canRoute ?? (referenceType && referenceId)),
    createdAt:
      typeof record.createdAt === "string"
        ? record.createdAt
        : new Date().toISOString(),
  };
}

function normalizeNotificationPayload(
  payload: unknown,
  seen = new WeakSet<object>(),
): NotificationItem[] {
  if (payload == null) return [];
  if (Array.isArray(payload)) {
    return payload.flatMap((item) => normalizeNotificationPayload(item, seen));
  }

  const notification = toNotificationItem(payload);
  if (notification) return [notification];

  if (typeof payload !== "object") return [];
  if (seen.has(payload)) return [];
  seen.add(payload);

  const value = payload as Record<string, unknown>;
  const candidates = [
    value.payload,
    value.data,
    value.item,
    value.items,
    value.result,
    value.results,
    value.notification,
    value.notifications,
  ];

  return candidates.flatMap((candidate) =>
    normalizeNotificationPayload(candidate, seen),
  );
}

function showNotificationToast(
  notification: NotificationItem,
  onClick?: () => void | Promise<void>,
) {
  if (toastedNotificationIds.has(notification.notificationId)) return;

  toastedNotificationIds.add(notification.notificationId);

  pushToast({
    title: notification.title || "New notification",
    message: notification.content,
    referenceType: notification.referenceType,
    onClick,
    variant: "info",
    duration: 5200,
  });
}

function showNotificationActionError(message: string) {
  pushToast({
    title: "Notification action failed",
    message,
    variant: "error",
    duration: 5200,
  });
}

export default function NotificationButtonComponent({
  variant = "main",
}: NotificationButtonComponentProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const notificationIdsRef = useRef<Set<string>>(new Set());
  const handleNotificationClickRef = useRef<
    (item: NotificationItem) => void | Promise<void>
  >(() => undefined);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [remoteUnreadCount, setRemoteUnreadCount] = useState<number | null>(
    null,
  );
  const [isFetching, setIsFetching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [openingNotificationId, setOpeningNotificationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(NOTIFICATIONS_BATCH_SIZE);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    notificationIdsRef.current = new Set(
      notifications.map((notification) => notification.notificationId),
    );
  }, [notifications]);

  const loadNotifications = useCallback(
    async (size = NOTIFICATIONS_BATCH_SIZE) => {
      setError(null);
      setIsFetching(true);

      const result = await getNotificationsAction(1, size);

      setIsFetching(false);

      if (!result?.success) {
        setError(result?.message ?? "Failed to load notifications.");
        return;
      }

      const notificationList = normalizeNotificationPayload(
        result.payload?.items,
      );
      setNotifications(notificationList);
      setTotalElements(result.payload?.pagination?.totalElements ?? 0);
    },
    [],
  );

  useEffect(() => {
    if (!session?.user?.accessToken) return;

    const initialLoadTimer = window.setTimeout(() => {
      void loadNotifications();
    }, 0);

    const client = createNotificationSocket({
      token: session.user.accessToken,
      onNotification: (payload) => {
        const incomingNotifications = normalizeNotificationPayload(payload);
        if (!incomingNotifications.length) return;

        const knownIds = notificationIdsRef.current;
        const next = incomingNotifications.filter(
          (item) => !knownIds.has(item.notificationId),
        );

        if (!next.length) return;

        next.forEach((notification) => {
          knownIds.add(notification.notificationId);
          showNotificationToast(notification, () =>
            handleNotificationClickRef.current(notification),
          );
        });

        setTotalElements((currentTotal) => currentTotal + next.length);
        setNotifications((current) => {
          const currentIds = new Set(
            current.map((item) => item.notificationId),
          );
          const freshNotifications = next.filter(
            (item) => !currentIds.has(item.notificationId),
          );

          return [...freshNotifications, ...current];
        });
      },
      onUnreadCount: (count) => {
        setRemoteUnreadCount(count);
      },
    });

    if (!client) {
      window.clearTimeout(initialLoadTimer);
      return;
    }

    client.activate();

    return () => {
      window.clearTimeout(initialLoadTimer);
      client.deactivate();
    };
  }, [session?.user?.accessToken, loadNotifications]);

  const closeDropdown = useCallback(() => setIsOpen(false), []);

  useDismissibleDropdown({
    open: isOpen,
    containerRef,
    onClose: closeDropdown,
  });

  // Lock body scroll while the mobile sheet is open so the page behind
  // it doesn't scroll along with the notification list.
  useEffect(() => {
    if (!isOpen) return;

    const isMobileViewport = window.matchMedia("(max-width: 639px)").matches;
    if (!isMobileViewport) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const handleToggle = async () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);

    // Reset the view each time the dropdown opens
    if (nextOpen) {
      setVisibleCount(NOTIFICATIONS_BATCH_SIZE);
      await loadNotifications(NOTIFICATIONS_BATCH_SIZE);
    }
  };

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  );

  const displayUnreadCount = remoteUnreadCount ?? unreadCount;

  const filteredNotifications = useMemo(
    () =>
      activeTab === "unread"
        ? notifications.filter((notification) => !notification.isRead)
        : notifications,
    [activeTab, notifications],
  );

  const displayedNotifications = useMemo(
    () => filteredNotifications.slice(0, visibleCount),
    [filteredNotifications, visibleCount],
  );

  const shouldShowSeeMore =
    !isFetching &&
    !error &&
    displayedNotifications.length > 0 &&
    (activeTab === "unread"
      ? Math.max(displayUnreadCount, filteredNotifications.length) >
        displayedNotifications.length
      : Math.max(totalElements, filteredNotifications.length) >
        displayedNotifications.length);

  const handleShowMoreNotifications = async () => {
    if (!shouldShowSeeMore) return;

    const nextVisibleCount = visibleCount + NOTIFICATIONS_BATCH_SIZE;
    setVisibleCount(nextVisibleCount);

    setError(null);
    setIsFetching(true);

    const result = await getNotificationsAction(1, nextVisibleCount);

    setIsFetching(false);

    if (!result?.success) {
      setVisibleCount(visibleCount);
      setError(result?.message ?? "Failed to load notifications.");
      return;
    }

    const notificationList = normalizeNotificationPayload(
      result.payload?.items,
    );
    setNotifications(notificationList);
    setTotalElements(result.payload?.pagination?.totalElements ?? 0);
  };

  const handleMarkAsRead = useCallback(async (notificationId: string) => {
    const prevNotifications = notifications;
    setNotifications((current) =>
      current.map((notification) =>
        notification.notificationId === notificationId
          ? { ...notification, isRead: true }
          : notification,
      ),
    );

    const result = await markNotificationAsReadAction(notificationId);
    if (!result.success) {
      setNotifications(prevNotifications);
      showNotificationActionError(
        result.message ?? "Failed to mark notification as read.",
      );
      return;
    }

    setRemoteUnreadCount((current) =>
      current == null ? null : Math.max(current - 1, 0),
    );
  }, [notifications]);

  const handleMarkAllAsRead = async () => {
    if (displayUnreadCount === 0) return;

    setIsProcessing(true);
    const result = await markAllNotificationsAsReadAction();
    setIsProcessing(false);

    if (!result.success) {
      showNotificationActionError(
        result.message ?? "Failed to mark all notifications as read.",
      );
      return;
    }

    setNotifications((current) =>
      current.map((notification) => ({ ...notification, isRead: true })),
    );
    setRemoteUnreadCount(0);
  };

  const handleDeleteNotification = async (notificationId: string) => {
    const deletedItem = notifications.find(
      (notification) => notification.notificationId === notificationId,
    );
    const prevNotifications = notifications;
    setNotifications((current) =>
      current.filter(
        (notification) => notification.notificationId !== notificationId,
      ),
    );

    const result = await deleteNotificationAction(notificationId);
    if (!result.success) {
      setNotifications(prevNotifications);
      showNotificationActionError(
        result.message ?? "Failed to delete notification.",
      );
      return;
    }

    setTotalElements((currentTotal) => Math.max(currentTotal - 1, 0));

    if (deletedItem && !deletedItem.isRead) {
      setRemoteUnreadCount((current) =>
        current == null ? null : Math.max(current - 1, 0),
      );
    }
  };

  const handleDeleteAll = async () => {
    if (notifications.length === 0) return;

    setIsProcessing(true);
    const result = await deleteAllNotificationsAction();
    setIsProcessing(false);

    if (!result.success) {
      showNotificationActionError("Failed to delete all notifications.");
      await loadNotifications();
      return;
    }

    setNotifications([]);
    setRemoteUnreadCount(0);
    setTotalElements(0);
  };

  const buttonClass =
    variant === "admin"
      ? "relative flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-[#3A3A3A] transition hover:bg-stone-200"
      : "relative flex w-10 h-10 items-center justify-center rounded-xl bg-white/90 transition hover:bg-white";

  const bellClass =
    variant === "admin"
      ? "h-6 w-6 stroke-[2.3] text-[#3A3A3A]"
      : "h-6 w-6 stroke-[2.3] text-[#3A3A3A]";

  const badgeClass =
    variant === "admin"
      ? "absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold leading-none text-white"
      : "absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white";

  const handleNotificationClick = useCallback(async (item: NotificationItem) => {
    if (!item) return;
    if (openingNotificationId) return;

    setOpeningNotificationId(item.notificationId);

    if (!item.isRead) {
      await handleMarkAsRead(item.notificationId);
    }

    setOpeningNotificationId(null);

    // Not routable — just mark as read, keep dropdown open so the user sees
    // the unread indicator disappear.
    if (!item.canRoute) return;

    const path = await getNotificationNavigationPath(
      item,
      session?.user?.role ?? undefined,
    );

    // No matching route for this type — same as above, stay open.
    if (!path) return;

    // We're navigating away — close the dropdown now.
    setIsOpen(false);
    router.push(path);
  }, [handleMarkAsRead, openingNotificationId, router, session?.user?.role]);

  useEffect(() => {
    handleNotificationClickRef.current = handleNotificationClick;
  }, [handleNotificationClick]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Notifications"
        className={buttonClass}
      >
        <BellIcon className={bellClass} aria-hidden="true" />
        {displayUnreadCount > 0 && (
          <span className={badgeClass}>
            {variant === "admin" && displayUnreadCount > 9
              ? "9+"
              : displayUnreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Mobile-only backdrop, closes the sheet on tap outside */}
          <div
            className="fixed inset-0 z-80 bg-black/30 sm:hidden"
            onClick={closeDropdown}
            aria-hidden="true"
          />

          <div
            className="
              fixed inset-x-3 top-20 z-90 flex h-[75vh] max-h-[calc(100vh-6rem)]
              w-auto flex-col overflow-hidden rounded-3xl border border-[#EEF2F6]
              bg-white shadow-2xl
              sm:absolute sm:inset-x-auto sm:top-12 sm:right-0 sm:h-130
              sm:max-h-[calc(100vh-4rem)] sm:w-104 sm:max-w-[calc(100vw-1rem)]
            "
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-[#EEF2F6] px-4 py-3.5 sm:px-5 sm:py-4">
                <h1 className="text-[18px] font-bold text-primary-heading sm:text-[20px]">
                  Notifications
                </h1>
                <div className="flex items-center gap-2">
                  {activeTab === "unread" && displayUnreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      disabled={isProcessing}
                      title="Mark all as read"
                      className="flex h-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 text-[12px] font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40 sm:px-3 sm:text-[13px]"
                    >
                      Mark as read
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleDeleteAll}
                    disabled={notifications.length === 0 || isProcessing}
                    title="Delete all"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  {/* Mobile-only close button */}
                  <button
                    type="button"
                    onClick={closeDropdown}
                    aria-label="Close notifications"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 sm:hidden"
                  >
                    <span className="text-lg leading-none">&times;</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 px-4 py-3 sm:px-5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("all");
                    setVisibleCount(NOTIFICATIONS_BATCH_SIZE);
                  }}
                  className={`flex h-10 items-center justify-center gap-2 rounded-xl border text-[13px] font-semibold transition ${
                    activeTab === "all"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-light-grey text-muted hover:bg-gray-50"
                  }`}
                >
                  All
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("unread");
                    setVisibleCount(NOTIFICATIONS_BATCH_SIZE);
                  }}
                  className={`flex h-10 items-center justify-center gap-2 rounded-xl border text-[13px] font-semibold transition ${
                    activeTab === "unread"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-light-grey text-muted hover:bg-gray-50"
                  }`}
                >
                  Unread
                  {displayUnreadCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[10px] text-white">
                      {displayUnreadCount}
                    </span>
                  )}
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-gutter-stable">
                <div className="min-h-full pl-4 pr-1 pb-5 sm:pl-5">
                  {isFetching && <NotificationListSkeleton />}

                  {error && !isFetching && (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <BellIcon className="h-10 w-10 text-red-300" />
                      <p className="mt-3 text-[14px] font-semibold text-red-500">
                        {error}
                      </p>
                    </div>
                  )}

                  {!isFetching &&
                    !error &&
                    filteredNotifications.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <BellIcon className="h-10 w-10 text-gray-300" />
                        <p className="mt-3 text-[14px] font-semibold text-gray-400">
                          {activeTab === "unread"
                            ? "No unread notifications"
                            : "No notifications"}
                        </p>
                      </div>
                    )}

                  <div className="space-y-3">
                    {!isFetching &&
                      !error &&
                      displayedNotifications.map((item) => {
                        const ReferenceIcon = getNotificationReferenceIcon(
                          item.referenceType,
                        );
                        const isOpening =
                          openingNotificationId === item.notificationId;

                        return (
                          <div
                            key={item.notificationId}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleNotificationClick(item)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                handleNotificationClick(item);
                              }
                            }}
                            aria-busy={isOpening}
                            className={`relative flex min-h-21.5 max-h-33 cursor-pointer items-start overflow-hidden rounded-2xl border border-[#EEF2F6] bg-white px-3 py-3 shadow-sm transition hover:border-primary/40 hover:bg-primary/5 sm:px-3.5 ${
                              openingNotificationId
                                ? isOpening
                                  ? "border-primary/40 bg-primary/5"
                                  : "pointer-events-none opacity-60"
                                : ""
                            }`}
                          >
                            {isOpening && (
                              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                              </div>
                            )}

                            {!item.isRead && (
                              <div className="absolute left-0 top-0 h-full w-1.25 rounded-l-[18px] bg-primary" />
                            )}

                            <div className="mr-2.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 sm:mr-3">
                              <ReferenceIcon
                                className="h-4.5 w-4.5 text-primary"
                                strokeWidth={2.2}
                              />
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                              <div className="min-h-0">
                                <div className="flex min-w-0 items-center gap-2">
                                  <h2 className="min-w-0 truncate text-[14px] font-semibold leading-tight text-primary-heading sm:text-[15px]">
                                    {item.title}
                                  </h2>
                                  {!item.isRead && (
                                    <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                                  )}
                                </div>
                                <p className="mt-1 line-clamp-3 wrap-break-word text-[12.5px] font-medium leading-4.5 text-description-text sm:text-[13px]">
                                  {item.content}
                                </p>
                              </div>
                              <p className="mt-1.5 text-[11px] text-muted">
                                {new Date(item.createdAt).toLocaleString()}
                              </p>
                            </div>

                            <div className="ml-2 flex flex-col gap-1.5 shrink-0 sm:ml-3">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleDeleteNotification(item.notificationId);
                                }}
                                disabled={isProcessing}
                                title="Delete"
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {shouldShowSeeMore && (
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={handleShowMoreNotifications}
                        className="w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-primary transition hover:bg-gray-50"
                      >
                        Show more notifications
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}