"use client";

import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Edit2, Loader2 } from "lucide-react";
import CommonButton from "@/app/components/button/CommonButton";
import CommonInput from "@/app/components/input/CommonInput";
import OTPInput from "react-otp-input";
import { useRequestOtp, useVerifyOtp, useUserProfile } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";

type Props = {
  open: boolean;
  onClose: () => void;
  redirectTo?: string;
  onSuccess?: () => void;
  forceLoginForm?: boolean;
};

type requestWithOtp = { success: boolean; message: string; otp?: string }

export default function LoginToContinueModal({
  open,
  onClose,
  redirectTo,
  onSuccess,
  forceLoginForm = false,
}: Props) {
  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const router = useRouter();
  const pathname = usePathname();
  const { data: user } = useUserProfile();
  const requestOtpMutation = useRequestOtp();
  const verifyOtpMutation = useVerifyOtp();

  const isLoggedIn = !forceLoginForm && !!user && !!user._id && user._id !== "guest";

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSmartRedirect = () => {
    if (onSuccess) {
      onSuccess();
      return;
    }

    if (redirectTo) {
      router.push(redirectTo);
      return;
    }

    if (pathname.includes("/sign-in") || pathname.includes("/login")) {
      router.push("/");
      return;
    }

    router.refresh();
  };

  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!mobile || mobile.length < 10) {
      toast.error("Please enter a valid mobile number");
      return;
    }

    setIsLoading(true);
    try {
      const result: requestWithOtp = await requestOtpMutation.mutateAsync(mobile);
      setStep("otp");
      setResendTimer(20);
      if (result.otp) {
        toast.success(`OTP sent! (Dev: ${result.otp})`);
      } else {
        toast.success("OTP sent successfully");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send OTP",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      const result: requestWithOtp = await requestOtpMutation.mutateAsync(mobile);
      setResendTimer(20);
      if (result.otp) {
        toast.success(`OTP resent! (Dev: ${result.otp})`);
      } else {
        toast.success("OTP resent successfully");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to resend OTP",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      toast.error("Please enter a valid OTP");
      return;
    }

    setIsLoading(true);
    try {
      await verifyOtpMutation.mutateAsync({ mobile, otp });

      toast.success("Welcome back!", {
        description: "You have successfully logged in.",
      });

      onClose();
      handleSmartRedirect();
    } catch (error) {
      toast.error("Login failed", {
        description: error instanceof Error ? error.message : "Invalid OTP",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditNumber = () => {
    setStep("mobile");
    setOtp("");
    setResendTimer(0);
  };

  const resetAndClose = () => {
    setStep("mobile");
    setMobile("");
    setOtp("");
    setResendTimer(0);
    onClose();
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[60]" onClose={resetAndClose}>
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

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95 translate-y-4"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100 translate-y-0"
            leaveTo="opacity-0 scale-95 translate-y-4"
          >
            <Dialog.Panel className="w-full max-w-[400px] bg-background rounded-xl shadow-2xl overflow-hidden relative mx-2">
              <button
                onClick={resetAndClose}
                className="absolute right-3 top-3 sm:right-4 sm:top-4 p-1 rounded-full hover:bg-foreground/10 transition-colors z-10"
                aria-label="Close modal"
              >
                <X size={20} className="text-foreground/50" />
              </button>

              <div className="p-5 sm:p-8 flex flex-col items-center justify-center gap-6 sm:gap-8">
                {isLoggedIn ? (
                  <div className="text-center w-full">
                    <h1 className="font-times text-3xl text-center mb-6">Privora</h1>
                    <h3 className="text-lg font-medium mb-2">Continue as</h3>
                    <p className="text-brand font-medium text-lg mb-6">
                      {user?.fullName || user?.mobile}
                    </p>
                    <CommonButton
                      variant="primaryBtn"
                      onClick={() => {
                        onClose();
                        handleSmartRedirect();
                      }}
                      className="w-full"
                    >
                      Continue
                    </CommonButton>
                  </div>
                ) : (
                  <>
                    <h1 className="font-times text-3xl text-center">Privora</h1>

                    <div className="flex flex-col gap-1 w-full text-center">
                      <h6 className="w-full text-lg text-foreground font-medium">
                        {step === "otp" ? "Verify OTP" : "Welcome Back"}
                      </h6>
                      <p className="text-sm text-foreground/70">
                        {step === "otp"
                          ? "Enter the OTP sent to your mobile number"
                          : "Sign in to view your orders, wishlist, and exclusive offers."}
                      </p>
                    </div>

                    <div className="w-full">
                      {step === "mobile" ? (
                        <form onSubmit={handleRequestOtp}>
                          <CommonInput
                            label="Mobile Number"
                            name="mobile"
                            type="tel"
                            placeholder="Enter your mobile number"
                            value={mobile}
                            onChange={(e) =>
                              setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                            }
                          />
                        </form>
                      ) : (
                        <div className="otpInputWrap flex flex-col items-center">
                          <div className="flex items-center justify-center gap-2 mb-4 text-sm bg-foreground/5 py-2 px-4 rounded-full">
                            <span className="font-medium">+91 {mobile}</span>
                            <button
                              type="button"
                              onClick={handleEditNumber}
                              className="text-brand hover:opacity-80"
                              aria-label="Edit mobile number"
                              title="Edit mobile number"
                            >
                              <Edit2 size={16} />
                            </button>
                          </div>

                          <OTPInput
                            value={otp}
                            onChange={setOtp}
                            numInputs={4}
                            renderSeparator={<span className="mx-1"> </span>}
                            renderInput={(props) => (
                              <input
                                {...props}
                                className="w-12 h-12 border border-gray-300 rounded-lg text-center text-lg focus:border-brand outline-none transition-all"
                              />
                            )}
                          />

                          <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={isLoading || resendTimer > 0}
                            className="mt-6 text-sm font-medium text-brand hover:underline disabled:opacity-50"
                          >
                            {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                          </button>
                        </div>
                      )}
                    </div>

                    <CommonButton
                      variant="primaryBtn"
                      className="w-full"
                      onClick={step === "otp" ? handleVerifyOtp : handleRequestOtp}
                      disabled={isLoading}
                    >
                      {isLoading ? "Please wait..." : step === "otp" ? "Verify OTP" : "Continue"}
                    </CommonButton>
                  </>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
