"use client";

import {
  useQuery,
  type QueryKey,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

/**
 * Project policy: server resources are precious. Every pharmacy-module
 * `useQuery` must go through this wrapper so the no-auto-refresh defaults
 * apply uniformly:
 *
 *   - refetchOnWindowFocus: false
 *   - refetchOnReconnect:   false
 *   - refetchOnMount:       true   ← see note below
 *   - refetchInterval:      false
 *
 * `refetchOnMount` is `true` (not `false`) on purpose. `invalidateQueries`
 * only triggers a refetch for active observers. When a mutation runs on a
 * sub-route (e.g. /pharmacies/create), the list query has no active
 * observer, so invalidation just flips the cache to stale. With
 * `refetchOnMount: false` the user would then see the pre-mutation
 * snapshot when navigating back. Setting it to `true` lets stale-on-mount
 * trigger a refetch — within `staleTime` the cache is still hit, so this
 * is not a polling regression.
 *
 * Cache freshness is controlled by:
 *   - mutation-driven invalidation (every mutation `onSuccess` invalidates
 *     the relevant pharmacyKeys.* hierarchy), and
 *   - explicit user-triggered refresh via `<RefreshButton />`.
 *
 * Two presets are exposed:
 *   - `pharmacyQueryDefaults`        — staleTime 5 min (most screens)
 *   - `pharmacyQueryFastChanging`    — staleTime 60 s (live order pipeline,
 *                                       wallet balance card). Document the
 *                                       reason at the call site.
 *
 * The wrapper is enforced by `lib/__tests__/pharmacy-no-auto-refresh-policy.test.ts`.
 */

const FIVE_MINUTES = 5 * 60 * 1000;
const ONE_MINUTE = 60 * 1000;
const TEN_MINUTES = 10 * 60 * 1000;

export const pharmacyQueryDefaults = {
  staleTime: FIVE_MINUTES,
  gcTime: TEN_MINUTES,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: true,
  refetchInterval: false,
} as const;

export const pharmacyQueryFastChanging = {
  staleTime: ONE_MINUTE,
  gcTime: TEN_MINUTES,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: true,
  refetchInterval: false,
} as const;

export type PharmacyQueryPreset = "default" | "fast-changing";

export interface UsePharmacyQueryOptions<
  TData,
  TError = Error,
  TQueryKey extends QueryKey = QueryKey,
> extends Omit<
  UseQueryOptions<TData, TError, TData, TQueryKey>,
  | "refetchOnWindowFocus"
  | "refetchOnReconnect"
  | "refetchOnMount"
  | "refetchInterval"
  | "staleTime"
  | "gcTime"
> {
  /**
   * `default` (5 min) for almost everything.
   *
   * `fast-changing` (60 s) only when a screen displays state that the user
   * expects to feel near-real-time and the cost of staleness > the cost of
   * an extra fetch — for example the live order pipeline. Always document
   * the reason at the call site.
   */
  preset?: PharmacyQueryPreset;
  /**
   * Override `staleTime` only when neither preset fits. Must come with a
   * comment explaining why.
   */
  staleTime?: number;
  gcTime?: number;
}

export function usePharmacyQuery<
  TData,
  TError = Error,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UsePharmacyQueryOptions<TData, TError, TQueryKey>,
): UseQueryResult<TData, TError> {
  const { preset = "default", staleTime, gcTime, ...rest } = options;

  const presetOptions =
    preset === "fast-changing"
      ? pharmacyQueryFastChanging
      : pharmacyQueryDefaults;

  return useQuery({
    ...rest,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
    refetchInterval: false,
    staleTime: staleTime ?? presetOptions.staleTime,
    gcTime: gcTime ?? presetOptions.gcTime,
  });
}
