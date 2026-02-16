"use client";

import CommonButton from "@/app/components/button/CommonButton";
import CommonHeading from "@/app/components/CommonHeading";
import CommonProductCard from "@/app/components/CommonProductCard";
import EmptyStateSection from "@/app/components/EmptyStateSection";
import CommonTextarea from "@/app/components/input/CommonTextArea";
import LoginToContinueModal from "@/app/components/LoginToContinue";
import { CartSkeleton } from "@/app/components/skeleton";
import { useState, memo, useEffect } from "react";
import { getImageUrl } from "@/lib/image-utils";
import { useRemoveFromCart, useUpdateCartQuantity } from "@/hooks/use-cart";
import { useCart } from "@/hooks/use-cart";
import { useYouMayAlsoLike } from "@/hooks/use-recommendations";
import { useIsLoggedIn } from "@/hooks/use-auth";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, Tag, Loader2, X } from "lucide-react";
import { FALLBACK_IMAGE } from "@/constants";
import { useApplyCoupon, useRemoveCoupon } from "@/hooks/use-checkout";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { CartItem } from "@/types/index";
import CommonInput from "@/app/components/input/CommonInput";

const CartItemRow = memo(function CartItemRow({ item }: { item: CartItem }) {
  const updateQuantity = useUpdateCartQuantity();
  const removeFromCart = useRemoveFromCart();

  const handleIncrease = () => {
    updateQuantity.mutate({
      productId: item.productId,
      quantity: (item.quantity || item.qty) + 1,
    });
  };

  const handleDecrease = () => {
    updateQuantity.mutate({
      productId: item.productId,
      quantity: Math.max(1, (item.quantity || item.qty) - 1),
    });
  };

  const handleRemove = () => {
    removeFromCart.mutate(item.productId);
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-[1fr_200px_150px] gap-6 border-b border-foreground/20 pb-6 md:pb-6">
      <div className="flex gap-6">
        <div className="w-16 h-16 min-w-16 md:w-28 md:h-28 md:min-w-28 relative rounded-md overflow-hidden border border-foreground/10">
          <Image
            src={getImageUrl(item.image || FALLBACK_IMAGE)}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 7rem, 4rem"
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
            }}
          />
        </div>

        <div>
          <h2 className="text-base md:text-lg font-medium font-times uppercase tracking-wide">{item.name}</h2>

          <p className="lg:hidden mt-2 text-sm">Rs. {(item.price * (item.quantity || item.qty || 1)).toFixed(2)}</p>

          <div className="lg:hidden mt-4">
            <div className="flex items-center border border-foreground/20 w-fit rounded-sm">
              <button
                onClick={handleDecrease}
                className="px-3 py-1 hover:bg-foreground/5"
                disabled={updateQuantity.isPending}>
                −
              </button>
              <span className="px-4 text-sm font-medium">{item.quantity || item.qty}</span>
              <button
                onClick={handleIncrease}
                className="px-3 py-1 hover:bg-foreground/5"
                disabled={updateQuantity.isPending}>
                +
              </button>
            </div>
          </div>

          <button
            onClick={handleRemove}
            disabled={removeFromCart.isPending}
            className="mt-3 md:mt-2 text-xs cursor-pointer underline underline-offset-2 text-foreground/60 hover:text-red-600 transition-colors w-fit">
            {removeFromCart.isPending ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>
      <div className="hidden lg:flex justify-center items-center">
        <div className="flex items-center border border-foreground/20 w-fit rounded-sm">
          <button
            onClick={handleDecrease}
            className="px-4 py-2 text-lg hover:bg-foreground/5 transition"
            disabled={updateQuantity.isPending}>
            −
          </button>
          <span className="px-6 font-medium">{item.quantity || item.qty}</span>
          <button
            onClick={handleIncrease}
            className="px-4 py-2 text-lg hover:bg-foreground/5 transition"
            disabled={updateQuantity.isPending}>
            +
          </button>
        </div>
      </div>

      <div className="hidden lg:flex justify-end items-center font-medium">
        Rs. {(item.price * (item.quantity || item.qty)).toFixed(2)}
      </div>
    </div>
  );
});

