"use client";

import { Package, Truck, MapPin, CalendarClock, CheckCircle2, AlertCircle } from "lucide-react";

export default function TrackingDetailsCard({ order }: { order: any }) {
  const trackingData = (order?.tracking || order)

  const { awbNumber, lastScanDetails, orderDateTime } = trackingData || {};

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("delivered")) return "bg-green-100 text-green-700 border-green-200";
    if (s.includes("transit")) return "bg-blue-50 text-blue-700 border-blue-200";
    if (s.includes("pickup") || s.includes("out")) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white border border-foreground/10 rounded-2xl p-6 mb-8 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-bl-full -mr-10 -mt-10 pointer-events-none" />

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand/10 rounded-xl text-brand">
            <Truck size={28} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground">Tracking Information</h3>
            <p className="text-sm text-foreground/60 flex items-center gap-2">
              Courier Partner: <span className="font-medium text-foreground">Delhivery Express</span>
            </p>
          </div>
        </div>

        {lastScanDetails?.status && (
          <span
            className={`px-4 py-1.5 rounded-full text-sm font-bold border flex items-center gap-2 ${getStatusColor(
              lastScanDetails.status
            )}`}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-current" />
            </span>
            {lastScanDetails.status}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        <div className="p-4 bg-foreground/[0.02] rounded-xl border border-foreground/5">
          <span className="text-xs text-foreground/50 uppercase tracking-wider font-bold block mb-2">
            AWB Number
          </span>
          <div className="font-mono font-medium text-lg flex items-center gap-2 text-brand">
            <Package size={18} />
            {awbNumber}
          </div>
        </div>

        <div className="p-4 bg-foreground/[0.02] rounded-xl border border-foreground/5">
          <span className="text-xs text-foreground/50 uppercase tracking-wider font-bold block mb-2">
            Expected Delivery
          </span>
          <div className="font-medium flex items-center gap-2">
            <CalendarClock size={18} className="text-foreground/70" />
            {orderDateTime?.expectedDeliveryDate
              ? new Date(orderDateTime.expectedDeliveryDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
              : "Estimating..."}
          </div>
        </div>

        <div className="p-4 bg-foreground/[0.02] rounded-xl border border-foreground/5 col-span-1 md:col-span-2">
          <span className="text-xs text-foreground/50 uppercase tracking-wider font-bold block mb-2">
            Latest Update
          </span>

          <div className="flex flex-col gap-2">
            <div className="font-medium flex items-start gap-2">
              <MapPin size={18} className="text-foreground/70 mt-0.5 shrink-0" />
              <span>{lastScanDetails?.scanLocation || "In Transit"}</span>
            </div>

            {lastScanDetails?.remark && (
              <div className="text-sm text-foreground/60 pl-6 border-l-2 border-brand/20 ml-2">
                {lastScanDetails.remark}
                <br />
                <span className="text-xs text-foreground/40 mt-1 block">
                  {formatDate(lastScanDetails.statusDateTime)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
