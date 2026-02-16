"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Search, X, Loader2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import CommonInput from "./input/CommonInput";
import { useSearchState } from "@/hooks/use-search";
import { FALLBACK_IMAGE } from "@/constants";

type SearchDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export default function SearchDrawer({ open, onClose }: SearchDrawerProps) {
  const { query, setQuery, results, isLoading, hasResults } = useSearchState();

  const handleClose = () => {
    setQuery("");
    onClose();
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-100" onClose={handleClose}>
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
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-out duration-300"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in duration-200"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative h-full w-full max-w-sm bg-[#fce9ca] p-3 md:p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <p className="text-xs tracking-widest uppercase text-foreground">
                  Find your perfect pick
                </p>
                <button
                  onClick={handleClose}
                  aria-label="Close search drawer"
                  className="p-2 rounded-full hover:bg-foreground/10"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="relative mb-6">
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60">
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Search size={18} />
                  )}
                </div>
                <CommonInput
                  name="search"
                  type="text"
                  iconInput
                  noMargin
                  placeholder="Search Products..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <div>
                <p className="mb-4 text-xs tracking-widest uppercase text-foreground/60">
                  {query.length >= 2 ? "Search Results" : "Popular Products"}
                </p>

                {query.length >= 2 && isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-brand" size={24} />
                  </div>
                ) : query.length >= 2 && !hasResults ? (
                  <p className="text-sm text-foreground/60 text-center py-4">
                    No products found for &quot;{query}&quot;
                  </p>
                ) : (
                  <div className="space-y-5">
                    {results.map((product) => (
                      <Link
                        href={`/product-details/${product.id}`}
                        key={product.id}
                        onClick={handleClose}
                        className="flex gap-4 items-start hover:bg-foreground/5 p-2 rounded-lg transition"
                      >
                        <div className="relative w-16 min-w-16 h-16 rounded-md overflow-hidden bg-foreground/10">
                          <Image
                            src={product.image || FALLBACK_IMAGE}
                            alt={product.title}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div>
                          <p className="text-sm font-times font-medium leading-snug mb-1">
                            {product.title}
                          </p>
                          <span className="font-medium text-sm">
                            {product.price}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {hasResults && query.length >= 2 && (
                  <div className="mt-6 pt-4 border-t border-foreground/20">
                    <Link
                      href={`/product-list?search=${encodeURIComponent(query)}`}
                      onClick={handleClose}
                      className="text-sm text-brand underline block text-center"
                    >
                      View all results
                    </Link>
                  </div>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
