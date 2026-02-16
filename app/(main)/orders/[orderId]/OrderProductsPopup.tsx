"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Image from "next/image";
import { X } from "lucide-react";
import Link from "next/link";
import { getImageUrl } from "@/lib/image-utils";
import { FALLBACK_IMAGE } from "@/constants";

interface OrderItem {
  productId: string;
  productName: string;
  thumbnail: string;
  quantity: number;
  totalPrice: number;
  color?: string;
  size?: string;
}

export default function OrderProductsModal({
  open,
  onClose,
  items = [],
}: {
  open: boolean;
  onClose: () => void;
  items: OrderItem[];
}) {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-end md:items-center justify-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="translate-y-full md:scale-95 md:opacity-0"
            enterTo="translate-y-0 md:scale-100 md:opacity-100"
            leave="ease-in duration-200"
            leaveFrom="translate-y-0 md:scale-100 md:opacity-100"
            leaveTo="translate-y-full md:scale-95 md:opacity-0"
          >
            <Dialog.Panel className="w-full md:max-w-lg bg-background rounded-t-3xl md:rounded-2xl p-5 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <Dialog.Title className="text-lg font-medium">
                  Order Products
                </Dialog.Title>
                <button
                  onClick={onClose}
                  aria-label="Close products modal"
                  className="p-2 rounded-full hover:bg-foreground/10"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                {items.map((product, idx) => (
                  <Link key={idx} href={`/product-details/${product.productId}`} className="block" onClick={onClose}>
                    <div className="border border-foreground/20 rounded-xl p-4 flex gap-4 cursor-pointer transition hover:bg-foreground/5">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-foreground/10">
                        <Image
                          src={getImageUrl(product.thumbnail || FALLBACK_IMAGE)}
                          alt={product.productName}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 text-sm space-y-1">
                        <p className="font-medium">{product.productName}</p>
                        <p className="text-foreground/70">
                          Qty: {product.quantity}
                        </p>
                        <p>
                          Price: <strong>₹{product.totalPrice}</strong>
                        </p>
                        <p className="text-xs text-foreground/60">
                          Seller: Privora
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
