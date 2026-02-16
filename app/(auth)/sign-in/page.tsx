"use client";

import CommonButton from "@/app/components/button/CommonButton";
import CommonInput from "@/app/components/input/CommonInput";

import React, { useState, useEffect, Suspense } from "react";
import OTPInput from "react-otp-input";
import { Edit2, Loader2 } from "lucide-react";
import LoginBackground from "./LoginBackground";
import { useRequestOtp, useVerifyOtp } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

function SignInLoading() {
  return (
    <section className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-brand" size={40} />
    </section>
  );
}

type requestWithOtp = { success: boolean; message: string; otp?: string }

export default function SignIn() {
  return (
    <Suspense fallback={<SignInLoading />}>
      <SignInContent />
    </Suspense>
  );
}

function SignInContent() {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const router = useRouter();
  const searchParams = useSearchParams();
  const requestOtpMutation = useRequestOtp();
  const verifyOtpMutation = useVerifyOtp();

  const callbackUrl = searchParams.get("callbackUrl") || "/";

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleRequestOtp = async () => {
    if (!mobile || mobile.length < 10) {
      toast.error("Please enter a valid mobile number");
      return;
    }

    setIsLoading(true);
    try {
      const result: requestWithOtp = await requestOtpMutation.mutateAsync(mobile);
      setShowOtp(true);
      setResendTimer(20);

      if (result.otp) {
        toast.success(`OTP sent! (Dev mode: ${result.otp})`, {
          duration: 10000,
        });
      } else {
        toast.success("OTP sent to your mobile number");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send OTP"
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

      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      toast.error("Login failed", {
        description: error instanceof Error ? error.message : "Invalid OTP",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditNumber = () => {
    setShowOtp(false);
    setOtp("");
    setResendTimer(0);
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      const result: requestWithOtp = await requestOtpMutation.mutateAsync(mobile);
      setResendTimer(20);
      if (result.otp) {
        toast.success(`OTP resent! (Dev mode: ${result.otp})`, {
          duration: 10000,
        });
      } else {
        toast.success("OTP resent successfully");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to resend OTP"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative z-10 py-20 px-10 min-h-screen flex items-center justify-center authPageWrap">
      <LoginBackground />
      <div className="signInCard bg-background p-8 w-96 flex flex-col items-center justify-center gap-8">
        <h1 className="font-times text-3xl text-center">Privora</h1>

        <div className="flex flex-col gap-1 w-full text-center">
          <h6 className="w-full text-lg text-foreground font-medium">
            {showOtp ? "Verify OTP" : "Welcome Back"}
          </h6>
          <p className="text-sm text-foreground/70">
            {showOtp
              ? "Enter the OTP sent to your mobile number"
              : "Sign in to view your orders, wishlist, and exclusive offers."}
          </p>
        </div>

        <div className="w-full">
          {!showOtp ? (
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
          onClick={showOtp ? handleVerifyOtp : handleRequestOtp}
          disabled={isLoading}
        >
          {isLoading ? "Please wait..." : showOtp ? "Verify OTP" : "Continue"}
        </CommonButton>
      </div>
    </section>
  );
}
