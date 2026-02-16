import { getDeviceId, getLocal, setLocal } from "@/lib/device-storage";
import { getCommonHeaders } from "@/lib/api-utils";

export interface SubscribeData {
  email: string;
  mobile?: string;
}

interface StoredSubscription {
  email: string;
  mobile?: string;
  timestamp: number;
  synced: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8018";
const SUBSCRIPTION_STORAGE_KEY = "newsletter_subscriptions";

export const initDevice = (): void => {
  getDeviceId();
};

const getStoredSubscriptions = (): StoredSubscription[] => {
  return getLocal<StoredSubscription[]>(SUBSCRIPTION_STORAGE_KEY, []);
};

const saveSubscription = (data: SubscribeData, synced: boolean): void => {
  const subscriptions = getStoredSubscriptions();
  const exists = subscriptions.some((s) => s.email === data.email);
  if (exists) return;

  subscriptions.push({
    email: data.email,
    mobile: data.mobile,
    timestamp: Date.now(),
    synced,
  });
  setLocal(SUBSCRIPTION_STORAGE_KEY, subscriptions);
};

export const hasSubscribedBefore = (): boolean => {
  if (typeof window === "undefined") return false;

  const subscriptions = getStoredSubscriptions();
  return subscriptions.length > 0;
};

const isAlreadySubscribed = (email: string): boolean => {
  const subscriptions = getStoredSubscriptions();
  return subscriptions.some((s) => s.email === email);
};

export const subscribeNewsletter = async (
  data: SubscribeData,
): Promise<{ success: boolean; message: string; couponCode?: string }> => {
  if (isAlreadySubscribed(data.email)) {
    return {
      success: true,
      message: "You are already subscribed to our newsletter!",
    };
  }
  const url = `${API_BASE_URL}/api/v1/devices/subscribe-email`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: getCommonHeaders(),
      credentials: "include",
      body: JSON.stringify({ email: data.email, deviceId: getDeviceId() }),
    });

    if (response.ok) {
      const result = await response.json().catch(() => ({}));
      saveSubscription(data, true);

      if (typeof window !== "undefined") {
        localStorage.setItem("hasSeenSubscribePopup", "true");

        const storedDevice = localStorage.getItem("device_data");
        if (storedDevice) {
          try {
            const device = JSON.parse(storedDevice);
            device.email = data.email;
            localStorage.setItem("device_data", JSON.stringify(device));
          } catch (e) {}
        }
      }

      return {
        success: true,
        message: result?.message || "Subscribed successfully!",
        couponCode: result?.data?.couponCode,
      };
    }

    if (response.status === 400 || response.status === 404) {
      const result = await response.json().catch(() => ({}));
      saveSubscription(data, false);
      return {
        success: true,
        message: "Thank you for subscribing!",
      };
    }

    const result = await response.json().catch(() => ({}));
    throw new Error(result?.message || "Failed to subscribe");
  } catch (error) {
    saveSubscription(data, false);
    return {
      success: true,
      message: "Thank you for subscribing!",
    };
  }
};

export const getSubscriptionStatus = (email: string): boolean => {
  return isAlreadySubscribed(email);
};

export const getStoredEmail = (): string | null => {
  const subscriptions = getStoredSubscriptions();
  if (subscriptions.length === 0) return null;
  return subscriptions[subscriptions.length - 1].email;
};
