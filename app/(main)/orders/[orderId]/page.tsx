"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useOrderDetails, useCancelOrder } from "@/hooks/use-orders";
import { useQueryClient } from "@tanstack/react-query";
import { useOrderReviews } from "@/hooks/use-reviews";
import {
    ChevronLeft,
    Loader2,
    Home,
    ChevronRight,
    StarIcon,
} from "lucide-react";

import OrderStatusCard from "./OrderStatusCard";
import AddressDetails from "./AddressDetails";
import PaymentDetails from "./PaymentDetails";
import TrackingDetailsCard from "./TrackingDetailsCard";
import CancelOrderModal from "./CancelOrderModal";
import ReturnOrderModal from "./ReturnOrderModal";
import CommonButton from "@/app/components/button/CommonButton";
import RateOrderModal from "../../account/RateOrderModal";
import AuthGuard from "@/app/components/AuthGuard";

interface UiOrderType {
    id: string;
    orderNumber: string;
    currency: string;
    total: number;
    status: string;
    date: string;
    updatedDate: string;
    items: {
        productId: string;
        productName: string;
        thumbnail: string;
        quantity: number;
        totalPrice: number;
    }[];
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
    financials: {
        subtotal: number;
        shipping: number;
        discount: number;
        total: number;
        currency: string;
    };
}

