import { getCommonHeaders } from "@/lib/api-utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8018";

export interface InitiatePaymentResponse {
  paymentSessionId: string;
  orderId: string;
  orderNumber?: string;
}

export const initiatePayment = async (
  orderId: string,
): Promise<InitiatePaymentResponse> => {
  const url = `${API_BASE_URL}/api/v1/payments/orders/${orderId}`;

  const response = await fetch(url, {
    method: "POST",
    headers: getCommonHeaders(),
    credentials: "include",
    body: JSON.stringify({}),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || "Failed to initiate payment");
  }
  return json.data;
};
