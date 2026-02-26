export interface PatientAddress {
  id: string;
  userId: string;
  label: string;
  address: string;
  phoneNumber: string;
  city?: string;
  area?: string;
  buildingNumber?: string;
  floor?: string;
  apartment?: string;
  landmark?: string;
  notes?: string;
  lat?: number;
  lng?: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientAddressDto {
  label: string;
  address: string;
  phoneNumber: string;
  city?: string;
  area?: string;
  buildingNumber?: string;
  floor?: string;
  apartment?: string;
  landmark?: string;
  notes?: string;
  lat?: number;
  lng?: number;
  isDefault?: boolean;
}

export type UpdatePatientAddressDto = Partial<CreatePatientAddressDto>;