export default function CartPage() {
  const [couponCode, setCouponCode] = useState("");
  const router = useRouter();
  const isLoggedIn = useIsLoggedIn();

  useEffect(() => { }, [isLoggedIn]);

  const { data: cart, isLoading } = useCart();
  const { data: recommendations = [] } = useYouMayAlsoLike(5);
  const applyCoupon = useApplyCoupon();
  const removeCoupon = useRemoveCoupon();

  if (!isLoggedIn) {
    return (
      <LoginToContinueModal
        open={true}
        onClose={() => { }}
        forceLoginForm={true}
      />
    );
  }

  const cartId = cart?._id || cart?.id;
  const discount = cart?.discountAmount || 0;

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    if (!cartId) {
      toast.error("Cart not found. Please refresh.");
      return;
    }
    applyCoupon.mutate({
      couponCode: couponCode.toUpperCase(),
      cartId,
    });
  };

  const handleRemoveCoupon = () => {
    if (!cartId) {
      toast.error("Cart not found. Please refresh.");
      return;
    }
    removeCoupon.mutate(cartId);
    setCouponCode("");
  };
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const cartItems = cart?.items ?? [];
  const subtotal = cartItems.reduce(
    (
      sum: number,
      item: {
        price: number;
        quantity?: number;
        qty?: number;
      },
    ) => sum + item.price * (item.quantity || item.qty || 1),
    0,
  );
  const shipping = 0;
  const total = subtotal - discount + shipping;

  const handleCheckout = () => {
    router.push("/checkout");
  };

  if (isLoading) {
    return <CartSkeleton />;
  }

  if (cartItems.length === 0) {
    return (
      <div className="cartPage bg-background min-h-screen">
        <section className="px-3 md:px-6 lg:px-10 py-7 md:py-12 lg:py-10">
          <div className="max-w-[1560px] mx-auto">
            <EmptyStateSection
              image="/img/cart.webp"
              title="Your cart is empty"
              description="Looks like you haven't added anything to your cart yet. Explore our collection and find something you'll love."
              buttonText="Shop Now"
              buttonHref="/product-list"
            />
          </div>
        </section>

        {recommendations.length > 0 && (
          <section className="px-3 md:px-8 lg:px-10 py-7 md:py-12 lg:py-12 bg-white">
            <CommonHeading level={1} title="You May Also Like" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-10 max-w-[1560px] mx-auto">
              {recommendations.map(product => (
                <CommonProductCard
                  key={product.id}
                  productId={product.id}
                  title={product.title}
                  price={product.price}
                  image={product.image}
                  oldPrice={product.oldPrice}
                  tag={product.tag}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="cartPage bg-background min-h-screen">
        <section className="px-3 md:px-6 lg:px-10 py-7 md:py-12 lg:py-10">
          <div className="max-w-[1560px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <CommonHeading level={1} title="Your Cart" className="text-left mb-6" />

                <div className="hidden lg:grid gap-6 grid-cols-[1fr_200px_150px] border-b border-foreground/20 pb-4 mb-6 text-sm font-medium text-foreground/60 uppercase tracking-wider">
                  <span>Product</span>
                  <span className="text-center">Quantity</span>
                  <span className="text-right">Total</span>
                </div>

                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <CartItemRow key={item.id || item.productId} item={item} />
                  ))}
                </div>
              </div>
              <div className="lg:sticky lg:top-24 h-fit">
                <div className="border border-foreground/20 rounded-xl p-6 bg-white shadow-sm">
                  <h2 className="text-lg font-medium font-times mb-6 pb-4 border-b border-foreground/10">
                    Order Summary
                  </h2>

                  <div className="mb-6">
                    <CommonTextarea
                      label="Order Notes (Optional)"
                      name="special Instruction"
                      placeholder="Special instructions for delivery..."
                      rows={3}
                      className="bg-background"
                    />
                  </div>

                  {/* DISCOUNT */}
                  <div className="mb-4">
                    {discount > 0 ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Tag size={16} className="text-green-700" />
                          <div>
                            <p className="text-xs font-bold text-green-700 uppercase">Discount Applied</p>
                            <p className="text-sm text-green-600">You saved Rs. {discount.toFixed(2)}</p>
                          </div>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="p-1 hover:bg-green-100 rounded-full transition-colors"
                          title="Remove Coupon"
                          disabled={removeCoupon.isPending}>
                          {removeCoupon.isPending ? (
                            <Loader2 size={16} className="animate-spin text-green-700" />
                          ) : (
                            <X size={16} className="text-green-700" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <CommonInput
                          placeholder="Discount code"
                          name="discount"
                          value={couponCode}
                          onChange={e => setCouponCode(e.target.value.toUpperCase())}
                          className="uppercase"
                        />
                        <CommonButton
                          variant="secondaryBtn"
                          onClick={handleApplyCoupon}
                          disabled={applyCoupon.isPending || !couponCode}
                          className="!w-auto shrink-0 h-[42px] px-4 text-sm">
                          {applyCoupon.isPending ? <Loader2 size={16} className="animate-spin" /> : "Apply"}
                        </CommonButton>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>Rs. {subtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="text-green-600 font-medium">{shipping === 0 ? "FREE" : `Rs. ${shipping}`}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-Rs. {discount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-foreground/20 pt-4 flex justify-between items-end mb-6">
                    <span className="font-medium text-base">Total</span>
                    <span className="font-bold text-xl">Rs. {total.toFixed(2)}</span>
                  </div>

                  <CommonButton
                    variant="primaryBtn"
                    onClick={handleCheckout}
                    className="w-full py-4 text-sm font-bold tracking-widest uppercase">
                    Proceed to Checkout
                  </CommonButton>

                  <p className="text-xs text-center text-foreground/40 mt-4">
                    Secure Checkout • 256-bit SSL Encryption
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {recommendations.length > 0 && (
          <section className="px-3 md:px-8 lg:px-10 py-7 md:py-12 lg:py-12 bg-white">
            <CommonHeading level={1} title="You May Also Like" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-10 max-w-[1560px] mx-auto">
              {recommendations.map(product => (
                <CommonProductCard
                  key={product.id}
                  productId={product.id}
                  title={product.title}
                  price={product.price}
                  image={product.image}
                  oldPrice={product.oldPrice}
                  tag={product.tag}
                />
              ))}
            </div>
          </section>
        )}
      </div>

    </>
  );
}
