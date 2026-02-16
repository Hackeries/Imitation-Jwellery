"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import CommonButton from "@/app/components/button/CommonButton";
import CommonHeading from "@/app/components/CommonHeading";
import { useSearchParams } from "next/navigation";

function PaymentPendingFallback() {
  return (
    <section className="min-h-[80vh] flex justify-center px-4 py-12 bg-[#fffaf2]">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="w-20 h-20 bg-yellow-100 rounded-full animate-pulse mx-auto" />
        <div className="h-8 bg-gray-200 rounded w-40 mx-auto animate-pulse" />
      </div>
    </section>
  );
}

function PaymentPendingContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const orderId = searchParams.get("orderId");

  const orderDetailsUrl = orderId ? `/orders/${orderId}` : "/account/orders";

  return (
    <section className="min-h-[80vh] flex justify-center px-4 py-12 bg-gradient-to-b from-[#fffaf2] to-white">
      <div className="max-w-lg w-full text-center space-y-6">
        
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 flex items-center justify-center">
            <Clock size={72} className="text-yellow-600 animate-pulse" />
          </div>
          <div className="absolute inset-0 border-4 border-transparent border-t-yellow-400 border-r-yellow-300 rounded-full animate-spin"></div>
        </div>

        <CommonHeading level={1} title="Payment Pending" />

        {orderNumber && (
          <p className="text-sm font-medium text-foreground/80 bg-yellow-50 px-4 py-2 rounded-lg inline-block">
            Order #{orderNumber}
          </p>
        )}

        <div className="space-y-3">
          <p className="text-sm text-foreground/70 leading-relaxed">
            We are securely connecting to your bank to process the payment.
          </p>
          <p className="text-xs text-foreground/60">
            Please <strong>do not close</strong> this window or press back.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-yellow-800 space-y-2">
          <p className="font-medium text-sm">Status Update</p>
          <p className="text-sm leading-relaxed">
            Your payment is being processed. This typically takes 2-5 minutes.
            We'll automatically confirm once your bank approves the transaction.
          </p>
        </div>

        <div className="space-y-3 pt-4">
          <CommonButton
            href={orderDetailsUrl}
            variant="secondaryBtn"
            className="w-full"
          >
            Check Order Status
          </CommonButton>
          <p className="text-xs text-foreground/50">
            Tip: Refresh this page to get the latest status
          </p>
        </div>
      </div>
    </section>
  );
}

export default function PaymentPendingPage() {
  return (
    <Suspense fallback={<PaymentPendingFallback />}>
      <PaymentPendingContent />
    </Suspense>
  );
}
