/**
 * API Request DTOs - Matching Swagger/OpenAPI Specification
 * These interfaces define the exact payload structure expected by the backend API.
 * DO NOT add fields that are not documented in Swagger.
 */

import {
  Gender,
  RelationshipType,
  ServiceType,
  DayOfWeek,
  AppointmentStatus,
  PaymentStatus,
  PaymentMethod,
} from "./enums";

// ============================================
// COMMON DTOs
// ============================================

/** Bilingual text field - both languages required */
export interface MultilingualDto {
  ar: string;
  en: string;
}

/** Bilingual text field - both languages optional */
export interface MultilingualOptionalDto {
  ar?: string;
  en?: string;
}

// ============================================
// AUTH DTOs
// ============================================

export interface LoginDto {
  email: string;
  password: string; // minLength: 8
}

export interface RegisterDto {
  email: string;
  phoneNumber: string; // Egyptian mobile: /^01[0125][0-9]{8}$/
  password: string; // minLength: 8, maxLength: 50
  fullName: string; // minLength: 2, maxLength: 100
  role?: "PATIENT" | "DOCTOR"; // default: PATIENT
}

export interface RefreshTokenDto {
  refreshToken: string; // JWT refresh token, required
}

// ============================================
// DOCTOR PROFILE DTOs
// ============================================

export interface CreateDoctorProfileDto {
  specialtyId: string; // UUID, required
  licenseNumber?: string;
  yearsOfExperience?: number; // 0-70
  qualifications?: MultilingualOptionalDto;
  bio?: MultilingualOptionalDto;
  profileImage?: string;
  showPhoneNumber?: boolean; // default: false
  showWhatsappNumber?: boolean; // default: false
  whatsappNumbers?: string[];
}

export interface UpdateDoctorProfileDto extends Partial<CreateDoctorProfileDto> {}

// ============================================
// PATIENT PROFILE DTOs
// ============================================

export interface CreatePatientProfileDto {
  dateOfBirth?: string; // ISO date string
  age?: number; // 1-120
  gender?: Gender;
  whatsappNumber?: string; // Egyptian mobile format
  usePhoneAsWhatsapp?: boolean; // default: false
  bloodType?: string;
}

export interface UpdatePatientProfileDto extends Partial<CreatePatientProfileDto> {}

// ============================================
// FAMILY MEMBER DTOs
// ============================================

export interface AddFamilyMemberDto {
  fullName: string; // minLength: 2, maxLength: 100, required
  dateOfBirth?: string; // ISO date string
  age?: number; // 1-120
  gender?: Gender;
  relationship: RelationshipType; // required
  bloodType?: string;
}

export interface UpdateFamilyMemberDto {
  fullName?: string; // minLength: 2, maxLength: 100
  dateOfBirth?: string; // ISO date string
  age?: number; // 1-120
  gender?: Gender;
  relationship?: RelationshipType;
  bloodType?: string;
}

// ============================================
// CLINIC DTOs
// ============================================

export interface CreateClinicDto {
  name: MultilingualDto; // required, ar/en minLength: 2, maxLength: 200
  address?: MultilingualDto;
  cityId: string; // UUID, required
  phoneNumber?: string; // maxLength: 20
  latitude?: number; // -90 to 90
  longitude?: number; // -180 to 180
  slotDurationMinutes?: number; // 1-60, default: 15
  isActive?: boolean; // default: true
}

export interface UpdateClinicDto extends Partial<CreateClinicDto> {}

// ============================================
// SCHEDULE DTOs
// ============================================

export interface ShiftDto {
  startTime: string; // HH:mm format, required
  endTime: string; // HH:mm format, required
  breakTime?: string; // HH:mm format
}

export interface CreateScheduleDto {
  dayOfWeek: DayOfWeek; // required
  startTime?: string; // HH:mm format (legacy, use shifts instead)
  endTime?: string; // HH:mm format (legacy, use shifts instead)
  shifts?: ShiftDto[];
  slotDuration?: number; // 5-120 minutes
  maxPatients?: number; // min: 1, maximum patients per day
  isActive?: boolean; // default: true
}

export interface UpdateScheduleDto extends Partial<CreateScheduleDto> {}

