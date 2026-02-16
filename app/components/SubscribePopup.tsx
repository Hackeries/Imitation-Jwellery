"use client";

import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, CheckCircle } from "lucide-react";
import CommonButton from "@/app/components/button/CommonButton";
import CommonInput from "@/app/components/input/CommonInput";
import { subscribeNewsletter } from "@/services/subscription-service";
import { toast } from "sonner";

type SubscribePopupProps = {
  open: boolean;
  onClose: () => void;
};

export default function SubscribePopup({ open, onClose }: SubscribePopupProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [couponCode, setCouponCode] = useState<string | null>(null);

  const handleSubscribe = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }

    setLoading(true);
    try {
      const result = await subscribeNewsletter({ email });

      setIsSuccess(true);
      setCouponCode(result.couponCode || null);

      if (typeof window !== "undefined") {
        localStorage.setItem("isSubscribed", "true");
        localStorage.setItem("hasSeenSubscribePopup", "true");
      }

      toast.success(result.message);

      setTimeout(() => {
        onClose();
      }, 4000);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to subscribe",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAfterLeave = () => {
    setEmail("");
    setIsSuccess(false);
    setCouponCode(null);
  };

  return (
    <Transition appear show={open} as={Fragment} afterLeave={handleAfterLeave}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="flex h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95 translate-y-4"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-4"
            >
              <Dialog.Panel className="w-full max-w-md bg-[#fffaf2] rounded-2xl p-6 relative shadow-2xl border-4 border-white">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 p-2 rounded-full hover:bg-black/5 transition-colors z-10"
                  aria-label="Close popup"
                >
                  <X size={20} className="text-foreground/60" />
                </button>

                {isSuccess ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                      <CheckCircle size={32} />
                    </div>
                    <Dialog.Title className="text-2xl font-serif font-bold mb-2 text-brand">
                      You&apos;re on the list!
                    </Dialog.Title>
                    <p className="text-foreground/70 mb-6 text-sm">
                      Thank you for subscribing. Keep an eye on your inbox.
                    </p>
                    {couponCode && (
                      <div className="bg-white border-2 border-brand/20 border-dashed p-4 rounded-xl mt-4">
                        <p className="text-xs text-brand uppercase font-bold mb-2 tracking-widest">
                          Use Code at Checkout:
                        </p>
                        <div className="bg-brand/5 py-2 px-4 rounded text-2xl font-mono font-bold text-brand tracking-wider">
                          {couponCode}
                        </div>
                        <p className="text-[10px] text-foreground/50 mt-2">
                          *Valid for orders above ₹300
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-2">
                    <div className="mb-6 text-center">
                      <p className="font-serif text-3xl text-brand mb-1">
                        Privora
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/40">
                        Jewelry
                      </p>
                    </div>

                    <div className="text-center mb-6">
                      <Dialog.Title className="text-xl font-medium mb-1">
                        Join Our Newsletter
                      </Dialog.Title>

                      <p className="text-4xl font-bold text-brand my-3">
                        Get 10% OFF
                      </p>

                      <p className="text-sm text-foreground/70 leading-relaxed max-w-[80%] mx-auto">
                        Sign up to get the latest on sales, new releases and
                        more.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <CommonInput
                        placeholder="Enter your email address"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        noMargin
                        className="bg-white h-12"
                        disabled={loading}
                      />

                      <CommonButton
                        className="w-full h-12 uppercase tracking-widest text-sm font-semibold"
                        onClick={handleSubscribe}
                        disabled={loading}
                      >
                        {loading ? "Joining..." : "Subscribe Now"}
                      </CommonButton>

                      <p className="text-[10px] text-center text-foreground/40 mt-3">
                        By subscribing you agree to our Terms & Conditions.
                      </p>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
