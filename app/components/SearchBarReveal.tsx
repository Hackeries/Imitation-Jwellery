"use client";

import { Fragment, useEffect, useRef } from "react";
import { Transition } from "@headlessui/react";
import { Search, Loader2, Tag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import CommonInput from "./input/CommonInput";
import { useSearchState } from "@/hooks/use-search";
import { useRouter } from "next/navigation";
import { FALLBACK_IMAGE } from "@/constants";

type SearchBarRevealProps = {
  open: boolean;
  onClose: () => void;
};

export default function SearchBarReveal({
  open,
  onClose,
}: SearchBarRevealProps) {
  const { query, setQuery, results, categories, isLoading, hasResults } =
    useSearchState();
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || query.length > 0) return;

    const timeoutId = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [open, query, onClose]);

  const handleClose = () => {
    setQuery("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/product-list?search=${encodeURIComponent(query)}`);
      handleClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <Transition
      show={open}
      as={Fragment}
      enter="transition ease-out duration-300"
      enterFrom="opacity-0 -translate-y-4"
      enterTo="opacity-100 translate-y-0"
      leave="transition ease-in duration-200"
      leaveFrom="opacity-100 translate-y-0"
      leaveTo="opacity-0 -translate-y-4"
    >
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-xl">
        <div
          ref={containerRef}
          className="relative bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 pr-4"
          >
            <CommonInput
              placeholder="Search for jewellery..."
              value={query}
              name="search"
              onChange={handleChange}
              noMargin
              className="border-0 focus:ring-0 noShadow"
              autoFocus
            />

            <button type="submit" className="p-1" aria-label="Search" title="Search">
              {isLoading ? (
                <Loader2 className="size-5 text-foreground/60 animate-spin" />
              ) : (
                <Search className="size-5 text-foreground/60 cursor-pointer" />
              )}
            </button>
          </form>

          {query.length >= 2 && hasResults && (
            <div className="border-t border-foreground/10 max-h-[50vh] overflow-y-auto">
              {categories.length > 0 && (
                <div className="p-3 border-b border-foreground/5">
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

              {results.length > 0 && (
                <div className="p-2">
                  {results.slice(0, 5).map((product) => (
                    <Link
                      key={product.id}
                      href={`/product-details/${product.id}`}
                      onClick={handleClose}
                      className="flex gap-3 items-center hover:bg-foreground/5 p-2 rounded-lg transition"
                    >
                      <div className="relative w-10 h-10 rounded-md overflow-hidden bg-foreground/10 flex-shrink-0">
                        <Image
                          src={product.image || FALLBACK_IMAGE}
                          alt={product.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {product.title}
                        </p>
                        <p className="text-xs text-foreground/60">
                          {product.price}
                        </p>
                      </div>
                    </Link>
                  ))}

                  {results.length > 5 && (
                    <Link
                      href={`/product-list?search=${encodeURIComponent(query)}`}
                      onClick={handleClose}
                      className="block text-center text-sm text-brand py-2 hover:underline"
                    >
                      View all {results.length} results
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Transition>
  );
}
