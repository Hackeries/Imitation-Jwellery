"use client";

import Link from "next/link";
import { COMPANY_INFO } from "@/constants";
import CommonButton from "@/app/components/button/CommonButton";
import CommonInput from "@/app/components/input/CommonInput";
import { useState } from "react";
import SearchDrawer from "./SearchDrawer";
import { useSubscribe } from "@/hooks/use-subscription";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Footer() {
  const [openSearch, setOpenSearch] = useState(false);
  const [email, setEmail] = useState("");
  const subscribeMutation = useSubscribe();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    try {
      const result = await subscribeMutation.mutateAsync({
        email: email.trim(),
      });

      if (result.success) {
        toast.success(result.message);
        setEmail("");
      } else {
        toast.info(result.message);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to subscribe. Please try again.",
      );
    }
  };

  return (
    <>
      <footer className="text-foreground bg-[#fce9ca]/30 border-t border-[#fce9ca]">
        <div className="mx-auto px-3 md:px-8 lg:px-10 py-7 md:py-12 lg:py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-10 md:gap-6 lg:gap-14 max-w-[1560px] mx-auto">
            {/* BRAND & CONTACT */}
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-times mb-4 text-brand">
                {COMPANY_INFO.NAME}
              </h2>
              <p className="text-sm font-normal text-foreground/80 mb-6 leading-relaxed">
                {COMPANY_INFO.DESCRIPTION}
              </p>

              <div className="text-sm text-foreground/80 space-y-3">
                <Link
                  href={`tel:${COMPANY_INFO.PHONE.replace(/\s/g, "")}`}
                  className="flex items-center gap-2 hover:text-brand transition-colors w-fit"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-5 w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                    />
                  </svg>
                  <span>Contact: {COMPANY_INFO.PHONE}</span>
                </Link>
                <Link
                  href={`mailto:${COMPANY_INFO.EMAIL}`}
                  className="flex items-center gap-2 hover:text-brand transition-colors w-fit"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-5 w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                    />
                  </svg>
                  <span>Email: {COMPANY_INFO.EMAIL}</span>
                </Link>
              </div>
            </div>

            {/* OUR COMPANY */}
            <div className="md:text-end flex flex-col h-full">
              <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider">
                OUR COMPANY
              </h4>
              <ul className="space-y-3 text-sm text-foreground/80">
                <li>
                  <Link href="/" className="hover:text-brand transition-colors">
                    Home page
                  </Link>
                </li>
                <li>
                  <Link
                    href="/product-list"
                    className="hover:text-brand transition-colors"
                  >
                    All products
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about-us"
                    className="hover:text-brand transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact-us"
                    className="hover:text-brand transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/wishlist"
                    className="hover:text-brand transition-colors"
                  >
                    Wishlist
                  </Link>
                </li>
              </ul>
            </div>

            {/* CUSTOMER SERVICE */}
            <div className="md:text-end flex flex-col h-full">
              <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider">
                CUSTOMER SERVICE
              </h4>
              <ul className="space-y-3 text-sm text-foreground/80">
                <li>
                  <Link
                    href="/privacy-policy"
                    className="hover:text-brand transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/refund-policy"
                    className="hover:text-brand transition-colors"
                  >
                    Refund Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shipping-policy"
                    className="hover:text-brand transition-colors"
                  >
                    Shipping Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-and-conditions"
                    className="hover:text-brand transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact-info"
                    className="hover:text-brand transition-colors"
                  >
                    Contact Information
                  </Link>
                </li>
              </ul>
            </div>

            {/* SUBSCRIBE COLUMN */}
            <div className="lg:col-span-2 flex flex-col h-full">
              <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider">
                REACH US
              </h4>
              <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                Subscribe/Join Privora today to unlock exclusive offers, early access to new collections & special perks just for you. Don&apos;t miss out on what&apos;s new & early bird deals.
              </p>

              <form className="relative mb-5" onSubmit={handleSubscribe}>
                <CommonInput
                  placeholder="Your email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="!rounded-full pr-[120px] bg-background border-foreground/20 focus:border-brand h-12"
                  disabled={subscribeMutation.isPending}
                  noMargin
                />
                <CommonButton
                  type="submit"
                  variant="primaryBtn"
                  className="h-10 max-w-fit !text-xs absolute right-1 top-1/2 -translate-y-1/2 !px-5 uppercase tracking-wide font-medium rounded-full"
                  disabled={subscribeMutation.isPending}
                >
                  {subscribeMutation.isPending ? (
                    <Loader2 className="animate-spin size-4" />
                  ) : (
                    "Subscribe"
                  )}
                </CommonButton>
              </form>

              {/* SOCIAL LINKS */}
              <div className="flex gap-4">
                <Link
                  href={COMPANY_INFO.INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-background border border-foreground/10 hover:border-brand hover:text-brand transition-all"
                  aria-label="Instagram"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </Link>

                <Link
                  href={`https://wa.me/${COMPANY_INFO.PHONE.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-background border border-foreground/10 hover:border-brand hover:text-brand transition-all"
                  aria-label="WhatsApp"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="text-center py-3 bg-brand text-background text-xs md:text-sm font-normal">
          © 2026 Privora. All rights reserved. Secure shopping experience.
        </div>
      </footer>

      <SearchDrawer open={openSearch} onClose={() => setOpenSearch(false)} />
    </>
  );
}