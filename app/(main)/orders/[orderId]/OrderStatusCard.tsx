"use client";

import {
    Truck,
    MoreVertical,
    XCircle,
    RotateCcw,
    Headset,
    Check,
    Package,
    MapPin,
    CheckCircle2,
    RefreshCw,
} from "lucide-react";
import OrderedProduct from "./OrderedProduct";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Link from "next/link";
import { useAdminUpdateOrderStatus } from "@/hooks/use-orders";
import type { OrderStatus } from "@/services/orders-service";
import { toast } from "sonner";
import { getStatusColor } from "@/lib/utils";

interface OrderType {
    id: string;
    orderNumber: string;
    currency: string;
    total: number;
    status: string;
    date: string;
    updatedDate: string;
    items: Array<{
        productId: string;
        productName: string;
        thumbnail: string;
        quantity: number;
        totalPrice: number;
    }>;
}

interface OrderCardProps {
    order: OrderType;
    onCancel: () => void;
    onReturn: () => void;
}

const STATUS_OPTIONS: { id: OrderStatus; label: string }[] = [
    { id: "pending", label: "Pending" },
    { id: "confirmed", label: "Confirmed" },
    { id: "shipped", label: "Shipped" },
    { id: "out_for_delivery", label: "Out for Delivery" },
    { id: "delivered", label: "Delivered" },
    { id: "cancelled", label: "Cancelled" },
    { id: "returned", label: "Returned" },
    { id: "failed", label: "Failed" },
];

const STEPS = [
    { id: "pending", label: "Order Placed", icon: Package },
    { id: "confirmed", label: "Confirmed", icon: CheckCircle2 },
    { id: "shipped", label: "Shipped", icon: Truck },
    { id: "out_for_delivery", label: "Out for Delivery", icon: MapPin },
    { id: "delivered", label: "Delivered", icon: Check },
];

