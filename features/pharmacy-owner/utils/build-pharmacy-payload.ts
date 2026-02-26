import { DeliveryType } from "@/types/enums";

export interface PharmacyFormValues {
  name: string;
  description?: string | "";
  address: string;
  stateId: string;
  cityId: string;
  latitude?: number | "";
  longitude?: number | "";
  phoneNumbers: { value: string }[];
  deliveryType: DeliveryType;
  deliveryFee?: number | "";
  minOrderAmount?: number | "";
  freeDeliveryThreshold?: number | "";
  isActive: boolean;
}

export function buildPharmacyPayload(data: PharmacyFormValues) {
  const phoneNumbers = data.phoneNumbers
    .map((p) => p.value)
    .filter((v) => v.length > 0);

  return {
    name: data.name,
    description: data.description || undefined,
    address: data.address,
    cityId: data.cityId,
    latitude: data.latitude ? Number(data.latitude) : undefined,
    longitude: data.longitude ? Number(data.longitude) : undefined,
    phoneNumbers,
    deliveryType: data.deliveryType,
    deliveryFee: data.deliveryFee ? Number(data.deliveryFee) : undefined,
    minOrderAmount: data.minOrderAmount
      ? Number(data.minOrderAmount)
      : undefined,
    freeDeliveryThreshold: data.freeDeliveryThreshold
      ? Number(data.freeDeliveryThreshold)
      : undefined,
    isActive: data.isActive,
  };
}
