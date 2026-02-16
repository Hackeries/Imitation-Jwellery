"use client";

import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { getImageUrl } from "@/lib/image-utils";
import { FALLBACK_IMAGE } from "@/constants";
import Image from "next/image";
import { X, Loader2 } from "lucide-react";
import CommonButton from "@/app/components/button/CommonButton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCart,
  useUpdateCartQuantity,
  useRemoveFromCart,
  useAddToCart,
} from "@/hooks/use-cart";
import {
  useYouMayAlsoLike,
  type RecommendedProduct,
} from "@/hooks/use-recommendations";
import { toast } from "sonner";
import { CartItem as CartItemType } from "@/types/index";

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};



function RecommendationsSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex gap-4 animate-pulse">
          <div className="w-20 h-20 min-w-20 rounded-lg bg-foreground/5" />
          <div className="flex-1 flex flex-col justify-center space-y-2">
            <div className="h-4 w-3/4 bg-foreground/5 rounded" />
            <div className="h-3 w-1/4 bg-foreground/5 rounded" />
            <div className="h-3 w-1/2 bg-foreground/5 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function DrawerRecommendations() {
  const { data: recommendations, isLoading } = useYouMayAlsoLike(6);
  const addToCart = useAddToCart();

  const handleAddSuggestion = (product: RecommendedProduct) => {
    addToCart.mutate(
      {
        productId: product.id,
        name: product.title,
        price: product.priceNumber,
        image: product.image,
        quantity: 1,
      },
      {
        onSuccess: () => {
          toast.success("Added to Cart", {
            description: `${product.title} has been added.`,
          });
        },
      },
    );
  };

  if (isLoading) {
    return <RecommendationsSkeleton />;
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <p className="text-sm text-foreground/50">
        No recommendations available.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {recommendations.slice(0, 6).map((product) => (
        <SuggestedProduct
          key={product.id}
          product={product}
          onAdd={() => handleAddSuggestion(product)}
        />
      ))}
    </div>
  );
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const router = useRouter();
  const { data: cart, isLoading } = useCart();
  const updateQuantity = useUpdateCartQuantity();
  const removeFromCart = useRemoveFromCart();

  const cartItems = cart?.items ?? [];
  const cartTotal =
    typeof cart?.total === "number" ? cart.total : (cart?.totalAmount ?? 0);

  const cartCount = cartItems.reduce(
    (sum: number, item: CartItemType) => sum + (item.quantity ?? 1),
    0,
  );

  const handleCheckout = () => {
    onClose();
    router.push("/checkout");
  };

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

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 flex justify-end">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="ease-in duration-200"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="w-full max-w-5xl bg-background shadow-xl flex h-full">
                <div className="hidden md:block w-1/2 border-r border-foreground/20 p-6 overflow-y-auto scrollbar-thin">
                  <h3 className="font-times text-lg mb-5 uppercase tracking-wide">
                    You may also like
                  </h3>
                  {open && <DrawerRecommendations />}
                </div>

                <div className="w-full md:w-1/2 p-4 md:p-6 flex flex-col h-full bg-background">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-medium">
                      Cart{" "}
                      <span className="ml-1 text-sm text-foreground/60">
                        ({cartCount})
                      </span>
                    </h3>
                    <button
                      onClick={onClose}
                      aria-label="Close cart"
                      className="p-2 hover:bg-foreground/5 rounded-full transition"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-thin">
                    {isLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex gap-4 animate-pulse">
                            <div className="w-20 h-20 rounded-lg bg-foreground/5" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 w-1/2 bg-foreground/5 rounded" />
                              <div className="h-3 w-1/4 bg-foreground/5 rounded" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : cartItems.length > 0 ? (
                      cartItems.map((item) => (
                        <CartItem
                          key={item.id}
                          title={item.name}
                          price={item.unitPrice}
                          image={item.image}
                          quantity={item.quantity}
                          onUpdateQuantity={(qty) =>
                            updateQuantity.mutate({
                              productId: item.productId,
                              quantity: qty,
                            })
                          }
                          onRemove={() => removeFromCart.mutate(item.productId)}
                        />
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full pb-20">
                        <div className="relative w-32 h-32 opacity-80 mb-4">
                          <Image
                            src={getImageUrl("/img/cart.webp")}
                            alt="Empty Cart"
                            fill
                            className="object-contain"
                          />
                        </div>
                        <p className="text-lg font-medium">
                          Your cart is empty
                        </p>
                        <p className="text-sm text-foreground/60 mt-1">
                          Add items to get started
                        </p>
                        <button
                          onClick={onClose}
                          className="mt-4 text-sm underline underline-offset-4 hover:text-brand"
                        >
                          Continue Shopping
                        </button>
                      </div>
                    )}
                  </div>

                  {cartItems.length > 0 && (
                    <div className="border-t border-foreground/20 pt-5 mt-5 bg-background">
                      <div className="flex justify-between mb-4 text-lg">
                        <span className="font-medium">Total</span>
                        <span className="font-bold">
                          ₹{cartTotal.toFixed(2)}
                        </span>
                      </div>

                      <p className="text-xs text-foreground/60 mb-4 text-center">
                        Shipping & taxes calculated at checkout
                      </p>

                      <CommonButton
                        onClick={handleCheckout}
                        className="w-full justify-center py-4 text-sm tracking-widest"
                      >
                        CHECK OUT
                      </CommonButton>

                      <Link
                        href="/cart"
                        onClick={onClose}
                        className="mt-4 commonLink block text-center mx-auto text-xs font-bold tracking-widest hover:text-brand transition-colors uppercase"
                      >
                        View Cart
                      </Link>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

function SuggestedProduct({
  product,
  onAdd,
}: {
  product: RecommendedProduct;
  onAdd: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const imageSrc = imgError || !product.image ? FALLBACK_IMAGE : product.image;

  return (
    <div className="flex gap-4 group">
      <Link
        href={`/product-details/${product.id}`}
        className="relative w-20 h-20 min-w-20 rounded-lg overflow-hidden bg-foreground/5 border border-foreground/5"
      >
        <Image
          src={getImageUrl(imageSrc)}
          alt={product.title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          onError={() => setImgError(true)}
        />
      </Link>

      <div className="flex flex-col justify-center items-start">
        <Link
          href={`/product-details/${product.id}`}
          className="text-sm font-medium line-clamp-1 hover:text-brand transition-colors"
        >
          {product.title}
        </Link>
        <p className="text-sm text-foreground/70">{product.price}</p>
        <button
          onClick={onAdd}
          className="mt-1 text-xs font-bold uppercase tracking-wider underline underline-offset-4 text-left w-fit hover:text-brand transition-colors"
        >
          + Add
        </button>
      </div>
    </div>
  );
}

function CartItem({
  title,
  price,
  image,
  quantity,
  onUpdateQuantity,
  onRemove,
}: {
  title: string;
  price: number | null | undefined;
  image: string;
  quantity: number;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const safePrice = typeof price === "number" ? price : 0;
  const safeQty = typeof quantity === "number" ? quantity : 1;
  const imageSrc = imgError || !image ? FALLBACK_IMAGE : image;

  return (
    <div className="flex gap-4">
      <div className="relative w-20 h-20 min-w-20 rounded-lg overflow-hidden bg-foreground/5 border border-foreground/5">
        <Image
          src={getImageUrl(imageSrc)}
          alt={title}
          fill
          className="object-cover"
          onError={() => setImgError(true)}
        />
      </div>

      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <p className="text-sm font-medium line-clamp-2 leading-tight">
            {title}
          </p>
          <p className="text-sm text-foreground/70 mt-1 font-medium">
            ₹{(safePrice * safeQty).toFixed(2)}
          </p>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center border border-foreground/20 rounded-full overflow-hidden h-8 w-fit">
            <button
              onClick={() => onUpdateQuantity(Math.max(1, safeQty - 1))}
              className="px-3 h-full hover:bg-foreground/5 transition flex items-center justify-center text-foreground/80"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="px-2 text-sm min-w-[20px] text-center font-medium">
              {safeQty}
            </span>
            <button
              onClick={() => onUpdateQuantity(safeQty + 1)}
              className="px-3 h-full hover:bg-foreground/5 transition flex items-center justify-center text-foreground/80"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            onClick={onRemove}
            className="text-xs font-medium text-red-500 hover:text-red-700 transition underline underline-offset-2"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
