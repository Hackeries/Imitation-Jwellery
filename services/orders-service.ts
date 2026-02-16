export interface OrderSummary {
  id: string;
  orderNumber: string;
  date: string;
  total: string;
  status: string;
  itemsCount: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  thumbnail: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface TrackingInfo {
  awbNumber: string;
  lastScanDetails: {
    status: string;
    scanLocation: string;
    statusDateTime: string;
    remark: string;
  };
  orderDateTime: {
    expectedDeliveryDate: string;
  };
}

export interface OrderDetails {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  shippingAddress: {
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    mobile: string;
  } | null;
  tracking?: TrackingInfo;
  // paymentMethod: string;
}

interface BackendOrderItem {
  productId: string;
  productName?: string;
  thumbnail?: string;
  qty: number;
  unitPrice: number;
  totalPrice: number;
}

interface BackendAddressSnapshot {
  fullName?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  mobile?: string;
}

interface BackendOrder {
  _id: string;
  orderNumber?: string;
  createdAt: string;
  totalAmount: number;
  subtotalAmount: number;
  shippingAmount: number;
  discountAmount: number;
  status: string;
  currency?: string;
  itemIds: BackendOrderItem[] | string[];
  shippingSnapshot?: BackendAddressSnapshot;
  addressId?: BackendAddressSnapshot;
  mobile?: string;
  awbNumber?: string;
  lastScanDetails?: {
    status?: string;
    scanLocation?: string;
    statusDateTime?: string;
    remark?: string;
  };
  orderDateTime?: {
    expectedDeliveryDate?: string;
  };
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned"
  | "failed";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8018";
import { FALLBACK_IMAGE } from "@/constants";

const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken");
    const deviceId =
      localStorage.getItem("privora_device_id") ||
      localStorage.getItem("deviceId");

    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (deviceId) headers["X-Device-Id"] = deviceId;
  }
  return headers;
};

const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const transformOrderSummary = (backendOrder: BackendOrder): OrderSummary => {
  return {
    id: backendOrder._id,
    orderNumber: backendOrder.orderNumber || backendOrder._id,
    date: formatDate(backendOrder.createdAt),
    total: formatCurrency(backendOrder.totalAmount),
    status:
      backendOrder.status.charAt(0).toUpperCase() +
      backendOrder.status.slice(1),
    itemsCount: Array.isArray(backendOrder.itemIds)
      ? backendOrder.itemIds.length
      : 0,
  };
};

const transformOrderDetails = (backendOrder: BackendOrder): OrderDetails => {
  const snapshot = backendOrder.shippingSnapshot || {};
  const fallbackAddress = backendOrder.addressId || {};

  const resolvedMobile =
    snapshot.mobile || fallbackAddress.mobile || backendOrder.mobile || "N/A";

  const items = (
    Array.isArray(backendOrder.itemIds) ? backendOrder.itemIds : []
  ) as BackendOrderItem[];

  const orderDetails: OrderDetails = {
    id: backendOrder._id,
    orderNumber: backendOrder.orderNumber || backendOrder._id,
    date: formatDate(backendOrder.createdAt),
    status:
      backendOrder.status.charAt(0).toUpperCase() +
      backendOrder.status.slice(1),
    items: items.map((item) => ({
      productId: item.productId,
      productName: item.productName || "Product",
      thumbnail: item.thumbnail || FALLBACK_IMAGE,
      quantity: item.qty,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    })),
    subtotal: backendOrder.subtotalAmount,
    shipping: backendOrder.shippingAmount,
    discount: backendOrder.discountAmount,
    total: backendOrder.totalAmount,
    currency: backendOrder.currency || "INR",
    shippingAddress: {
      fullName: snapshot.fullName || fallbackAddress.fullName || "",
      line1: snapshot.line1 || fallbackAddress.line1 || "",
      line2: snapshot.line2 || fallbackAddress.line2 || "",
      city: snapshot.city || fallbackAddress.city || "",
      state: snapshot.state || fallbackAddress.state || "",
      pincode: snapshot.pincode || fallbackAddress.pincode || "",
      country: snapshot.country || fallbackAddress.country || "India",
      mobile: resolvedMobile,
    },
    // paymentMethod: "Online Payment",
  };

  if (backendOrder.awbNumber || backendOrder.lastScanDetails || backendOrder.orderDateTime) {
    orderDetails.tracking = {
      awbNumber: backendOrder.awbNumber || "",
      lastScanDetails: {
        status: backendOrder.lastScanDetails?.status || "N/A",
        scanLocation: backendOrder.lastScanDetails?.scanLocation || "N/A",
        statusDateTime: backendOrder.lastScanDetails?.statusDateTime || "N/A",
        remark: backendOrder.lastScanDetails?.remark || "N/A",
      },
      orderDateTime: {
        expectedDeliveryDate: backendOrder.orderDateTime?.expectedDeliveryDate || "",
      },
    };
  }

  return orderDetails;
};

