"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";
import CommonButton from "@/app/components/button/CommonButton";
import CommonHeading from "@/app/components/CommonHeading";

export default function PaymentFailedPage() {
  return (
    <section className="min-h-[80vh] flex justify-center px-4 py-12 bg-[#fffaf2]">
      <div className="max-w-lg w-full text-center space-y-6">
        <XCircle size={72} className="mx-auto text-red-500" />

        <CommonHeading level={1} title="Payment Failed" />

        <p className="text-sm text-foreground/70 leading-relaxed">
          We couldn’t complete your payment. This can happen due to a bank
          decline or interruption during the transaction.
        </p>

        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-800 text-sm">
          <p className="font-medium">Don’t worry!</p>
          <p>Your items are safe in your cart.</p>
        </div>

        <div className="space-y-3 pt-4">
          <CommonButton href="/checkout" className="w-full">
            Try Again
          </CommonButton>

          <Link
            href="/contact-us"
            className="block text-xs text-foreground/50 hover:underline"
          >
            Report an issue
          </Link>
        </div>
      </div>
    </section>
  );
}
