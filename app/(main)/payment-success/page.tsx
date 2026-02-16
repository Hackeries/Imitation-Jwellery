"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from "@/lib/image-utils";
import { CheckCircle, Loader2 } from "lucide-react";
import CommonButton from "@/app/components/button/CommonButton";
import CommonHeading from "@/app/components/CommonHeading";
import { useOrderDetails } from "@/hooks/use-orders";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const { data: order, isLoading } = useOrderDetails(orderId || "");

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-brand" size={40} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <p className="text-red-500">Order details not found.</p>
        <CommonButton href="/">Go Home</CommonButton>
      </div>
    );
  }

  const address = order.shippingAddress
    ? `${order.shippingAddress.line1}, ${order.shippingAddress.city}, ${order.shippingAddress.pincode}`
    : "Address unavailable";

  return (
    <section className="min-h-[80vh] flex justify-center px-4 py-12 bg-[#fffaf2]">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <CheckCircle size={72} className="mx-auto text-green-600 mb-4" />
          <CommonHeading level={1} title="Payment Successful" />
          <p className="text-sm text-foreground/70">
            Your order <strong>#{order.orderNumber}</strong> has been confirmed.
          </p>
        </div>

        <div className="bg-white border border-foreground/10 rounded-2xl p-6 shadow-sm space-y-4">
          <InfoRow label="Estimated Delivery" value="3-5 Business Days" />
          <InfoRow label="Shipping Address" value={address} />
        </div>

        <div className="bg-white border border-foreground/10 rounded-2xl p-6 shadow-sm">
          <h3 className="font-medium mb-4 text-lg">Order Summary</h3>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.productId}
                className="flex gap-4 items-center border-b border-foreground/5 pb-4 last:border-0"
              >
                <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={getImageUrl(item.thumbnail)}
                    alt={item.productName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium line-clamp-1">
                    {item.productName}
                  </p>
                  <p className="text-xs text-foreground/60">
                    Qty: {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-medium">₹{item.totalPrice}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-foreground/10 mt-4 pt-4 flex justify-between font-bold text-lg">
            <span>Total Paid</span>
            <span>₹{order.total}</span>
          </div>
        </div>

        <div className="text-center space-y-4">
          <CommonButton
            href={`/orders/${order.id}`}
            className="w-full sm:w-auto"
          >
            Track Your Order
          </CommonButton>
          <Link
            href="/product-list"
            className="block text-sm text-brand hover:underline font-medium"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
      <span className="text-xs font-medium text-foreground/50 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm font-medium text-foreground/90">{value}</span>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="animate-spin text-brand" size={40} />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
