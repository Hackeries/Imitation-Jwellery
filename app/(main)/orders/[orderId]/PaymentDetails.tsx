"use client";

import { Download, Lock } from "lucide-react";
import CommonButton from "@/app/components/button/CommonButton";
import { generateInvoice } from "@/lib/invoice-generator";
import { toast } from "sonner";

interface PaymentDetailsProps {
  order: {
    orderNumber: string;
    date: string;
    status: string;
    shippingAddress: {
      fullName: string;
      line1: string;
      line2?: string;
      city: string;
      state: string;
      pincode: string;
      country: string;
      mobile: string;
    };
    items: {
      productName: string;
      quantity: number;
      totalPrice: number;
    }[];
    financials: {
      subtotal: number;
      shipping: number;
      discount: number;
      total: number;
      currency: string;
    };
  };
}

export default function PaymentDetails({ order }: PaymentDetailsProps) {
  const { financials } = order;
  const status = order.status.toLowerCase();

  const isDownloadable = status === "delivered";

  const handleDownloadInvoice = () => {
    if (!isDownloadable) {
      if (status === "cancelled") {
        toast.error("Invoice is not available for cancelled orders.");
      } else {
        toast.error("Invoice will be available after delivery.");
      }
      return;
    }

    try {
      generateInvoice(order);
      toast.success("Invoice Downloaded!", {
        description:
          "Check your downloads folder • For support: +91 96995 52754",
        duration: 5000,
      });
    } catch (error) {
      console.error("Invoice generation failed:", error);
      toast.error("Failed to generate invoice");
    }
  };

  return (
    <div className="border border-foreground/20 rounded-xl p-4 md:p-6 h-fit sticky top-24">
      <h3 className="font-times text-xl mb-6">Payment Details</h3>

      <div className="space-y-4 text-sm mb-6 border-b border-foreground/10 pb-6">
        <div className="flex justify-between items-center">
          <span className="text-foreground/70">Item Subtotal</span>
          <span className="font-medium">
            ₹{financials.subtotal.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-foreground/70">Delivery Charges</span>
          <span className={`font-medium ${financials.shipping === 0 ? "text-green-600" : "text-foreground"}`}>
            {financials.shipping === 0 ? "Free" : `₹${financials.shipping}`}
          </span>
        </div>
        {financials.discount > 0 && (
          <div className="flex justify-between items-center text-green-600">
            <span>Discount</span>
            <span className="font-medium">
              - ₹{financials.discount.toLocaleString("en-IN")}
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-8">
        <span className="font-semibold text-lg">Total Amount</span>
        <span className="font-semibold text-lg">
          ₹{financials.total.toLocaleString("en-IN")}
        </span>
      </div>

      <CommonButton
        variant={isDownloadable ? "primaryBtn" : "secondaryBtn"}
        className={`w-full flex items-center justify-center gap-2 ${!isDownloadable
            ? "opacity-60 cursor-not-allowed bg-foreground/10 border-foreground/10 text-foreground/50 hover:bg-foreground/10"
            : ""
          }`}
        onClick={handleDownloadInvoice}
        disabled={!isDownloadable}
      >
        {isDownloadable ? <Download size={18} /> : <Lock size={16} />}
        DOWNLOAD INVOICE
      </CommonButton>

      {!isDownloadable && status !== "cancelled" && (
        <p className="text-xs text-center mt-3 text-foreground/50">
          * Invoice will be available once delivered
        </p>
      )}
    </div>
  );
}
