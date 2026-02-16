"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Tag, X, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSearchState } from "@/hooks/use-search";
import { useRouter } from "next/navigation";
import { FALLBACK_IMAGE } from "@/constants";

export default function ExpandableSearch() {
    const { query, setQuery, results, categories, isLoading, hasResults } = useSearchState();
    const [isExpanded, setIsExpanded] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();

    const isMobileScreen = () => {
        if (typeof window === "undefined") return false;
        return window.innerWidth < 1024;
    };

    useEffect(() => {
        if (isExpanded && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isExpanded]);

    useEffect(() => {
        if (!isExpanded) return;

        const handleClickOutside = (e: Event) => {
            const target = e.target as HTMLElement;
            if (wrapperRef.current && !wrapperRef.current.contains(target)) {
                setIsExpanded(false);
                setQuery("");
            }
        };

        const handleTouchEnd = (e: Event) => {
            const target = (e as TouchEvent).changedTouches[0].target as HTMLElement;
            if (wrapperRef.current && !wrapperRef.current.contains(target)) {
                setIsExpanded(false);
                setQuery("");
            }
        };

        document.addEventListener("click", handleClickOutside, true);
        document.addEventListener("touchend", handleTouchEnd, true);

        return () => {
            document.removeEventListener("click", handleClickOutside, true);
            document.removeEventListener("touchend", handleTouchEnd, true);
        };
    }, [isExpanded, setQuery]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsExpanded(false);
                setQuery("");
            }
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [setQuery]);

    useEffect(() => {
        if (!isExpanded) {
            if (autoCloseTimerRef.current) {
                clearTimeout(autoCloseTimerRef.current);
                autoCloseTimerRef.current = null;
            }
            return;
        }

        if (query.length > 0) {
            if (autoCloseTimerRef.current) {
                clearTimeout(autoCloseTimerRef.current);
                autoCloseTimerRef.current = null;
            }
            return;
        }

        const closeDelay = isMobileScreen() ? 3000 : 5000;

        if (autoCloseTimerRef.current) {
            clearTimeout(autoCloseTimerRef.current);
        }

        autoCloseTimerRef.current = setTimeout(() => {
            setIsExpanded(false);
        }, closeDelay);

        return () => {
            if (autoCloseTimerRef.current) {
                clearTimeout(autoCloseTimerRef.current);
            }
        };
    }, [isExpanded, query]);

    const handleClose = () => {
        setIsExpanded(false);
        setQuery("");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/product-list?search=${encodeURIComponent(query)}`);
            handleClose();
        }
    };

    const handleSearchClick = () => {
        setIsExpanded(true);
    };

    return (
        <div ref={wrapperRef} className="flex items-center">
            {!isExpanded && (
                <button
                    onClick={handleSearchClick}
                    className="p-1.5 text-foreground"
                    aria-label="Open search"
                    title="Open search"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                </button>
            )}

            {isExpanded && (
                <div className="flex items-center gap-2 bg-white rounded-full shadow-md border border-foreground/10 px-4 py-2">
                    <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-1">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-32 sm:w-36 md:w-44 lg:w-52 py-1 text-sm bg-transparent outline-none placeholder:text-foreground/50"
                        />
                        <button type="submit" aria-label="Search" title="Search">
                            {isLoading ? (
                                <Loader2 className="size-5 text-foreground/60 animate-spin" />
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-foreground/60">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                </svg>
                            )}
                        </button>
                    </form>
                    <button
                        onClick={handleClose}
                        className="p-1 text-foreground/60 hover:text-foreground"
                        aria-label="Close search"
                        title="Close search"
                    >
                        <X className="size-5" />
                    </button>

                    {query.length >= 2 && hasResults && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-96 sm:w-[28rem] lg:w-[32rem] max-w-[95vw] bg-white rounded-xl shadow-lg border border-foreground/10 overflow-hidden z-50">
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
                                <div className="p-2 max-h-64 overflow-y-auto">
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
                                                <p className="text-sm font-medium truncate">{product.title}</p>
                                                <p className="text-xs text-foreground/60">{product.price}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
