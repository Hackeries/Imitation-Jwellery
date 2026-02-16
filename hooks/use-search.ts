"use client";

import { useQuery } from "@tanstack/react-query";
import { searchAll, type SearchResponse } from "@/services/search-service";
import { useState, useEffect, useRef } from "react";

export const useSearch = (query: string, enabled = true) => {
  return useQuery<SearchResponse>({
    queryKey: ["search", query],
    queryFn: () => searchAll(query),
    enabled: enabled && query.length >= 2,
    staleTime: 1000 * 60 * 5,
    throwOnError: false,
  });
};

export const useSearchState = () => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isDebouncing, setIsDebouncing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (query !== debouncedQuery) {
      setIsDebouncing(true);
    }

    timerRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      setIsDebouncing(false);
    }, 500);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [query, debouncedQuery]);

  const { data, isLoading: queryLoading } = useSearch(debouncedQuery, !isDebouncing);

  return {
    query,
    setQuery,
    results: data?.products ?? [],
    categories: data?.categories ?? [],
    isLoading: isDebouncing || queryLoading,
    hasResults: (data?.products?.length ?? 0) > 0 || (data?.categories?.length ?? 0) > 0,
  };
};
