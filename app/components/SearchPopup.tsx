"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Search, Loader2, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import CommonInput from "./input/CommonInput";
import { useSearchState } from "@/hooks/use-search";
import { FALLBACK_IMAGE } from "@/constants";

type SearchPopupProps = {
  open: boolean;
  onClose: () => void;
};

export default function SearchPopup({ open, onClose }: SearchPopupProps) {
  const { query, setQuery, results, categories, isLoading, hasResults } = useSearchState();

  const handleClose = () => {
    setQuery("");
    onClose();
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
          <div className="flex h-full items-end sm:items-center justify-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-full sm:translate-y-6 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-full sm:translate-y-6 sm:scale-95"
            >
              <Dialog.Panel className="w-full sm:max-w-lg bg-background rounded-t-2xl sm:rounded-2xl p-3 md:p-6 relative">
                <button
                  onClick={handleClose}
                  aria-label="Close search popup"
                  className="absolute right-4 top-4 p-2 rounded-full hover:bg-foreground/10"
                >
                  <X size={18} />
                </button>

                <div className="sm:hidden w-12 h-1 rounded-full mx-auto mb-4" />

                <Dialog.Title className="text-lg font-medium mb-4">
                  Search Products
                </Dialog.Title>

                <div className="relative mb-6">
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60">
                    {isLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Search size={18} />
                    )}
                  </div>
                  <CommonInput
                    placeholder="Search for jewellery or categories..."
                    value={query}
                    name="Search"
                    onChange={(e) => setQuery(e.target.value)}
                    noMargin
                  />
                </div>

                <div className="space-y-4 max-h-[50vh] overflow-y-auto">
                  {query.length < 2 ? (
                    <p className="text-sm text-foreground/60 text-center py-4">
                      Type at least 2 characters to search
                    </p>
                  ) : isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="animate-spin text-brand" size={24} />
                    </div>
                  ) : !hasResults ? (
                    <div className="text-center py-8">
                      <p className="text-foreground/60 mb-2">No products found</p>
                      <p className="text-sm text-foreground/40">
                        Try a different search term
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Category Suggestions */}
                      {categories.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-foreground/50 uppercase tracking-wide mb-2">
                            Categories
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {categories.map((category) => (
                              <Link
                                key={category.id}
                                href={`/${category.slug}`}
                                onClick={handleClose}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand/10 hover:bg-brand/20 text-brand rounded-full text-sm transition"
                              >
                                <Tag size={14} />
                                {category.title}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Product Results */}
                      {results.length > 0 && (
                        <div>
                          <p className="text-xs text-foreground/50 uppercase tracking-wide mb-2">
                            Products
                          </p>
                          {results.map((product) => (
                            <Link
                              key={product.id}
                              href={`/product-details/${product.id}`}
                              onClick={handleClose}
                              className="flex gap-4 items-center hover:bg-foreground/5 p-2 rounded-lg transition"
                            >
                              <div className="relative w-14 h-14 rounded-md overflow-hidden bg-foreground/10 flex-shrink-0">
                                <Image
                                  src={product.image || FALLBACK_IMAGE}
                                  alt={product.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-times font-medium truncate">
                                  {product.title}
                                </p>
                                <p className="text-sm text-foreground/70">
                                  {product.price}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {hasResults && query.length >= 2 && (
                  <div className="mt-4 pt-4 border-t">
                    <Link
                      href={`/product-list?search=${encodeURIComponent(query)}`}
                      onClick={handleClose}
                      className="text-sm text-brand underline block text-center"
                    >
                      View all results for &quot;{query}&quot;
                    </Link>
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
