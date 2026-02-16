"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster, toast } from "sonner";
import { NetworkError } from "@/lib/error-handler";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            retry: (failureCount, error: Error | null) => {
              if (error instanceof NetworkError && error.isNetworkError) {
                return false;
              }
              return failureCount < 1;
            },
          },
          mutations: {
            retry: (failureCount, error: Error | null) => {
              if (error instanceof NetworkError && error.isNetworkError) {
                return false;
              }
              return failureCount < 1;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster 
        position="bottom-center"
        expand={false}
        richColors
        closeButton
        offset={20}
        gap={8}
        visibleToasts={2}
        toastOptions={{
          duration: 2500,
          className: "!rounded-lg !shadow-md !border-0 !mx-4 md:!mx-0 !min-w-0 md:!min-w-[350px]",
          style: {
            background: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
            padding: "12px 16px",
            fontSize: "14px",
            lineHeight: "1.4",
          },
          classNames: {
            success: "!bg-green-50 !text-green-900 !border !border-green-200",
            error: "!bg-red-50 !text-red-900 !border !border-red-200",
            info: "!bg-blue-50 !text-blue-900 !border !border-blue-200",
            warning: "!bg-yellow-50 !text-yellow-900 !border !border-yellow-200",
          },
        }}
      />
    </QueryClientProvider>
  );
}
