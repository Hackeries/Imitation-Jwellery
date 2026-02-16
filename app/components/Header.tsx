"use client";

import {
  Dialog,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import {
  ChevronDownIcon,
  LogIn,
  LogOut,
  MenuIcon,
  User2Icon,
  X,
  Package,
  MapPin,
  Search,
  ChevronRight,
  Phone,
  Mail,
  Instagram,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { Fragment, useState, useEffect, useMemo, useCallback } from "react";
import SearchBarReveal from "./SearchBarReveal";
import ExpandableSearch from "./ExpandableSearch";
import { useCartCount } from "@/hooks/use-cart";
import { useWishlistCount } from "@/hooks/use-wishlist";
import { useUserProfile, useLogout } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { useRoundNotifications } from "@/hooks/use-round-notification";
import CartDrawer from "./CartDrawer";
import LoginToContinueModal from "@/app/components/LoginToContinue";
import { COMPANY_INFO } from "@/constants";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);

  const { data: roundNotifications } = useRoundNotifications();
  const { data: userProfile } = useUserProfile();

  const pathname = usePathname();
  const router = useRouter();

  const currentPath = useMemo(() => pathname || "/", [pathname]);

  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem("subscribe_popup_shown");
    if (hasSeenPopup) return;

    const timer = setTimeout(() => {
      setSubscribeOpen(true);
      sessionStorage.setItem("subscribe_popup_shown", "true");
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  const logoutMutation = useLogout();
  const cartCount = useCartCount();
  const wishlistCount = useWishlistCount();

  const isAuthenticated = useMemo(
    () => !!userProfile && !!userProfile._id && userProfile._id !== "guest",
    [userProfile]
  );

  const handleSignOut = useCallback(() => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        router.push("/");
      },
    });
  }, [logoutMutation, router]);

  const marqueeItems = useMemo(() => {
    if (!roundNotifications || roundNotifications.length === 0) return null;
    return [
      ...roundNotifications,
      ...roundNotifications,
      ...roundNotifications,
      ...roundNotifications,
    ].slice(0, 4);
  }, [roundNotifications]);

  return (
    <>
      <div className="group overflow-hidden bg-brand">
        <div className="flex w-max gap-20 px-8 py-2.5 whitespace-nowrap animate-marquee">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-20">
              {marqueeItems ? (
                marqueeItems.map((note, idx) => (
                  <p
                    key={`${i}-${idx}`}
                    className="uppercase text-xs font-normal text-background"
                  >
                    {note.body}{" "}
                    <Link
                      href="/product-list"
                      className="underline underline-offset-2 ml-1"
                    >
                      Shop Now
                    </Link>
                  </p>
                ))
              ) : (
                <>
                  <p className="uppercase text-xs font-normal text-background">
                    Buy any 3 products, get 20% off{" "}
                    <Link
                      href="/product-list"
                      className="underline underline-offset-2"
                    >
                      Shop Now
                    </Link>
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      <header className="headerWrap sticky top-0 left-0 w-full h-fit bg-[#fce9ca] px-3 md:px-6 py-2 md:py-3.5 lg:px-8 z-30">
        <nav
          aria-label="Global"
          className="flex items-center justify-between max-w-[1560px] mx-auto"
        >
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Open main menu</span>
              <MenuIcon aria-hidden="true" className="size-6" />
            </button>
            <button
              onClick={() => setOpenSearch(true)}
              aria-label="Search"
              title="Search"
              className="font-semibold text-foreground p-1.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </button>
          </div>
          <div className="flex lg:flex-1">
            <p className="-m-1.5 p-1.5">
              <span className="sr-only">Your Company</span>
              <Link href="/" className="font-times text-3xl">
                Privora
              </Link>
            </p>
          </div>
          <div className="flex lg:hidden items-center gap-2">
            {/* Wishlist Mobile */}
            <Link
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
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                />
              </svg>
              {wishlistCount > 0 && (
                <span className="w-5 h-5 flex items-center justify-center bg-brand text-xs text-background p-2 rounded-full absolute -top-1 -right-1">
                  {wishlistCount}
                </span>
              )}
            </Link>
            {/* Cart Mobile */}
            <button
              onClick={() => setOpenCart(true)}
              className="relative font-semibold text-foreground p-1.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="w-5 h-5 flex items-center justify-center bg-brand text-xs text-background p-2 rounded-full absolute -top-1 -right-1">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          <div className="hidden lg:flex lg:gap-x-3 webHeaderLinksWrap">
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
              href="/jhumkas"
              className="py-1 px-2 text-sm/6 font-medium text-foreground uppercase"
            >
              Jhumkas
            </Link>
            <Link
              href="/earrings"
              className="py-1 px-2 text-sm/6 font-medium text-foreground uppercase"
            >
              Earrings
            </Link>
            <Link
              href="/bracelets"
              className="py-1 px-2 text-sm/6 font-medium text-foreground uppercase"
            >
              Bracelets
            </Link>
            <Link
              href="/earring-set"
              className="py-1 px-2 text-sm/6 font-medium text-foreground uppercase"
            >
              Earring Sets
            </Link>
            <Link
              href="/pendant"
              className="py-1 px-2 text-sm/6 font-medium text-foreground uppercase"
            >
              Pendants
            </Link>
            <Link
              href="/contact-us"
              className="py-1 px-2 text-sm/6 font-medium text-foreground uppercase"
            >
              Contact Us
            </Link>
          </div>
          <div className="hidden lg:flex lg:gap-3 lg:flex-1 lg:justify-end items-center">
            {/* Search */}
            <button
              onClick={() => setOpenSearch(true)}
              aria-label="Search"
              title="Search"
              className="font-semibold text-foreground p-1.5 cursor-pointer headerSearchMdBtn"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </button>
            <div className="headerSearchLGBtn">
              <ExpandableSearch />
            </div>
            {/* Wishlist Desktop */}
            <Link
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
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                />
              </svg>
              {wishlistCount > 0 && (
                <span className="w-5 h-5 flex items-center justify-center bg-brand text-xs text-background p-2 rounded-full absolute -top-1 -right-1">
                  {wishlistCount}
                </span>
              )}
            </Link>
            {/* Cart Desktop */}
            <button
              onClick={() => setOpenCart(true)}
              className="relative font-semibold text-foreground p-1.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="w-5 h-5 flex items-center justify-center bg-brand text-xs text-background p-2 rounded-full absolute -top-1 -right-1">
                  {cartCount}
                </span>
              )}
            </button>
            {/* Login / Profile */}
            <Menu as="div" className="relative z-40">
              <MenuButton className="cursor-pointer inline-flex items-center gap-2 rounded-md bg-transparent px-3 py-1.5 text-sm/6 font-semibold text-foreground outline-0">
                <div className="relative h-10 w-10 min-w-10 rounded-full overflow-hidden bg-background text-foreground flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                    />
                  </svg>
                </div>
                <ChevronDownIcon className="size-4 stroke-foreground" />
              </MenuButton>

              <MenuItems
                transition
                anchor="bottom end"
                className="w-52 origin-top-right rounded-xl border border-foreground/20 bg-background p-1 text-sm/6 text-foreground transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0 z-[99]"
              >
                {isAuthenticated ? (
                  <>
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
                    <MenuItem>
                      <button
                        onClick={handleSignOut}
                        className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-foreground/10 text-red-600"
                      >
                        <LogOut className="size-4 stroke-red-600" />
                        Sign Out
                      </button>
                    </MenuItem>
                  </>
                ) : (
                  <MenuItem>
                    <button
                      onClick={() => setOpenLogin(true)}
                      className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-foreground/10 text-foreground"
                    >
                      <LogIn className="size-4" />
                      Login
                    </button>
                  </MenuItem>
                )}
              </MenuItems>
            </Menu>
          </div>

          <Transition appear show={mobileMenuOpen} as={Fragment}>
            <Dialog
              as="div"
              className="relative z-50 lg:hidden"
              onClose={setMobileMenuOpen}
            >
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-800"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-foreground/40" />
              </Transition.Child>

              <div className="fixed inset-0 overflow-hidden">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-out duration-400"
                  enterFrom="-translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-out duration-400"
                  leaveFrom="translate-x-0"
                  leaveTo="-translate-x-full"
                >
                  <Dialog.Panel className="mobileMenuWrap fixed inset-y-0 left-0 z-50 h-dvh w-full sm:max-w-md bg-[#fef5e6] overflow-y-auto shadow-2xl flex flex-col">
                    {/* Header - Beige for Branding, Centered Logo */}
                    <div className="relative flex items-center justify-between px-6 py-5 sticky top-0 bg-[#fef5e6] z-10">
                      <Link
                        href="/"
                        onClick={() => setMobileMenuOpen(false)}
                        className="font-times text-3xl tracking-tight text-[#4E342E]"
                      >
                        Privora
                      </Link>

                      <button
                        onClick={() => setMobileMenuOpen(false)}
                        aria-label="Close menu"
                        title="Close menu"
                        className="p-1 text-[#4E342E]/60 hover:text-[#4E342E] transition"
                      >
                        <X className="size-7" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 pb-6">
                      {/* Collections Links */}
                      <div className="py-4 space-y-1">
                        <p className="text-[11px] font-bold text-[#4E342E]/60 uppercase tracking-[2px] mb-4">
                          Collections
                        </p>
                        <div className="flex flex-col space-y-1">
                          {[
                            { name: "Jhumkas", href: "/jhumkas" },
                            { name: "Earrings", href: "/earrings" },
                            { name: "Bracelets", href: "/bracelets" },
                            { name: "Earring Sets", href: "/earring-set" },
                            { name: "Pendants", href: "/pendant" },
                          ].map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex items-center justify-between py-4 border-b border-[#4E342E]/5 group"
                            >
                              <span className="text-[13px] font-bold uppercase tracking-[1.5px] text-[#4E342E]/80 group-hover:text-[#4E342E] transition">
                                {item.name}
                              </span>
                              <ChevronRight className="size-4 text-[#4E342E]/20 group-hover:text-[#4E342E] transition" />
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Main Navigation */}
                      <div className="py-6 space-y-4">
                        {[
                          { name: "Home", href: "/" },
                          { name: "About Us", href: "/about-us" },
                          { name: "Contact Us", href: "/contact-us" },
                        ].map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block text-[13px] font-bold uppercase tracking-[1.5px] text-[#4E342E]/60 hover:text-[#4E342E] transition"
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>

                      {/* Account Section */}
                      <div className="pt-6 border-t border-[#4E342E]/10">
                        {isAuthenticated ? (
                          <div className="space-y-5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-[#4E342E]/80 uppercase tracking-[2px]">
                                My Account
                              </span>
                              <button
                                onClick={handleSignOut}
                                className="text-[10px] font-bold text-[#4E342E] hover:text-red-700 border border-[#4E342E]/20 rounded-full px-4 py-1.5 uppercase tracking-wide transition hover:bg-[#4E342E]/5"
                              >
                                Sign Out
                              </button>
                            </div>

                            {/* Account Grid Widget - Dark Brown Style */}
                            <div className="grid grid-cols-2 gap-3">
                              {/* Profile Card */}
                              <Link
                                href="/account?tab=settings"
                                onClick={() => setMobileMenuOpen(false)}
                                className="bg-[#4a342e] col-span-2 p-5 rounded-2xl flex items-center justify-between group shadow-sm active:scale-[0.99] transition relative overflow-hidden"
                              >
                                <div className="relative z-10 flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white">
                                    <User2Icon className="size-5" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold uppercase tracking-wide text-white mb-0.5">My Profile</p>
                                    <p className="text-[10px] text-white/60 font-medium">Details & Settings</p>
                                  </div>
                                </div>
                                <ChevronRight className="size-5 text-white/40 group-hover:text-white transition relative z-10" />
                              </Link>

                              {/* Orders Card */}
                              <Link
                                href="/account?tab=orders"
                                onClick={() => setMobileMenuOpen(false)}
                                className="bg-[#4a342e] p-5 rounded-2xl flex flex-col justify-between h-28 group shadow-sm active:scale-[0.99] transition relative overflow-hidden"
                              >
                                <div className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white">
                                  <Package className="size-4" />
                                </div>
                                <div>
                                  <p className="text-[11px] font-bold uppercase tracking-wide text-white mb-0.5">Orders</p>
                                  <p className="text-[9px] text-white/60 font-medium">Track & items</p>
                                </div>
                              </Link>

                              {/* Addresses Card */}
                              <Link
                                href="/account?tab=addresses"
                                onClick={() => setMobileMenuOpen(false)}
                                className="bg-[#4a342e] p-5 rounded-2xl flex flex-col justify-between h-28 group shadow-sm active:scale-[0.99] transition relative overflow-hidden"
                              >
                                <div className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white">
                                  <MapPin className="size-4" />
                                </div>
                                <div>
                                  <p className="text-[11px] font-bold uppercase tracking-wide text-white mb-0.5">Addresses</p>
                                  <p className="text-[9px] text-white/60 font-medium">Locations</p>
                                </div>
                              </Link>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setOpenLogin(true);
                            }}
                            className="w-full bg-[#4E342E] text-[#fce9ca] py-4 flex items-center justify-center gap-2 uppercase text-xs font-bold tracking-[2px] rounded-xl shadow-lg hover:shadow-xl hover:translate-y-[-1px] transition-all active:scale-95 active:translate-y-0"
                          >
                            <LogIn className="size-4" />
                            Login / Register
                          </button>
                        )}
                      </div>

                      {/* Footer Section - Fixed Layout */}
                      <div className="mt-8 pt-6 border-t border-[#4E342E]/10 flex items-end justify-between">
                        <div className="space-y-3">
                          <p className="text-[11px] font-bold text-[#4E342E]/60 uppercase tracking-[2px]">
                            Contact Us
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#352825] flex items-center justify-center text-white shrink-0">
                              <span className="text-[10px] font-bold">P</span>
                            </div>
                            <a href={`mailto:${COMPANY_INFO.EMAIL}`} className="text-sm font-bold text-[#4E342E]/90 hover:text-[#4E342E] transition">
                              {COMPANY_INFO.EMAIL}
                            </a>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <a
                            href="https://instagram.com/privora.in"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-[#352825] text-white rounded-full flex items-center justify-center hover:scale-110 transition shadow-sm"
                            aria-label="Instagram"
                          >
                            <Instagram className="size-5" />
                          </a>
                          <a
                            href={`https://wa.me/${COMPANY_INFO.PHONE.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-[#25D366] text-white rounded-full flex items-center justify-center hover:scale-110 transition shadow-sm"
                            aria-label="WhatsApp"
                          >
                            <MessageCircle className="size-5" />
                          </a>
                        </div>
                      </div>

                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </Dialog>
          </Transition>
        </nav>
      </header>

      <SearchBarReveal open={openSearch} onClose={() => setOpenSearch(false)} />
      <CartDrawer open={openCart} onClose={() => setOpenCart(false)} />
      <LoginToContinueModal open={openLogin} onClose={() => setOpenLogin(false)} />
    </>
  );
}
