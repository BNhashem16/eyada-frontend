/**
 * Centralized TanStack Query keys for the pharmacy module.
 *
 * Every pharmacy hook (owner / admin / patient) imports from this file so
 * that:
 *   1. Renames are compile-time safe.
 *   2. Mutation invalidations target a stable key hierarchy.
 *   3. Cross-role invalidation (e.g. admin status change → owner list) is
 *      possible without grepping string literals.
 *
 * Hierarchy convention (TanStack canonical):
 *   .all                       → ["pharmacy"]                       (root)
 *   .lists()                   → ["pharmacy", "list"]               (all lists)
 *   .list(filters)             → ["pharmacy", "list", filters]      (one list)
 *   .details()                 → ["pharmacy", "detail"]             (all details)
 *   .detail(id)                → ["pharmacy", "detail", id]         (one detail)
 *
 * Invalidating `.all` cascades to every derived key.
 */

import type { ListFilters } from "@/types";

// ---------------------------------------------------------------------------
// Pharmacies
// ---------------------------------------------------------------------------

export const pharmacyKeys = {
  all: ["pharmacy"] as const,
  lists: () => [...pharmacyKeys.all, "list"] as const,
  list: (filters: ListFilters | Record<string, unknown> = {}) =>
    [...pharmacyKeys.lists(), filters] as const,
  details: () => [...pharmacyKeys.all, "detail"] as const,
  detail: (pharmacyId: string) =>
    [...pharmacyKeys.details(), pharmacyId] as const,
  dashboard: (pharmacyId: string) =>
    [...pharmacyKeys.all, "dashboard", pharmacyId] as const,
  ownerProfile: () => [...pharmacyKeys.all, "owner-profile"] as const,
};

// ---------------------------------------------------------------------------
// Pharmacy orders
// ---------------------------------------------------------------------------

export const pharmacyOrderKeys = {
  all: ["pharmacy-orders"] as const,
  scoped: (pharmacyId: string) =>
    [...pharmacyOrderKeys.all, pharmacyId] as const,
  lists: (pharmacyId: string) =>
    [...pharmacyOrderKeys.scoped(pharmacyId), "list"] as const,
  list: (
    pharmacyId: string,
    filters: ListFilters | Record<string, unknown> = {},
  ) => [...pharmacyOrderKeys.lists(pharmacyId), filters] as const,
  details: (pharmacyId: string) =>
    [...pharmacyOrderKeys.scoped(pharmacyId), "detail"] as const,
  detail: (pharmacyId: string, orderId: string) =>
    [...pharmacyOrderKeys.details(pharmacyId), orderId] as const,
};

// ---------------------------------------------------------------------------
// Pharmacy products
// ---------------------------------------------------------------------------

export const pharmacyProductKeys = {
  all: ["pharmacy-products"] as const,
  scoped: (pharmacyId: string) =>
    [...pharmacyProductKeys.all, pharmacyId] as const,
  lists: (pharmacyId: string) =>
    [...pharmacyProductKeys.scoped(pharmacyId), "list"] as const,
  list: (
    pharmacyId: string,
    filters: ListFilters | Record<string, unknown> = {},
  ) => [...pharmacyProductKeys.lists(pharmacyId), filters] as const,
  details: (pharmacyId: string) =>
    [...pharmacyProductKeys.scoped(pharmacyId), "detail"] as const,
  detail: (pharmacyId: string, productId: string) =>
    [...pharmacyProductKeys.details(pharmacyId), productId] as const,
};

// ---------------------------------------------------------------------------
// Pharmacy wallet & settlements
// ---------------------------------------------------------------------------

export const pharmacyWalletKeys = {
  all: ["pharmacy-wallet"] as const,
  scoped: (pharmacyId: string) =>
    [...pharmacyWalletKeys.all, pharmacyId] as const,
  balance: (pharmacyId: string) =>
    [...pharmacyWalletKeys.scoped(pharmacyId), "balance"] as const,
  transactions: (
    pharmacyId: string,
    filters: ListFilters | Record<string, unknown> = {},
  ) =>
    [
      ...pharmacyWalletKeys.scoped(pharmacyId),
      "transactions",
      filters,
    ] as const,
  settlements: (
    pharmacyId: string,
    filters: ListFilters | Record<string, unknown> = {},
  ) =>
    [...pharmacyWalletKeys.scoped(pharmacyId), "settlements", filters] as const,
};

// ---------------------------------------------------------------------------
// Pharmacy campaigns
// ---------------------------------------------------------------------------

export const pharmacyCampaignKeys = {
  all: ["pharmacy-campaigns"] as const,
  scoped: (pharmacyId: string) =>
    [...pharmacyCampaignKeys.all, pharmacyId] as const,
  lists: (pharmacyId: string) =>
    [...pharmacyCampaignKeys.scoped(pharmacyId), "list"] as const,
  list: (
    pharmacyId: string,
    filters: ListFilters | Record<string, unknown> = {},
  ) => [...pharmacyCampaignKeys.lists(pharmacyId), filters] as const,
  details: (pharmacyId: string) =>
    [...pharmacyCampaignKeys.scoped(pharmacyId), "detail"] as const,
  detail: (pharmacyId: string, campaignId: string) =>
    [...pharmacyCampaignKeys.details(pharmacyId), campaignId] as const,
};

