import type { Clinic } from "@/types";
import type { PatientAddress } from "@/types/address";

const NEAR_THRESHOLD_KM = 10;

/**
 * Normalize a place name for fuzzy matching across locales.
 * - lowercases
 * - strips diacritics
 * - normalizes Arabic forms (alef variants, taa marbuta, etc.)
 * - collapses whitespace
 */
function normalizePlaceName(value: string | undefined | null): string {
  if (!value) return "";
  return value
    .toString()
    .normalize("NFKD")
    .replace(/[ً-ْ]/g, "") // Arabic harakat
    .replace(/[إأآا]/g, "ا")
    .replace(/[ى]/g, "ي")
    .replace(/[ة]/g, "ه")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * Haversine distance between two lat/lng pairs, in kilometers.
 */
function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export interface ClinicMatch {
  isNearYou: boolean;
  distanceKm?: number;
  matchedByCity?: boolean;
}

/**
 * Given a clinic and the user's saved address, decide whether the clinic
 * is "near you", and (if known) how many km away.
 *
 * Strategy: prefer geo distance when both sides have coordinates. Fall back
 * to fuzzy city-name match against the clinic.city.name (ar/en).
 */
export function matchClinicToAddress(
  clinic: Clinic,
  address: PatientAddress | null | undefined,
): ClinicMatch {
  if (!address) return { isNearYou: false };

  // 1. Geo distance (most reliable)
  if (
    address.lat != null &&
    address.lng != null &&
    clinic.latitude != null &&
    clinic.longitude != null
  ) {
    const km = haversineKm(
      { lat: address.lat, lng: address.lng },
      { lat: clinic.latitude, lng: clinic.longitude },
    );
    return {
      isNearYou: km <= NEAR_THRESHOLD_KM,
      distanceKm: Math.round(km * 10) / 10,
    };
  }

  // 2. Fuzzy city-name match against ar/en
  const userCity = normalizePlaceName(address.city);
  const userArea = normalizePlaceName(address.area);
  const clinicCityAr = normalizePlaceName(clinic.city?.name?.ar);
  const clinicCityEn = normalizePlaceName(clinic.city?.name?.en);
  const clinicAddrAr = normalizePlaceName(clinic.address?.ar);
  const clinicAddrEn = normalizePlaceName(clinic.address?.en);

  if (userCity) {
    const cityHit =
      (clinicCityAr &&
        (clinicCityAr === userCity || clinicCityAr.includes(userCity))) ||
      (clinicCityEn &&
        (clinicCityEn === userCity || clinicCityEn.includes(userCity))) ||
      (clinicAddrAr && clinicAddrAr.includes(userCity)) ||
      (clinicAddrEn && clinicAddrEn.includes(userCity));
    if (cityHit) {
      return { isNearYou: true, matchedByCity: true };
    }
  }

  if (userArea) {
    const areaHit =
      (clinicAddrAr && clinicAddrAr.includes(userArea)) ||
      (clinicAddrEn && clinicAddrEn.includes(userArea));
    if (areaHit) {
      return { isNearYou: true, matchedByCity: true };
    }
  }

  return { isNearYou: false };
}

/**
 * Sort clinics so the ones that match the user's address come first
 * (closest first by distance), with the rest preserved in original order.
 */
export function sortClinicsByMatch(
  clinics: Clinic[],
  address: PatientAddress | null | undefined,
): Array<Clinic & { match: ClinicMatch }> {
  const decorated = clinics.map((clinic) => ({
    ...clinic,
    match: matchClinicToAddress(clinic, address),
  }));

  return decorated.sort((a, b) => {
    if (a.match.isNearYou !== b.match.isNearYou) {
      return a.match.isNearYou ? -1 : 1;
    }
    const ad = a.match.distanceKm ?? Number.POSITIVE_INFINITY;
    const bd = b.match.distanceKm ?? Number.POSITIVE_INFINITY;
    return ad - bd;
  });
}

/**
 * Pick the address used for matching: explicit default first, otherwise the
 * first one returned by the API.
 */
export function pickPrimaryAddress(
  addresses: PatientAddress[] | undefined,
): PatientAddress | null {
  if (!addresses || addresses.length === 0) return null;
  return addresses.find((a) => a.isDefault) ?? addresses[0];
}
