import { getDeviceId } from "@/lib/device-storage";
import { getCommonHeaders } from "@/lib/api-utils";

export interface User {
  _id: string;
  fullName: string;
  email?: string;
  mobile: string;
}

export interface Device {
  _id: string;
  deviceId: string;
  customerId?: string;
  deviceType: string;
  lastSeenAt: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8018";

const hashString = async (str: string): Promise<string> => {
  if (typeof window === "undefined") return str;
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

const getBrowserFingerprint = (): string => {
  if (typeof window === "undefined") return "server";
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillText("fingerprint", 2, 2);
  }
  return canvas.toDataURL().slice(-50);
};

export const registerDevice = async (): Promise<{
  device: Device;
  customer: User | null;
}> => {
  try {
    let deviceId =
      typeof window !== "undefined"
        ? localStorage.getItem("privora_device_id") ||
          localStorage.getItem("deviceId")
        : null;

    if (!deviceId) {
      deviceId = getDeviceId();
      if (!deviceId || deviceId === "server") {
        if (typeof crypto !== "undefined" && crypto.randomUUID) {
          deviceId = crypto.randomUUID();
        } else {
          deviceId =
            "dev-" + Date.now() + "-" + Math.random().toString(36).substring(2);
        }
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("privora_device_id", deviceId);
        localStorage.setItem("deviceId", deviceId);
      }
    }

    const headers = getCommonHeaders();
    headers["X-Device-Id"] = deviceId;

    const response = await fetch(`${API_BASE_URL}/api/v1/devices`, {
      method: "POST",
      headers: headers,
      credentials: "include",
      body: JSON.stringify({
        deviceId,
        userAgentHash: await hashString(navigator.userAgent),
        browserFingerprint: getBrowserFingerprint(),
        deviceType: "desktop",
      }),
    });

    if (!response.ok) {
      return {
        device: {
          _id: "local",
          deviceId,
          deviceType: "desktop",
          lastSeenAt: new Date().toISOString(),
        },
        customer: null,
      };
    }

    const data = await response.json();
    return {
      device: data?.data?.device ?? data?.device,
      customer: data?.data?.customer ?? data?.customer ?? null,
    };
  } catch (error) {
    return {
      device: {
        _id: "fallback",
        deviceId: "fallback",
        deviceType: "unknown",
        lastSeenAt: new Date().toISOString(),
      },
      customer: null,
    };
  }
};

export const fetchUserProfile = async (): Promise<User | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/customer/me`, {
      method: "GET",
      credentials: "include",
      headers: getCommonHeaders(),
    });

    if (response.status === 401 || response.status === 403) return null;
    if (!response.ok) return null;

    const responseData = await response.json();
    const customer = responseData?.data?.customer ?? responseData?.data;

    if (customer && typeof window !== "undefined") {
      localStorage.setItem("authenticatedUser", JSON.stringify(customer));
    }

    return customer;
  } catch {
    return null;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/api/v1/customer/logout`, {
      method: "POST",
      headers: getCommonHeaders(),
      credentials: "include",
    });
  } catch (error) {
    console.error("Logout error", error);
  } finally {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      localStorage.removeItem("authenticatedUser");
    }
  }
};

export const verifyOtp = async (mobile: string, otp: string) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/customer/verify-otp`, {
    method: "POST",
    headers: getCommonHeaders(),
    credentials: "include",
    body: JSON.stringify({ mobile, otp }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || "Invalid or expired OTP");
  }

  const customer = data?.data?.customer ?? data?.customer;
  const token = data?.data?.token ?? data?.token;

  if (!customer?._id) throw new Error("Login failed");

  if (typeof window !== "undefined") {
    localStorage.setItem("authenticatedUser", JSON.stringify(customer));
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("authToken", token);
    }
  }

  return { user: customer, token };
};

export const requestOtp = async (mobile: string) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/customer/send-otp`, {
    method: "POST",
    headers: getCommonHeaders(),
    credentials: "include",
    body: JSON.stringify({ mobile }),
  });
  const data = await response.json();
  if (!response.ok) return { success: false, message: data?.message };
  const otp = data?.data?.OTP || data?.data?.otp;
  return { success: true, message: "OTP sent", otp };
};

export const updateUserProfile = async (payload: Partial<User>) => {
  // Only send fields that are allowed by the backend schema
  const allowedFields = {
    ...(payload.fullName !== undefined && { fullName: payload.fullName }),
    ...(payload.email !== undefined && { email: payload.email }),
    // Note: mobile cannot be updated after registration
  };

  const response = await fetch(`${API_BASE_URL}/api/v1/customer/me`, {
    method: "PUT",
    headers: getCommonHeaders(),
    body: JSON.stringify(allowedFields),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data.data.customer;
};

export const loginUser = async (creds: { mobile: string; otp: string }) =>
  verifyOtp(creds.mobile, creds.otp);
