"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, useEffect } from "react";
import { tokenStorage } from "@/lib/api";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Project policy ("موارد السيرفر"): every form of automatic
            // refresh is disabled by default. Cache freshness is driven
            // by mutation-driven invalidation and explicit user-triggered
            // refresh (RefreshButton). Per-call sites can still opt in to
            // a different staleTime, but cannot re-enable auto-refetch
            // without an explicit override (caught by code review +
            // pharmacy meta-test).
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            refetchOnMount: false,
            refetchInterval: false,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  // Register callback to clear query cache on logout/user change
  useEffect(() => {
    tokenStorage.onClearQueryCache(() => {
      queryClient.clear();
    });
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
