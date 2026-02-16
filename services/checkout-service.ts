import { getCommonHeaders } from "@/lib/api-utils";
import { getDeviceId } from "@/lib/device-storage";

export interface CheckoutPayload {
  cartId: string;
  addressId: string;
  billingAddressId?: string;
  couponCode?: string;
  email?: string;
  fullName?: string;
  mobile?: string;
  notes?: string;
}

export interface OrderCreatedResponse {
  success: boolean;
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  paymentSessionId?: string;
  redirectUrl?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8018";

export const createOrderFromCart = async (
  payload: CheckoutPayload,
): Promise<OrderCreatedResponse> => {
  const url = `${API_BASE_URL}/api/v1/orders`;
  const deviceId = getDeviceId();

  const { ...payloadToSend } = payload;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      ...getCommonHeaders(),
      "X-Device-Id": deviceId || "",
    },
    credentials: "include",
    body: JSON.stringify(payloadToSend),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || "Failed to create order");
  }

  const resultData = json.data || {};
  const orderData = resultData.order || {};

  return {
    success: true,
    orderId: orderData._id || resultData.orderId || "",
    orderNumber: orderData.orderNumber || "",
    totalAmount: orderData.totalAmount || 0,
    paymentSessionId: resultData.paymentSessionId || "",
    redirectUrl: resultData.redirectUrl || "",
  };
};

export const applyCoupon = async (
  couponCode: string,
  cartId: string,
): Promise<{ success: boolean; message: string; discountAmount: number }> => {
  const url = `${API_BASE_URL}/api/v1/coupons/apply`;
  const deviceId = getDeviceId();

  const response = await fetch(url, {
    method: "POST",
    headers: {
      ...getCommonHeaders(),
      "X-Device-Id": deviceId || "",
    },
    credentials: "include",
    body: JSON.stringify({ cartId, code: couponCode }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Invalid coupon code");
  }

  return {
    success: true,
    message: data?.data?.message || "Coupon Applied Successfully",
    discountAmount: data?.data?.totalDiscount || 0,
  };
};

export const removeCoupon = async (
  cartId: string,
): Promise<{ success: boolean; message: string }> => {
  const url = `${API_BASE_URL}/api/v1/coupons/applied/${cartId}`;
  const deviceId = getDeviceId();

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      ...getCommonHeaders(),
      "X-Device-Id": deviceId || "",
    },
    credentials: "include",
    body: JSON.stringify({ cartId }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to remove coupon");
  }

  return {
    success: true,
    message: data?.message || "Coupon removed",
  };
};
