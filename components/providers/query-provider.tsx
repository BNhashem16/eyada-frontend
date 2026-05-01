"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { tokenStorage } from "@/lib/api";

// Devtools are dev-only. Loading them via next/dynamic with a guarded import
// keeps the package out of the production bundle even before bundler DCE.
const ReactQueryDevtools =
  process.env.NODE_ENV === "development"
    ? dynamic(
        () =>
          import("@tanstack/react-query-devtools").then(
            (m) => m.ReactQueryDevtools,
          ),
        { ssr: false },
      )
    : () => null;

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
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
