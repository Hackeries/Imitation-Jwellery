import { getCommonHeaders } from "@/lib/api-utils";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "order" | "promo" | "system";
  isRead: boolean;
  createdAt: string;
  link?: string;
}

interface BackendNotification {
  _id: string;
  title: string;
  message?: string;
  body?: string;
  type?: string;
  isRead?: boolean;
  readAt?: string;
  createdAt: string;
  link?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8018";

const transformNotification = (n: BackendNotification): Notification => ({
  id: n._id,
  title: n.title,
  message: n.message || n.body || "",
  type: (n.type as Notification["type"]) || "system",
  isRead: n.isRead || !!n.readAt,
  createdAt: n.createdAt,
  link: n.link,
});

export const fetchNotifications = async (): Promise<Notification[]> => {
  const url = `${API_BASE_URL}/api/v1/notifications`;

  try {
    const response = await fetch(url, {
      credentials: "include",
      headers: getCommonHeaders(),
    });

    if (response.status === 401) {
      return [];
    }

    if (!response.ok) return [];

    const data = await response.json();
    const items: BackendNotification[] = data?.data?.items ?? data?.items ?? [];

    return items.map(transformNotification);
  } catch {
    return [];
  }
};

export const fetchNotificationById = async (
  notificationId: string
): Promise<Notification | null> => {
  const url = `${API_BASE_URL}/api/v1/notifications/${notificationId}`;

  try {
    const response = await fetch(url, {
      credentials: "include",
      headers: getCommonHeaders(),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const notification: BackendNotification | undefined =
      data?.data?.notification ?? data?.data ?? data?.notification;

    if (!notification) return null;

    return transformNotification(notification);
  } catch {
    return null;
  }
};

export const markNotificationRead = async (
  notificationId: string
): Promise<void> => {
  const url = `${API_BASE_URL}/api/v1/notifications/${notificationId}/read`;

  try {
    await fetch(url, {
      method: "PUT",
      credentials: "include",
      headers: getCommonHeaders(),
    });
  } catch {}
};

export const deleteNotification = async (
  notificationId: string
): Promise<void> => {
  const url = `${API_BASE_URL}/api/v1/notifications/${notificationId}`;

  try {
    await fetch(url, {
      method: "DELETE",
      credentials: "include",
      headers: getCommonHeaders(),
    });
  } catch {}
};

export const markAllNotificationsRead = async (): Promise<void> => {
  try {
    const notifications = await fetchNotifications();
    const unreadNotifications = notifications.filter((n) => !n.isRead);

    await Promise.all(
      unreadNotifications.map((n) => markNotificationRead(n.id))
    );
  } catch {}
};

export const getUnreadCount = async (): Promise<number> => {
  try {
    const notifications = await fetchNotifications();
    return notifications.filter((n) => !n.isRead).length;
  } catch {
    return 0;
  }
};