// ============================================
// SERVICE TYPE DTOs
// ============================================

export interface CreateServiceTypeDto {
  serviceType: ServiceType; // required
  name?: MultilingualDto; // optional custom name
  price: number; // required, 0-100000
  duration?: number; // 1-240 minutes
  reVisitValidityDays?: number; // min: 1
  isActive?: boolean; // default: true
}

export interface UpdateServiceTypeDto extends Partial<CreateServiceTypeDto> {}

// ============================================
// APPOINTMENT DTOs
// ============================================

export interface CreateAppointmentDto {
  clinicId: string; // UUID, required
  serviceTypeId: string; // UUID, required
  appointmentDate: string; // YYYY-MM-DD format, required (per Swagger)
  appointmentTime?: string; // HH:mm format, optional
  patientProfileId?: string; // UUID, for booking for family members
  notes?: string; // maxLength: 500
}

export interface CreateSecretaryAppointmentDto {
  clinicId: string; // UUID, required
  serviceTypeId: string; // UUID, required
  appointmentDate: string; // YYYY-MM-DD format, required
  patientName: string; // 2-100 chars, required
  patientDateOfBirth: string; // YYYY-MM-DD format, required
  patientPhone?: string; // optional
  notes?: string; // maxLength: 500
  symptoms?: string; // maxLength: 500
}

export interface UpdateAppointmentStatusDto {
  status: AppointmentStatus; // required
  cancellationReason?: string; // maxLength: 500
}

export interface UpdateMedicalNotesDto {
  diagnosis?: string; // maxLength: 2000
  prescription?: string; // maxLength: 2000
  notes?: string; // maxLength: 2000
}

export interface UpdatePaymentStatusDto {
  paymentStatus: PaymentStatus; // required
  paymentMethod?: PaymentMethod;
}

// ============================================
// APPOINTMENT FILTER DTOs
// ============================================

export interface AppointmentFilterDto {
  clinicId?: string; // UUID
  status?: AppointmentStatus;
  paymentStatus?: PaymentStatus;
  date?: string; // ISO date string
  dateFrom?: string; // ISO date string
  dateTo?: string; // ISO date string
  search?: string; // search by patient name or booking number
  serviceTypeId?: string; // UUID
  upcoming?: boolean;
  page?: number;
  limit?: number;
}

export interface PatientAppointmentFilterDto {
  status?: AppointmentStatus;
  paymentStatus?: PaymentStatus;
  dateFrom?: string; // ISO date string
  dateTo?: string; // ISO date string
  clinicId?: string; // UUID
  doctorId?: string; // UUID
  upcoming?: boolean;
  forFamilyMember?: boolean;
  page?: number;
  limit?: number;
}

// ============================================
// RATING DTOs
// ============================================

export interface CreateRatingDto {
  appointmentId: string; // UUID, required
  rating: number; // 1-5, required
  review?: string; // maxLength: 1000
}

// ============================================
// AUTH - CHANGE PASSWORD DTO
// ============================================

export interface ChangePasswordDto {
  currentPassword: string; // required
  newPassword: string; // minLength: 8, maxLength: 50, required
}

// ============================================
// ADMIN - SPECIALTY DTOs
// ============================================

export interface CreateSpecialtyDto {
  name: MultilingualDto; // required
  description?: MultilingualDto;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean; // default: true
}

export interface UpdateSpecialtyDto {
  name?: MultilingualDto;
  description?: MultilingualDto;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
}

// ============================================
// ADMIN - STATE DTOs
// ============================================

export interface CreateStateDto {
  name: MultilingualDto; // required
  code: string; // maxLength: 10, required
  sortOrder?: number;
  isActive?: boolean; // default: true
}

export interface UpdateStateDto {
  name?: MultilingualDto;
  code?: string; // maxLength: 10
  sortOrder?: number;
  isActive?: boolean;
}

// ============================================
// ADMIN - CITY DTOs
// ============================================

export interface CreateCityDto {
  stateId: string; // UUID, required
  name: MultilingualDto; // required
  sortOrder?: number;
  isActive?: boolean; // default: true
}

export interface UpdateCityDto {
  stateId?: string; // UUID
  name?: MultilingualDto;
  sortOrder?: number;
  isActive?: boolean;
}
