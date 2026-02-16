"use client";

import Image from "next/image";
import { getImageUrl } from "@/lib/image-utils";
import CommonHeading from "@/app/components/CommonHeading";
import CommonInput from "@/app/components/input/CommonInput";
import CommonButton from "@/app/components/button/CommonButton";
import { CheckoutSkeleton } from "@/app/components/skeleton";
import { CheckCircle, Plus, Loader2, X, Tag, LockKeyhole, AlertCircle } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useAddresses } from "@/hooks/use-address";
import { useUserProfile, isAuthenticated } from "@/hooks/use-auth";
import { useCreateOrder, useApplyCoupon, useRemoveCoupon } from "@/hooks/use-checkout";
import { usePaymentGateway } from "@/hooks/use-payments";
import { useOrders } from "@/hooks/use-orders";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import AddAddressModal from "@/app/(main)/account/AddAddressModal";
import AuthGuard from "@/app/components/AuthGuard";
import { triggerLoginRequired } from "@/lib/auth-events";
import { validatePincode } from "@/services/pincode-service";

interface AddressRadioProps {
  title: string;
  address: string;
  meta: string;
  checked?: boolean;
  onChange?: () => void;
}

interface CartItemProps {
  title: string;
  price: number;
  image: string;
  quantity: number;
}

function AddressRadio({ title, address, meta, checked, onChange }: AddressRadioProps) {
  return (
    <label
      className={`block border rounded-xl p-4 cursor-pointer transition-all ${checked ? "border-brand bg-brand/5 ring-1 ring-brand" : "border-foreground/20 hover:border-foreground/40"
        }`}>
      <div className="flex gap-4 items-start">
        <div
          className={`mt-1 w-4 h-4 rounded-full border flex items-center justify-center ${checked ? "border-brand" : "border-foreground/40"
            }`}>
          {checked && <div className="w-2 h-2 rounded-full bg-brand" />}
        </div>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-sm text-foreground/70 leading-relaxed">{address}</p>
          <p className="text-xs text-foreground/50 mt-1 uppercase tracking-wide">{meta}</p>
        </div>
      </div>
      <input type="radio" checked={checked} onChange={onChange} className="hidden" />
    </label>
  );
}

