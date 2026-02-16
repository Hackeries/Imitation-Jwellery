import { getCommonHeaders } from "@/lib/api-utils";

export interface PincodeValidationResponse {
  success: boolean;
  message: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8018";

export const validatePincode = async (
  pincode: string
): Promise<PincodeValidationResponse> => {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/addresses/check/pincode/${pincode}`,
      {
        method: "GET",
        headers: getCommonHeaders(),
        credentials: "include",
      }
    );

    const json = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: json.message || "Delivery not available to the provided pincode",
      };
    }

    if (json.success || json.data?.isServiceable) {
      return {
        success: true,
        message: "Delivery available",
      };
    }

    return {
      success: false,
      message: json.message || "Pincode not serviceable",
    };
  } catch (error) {
    console.error("Pincode validation error:", error);
    return {
      success: false,
      message: "Unable to verify pincode. Please try again.",
    };
  }
};
