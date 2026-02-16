import { getCommonHeaders } from "@/lib/api-utils";
import { getDeviceId } from "@/lib/device-storage";
import { API_BASE_URL } from "@/constants";
import { Coupon, FetchCouponsResponse, Cart, RemoveCouponResponse, ApplyCouponResponse } from "@/types/index";

export const fetchCoupons = async (): Promise<Coupon[]> => {
  if (typeof window === "undefined") {
    return [];
  }

  const deviceId = getDeviceId();
  const url = `${API_BASE_URL}/api/v1/coupons`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(deviceId && deviceId !== "server" && { "X-Device-Id": deviceId }),
    },
    credentials: "include",
  });

  if (!response.ok) {
    return [];
  }

  const json: FetchCouponsResponse = await response.json();
  return json.data?.coupons || [];
};

export const applyCoupon = async (code: string, cartId: string): Promise<ApplyCouponResponse> => {
  const deviceId = getDeviceId();
  const url = `${API_BASE_URL}/api/v1/coupons/apply`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      ...getCommonHeaders(),
      "X-Device-Id": deviceId || "",
    },
    credentials: "include",
    body: JSON.stringify({ cartId, code }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to apply coupon");
  }

  return data;
};

export const removeCoupon = async (cartId: string): Promise<RemoveCouponResponse> => {
  const deviceId = getDeviceId();
  const url = `${API_BASE_URL}/api/v1/coupons/applied/${cartId}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      ...getCommonHeaders(),
      "X-Device-Id": deviceId || "",
    },
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to remove coupon");
  }

  return data;
};
