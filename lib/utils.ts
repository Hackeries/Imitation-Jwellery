import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStatusColor(status: string) {
  const s = status?.toLowerCase() || "";

  if (s === "paid" || s === "delivered" || s === "success") {
    return "text-green-600 bg-green-50 border-green-200";
  } else if (s === "failed" || s === "cancelled" || s === "returned") {
    return "text-red-600 bg-red-50 border-red-200";
  } else if (s === "pending" || s === "processing") {
    return "text-yellow-600 bg-yellow-50 border-yellow-200";
  } else if (s === "shipped" || s === "out_for_delivery") {
    return "text-blue-600 bg-blue-50 border-blue-200";
  }

  return "text-gray-600 bg-gray-50 border-gray-200";
}
