"use client";

import CommonButton from "@/app/components/button/CommonButton";
import CommonHeading from "@/app/components/CommonHeading";
import CommonProductCard from "@/app/components/CommonProductCard";
import EmptyStateSection from "@/app/components/EmptyStateSection";
import CommonTextarea from "@/app/components/input/CommonTextArea";
import LoginToContinueModal from "@/app/components/LoginToContinue";
import { useState, useMemo } from "react";
import {
  useCart,
  useUpdateCartQuantity,
  useRemoveFromCart,
} from "@/hooks/use-cart";

// static products for recommendation section
const PRODUCTS = [
  {
    id: 1,
    title: "Glossy Heart Stud",
    price: "Rs. 799.00",
    oldPrice: "Rs. 849.00",
    image: "/img/bracelet-img.webp",
  },
  {
    id: 2,
    title: "Interlocking Hoop Earring",
    price: "Rs. 1,299.00",
    oldPrice: "Rs. 1,349.00",
    image: "/img/bracelets.webp",
  },
  {
    id: 3,
    title: "Interlocking Hoop Earring",
    price: "Rs. 1,299.00",
    oldPrice: "Rs. 1,349.00",
    image: "/img/jewelrySet.webp",
  },
  {
    id: 4,
    title: "Interlocking Hoop Earring",
    price: "Rs. 1,299.00",
    oldPrice: "Rs. 1,349.00",
    image: "/img/pendant_old.webp",
  },
  {
    id: 5,
    title: "Interlocking Hoop Earring",
    price: "Rs. 1,299.00",
    oldPrice: "Rs. 1,349.00",
    image: "/img/necklace.webp",
  },
];

