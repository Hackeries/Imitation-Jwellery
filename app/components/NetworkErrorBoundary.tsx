"use client";

import { ReactNode, useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import CommonButton from "@/app/components/button/CommonButton";

type NetworkErrorBoundaryProps = {
  children: ReactNode;
  onError?: (error: Error) => void;
};

export default function NetworkErrorBoundary({
  children,
  onError,
}: NetworkErrorBoundaryProps) {
  const [error, setError] = useState<Error | null>(null);
  const [isOnline, setIsOnline] = useState(
    typeof window !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (
        event.error?.message?.includes("Failed to fetch") ||
        event.error?.message?.includes("Network")
      ) {
        setError(event.error);
        onError?.(event.error);
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason?.message?.includes("Failed to fetch") ||
        event.reason?.message?.includes("Network")
      ) {
        setError(event.reason);
        onError?.(event.reason);
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, [onError]);

  if (!isOnline) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-background/50">
        <div className="max-w-md w-full mx-4 p-6 bg-white rounded-xl shadow-lg border border-red-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              No Internet Connection
            </h2>
          </div>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            You appear to be offline. Please check your internet connection and
            try again.
          </p>
          <CommonButton
            variant="primaryBtn"
            onClick={() => window.location.reload()}
            className="w-full"
          >
            Retry
          </CommonButton>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-background/50">
        <div className="max-w-md w-full mx-4 p-6 bg-white rounded-xl shadow-lg border border-red-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Server Connection Error
            </h2>
          </div>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            {error.message ||
              "Cannot connect to the server. Please check your connection and try again."}
          </p>
          <div className="flex gap-3">
            <CommonButton
              variant="primaryBtn"
              onClick={() => {
                setError(null);
                window.location.reload();
              }}
              className="flex-1"
            >
              Retry
            </CommonButton>
            <CommonButton
              variant="secondaryBtn"
              onClick={() => setError(null)}
              className="flex-1"
            >
              Dismiss
            </CommonButton>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