function CartItem({ title, price, image, quantity }: CartItemProps) {
  return (
    <div className="flex gap-3 items-center">
      <div className="relative w-16 h-16 bg-foreground/5 rounded-lg overflow-hidden border border-foreground/10 shrink-0">
        <Image src={getImageUrl(image)} alt={title} fill className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate pr-2">{title}</p>
        <p className="text-xs text-foreground/60 mb-1">Qty: {quantity}</p>
        <p className="text-sm font-medium">₹{(price * quantity).toFixed(2)}</p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const [userSelectedId, setUserSelectedId] = useState<string>("");
  const [couponCode, setCouponCode] = useState("");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const [isPaymentInitiated, setIsPaymentInitiated] = useState(false);
  const [pincodeError, setPincodeError] = useState("");
  const [isValidatingPincode, setIsValidatingPincode] = useState(false);

  const { data: user, isLoading: isUserLoading } = useUserProfile();
  const { data: addresses, isLoading: isAddressesLoading } = useAddresses();
  const { data: cart, isLoading: isCartLoading } = useCart();
  const { data: orders, isLoading: isOrdersLoading } = useOrders();

  const createOrder = useCreateOrder();
  const applyCoupon = useApplyCoupon();
  const removeCoupon = useRemoveCoupon();
  const { processPayment, isProcessing: isPaymentProcessing } = usePaymentGateway();

  const cartId = cart?._id || cart?.id;

  useEffect(() => {
    if (!isCartLoading && (!cart || cart.items.length === 0) && !isOrdersLoading) {
      const pendingOrder = orders?.find(order => order.status.toLowerCase() === "pending");
      if (pendingOrder) {
        router.push(`/payment-pending?orderId=${pendingOrder.id}&orderNumber=${pendingOrder.orderNumber}`);
      }
    }
  }, [isCartLoading, cart, isOrdersLoading, orders, router]);

  const subtotal = cart?.subtotalAmount || 0;
  const discount = cart?.discountAmount || 0;
  const shipping = cart?.shippingAmount || 0;
  const total = cart?.totalAmount || 0;

  const displayTotal = total > 0 ? total : Math.max(0, subtotal - discount + shipping);

  const activeAddressId = useMemo(() => {
    if (userSelectedId) return userSelectedId;
    if (addresses && addresses.length > 0) {
      return addresses.find(a => a.isDefault)?._id || addresses[0]._id;
    }
    return "";
  }, [addresses, userSelectedId]);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    if (!cartId) return;
    applyCoupon.mutate({ couponCode: couponCode.toUpperCase(), cartId });
  };

  const handleRemoveCoupon = () => {
    if (!cartId) return;
    removeCoupon.mutate(cartId);
    setCouponCode("");
  };

  const handlePlaceOrder = async () => {
    if (!activeAddressId) {
      toast.error("Please select a shipping address");
      return;
    }
    if (!cartId) return;

    const selectedAddress = addresses?.find(a => a._id === activeAddressId);

    if (!selectedAddress?.pincode) {
      toast.error("Address pincode is missing");
      return;
    }

    setPincodeError("");
    setIsValidatingPincode(true);

    try {
      const pincodeValidation = await validatePincode(selectedAddress.pincode);

      if (!pincodeValidation.success) {
        setPincodeError(pincodeValidation.message);
        setIsValidatingPincode(false);
        toast.error(pincodeValidation.message);
        return;
      }

      setIsValidatingPincode(false);
      const response = await createOrder.mutateAsync({
        cartId,
        addressId: activeAddressId,
        email: user?.email || `${user?.mobile || selectedAddress?.mobile || "guest"}@privora.in`,
        fullName: user?.fullName || selectedAddress?.fullName,
        mobile: user?.mobile || selectedAddress?.mobile,
      });

      if (response) {
        setIsPaymentInitiated(true);

        if (response.redirectUrl && !response.paymentSessionId) {
          window.location.href = response.redirectUrl;
        } else if (response.paymentSessionId) {
          await processPayment({ paymentSessionId: response.paymentSessionId });
        } else if (response.redirectUrl) {
          window.location.href = response.redirectUrl;
        } else if (response.orderId) {
          router.push(`/payment-pending?orderId=${response.orderId}&orderNumber=${response.orderNumber}`);
        } else {
          toast.error("Payment initialization failed. Please try again.");
        }
      }
    } catch (error: unknown) {
      setIsPaymentInitiated(false);
      let msg = "Failed to create order";
      if (error instanceof Error) msg = error.message;
      if (msg.toLowerCase().includes("missing customerid") || msg.toLowerCase().includes("customerid")) {
        triggerLoginRequired();
      } else {
        toast.error(msg);
      }
    }
  };

  if (isUserLoading || isCartLoading || isAddressesLoading || isOrdersLoading) {
    return <CheckoutSkeleton />;
  }

  if (isPaymentInitiated) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <LockKeyhole className="text-brand w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2 text-center">Contacting Bank...</h2>
        <p className="text-foreground/60 text-center max-w-md mb-8">
          We are securely connecting you to complete your payment.
          <br />
          Please do not close this window or press back.
        </p>
        <div className="flex items-center gap-3 text-sm font-medium text-brand bg-brand/5 px-6 py-3 rounded-full border border-brand/20">
          <Loader2 className="animate-spin" size={18} />
          Redirecting...
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    if (createOrder.isSuccess) {
      router.replace("/account?tab=orders");
      return null;
    }

    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-foreground/60">Your cart is empty.</p>
        <CommonButton href="/product-list">Continue Shopping</CommonButton>
      </div>
    );
  }

  return (
    <AuthGuard>
    <div className="bg-[#fffaf2] min-h-screen">
      <div className="max-w-[1560px] mx-auto px-4 md:px-8 py-8 md:py-12">
        <CommonHeading title="Checkout" className="text-left mb-8" level={1} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-5 sm:space-y-8">
            {/* Address Section */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-foreground/5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base sm:text-lg font-semibold">Shipping Address</h2>
                <button
                  onClick={() => setIsAddressModalOpen(true)}
                  className="text-sm text-brand font-medium hover:underline flex items-center gap-1">
                  <Plus size={16} /> Add New
                </button>
              </div>

              <div className="space-y-3">
                {addresses && addresses.length > 0 ? (
                  addresses.map(addr => (
                    <AddressRadio
                      key={addr._id}
                      title={addr.fullName}
                      address={`${addr.line1}, ${addr.city}, ${addr.state} ${addr.pincode}`}
                      meta={`${addr.country}`}
                      checked={activeAddressId === addr._id}
                      onChange={() => {
                        setUserSelectedId(addr._id);
                        setPincodeError("");
                      }}
                    />
                  ))
                ) : (
                  <p className="text-sm text-foreground/50 italic">No addresses found. Please add one.</p>
                )}
              </div>

              {pincodeError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle size={18} className="text-red-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium text-red-900 text-sm">Delivery Not Available</h4>
                    <p className="text-red-700 text-sm mt-1">{pincodeError}</p>
                    <p className="text-red-600 text-xs mt-2">
                      Please select a different address or add a new one with a serviceable pincode.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Section */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-foreground/5">
              <h2 className="text-base sm:text-lg font-semibold mb-4">Payment</h2>
              <label className="block border border-brand bg-brand/5 rounded-xl p-4 cursor-pointer relative overflow-hidden ring-1 ring-brand">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">Secure Online Payment</span>
                  <CheckCircle size={20} className="text-brand" />
                </div>
                <p className="text-xs text-foreground/60 mt-1">UPI, Netbanking, Cards, Wallets</p>
              </label>
            </div>
          </div>

          {/* Right Column (Summary) */}
          <div className="lg:col-span-1">
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-foreground/5 sticky top-24">
              <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Order Summary</h2>

              <div className="max-h-60 overflow-y-auto pr-2 space-y-4 mb-6 scrollbar-thin">
                {cart.items.map((item) => (
                  <CartItem
                    key={item.id || item.productId}
                    title={item.name}
                    price={item.price}
                    image={item.image}
                    quantity={item.quantity || item.qty}
                  />
                ))}
              </div>

              <div className="mb-6">
                {discount > 0 ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-green-700" />
                      <div>
                        <p className="text-xs font-bold text-green-700 uppercase">Discount Applied</p>
                        <p className="text-sm text-green-600">You saved ₹{discount.toFixed(2)}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="p-1 hover:bg-green-100 rounded-full transition-colors"
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
                      name="couponCode"
                      placeholder="Coupon Code"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      noMargin
                      className="uppercase"
                    />
                    <CommonButton
                      variant="secondaryBtn"
                      onClick={handleApplyCoupon}
                      disabled={applyCoupon.isPending || !couponCode}
                      className="!w-auto shrink-0 h-10.5 px-4 text-sm">
                      {applyCoupon.isPending ? <Loader2 size={16} className="animate-spin" /> : "APPLY"}
                    </CommonButton>
                  </div>
                )}
              </div>

              <div className="space-y-3 text-sm border-t border-foreground/10 pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-foreground/70">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Shipping</span>
                  <span className="font-medium">{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-end border-t border-foreground/10 pt-4 mb-6">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-xl">₹{displayTotal.toFixed(2)}</span>
              </div>

              <CommonButton
                className={pincodeError ? "w-full py-4 uppercase tracking-widest font-bold text-sm bg-[#8d6e63] opacity-60 cursor-not-allowed text-white" : "w-full py-4 uppercase tracking-widest font-bold text-sm"}
                onClick={handlePlaceOrder}
                disabled={!!pincodeError || createOrder.isPending || isPaymentInitiated || isPaymentProcessing || isValidatingPincode}>
                {isValidatingPincode ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    Verifying Address...
                  </span>
                ) : !!pincodeError ? (
                  "Delivery Not Available"
                ) : createOrder.isPending || isPaymentInitiated || isPaymentProcessing ? (
                  "Processing..."
                ) : (
                  "PAY NOW"
                )}
              </CommonButton>
            </div>
          </div>
        </div>
      </div>

      <AddAddressModal open={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} />
    </div>
    </AuthGuard>
  );
}
