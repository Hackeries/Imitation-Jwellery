"use client";

import { getImageUrl } from "@/lib/image-utils";
import Image from "next/image";
import Link from "next/link";
import { FALLBACK_IMAGE } from "@/constants";

interface OrderItem {
    productId: string;
    productName: string;
    thumbnail: string;
    quantity: number;
    totalPrice: number;
}

interface OrderedProductProps {
    orderNumber: string;
    items: OrderItem[];
    total: string;
}

export default function OrderedProduct({
    orderNumber,
    items,
    total,
}: OrderedProductProps) {
    return (
        <div>
            <div className="divide-y divide-foreground/10">
                {items.map((product, idx) => (
                    <Link
                        key={idx}
                        href={`/product-details/${product.productId}`}
                        className="block"
                    >
                        <div className="flex gap-4 py-4 md:py-6 hover:bg-foreground/5 rounded-lg transition px-4 -mx-4 items-center">
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-foreground/5 border border-foreground/10 shrink-0">
                                <Image
                                    src={getImageUrl(product.thumbnail || FALLBACK_IMAGE)}
                                    alt={product.productName}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <div className="flex-1 min-w-0 text-sm">
                                <p className="font-medium truncate">{product.productName}</p>
                                <p className="text-foreground/60 mt-0.5">
                                    Qty: {product.quantity}
                                </p>
                                <p className="font-medium mt-1">
                                    ₹{product.totalPrice.toLocaleString("en-IN")}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="flex justify-between items-center pt-6 mt-4 border-t border-foreground/10">
                <span className="text-sm text-foreground/70">
                    {items.length} item{items.length !== 1 ? "s" : ""}
                </span>
                <span className="font-semibold text-lg">{total}</span>
            </div>
        </div>
    );
}