export const fetchOrders = async (): Promise<OrderSummary[]> => {
  const url = `${API_BASE_URL}/api/v1/orders`;

  try {
    const response = await fetch(url, {
      credentials: "include",
      headers: getAuthHeaders(),
    });

    if (!response.ok) return [];

    const json = await response.json();
    const items = (json?.data?.items || json?.items || []) as BackendOrder[];
    return items.map(transformOrderSummary);
  } catch (err) {
    return [];
  }
};

export const fetchOrdersPaginated = async (
  page: number = 1,
  limit: number = 8,
) => {
  const url = `${API_BASE_URL}/api/v1/orders?page=${page}&limit=${limit}`;

  try {
    const response = await fetch(url, {
      credentials: "include",
      headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error("Failed to fetch orders");

    const json = await response.json();
    const items = (json?.data?.items || json?.items || []) as BackendOrder[];
    const paginationData = json?.data?.pagination;
    const pagination = {
      page: paginationData?.page || page,
      limit: paginationData?.limit || limit,
      total: paginationData?.total || 0,
    };

    console.log(
      "Fetched orders page",
      page,
      "items:",
      items.length,
      "pagination:",
      pagination,
    );

    return {
      orders: items.map(transformOrderSummary),
      pagination,
    };
  } catch (err) {
    console.error("Error fetching paginated orders:", err);
    throw err;
  }
};

export const fetchOrderDetails = async (
  orderId: string,
): Promise<OrderDetails | null> => {
  const url = `${API_BASE_URL}/api/v1/orders/${orderId}`;

  try {
    const response = await fetch(url, {
      credentials: "include",
      headers: getAuthHeaders(),
    });

    if (!response.ok) return null;

    const json = await response.json();
    const orderData = (json?.data || json) as BackendOrder;
    return transformOrderDetails(orderData);
  } catch (err) {
    return null;
  }
};

export const trackOrder = async (
  orderId: string,
  phoneOrEmail: string,
): Promise<OrderDetails | null> => {
  const url = `${API_BASE_URL}/api/v1/orders/track`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        orderId,
        contact: phoneOrEmail,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Tracking failed");
    }

    const json = await response.json();
    const orderData = (json?.data || json) as BackendOrder;
    return transformOrderDetails(orderData);
  } catch (err) {
    throw err;
  }
};

export const cancelOrder = async (orderId: string): Promise<void> => {
  const url = `${API_BASE_URL}/api/v1/orders/${orderId}/cancel`;

  const response = await fetch(url, {
    method: "PATCH",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.message || "Failed to cancel order");
  }
};

export const adminUpdateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
): Promise<void> => {
  const url = `${API_BASE_URL}/api/v1/orders/admin/${orderId}/status`;

  const response = await fetch(url, {
    method: "PATCH",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.message || "Failed to update order status");
  }
};
