"use client";

import { Check, X, Clock, AlertCircle } from "lucide-react";

const STEPS = [
  { label: "Order Placed", key: "pending" },
  { label: "Order Confirmed", key: "confirmed" },
  { label: "Order Dispatched", key: "shipped" },
  { label: "Out for Delivery", key: "out_for_delivery" },
  { label: "Delivered", key: "delivered" },
];

interface OrderTrackingProps {
  status: string;
  createdDate: string;
  updatedDate: string;
}

export default function OrderTracking({
  status,
  createdDate,
  updatedDate,
}: OrderTrackingProps) {
  const currentStatus = status.toLowerCase();

  let activeStepIndex = 0;
  const isCancelled = currentStatus === "cancelled";
  const isReturned = currentStatus === "returned";
  if (isCancelled || isReturned) {
    activeStepIndex = -1;
  } else {
    switch (currentStatus) {
      case "pending":
        activeStepIndex = 0;
        break;
      case "confirmed":
        activeStepIndex = 1;
        break;
      case "shipped":
        activeStepIndex = 2;
        break;
      case "out_for_delivery":
        activeStepIndex = 3;
        break;
      case "delivered":
        activeStepIndex = 4;
        break;
      default:
        activeStepIndex = 0;
    }
  }

  const hasDate = updatedDate && updatedDate !== "N/A";
  const actionText = isCancelled ? "Cancelled" : "Returned";
  const dateText = hasDate ? `on ${updatedDate}` : "";

  return (
    <div className="border border-foreground/20 rounded-xl p-3 md:p-5 w-full overflow-x-auto">
      {isCancelled || isReturned ? (
        <div
          className={`flex items-start gap-4 p-4 rounded-lg border ${
            isCancelled
              ? "bg-red-50 border-red-100 text-red-900"
              : "bg-orange-50 border-orange-100 text-orange-900"
          }`}
        >
          <div className="mt-0.5">
            {isCancelled ? (
              <XCircleIcon />
            ) : (
              <Clock className="text-orange-600" size={20} />
            )}
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-sm md:text-base">
              Order {actionText}
            </p>
            <p className="text-sm opacity-90">
              This order was {actionText.toLowerCase()} {dateText}. If you have
              any questions regarding this, please contact support.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex justify-between relative min-w-[600px] md:min-w-0">
          {STEPS.map((step, idx) => {
            const isCompleted = activeStepIndex >= idx;
            const isLast = idx === STEPS.length - 1;
            const isCurrent = activeStepIndex === idx;
            const isLineActive = activeStepIndex > idx;

            return (
              <div
                key={step.key}
                className="relative flex flex-col items-center text-center w-full group"
              >
                {!isLast && (
                  <div
                    className={`absolute top-4 left-1/2 w-full h-[2px] transition-colors duration-300 ${
                      isLineActive ? "bg-brand" : "bg-gray-200"
                    }`}
                    style={{ zIndex: 0 }}
                  />
                )}

                <div
                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isCompleted
                      ? "bg-brand text-white shadow-md scale-110"
                      : "bg-white border-2 border-gray-200 text-gray-400"
                  }`}
                >
                  {isCompleted ? <Check size={14} strokeWidth={3} /> : idx + 1}
                </div>

                <div className="mt-3 flex flex-col items-center">
                  <p
                    className={`text-xs md:text-sm font-semibold transition-colors ${
                      isCompleted ? "text-foreground" : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </p>

                  {idx === 0 && (
                    <p className="text-[10px] text-gray-500 mt-1 font-medium">
                      {createdDate !== "N/A" ? createdDate : ""}
                    </p>
                  )}

                  {isCurrent && idx !== 0 && (
                    <p className="text-[10px] text-brand mt-1 font-medium">
                      {updatedDate !== "N/A" ? updatedDate : ""}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function XCircleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-red-600"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}
