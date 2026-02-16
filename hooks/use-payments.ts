"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

declare global {
  interface Window {
    Cashfree?: (config: { mode: string }) => {
      checkout: (options: {
        paymentSessionId: string;
        redirectTarget: string;
      }) => Promise<void>;
    };
  }
}

const getCashfreeMode = (): string => {
  return process.env.NEXT_PUBLIC_CASHFREE_MODE === "production"
    ? "production"
    : "sandbox";
};

const loadCashfreeSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.Cashfree) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Cashfree SDK"));
    document.head.appendChild(script);
  });
};

export const useCashfreePayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processPayment = useCallback(async (paymentSessionId: string) => {
    if (!paymentSessionId) return;

    setIsProcessing(true);
    try {
      await loadCashfreeSDK();

      const cashfree = window.Cashfree?.({ mode: getCashfreeMode() });

      if (!cashfree) {
        throw new Error("Cashfree SDK failed to initialize. Please try again.");
      }

      await cashfree.checkout({
        paymentSessionId,
        redirectTarget: "_self",
      });
    } catch (error) {
      setIsProcessing(false);
      const msg =
        error instanceof Error
          ? error.message
          : "Payment initialization failed";
      toast.error(msg);
    }
  }, []);

  return {
    processPayment,
    isProcessing,
  };
};

export const usePaymentGateway = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { processPayment: processCashfree } = useCashfreePayment();

  const processPayment = useCallback(async (response: {
    paymentSessionId?: string;
    redirectUrl?: string;
  }) => {
    setIsProcessing(true);
    try {
      if (response.redirectUrl && !response.paymentSessionId) {
        window.location.href = response.redirectUrl;
        return;
      }

      if (response.paymentSessionId) {
        await processCashfree(response.paymentSessionId);
        return;
      }

      if (response.redirectUrl) {
        window.location.href = response.redirectUrl;
        return;
      }

      throw new Error("No payment method available");
    } catch (error) {
      setIsProcessing(false);
      const msg =
        error instanceof Error
          ? error.message
          : "Payment initialization failed";
      toast.error(msg);
    }
  }, [processCashfree]);

  return { processPayment, isProcessing };
};
