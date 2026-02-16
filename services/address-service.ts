import { getCommonHeaders } from "@/lib/api-utils";

export interface Address {
  _id: string;
  fullName: string;
  mobile: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  label: string;
}

export interface AddressFormData {
  fullName: string;
  mobile: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  label: string;
  isDefault?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8018";

export const fetchAddresses = async (): Promise<Address[]> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/addresses`, {
    headers: getCommonHeaders(),
    cache: "no-store",
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data?.items || json.data || [];
};

export const getAddressById = async (id: string): Promise<Address | null> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/addresses/${id}`, {
    headers: getCommonHeaders(),
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data?.address || json.data || null;
};

export const addAddress = async (data: AddressFormData): Promise<Address> => {
  const cleanedData: Record<string, unknown> = { ...data };

  // Remove empty optional fields - backend schema rejects empty strings
  const optionalFields = ['line2', 'landmark', 'country'];
  for (const field of optionalFields) {
    if (cleanedData[field] === '' || cleanedData[field] === undefined || cleanedData[field] === null) {
      delete cleanedData[field];
    }
  }

  // Strip spaces from mobile
  if (typeof cleanedData.mobile === 'string') {
    cleanedData.mobile = cleanedData.mobile.replace(/\s/g, '');
  }

  const res = await fetch(`${API_BASE_URL}/api/v1/addresses`, {
    method: "POST",
    headers: getCommonHeaders(),
    body: JSON.stringify(cleanedData),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || json.error || "Failed to add address");
  }

  return json.data?.address || json.data;
};

export const updateAddress = async (
  id: string,
  data: Partial<AddressFormData>,
): Promise<Address> => {
  const cleanedData: Record<string, unknown> = { ...data };

  // Remove empty optional fields
  const optionalFields = ['line2', 'landmark', 'country'];
  for (const field of optionalFields) {
    if (cleanedData[field] === '' || cleanedData[field] === undefined || cleanedData[field] === null) {
      delete cleanedData[field];
    }
  }

  // Strip spaces from mobile
  if (typeof cleanedData.mobile === 'string') {
    cleanedData.mobile = cleanedData.mobile.replace(/\s/g, '');
  }

  // Remove email and phone if not needed (backend says: remove email if not available and phone number in update)
  delete cleanedData.email;

  const res = await fetch(`${API_BASE_URL}/api/v1/addresses/${id}`, {
    method: "PUT",
    headers: getCommonHeaders(),
    body: JSON.stringify(cleanedData),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || json.error || "Failed to update address");
  }

  return json.data?.address || json.data;
};

export const deleteAddress = async (id: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/addresses/${id}`, {
    method: "DELETE",
    headers: getCommonHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete address");
};

export const setDefaultAddress = async (id: string): Promise<void> => {
  const res = await fetch(
    `${API_BASE_URL}/api/v1/addresses/${id}/set-default`,
    {
      method: "PATCH",
      headers: getCommonHeaders(),
    },
  );
  if (!res.ok) throw new Error("Failed to set default address");
};