export default function OrderStatusCard({
    order,
    onCancel,
    onReturn,
}: OrderCardProps) {
    const updateStatusMutation = useAdminUpdateOrderStatus();

    const formattedTotal = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: order.currency,
    }).format(order.total);

    const status = order.status.toLowerCase();

    let currentStepIndex = -1;
    if (status === "cancelled" || status === "returned" || status === "failed") {
        currentStepIndex = -1;
    } else {
        currentStepIndex = STEPS.findIndex((s) => s.id === status);
        if (currentStepIndex === -1 && status === "pending") currentStepIndex = 0;
    }

    const isCancelled = status === "cancelled";
    const isReturned = status === "returned";
    const isFailed = status === "failed";
    const isCancelable = status === "pending";
    const isReturnable = status === "delivered";

    const showCancelOption =
        !isReturnable && !isReturned && !isCancelled && !isFailed;

    const handleStatusChange = (newStatus: OrderStatus) => {
        updateStatusMutation.mutate(
            { orderId: order.id, status: newStatus },
            {
                onSuccess: () => {
                    toast.success(`Status updated to ${newStatus.replace(/_/g, " ")}`);
                },
                onError: (error) => {
                    toast.error(
                        error instanceof Error ? error.message : "Failed to update status",
                    );
                },
            },
        );
    };

    return (
        <div className="bg-background border border-foreground/20 rounded-2xl p-6 md:p-8 space-y-8">
            <div className="flex flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div
                        className={`h-12 w-12 min-w-12 rounded-full flex items-center justify-center border ${getStatusColor(
                            status,
                        )}`}
                    >
                        {isCancelled || isFailed ? (
                            <XCircle />
                        ) : isReturned ? (
                            <RotateCcw />
                        ) : (
                            <Truck />
                        )}
                    </div>
                    <div>
                        <div
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize mb-1 ${getStatusColor(
                                status,
                            )}`}
                        >
                            {status.replace(/_/g, " ")}
                        </div>
                        <p className="font-medium text-base md:text-lg">
                            Order #{order.orderNumber}
                        </p>
                        <p className="text-sm text-foreground/70">
                            Placed on: <strong>{order.date}</strong>
                        </p>
                    </div>
                </div>

                <Menu as="div" className="relative">
                    <MenuButton
                        className="h-10 w-10 rounded-full border border-foreground/20 flex items-center justify-center hover:bg-foreground/10 transition"
                        aria-label="Order actions"
                    >
                        <MoreVertical size={18} />
                    </MenuButton>

                    <MenuItems
                        anchor="bottom end"
                        className="mt-2 w-56 rounded-xl border border-foreground/20 bg-background shadow-lg p-1 z-50 focus:outline-none"
                    >
                        {showCancelOption && (
                            <MenuItem>
                                {({ active }) => (
                                    <button
                                        onClick={isCancelable ? onCancel : undefined}
                                        disabled={!isCancelable}
                                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${active && isCancelable ? "bg-foreground/10" : ""
                                            } ${!isCancelable
                                                ? "text-foreground/40 cursor-not-allowed opacity-70"
                                                : "text-red-600"
                                            }`}
                                    >
                                        <XCircle size={16} />
                                        <span>Cancel Order</span>
                                    </button>
                                )}
                            </MenuItem>
                        )}

                        {isReturnable && (
                            <MenuItem>
                                {({ active }) => (
                                    <button
                                        onClick={onReturn}
                                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm ${active ? "bg-foreground/10" : ""
                                            }`}
                                    >
                                        <RotateCcw size={16} />
                                        Return Order
                                    </button>
                                )}
                            </MenuItem>
                        )}

                        <div className="my-1 h-px bg-foreground/20" />

                        <MenuItem>
                            {({ active }) => (
                                <Link
                                    href="/contact-info"
                                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${active ? "bg-foreground/10" : ""
                                        }`}
                                >
                                    <Headset size={16} />
                                    Support & Help
                                </Link>
                            )}
                        </MenuItem>

                        <div className="my-1 h-px bg-foreground/20" />
                        <div className="px-3 py-2">
                            <p className="text-xs text-foreground/50 mb-2 flex items-center gap-1">
                                <RefreshCw size={12} /> Change Status (Testing)
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {STATUS_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleStatusChange(opt.id)}
                                        disabled={
                                            updateStatusMutation.isPending || status === opt.id
                                        }
                                        className={`text-xs px-2 py-1 rounded-md transition-colors ${status === opt.id
                                                ? "bg-brand text-background"
                                                : "bg-foreground/10 hover:bg-foreground/20 disabled:opacity-50"
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </MenuItems>
                </Menu>
            </div>

            <OrderedProduct
                orderNumber={order.orderNumber}
                items={order.items}
                total={formattedTotal}
            />

            {!isCancelled && !isReturned && !isFailed && (
                <div className="w-full py-4 md:py-6 overflow-x-auto">
                    <div className="min-w-[600px] md:min-w-full relative">
                        <div className="absolute top-[20px] left-0 w-full h-1 bg-gray-200 z-0 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-brand transition-all duration-500 ease-in-out"
                                style={{
                                    width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%`,
                                }}
                            />
                        </div>

                        <div className="flex items-start justify-between relative z-10">
                            {STEPS.map((step, index) => {
                                const isCompleted = index <= currentStepIndex;
                                const isCurrent = index === currentStepIndex;
                                const Icon = step.icon;

                                return (
                                    <div
                                        key={step.id}
                                        className="flex flex-col items-center gap-2 md:gap-3 w-20 md:w-24"
                                    >
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-background ${isCompleted
                                                    ? "border-brand bg-brand text-background shadow-md"
                                                    : "border-gray-200 text-gray-300"
                                                }`}
                                        >
                                            <Icon size={18} />
                                        </div>
                                        <div className="text-center">
                                            <p
                                                className={`text-xs md:text-sm font-medium transition-colors ${isCompleted ? "text-foreground" : "text-foreground/40"
                                                    }`}
                                            >
                                                {step.label}
                                            </p>
                                            {isCurrent && (
                                                <p className="text-[10px] md:text-xs text-brand font-medium mt-0.5">
                                                    {order.updatedDate || "Today"}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {isCancelled && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center border border-red-100">
                    This order has been cancelled.
                </div>
            )}
            {isReturned && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center border border-red-100">
                    This order has been returned.
                </div>
            )}
            {isFailed && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center border border-red-100">
                    Payment for this order failed.
                </div>
            )}
        </div>
    );
}