export default function OrderDetailsPage() {
    const [openRateOrder, setOpenRateOrder] = useState(false);
    const [rateModalMode, setRateModalMode] = useState<"edit" | "view">("edit");

    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const orderId = params.orderId as string;

    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [returnModalOpen, setReturnModalOpen] = useState(false);

    const { data: order, isLoading } = useOrderDetails(orderId);
    const cancelOrderMutation = useCancelOrder();

    const { data: orderReviews = [] } = useOrderReviews(orderId);
    const hasReviewed = orderReviews.length > 0;
    const avgRating =
        orderReviews.length > 0
            ? orderReviews.reduce((sum, r) => sum + r.rating, 0) / orderReviews.length
            : 0;

    const handleCancel = (_reason: string, _note: string) => {
        cancelOrderMutation.mutate(orderId, {
            onSuccess: () => {
                toast.success("Order cancelled successfully");
                setCancelModalOpen(false);
                queryClient.invalidateQueries({ queryKey: ["order", orderId] });
                queryClient.invalidateQueries({ queryKey: ["orders"] });

                setTimeout(() => {
                    router.push("/account?tab=orders");
                }, 1000);
            },
            onError: (err: Error) => {
                toast.error(err.message || "Failed to cancel");
            },
        });
    };

    const handleReturn = (reason: string) => {
        toast.info("Return request submitted (Demo)");
        setReturnModalOpen(false);
    };

    const handleOpenRateModal = () => {
        setRateModalMode("edit");
        setOpenRateOrder(true);
    };

    const handleViewReviews = () => {
        setRateModalMode("view");
        setOpenRateOrder(true);
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-brand" size={40} />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
                <h2 className="text-xl font-medium">Order not found</h2>
                <p className="text-foreground/60">
                    We couldn&apos;t locate the details for this order.
                </p>
                <Link
                    href="/account"
                    className="text-brand underline hover:text-brand/80 transition"
                >
                    Back to Orders
                </Link>
            </div>
        );
    }
    const defaultAddress = {
        fullName: "N/A",
        line1: "N/A",
        city: "N/A",
        state: "N/A",
        pincode: "N/A",
        country: "N/A",
        mobile: "N/A",
    };

    const uiOrder: UiOrderType = {
        id: order.id,
        orderNumber: order.orderNumber,
        currency: order.currency,
        total: order.total,
        status: order.status.toLowerCase(),
        date: order.date,
        updatedDate: order.date,
        items: order.items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            thumbnail: item.thumbnail,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
        })),
        shippingAddress: order.shippingAddress ?? defaultAddress,
        financials: {
            subtotal: order.subtotal,
            shipping: order.shipping,
            discount: order.discount,
            total: order.total,
            currency: order.currency,
        },
    };

    return (
        <section className="bg-background min-h-screen pb-20">
            <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
                {/* --- PROFESSIONAL HEADER SECTION --- */}
                <div className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-10 border-b border-foreground/10 pb-4 sm:pb-6">
                    {/* Breadcrumbs & Back Link */}
                    <div className="flex flex-col-reverse md:flex-row md:items-center justify-between gap-4">
                        <nav className="flex items-center gap-2 text-sm text-foreground/60">
                            <Link
                                href="/"
                                className="hover:text-brand flex items-center gap-1 transition-colors"
                            >
                                <Home size={14} /> Home
                            </Link>
                            <ChevronRight size={14} />
                            <Link
                                href="/account"
                                className="hover:text-brand transition-colors"
                            >
                                My Account
                            </Link>
                            <ChevronRight size={14} />
                            <span className="text-foreground font-medium">
                                Order #{order.orderNumber}
                            </span>
                        </nav>

                        <Link
                            href="/account?tab=orders"
                            className="flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-brand transition-all group w-fit"
                        >
                            <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center group-hover:bg-brand/10 transition-colors">
                                <ChevronLeft size={16} />
                            </div>
                            Back to Orders
                        </Link>
                    </div>

                    {/* Title & Meta Data */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="font-times text-2xl sm:text-3xl md:text-4xl text-foreground mb-2">
                                Order #{order.orderNumber}
                            </h1>
                            <div className="flex items-center gap-3 text-sm text-foreground/70">
                                <span className="bg-foreground/5 px-3 py-1 rounded-full border border-foreground/10">
                                    Placed on {order.date}
                                </span>
                                <span className="hidden md:inline text-foreground/30">|</span>
                                <span className="hidden md:inline">
                                    Total Items: {order.items.length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- MAIN CONTENT GRID --- */}
                <div className="space-y-6 sm:space-y-8">
                    <OrderStatusCard
                        order={uiOrder}
                        onCancel={() => setCancelModalOpen(true)}
                        onReturn={() => setReturnModalOpen(true)}
                    />

                    {order && ["confirmed", "shipped", "out for delivery"].includes(uiOrder.status) && (
                        <TrackingDetailsCard order={order} />
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                        {uiOrder.status === "delivered" && (
                            <div className="lg:col-span-12">
                                {hasReviewed ? (
                                    <div className="border border-foreground/20 rounded-xl p-4 sm:p-5 md:p-6 bg-background/50">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div>
                                                <p className="font-medium text-sm sm:text-base">
                                                    You rated this order
                                                </p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <StarIcon
                                                            key={star}
                                                            className={`size-5 ${star <= Math.round(avgRating)
                                                                ? "text-amber-500 fill-amber-500"
                                                                : "text-gray-300"
                                                                }`}
                                                        />
                                                    ))}
                                                    <span className="ml-2 text-sm text-foreground/70">
                                                        {avgRating.toFixed(1)} / 5
                                                    </span>
                                                </div>
                                                <p className="text-xs text-foreground/60 mt-1">
                                                    Thanks for sharing your feedback
                                                </p>
                                            </div>
                                            <button
                                                onClick={handleViewReviews}
                                                className="text-sm text-brand hover:underline font-medium w-fit"
                                            >
                                                View rating
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border border-foreground/20 rounded-xl p-4 sm:p-5 md:p-6 bg-background/50">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 min-w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                                    <StarIcon className="text-amber-500 fill-amber-500 size-5" />
                                                </div>
                                                <p className="font-medium text-sm sm:text-base">
                                                    How were your ordered items?
                                                </p>
                                            </div>
                                            <CommonButton
                                                className="w-full sm:w-auto sm:max-w-fit"
                                                onClick={handleOpenRateModal}
                                            >
                                                Rate now
                                            </CommonButton>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {/* Address Column */}
                        <div className="lg:col-span-8 flex flex-col gap-8">
                            <AddressDetails
                                shippingAddress={order.shippingAddress}
                                billingAddress={undefined}
                            />
                        </div>

                        {/* Payment/Summary Column (Sticky) */}
                        <div className="lg:col-span-4">
                            <PaymentDetails order={uiOrder} />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MODALS --- */}
            <CancelOrderModal
                open={cancelModalOpen}
                onClose={() => setCancelModalOpen(false)}
                onConfirm={handleCancel}
                isLoading={cancelOrderMutation.isPending}
            />

            <ReturnOrderModal
                open={returnModalOpen}
                onClose={() => setReturnModalOpen(false)}
                onConfirm={handleReturn}
                isLoading={false}
            />
            <RateOrderModal
                open={openRateOrder}
                onClose={() => setOpenRateOrder(false)}
                order={order}
                mode={rateModalMode}
                existingReviews={orderReviews}
            />
        </section>
    );
}
