"use client";

import { PharmacyForm } from "./pharmacy-form";

interface EditPharmacyFormProps {
  pharmacyId: string;
}

export function EditPharmacyForm({ pharmacyId }: EditPharmacyFormProps) {
  return <PharmacyForm mode="edit" pharmacyId={pharmacyId} />;
}
