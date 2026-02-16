import { getCommonHeaders } from "@/lib/api-utils";

export interface RoundNotification {
  id: string;
  body: string;
  isActive: boolean;
  link?: string;
}

interface BackendRoundNotification {
  _id: string;
  body: string;
  text?: string;
  isActive: boolean;
  link?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8018";

const transformRoundNotification = (
  n: BackendRoundNotification
): RoundNotification => ({
  id: n._id,
  body: n.body || n.text || "",
  isActive: n.isActive ?? true,
  link: n.link,
});

export const fetchRoundNotifications = async (): Promise<
  RoundNotification[]
> => {
  const timestamp = Date.now(); // Cache-busting parameter
  const url = `${API_BASE_URL}/api/v1/notifications/round-notifications?t=${timestamp}`;

  try {
    const response = await fetch(url, {
      credentials: "include",
      headers: {
        ...getCommonHeaders(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

    if (!response.ok) return [];

    const json = await response.json();
    const items: BackendRoundNotification[] = Array.isArray(json?.data)
      ? json.data
      : json?.data?.items || [];

    return items.map(transformRoundNotification);
  } catch {
    return [];
  }
};
