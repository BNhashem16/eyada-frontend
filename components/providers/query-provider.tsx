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
            // Project policy ("موارد السيرفر"): focus/reconnect/interval
            // auto-refresh stay off. `refetchOnMount` is `true` so that
            // mutation-driven `invalidateQueries(...)` actually takes
            // effect when the user navigates back to a list/detail page
            // — invalidation only refetches active observers, so without
            // remount-refetch the user would see stale data after every
            // create/update/delete done from a sub-route.
            // Within `staleTime` and uninvalidated, mounts still hit the
            // cache (no network).
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            refetchOnMount: true,
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