export default function CartPage() {
  const [openLogin, setOpenLogin] = useState(false);

  const { data: cart } = useCart();
  const updateQuantity = useUpdateCartQuantity();
  const removeFromCart = useRemoveFromCart();

  // safe cart items array
  const cartItems = useMemo(
    () => (Array.isArray(cart?.items) ? cart!.items : []),
    [cart]
  );

  // calculate subtotal
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = typeof item.price === "number" ? item.price : 0;
      const qty = typeof item.quantity === "number" ? item.quantity : 1;
      return sum + price * qty;
    }, 0);
  }, [cartItems]);

  // shipping is free for now
  const shipping = 0;
  const total = subtotal + shipping;

  const isEmpty = cartItems.length === 0;

  return (
    <>
      <div className="cartPage gradientBg">
        <section className="px-3 md:px-6 lg:px-10 py-7 md:py-12 lg:py-10">
          <div className="max-w-[1560px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* cart items section */}
              <div className="lg:col-span-2">
                <CommonHeading
                  level={1}
                  title="Your Cart"
                  className="text-left"
                />

                {!isEmpty && (
                  <div className="hidden lg:grid grid-cols-[1fr_200px_150px] border-b border-foreground/20 pb-4 mb-8 text-sm font-medium">
                    <span>Product</span>
                    <span className="text-center">Quantity</span>
                    <span className="text-right">Total</span>
                  </div>
                )}

                {!isEmpty && (
                  <div className="space-y-6">
                    {cartItems.map((item) => {
                      const isUpdating = updateQuantity.isPending;
                      const isRemoving = removeFromCart.isPending;

                      return (
                        <div
                          key={item.id}
                          className="flex flex-col lg:grid lg:grid-cols-[1fr_200px_150px] gap-6 border-b border-foreground/20 pb-6"
                        >
                          {/* product info */}
                          <div className="flex gap-6">
                            <img
                              src={item.image || "/placeholder.svg"}
                              alt={item.name || "Product"}
                              className="w-16 h-16 md:w-28 md:h-28 object-cover rounded-md"
                            />

                            <div>
                              <h2 className="text-base md:text-lg font-medium font-times uppercase">
                                {item.name ||
                                  `Product ${String(item.productId).slice(
                                    0,
                                    6
                                  )}`}
                              </h2>

                              {/* mobile price */}
                              <p className="lg:hidden mt-2 text-sm">
                                Rs. {Number(item.price).toFixed(2)}
                              </p>

                              {/* mobile quantity */}
                              <div className="lg:hidden mt-4">
                                <QuantityControl
                                  quantity={item.quantity}
                                  onIncrease={() =>
                                    updateQuantity.mutate({
                                      cartItemId: item.id,
                                      quantity: item.quantity + 1,
                                    })
                                  }
                                  onDecrease={() =>
                                    updateQuantity.mutate({
                                      cartItemId: item.id,
                                      quantity: Math.max(1, item.quantity - 1),
                                    })
                                  }
                                  disabled={isUpdating}
                                />
                              </div>

                              <button
                                onClick={() => removeFromCart.mutate(item.id)}
                                disabled={isRemoving}
                                className="mt-2 text-sm underline text-foreground/70 hover:text-foreground w-fit disabled:opacity-50"
                              >
                                {isRemoving ? "Removing..." : "Remove"}
                              </button>
                            </div>
                          </div>

                          {/* desktop quantity */}
                          <div className="hidden lg:flex justify-center items-center">
                            <QuantityControl
                              quantity={item.quantity}
                              onIncrease={() =>
                                updateQuantity.mutate({
                                  cartItemId: item.id,
                                  quantity: item.quantity + 1,
                                })
                              }
                              onDecrease={() =>
                                updateQuantity.mutate({
                                  cartItemId: item.id,
                                  quantity: Math.max(1, item.quantity - 1),
                                })
                              }
                              disabled={isUpdating}
                            />
                          </div>

                          {/* desktop total */}
                          <div className="hidden lg:flex justify-end items-center font-medium">
                            Rs.{" "}
                            {(Number(item.price) * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* order summary */}
              <div className="lg:sticky lg:top-24 h-fit">
                <div className="border border-foreground/20 rounded-md p-4 md:p-6">
                  <h2 className="text-lg font-semibold mb-6">Order Summary</h2>

                  <CommonTextarea
                    label="Special instructions for seller"
                    name="specialInstruction"
                    placeholder="Write any special requests here"
                    rows={4}
                  />

                  <div className="space-y-4 text-sm mt-6">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>Rs. {subtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? "Free" : shipping}</span>
                    </div>

                    <div className="border-t border-foreground/20 pt-4 flex justify-between font-medium">
                      <span>Total</span>
                      <span>Rs. {total.toFixed(2)}</span>
                    </div>
                  </div>

                  <CommonButton
                    className="mt-5"
                    onClick={() => setOpenLogin(true)}
                    disabled={isEmpty}
                  >
                    Proceed to Checkout
                  </CommonButton>
                </div>
              </div>
            </div>

            {/* empty cart */}
            {isEmpty && (
              <EmptyStateSection
                image="/img/cart.webp"
                title="Your cart is empty"
                description="Looks like you havent added anything yet"
                buttonText="Shop Now"
                buttonHref="/product-list"
              />
            )}
          </div>
        </section>

        {/* recommendations */}
        {!isEmpty && (
          <section className="px-3 md:px-8 lg:px-10 py-10">
            <CommonHeading level={1} title="You May Also Like" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-[1560px] mx-auto">
              {PRODUCTS.map((product) => (
                <CommonProductCard
                  key={product.id}
                  title={product.title}
                  price={product.price}
                  oldPrice={product.oldPrice}
                  image={product.image}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <LoginToContinueModal
        open={openLogin}
        onClose={() => setOpenLogin(false)}
      />
    </>
  );
}

/* quantity buttons component */

function QuantityControl({
  quantity,
  onIncrease,
  onDecrease,
  disabled,
}: {
  quantity: number;
  onIncrease?: () => void;
  onDecrease?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center border border-foreground/20 w-fit">
      <button
        onClick={onDecrease}
        disabled={disabled}
        className="px-3 py-1 text-lg disabled:opacity-50"
      >
        −
      </button>
      <span className="px-4">{quantity}</span>
      <button
        onClick={onIncrease}
        disabled={disabled}
        className="px-3 py-1 text-lg disabled:opacity-50"
      >
        +
      </button>
    </div>
  );
}