// ---------------------------------------------------------------------------
// Pharmacy drivers
// ---------------------------------------------------------------------------

export const pharmacyDriverKeys = {
  all: ["pharmacy-drivers"] as const,
  scoped: (pharmacyId: string) =>
    [...pharmacyDriverKeys.all, pharmacyId] as const,
  lists: (pharmacyId: string) =>
    [...pharmacyDriverKeys.scoped(pharmacyId), "list"] as const,
  list: (
    pharmacyId: string,
    filters: ListFilters | Record<string, unknown> = {},
  ) => [...pharmacyDriverKeys.lists(pharmacyId), filters] as const,
  details: (pharmacyId: string) =>
    [...pharmacyDriverKeys.scoped(pharmacyId), "detail"] as const,
  detail: (pharmacyId: string, driverId: string) =>
    [...pharmacyDriverKeys.details(pharmacyId), driverId] as const,
  availableForOrder: (pharmacyId: string, orderId: string) =>
    [
      ...pharmacyDriverKeys.scoped(pharmacyId),
      "available-for-order",
      orderId,
    ] as const,
};

// ---------------------------------------------------------------------------
// Prescriptions (shared across patient / owner / admin)
// ---------------------------------------------------------------------------

export const prescriptionKeys = {
  all: ["prescriptions"] as const,
  // Patient-side
  patientRequests: (filters: ListFilters | Record<string, unknown> = {}) =>
    [...prescriptionKeys.all, "patient", "requests", filters] as const,
  patientRequest: (id: string) =>
    [...prescriptionKeys.all, "patient", "request", id] as const,
  patientOrders: (filters: ListFilters | Record<string, unknown> = {}) =>
    [...prescriptionKeys.all, "patient", "orders", filters] as const,
  patientOrder: (id: string) =>
    [...prescriptionKeys.all, "patient", "order", id] as const,
  // Pharmacy-owner-side
  pharmacyOrders: (
    pharmacyId: string,
    filters: ListFilters | Record<string, unknown> = {},
  ) =>
    [
      ...prescriptionKeys.all,
      "pharmacy",
      pharmacyId,
      "orders",
      filters,
    ] as const,
  // Admin-side
  adminRequests: (filters: ListFilters | Record<string, unknown> = {}) =>
    [...prescriptionKeys.all, "admin", "requests", filters] as const,
  adminRequest: (id: string) =>
    [...prescriptionKeys.all, "admin", "request", id] as const,
  adminOrders: (filters: ListFilters | Record<string, unknown> = {}) =>
    [...prescriptionKeys.all, "admin", "orders", filters] as const,
};

// ---------------------------------------------------------------------------
// Admin pharmacy management
// ---------------------------------------------------------------------------

export const adminPharmacyKeys = {
  all: ["admin-pharmacy"] as const,
  pharmacies: (filters: ListFilters | Record<string, unknown> = {}) =>
    [...adminPharmacyKeys.all, "pharmacies", filters] as const,
  pharmacy: (pharmacyId: string) =>
    [...adminPharmacyKeys.all, "pharmacy", pharmacyId] as const,
  owners: (filters: ListFilters | Record<string, unknown> = {}) =>
    [...adminPharmacyKeys.all, "owners", filters] as const,
  dashboard: () => [...adminPharmacyKeys.all, "dashboard"] as const,
  commissions: (filters: ListFilters | Record<string, unknown> = {}) =>
    [...adminPharmacyKeys.all, "commissions", filters] as const,
};

// ---------------------------------------------------------------------------
// Patient pharmacy (cart, browse, orders)
// ---------------------------------------------------------------------------

export const patientCartKeys = {
  all: ["patient-cart"] as const,
};

export const patientPharmacyOrderKeys = {
  all: ["patient-pharmacy-orders"] as const,
  lists: () => [...patientPharmacyOrderKeys.all, "list"] as const,
  list: (filters: ListFilters | Record<string, unknown> = {}) =>
    [...patientPharmacyOrderKeys.lists(), filters] as const,
  details: () => [...patientPharmacyOrderKeys.all, "detail"] as const,
  detail: (id: string) => [...patientPharmacyOrderKeys.details(), id] as const,
};

export const patientPharmacyBrowseKeys = {
  all: ["patient-pharmacy-browse"] as const,
  pharmacies: (filters: ListFilters | Record<string, unknown> = {}) =>
    [...patientPharmacyBrowseKeys.all, "pharmacies", filters] as const,
  products: (filters: ListFilters | Record<string, unknown> = {}) =>
    [...patientPharmacyBrowseKeys.all, "products", filters] as const,
  categories: () => [...patientPharmacyBrowseKeys.all, "categories"] as const,
};
