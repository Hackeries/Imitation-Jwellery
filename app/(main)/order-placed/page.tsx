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

function OrderPlacedContent() {
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
    <section className="min-h-[80vh] px-4 py-10 flex justify-center bg-[#fffaf2]">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <CheckCircle
            size={72}
            className="mx-auto text-green-600 mb-4 animate-pulse"
          />

          <CommonHeading level={1} title="Order Placed!" />

          <p className="text-foreground/70 text-sm mb-2">
            Thank you for your purchase.
            <br />
            Your order{" "}
            <span className="font-medium text-foreground">
              #{order.orderNumber}
            </span>{" "}
            is being processed.
          </p>
        </div>

        <div className="bg-white border border-foreground/20 rounded-2xl p-4 md:p-6 space-y-6">
          <DetailRow title="Delivery Address" value={address} />
          <DetailRow title="Estimated Delivery" value="3-5 Business Days" />
          {/* <DetailRow title="Payment Method" value={order.paymentMethod} /> */}
        </div>

        <div className="bg-white border border-foreground/20 rounded-2xl p-4 md:p-6">
          <h3 className="font-medium mb-4">Order Summary</h3>

          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.productId} className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-md overflow-hidden border bg-gray-50">
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

          <div className="border-t border-foreground/20 mt-4 pt-4 flex justify-between font-medium">
            <span>Total Amount</span>
            <span>₹{order.total}</span>
          </div>
        </div>

        <div className="text-center space-y-4">
          <CommonButton
            href={`/account/orders/${order.id}`}
            className="w-full sm:w-auto"
          >
            Track Your Order
          </CommonButton>

          <div className="flex justify-center gap-4 text-sm">
            <Link href="/" className="text-brand hover:underline">
              Continue Shopping
            </Link>
          </div>

          <p className="text-xs text-foreground/60">
            Questions about your order?{" "}
            <Link href="/contact-us" className="underline">
              Contact Support
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}

function DetailRow({ title, value }: { title: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
      <span className="text-xs font-medium text-foreground/70">{title}</span>
      <span className="text-sm whitespace-pre-line text-right sm:text-left">
        {value}
      </span>
    </div>
  );
}

export default function OrderPlacedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="animate-spin text-brand" size={40} />
        </div>
      }
    >
      <OrderPlacedContent />
    </Suspense>
  );
}
