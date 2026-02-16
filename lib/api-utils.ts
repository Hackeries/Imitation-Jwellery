import { getDeviceId } from "@/lib/device-storage";
import { triggerLoginRequired } from "@/lib/auth-events";

export const formatPriceShort = (price: number): string =>
  `₹${price.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

export const formatPrice = (price: number): string =>
  `Rs. ${price.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const getCommonHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const deviceId =
      localStorage.getItem("privora_device_id") ||
      localStorage.getItem("deviceId") ||
      getDeviceId();

    if (deviceId && deviceId !== "server") {
      headers["X-Device-Id"] = deviceId;
    }
  }

  return headers;
};

export const handleApiError = (message: string) => {
  if (message?.toLowerCase().includes("missing customerid")) {
    triggerLoginRequired();
    return true;
  }
  return false;
};
