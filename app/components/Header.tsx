"use client";

import {
  Dialog,
  DialogPanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { ChevronDownIcon, LogIn, LogOut, MenuIcon, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import SubscribePopup from "./SubscribePopup";
import SearchPopup from "./SearchPopup";
import { useCartCount } from "@/hooks/use-cart";
import { useWishlistCount } from "@/hooks/use-wishlist";
import { useUserProfile } from "@/hooks/use-auth";
import { usePathname, useRouter } from "next/navigation";

/**
 * Fully functional Header with strict types.
 * - Counters update live via custom events from hooks.
 * - No `any` usage; type guards for union hook return types.
 * - Sign-in/out works:  if your use-auth doesn't export a sign-out hook, we call POST /api/auth/sign-out.
 * - Category links now use dynamic routes (/pendant, /necklace, etc.)
 */

type QueryNumber = { data: number };
const isQueryNumber = (val: unknown): val is QueryNumber =>
  typeof val === "object" &&
  val !== null &&
  "data" in (val as Record<string, unknown>) &&
  typeof (val as Record<string, unknown>).data === "number";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [openSubscribe, setOpenSubscribe] = useState(false);

  const cartCountHook = useCartCount() as unknown;
  const wishlistCountHook = useWishlistCount() as unknown;
  const { data: userProfile } = useUserProfile();
  const router = useRouter();
  const pathname = usePathname();

  // Safely derive numbers whether hooks return a number or { data: number }
  const cartCount = useMemo(() => {
    if (typeof cartCountHook === "number") return cartCountHook;
    if (isQueryNumber(cartCountHook)) return cartCountHook.data;
    return 0;
  }, [cartCountHook]);

  const wishlistCount = useMemo(() => {
    if (typeof wishlistCountHook === "number") return wishlistCountHook;
    if (isQueryNumber(wishlistCountHook)) return wishlistCountHook.data;
    return 0;
  }, [wishlistCountHook]);

  const isAuthenticated = !!userProfile;

  const handleMobileLinkClick = () => setMobileMenuOpen(false);
  const handleOpenSearch = () => setOpenSearch(true);
  const handleCloseSearch = () => setOpenSearch(false);
  const handleOpenSubscribe = () => setOpenSubscribe(true);
  const handleCloseSubscribe = () => setOpenSubscribe(false);

  const onSignInClick = useCallback(() => {
    const redirect = encodeURIComponent(pathname || "/");
    router.push(`/sign-in?redirect=${redirect}`);
    setMobileMenuOpen(false);
  }, [router, pathname]);

  const onSignOutClick = useCallback(async () => {
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
    } catch {
      // ignore
    } finally {
      setMobileMenuOpen(false);
      router.refresh();
      router.push("/");
    }
  }, [router]);

  return (
    <>
      {/* Promo Marquee */}
      <div className="group overflow-hidden bg-brand">
        <div
          className="flex w-max gap-20 px-8 py-2. 5 whitespace-nowrap animate-marquee"
          aria-label="Promotions"
        >
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-20">
              <p className="uppercase text-xs font-normal text-background">
                Buy any 3 Products, get 20% off{" "}
                <Link href="/necklace" className="underline underline-offset-2">
                  Shop Now
                </Link>
              </p>
              <p className="uppercase text-xs font-normal text-background">
                Buy any 3 Products, get 20% off{" "}
                <Link href="/earring" className="underline underline-offset-2">
                  Shop Now
                </Link>
              </p>
              <p className="uppercase text-xs font-normal text-background">
                Buy any 3 Products, get 20% off{" "}
                <Link href="/pendant" className="underline underline-offset-2">
                  Shop Now
                </Link>
              </p>
              <p className="uppercase text-xs font-normal text-background">
                Buy any 3 Products, get 20% off{" "}
                <Link href="/bracelet" className="underline underline-offset-2">
                  Shop Now
                </Link>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="headerWrap sticky top-0 left-0 w-full h-fit bg-[#fce9ca] px-3 md:px-6 py-2 md:py-3. 5 lg:px-8">
        <nav
          aria-label="Global"
          className="flex items-center justify-between max-w-[1560px] mx-auto"
        >
          {/* Mobile:  left controls */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              aria-label="Open main menu"
              title="Open menu"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Open main menu</span>
              <MenuIcon aria-hidden="true" className="size-6" />
            </button>

            <button
              type="button"
              aria-label="Search"
              title="Search"
              onClick={handleOpenSearch}
              className="font-semibold text-foreground p-1. 5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </button>
          </div>

          {/* Brand triggers subscribe */}
          <div className="flex lg:flex-1">
            <p className="-m-1.5 p-1.5">
              <span className="sr-only">Privora Home</span>
              <button
                type="button"
                aria-label="Subscribe"
                title="Subscribe"
                onClick={handleOpenSubscribe}
                className="font-times text-3xl"
              >
                Privora
              </button>
            </p>
          </div>

          {/* Mobile:  right counters */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Wishlist */}
            <Link
              aria-label="Wishlist"
              title="Wishlist"
              href="/wishlist"
              className="relative font-semibold text-foreground p-1.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                />
              </svg>
              {wishlistCount > 0 && (
                <span className="min-w-[20px] h-5 flex items-center justify-center bg-brand text-xs text-background px-1 rounded-full absolute -top-1 -right-1">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              aria-label="Cart"
              title="Cart"
              href="/cart"
              className="relative font-semibold text-foreground p-1.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c. 07.665-. 45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c. 576 0 1. 059. 435 1.119 1.007ZM8.625 10.5a. 375.375 0 1 1-. 75 0 . 375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="min-w-[20px] h-5 flex items-center justify-center bg-brand text-xs text-background px-1 rounded-full absolute -top-1 -right-1">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Desktop: nav links - UPDATED to use dynamic category routes */}
          <div className="hidden lg:flex lg:gap-x-6 webHeaderLinksWrap">
            <Link
              href="/"
              className="py-1 px-2 text-sm/6 font-medium text-foreground uppercase"
            >
              Home
            </Link>
            <Link
              href="/about-us"
              className="py-1 px-2 text-sm/6 font-medium text-foreground uppercase"
            >
              About Us
            </Link>
            <Link
              href="/bracelet"
              className="py-1 px-2 text-sm/6 font-medium text-foreground uppercase"
            >
              Bracelet
            </Link>
            <Link
              href="/earring"
              className="py-1 px-2 text-sm/6 font-medium text-foreground uppercase"
            >
              Earring
            </Link>
            <Link
              href="/necklace"
              className="py-1 px-2 text-sm/6 font-medium text-foreground uppercase"
            >
              Necklace
            </Link>
            <Link
              href="/jewelry-set"
              className="py-1 px-2 text-sm/6 font-medium text-foreground uppercase"
            >
              Jewelry Set
            </Link>
            <Link
              href="/pendant"
              className="py-1 px-2 text-sm/6 font-medium text-foreground uppercase"
            >
              Pendant
            </Link>
            <Link
              href="/contact-us"
              className="py-1 px-2 text-sm/6 font-medium text-foreground uppercase"
            >
              Contact Us
            </Link>
          </div>

          {/* Desktop:  actions */}
          <div className="hidden lg:flex lg: gap-3 lg:flex-1 lg:justify-end items-center">
            {/* Search */}
            <button
              type="button"
              aria-label="Search"
              title="Search"
              onClick={handleOpenSearch}
              className="font-semibold text-foreground p-1.5 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </button>

            {/* Wishlist */}
            <Link
              aria-label="Wishlist"
              title="Wishlist"
              href="/wishlist"
              className="relative font-semibold text-foreground p-1.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                />
              </svg>
              {wishlistCount > 0 && (
                <span className="min-w-[20px] h-5 flex items-center justify-center bg-brand text-xs text-background px-1 rounded-full absolute -top-1 -right-1">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              aria-label="Cart"
              title="Cart"
              href="/cart"
              className="relative font-semibold text-foreground p-1.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c. 576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="min-w-[20px] h-5 flex items-center justify-center bg-brand text-xs text-background px-1 rounded-full absolute -top-1 -right-1">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <Menu>
              <MenuButton
                aria-label="User menu"
                title="User menu"
                className="cursor-pointer inline-flex items-center gap-2 rounded-md bg-transparent px-3 py-1. 5 text-sm/6 font-semibold text-foreground outline-0"
              >
                <div className="relative h-10 w-10 min-w-10 rounded-full overflow-hidden bg-background text-foreground flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                    />
                  </svg>
                </div>
                <ChevronDownIcon
                  className="size-4 stroke-foreground"
                  aria-hidden="true"
                />
              </MenuButton>

              <MenuItems
                transition
                anchor="bottom end"
                className="w-52 origin-top-right rounded-xl border border-foreground/20 bg-background p-1 text-sm/6 text-foreground transition duration-100 ease-out [--anchor-gap: --spacing(1)] focus:outline-none data-closed: scale-95 data-closed:opacity-0 z-[99]"
              >
                {/* Account */}
                <MenuItem>
                  <Link
                    href="/account"
                    className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-foreground/10 text-foreground"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-4"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                      />
                    </svg>
                    Account
                  </Link>
                </MenuItem>

                <div className="my-1 h-px bg-foreground/20" />

                {/* Auth action */}
                {isAuthenticated ? (
                  <MenuItem>
                    <button
                      type="button"
                      onClick={onSignOutClick}
                      className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-foreground/10 text-left"
                    >
                      <LogOut
                        className="size-4 stroke-red-600"
                        aria-hidden="true"
                      />
                      Sign Out
                    </button>
                  </MenuItem>
                ) : (
                  <MenuItem>
                    <button
                      type="button"
                      onClick={onSignInClick}
                      className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-foreground/10 text-left"
                    >
                      <LogIn
                        className="size-4 stroke-foreground"
                        aria-hidden="true"
                      />
                      Sign In
                    </button>
                  </MenuItem>
                )}
              </MenuItems>
            </Menu>
          </div>

          {/* Mobile Menu Drawer */}
          <Dialog
            open={mobileMenuOpen}
            onClose={setMobileMenuOpen}
            className="lg:hidden"
          >
            <div className="fixed inset-0 z-50" />
            <DialogPanel className="mobileMenuWrap fixed inset-y-0 left-0 z-50 w-full overflow-y-auto bg-[#fce9ca] p-0 sm:max-w-sm sm:ring-1 sm: ring-gray-900/10">
              <div className="flex items-center justify-between p-4">
                <Link
                  href="/"
                  onClick={handleMobileLinkClick}
                  className="font-times text-3xl"
                  aria-label="Go to home"
                >
                  Privora
                </Link>
                <button
                  type="button"
                  aria-label="Close menu"
                  title="Close menu"
                  onClick={() => setMobileMenuOpen(false)}
                  className="-m-2.5 rounded-md p-2.5 text-gray-700"
                >
                  <span className="sr-only">Close menu</span>
                  <X aria-hidden="true" className="size-6" />
                </button>
              </div>

              <div className="pt-2 flow-root">
                <div className="divide-y divide-gray-500/10">
                  {/* Links - UPDATED to use dynamic category routes */}
                  <div className="flex flex-col gap-x-6 pb-2">
                    <Link
                      href="/"
                      onClick={handleMobileLinkClick}
                      className="py-2 px-4 text-sm/6 font-medium text-foreground uppercase"
                    >
                      Home
                    </Link>
                    <Link
                      href="/about-us"
                      onClick={handleMobileLinkClick}
                      className="py-2 px-4 text-sm/6 font-medium text-foreground uppercase"
                    >
                      About Us
                    </Link>
                    <Link
                      href="/bracelet"
                      onClick={handleMobileLinkClick}
                      className="py-2 px-4 text-sm/6 font-medium text-foreground uppercase"
                    >
                      Bracelet
                    </Link>
                    <Link
                      href="/earring"
                      onClick={handleMobileLinkClick}
                      className="py-2 px-4 text-sm/6 font-medium text-foreground uppercase"
                    >
                      Earring
                    </Link>
                    <Link
                      href="/necklace"
                      onClick={handleMobileLinkClick}
                      className="py-2 px-4 text-sm/6 font-medium text-foreground uppercase"
                    >
                      Necklace
                    </Link>
                    <Link
                      href="/jewelry-set"
                      onClick={handleMobileLinkClick}
                      className="py-2 px-4 text-sm/6 font-medium text-foreground uppercase"
                    >
                      Jewelry Set
                    </Link>
                    <Link
                      href="/pendant"
                      onClick={handleMobileLinkClick}
                      className="py-2 px-4 text-sm/6 font-medium text-foreground uppercase"
                    >
                      Pendant
                    </Link>
                    <Link
                      href="/contact-us"
                      onClick={handleMobileLinkClick}
                      className="py-2 px-4 text-sm/6 font-medium text-foreground uppercase"
                    >
                      Contact Us
                    </Link>
                  </div>

                  {/* Auth & Account */}
                  <div className="pt-2">
                    {!isAuthenticated ? (
                      <button
                        type="button"
                        onClick={onSignInClick}
                        className="text-sm/6 font-medium uppercase flex w-full items-center gap-2 rounded-lg px-4 py-2 data-focus:bg-foreground/10 text-foreground"
                      >
                        <LogIn
                          className="size-4 stroke-foreground"
                          aria-hidden="true"
                        />
                        Sign In
                      </button>
                    ) : (
                      <>
                        <Link
                          href="/account"
                          onClick={handleMobileLinkClick}
                          className="text-sm/6 font-medium uppercase flex w-full items-center gap-2 rounded-lg px-4 py-2 data-focus:bg-foreground/10 text-foreground"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-4"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                            />
                          </svg>
                          Account
                        </Link>
                        <button
                          type="button"
                          onClick={onSignOutClick}
                          className="text-sm/6 font-medium uppercase flex w-full items-center gap-2 rounded-lg px-4 py-2 data-focus:bg-foreground/10"
                        >
                          <LogOut
                            className="size-4 stroke-red-600"
                            aria-hidden="true"
                          />
                          Sign Out
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </DialogPanel>
          </Dialog>
        </nav>
      </header>

      {/* Popups */}
      <SearchPopup open={openSearch} onClose={handleCloseSearch} />
      <SubscribePopup open={openSubscribe} onClose={handleCloseSubscribe} />
    </>
  );
}