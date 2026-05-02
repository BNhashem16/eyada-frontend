import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import {
  pharmacyQueryDefaults,
  pharmacyQueryFastChanging,
  usePharmacyQuery,
} from "../use-pharmacy-query";

function wrap(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

describe("pharmacyQueryDefaults / pharmacyQueryFastChanging presets", () => {
  it("disables focus / reconnect / interval refetches and enables mount-on-stale", () => {
    for (const preset of [pharmacyQueryDefaults, pharmacyQueryFastChanging]) {
      expect(preset.refetchOnWindowFocus).toBe(false);
      expect(preset.refetchOnReconnect).toBe(false);
      // `true` is required so that `invalidateQueries` from a sub-route
      // (e.g. /pharmacies/create) takes effect when the user returns to
      // the list page. Within `staleTime` the cache is still hit.
      expect(preset.refetchOnMount).toBe(true);
      expect(preset.refetchInterval).toBe(false);
    }
  });

  it("uses 5min stale for default, 1min for fast-changing", () => {
    expect(pharmacyQueryDefaults.staleTime).toBe(5 * 60 * 1000);
    expect(pharmacyQueryFastChanging.staleTime).toBe(60 * 1000);
  });
});

describe("usePharmacyQuery wrapper", () => {
  it("fetches via queryFn and exposes the data", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(
      () =>
        usePharmacyQuery({
          queryKey: ["t", "ok"],
          queryFn: () => Promise.resolve({ value: 42 }),
        }),
      { wrapper: wrap(client) },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ value: 42 });
  });

  it("hits cache on remount when data is still fresh (within staleTime)", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    let calls = 0;
    const queryFn = () => {
      calls += 1;
      return Promise.resolve(calls);
    };

    const { unmount } = renderHook(
      () =>
        usePharmacyQuery({
          queryKey: ["t", "remount"],
          queryFn,
        }),
      { wrapper: wrap(client) },
    );

    await waitFor(() => expect(calls).toBe(1));
    unmount();

    renderHook(
      () =>
        usePharmacyQuery({
          queryKey: ["t", "remount"],
          queryFn,
        }),
      { wrapper: wrap(client) },
    );

    // Within staleTime → no refetch even with refetchOnMount: true.
    await new Promise((r) => setTimeout(r, 50));
    expect(calls).toBe(1);
  });

  it("refetches on remount after invalidateQueries (mutation-driven freshness)", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    let calls = 0;
    const queryFn = () => {
      calls += 1;
      return Promise.resolve(calls);
    };

    const { unmount } = renderHook(
      () =>
        usePharmacyQuery({
          queryKey: ["t", "invalidate-remount"],
          queryFn,
        }),
      { wrapper: wrap(client) },
    );

    await waitFor(() => expect(calls).toBe(1));
    unmount();

    // Simulate a mutation invalidating the list while no observer is mounted.
    await client.invalidateQueries({ queryKey: ["t", "invalidate-remount"] });

    renderHook(
      () =>
        usePharmacyQuery({
          queryKey: ["t", "invalidate-remount"],
          queryFn,
        }),
      { wrapper: wrap(client) },
    );

    await waitFor(() => expect(calls).toBe(2));
  });

  it("'fast-changing' preset uses a shorter staleTime than the default", () => {
    expect(pharmacyQueryFastChanging.staleTime).toBeLessThan(
      pharmacyQueryDefaults.staleTime,
    );
  });
});
