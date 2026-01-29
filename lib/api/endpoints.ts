// API Base URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Authentication endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  LOGOUT_ALL: '/auth/logout-all',
  ME: '/auth/me',
  CHANGE_PASSWORD: '/auth/change-password',
} as const;

// Public endpoints
export const PUBLIC_ENDPOINTS = {
  // Doctors
  DOCTORS: '/doctors',
  DOCTOR: (id: string) => `/doctors/${id}`,
  DOCTOR_RATINGS: (id: string) => `/doctors/${id}/ratings`,

  // Clinics
  CLINICS: '/clinics',
  CLINIC: (id: string) => `/clinics/${id}`,
  CLINIC_SCHEDULES: (id: string) => `/clinics/${id}/schedules`,
  CLINIC_SERVICES: (id: string) => `/clinics/${id}/services`,
  CLINIC_AVAILABLE_SLOTS: (id: string) => `/clinics/${id}/available-slots`,

  // Specialties
  SPECIALTIES: '/specialties',
  SPECIALTY: (id: string) => `/specialties/${id}`,

  // Locations
  STATES: '/states',
  STATE: (id: string) => `/states/${id}`,
  CITIES: '/cities',
  CITY: (id: string) => `/cities/${id}`,
} as const;

// Patient endpoints (requires PATIENT role)
export const PATIENT_ENDPOINTS = {
  // Profile
  PROFILE: '/patients/profile',
  MEDICAL: '/patients/profile/medical',

  // Family
  FAMILY: '/patients/family',
  FAMILY_MEMBER: (id: string) => `/patients/family/${id}`,

  // Appointments
  APPOINTMENTS: '/patients/appointments',
  APPOINTMENT: (id: string) => `/patients/appointments/${id}`,
  CANCEL_APPOINTMENT: (id: string) => `/patients/appointments/${id}/cancel`,
  APPOINTMENT_MEDICAL_NOTES: (id: string) => `/patients/appointments/${id}/medical-notes`,

  // Ratings
  RATINGS: '/patients/ratings',
} as const;

// Doctor endpoints (requires DOCTOR role)
export const DOCTOR_ENDPOINTS = {
  // Profile
  PROFILE: '/doctors/profile/me',
  UPDATE_PROFILE: '/doctors/profile',

  // Clinics
  CLINICS: '/doctors/clinics',
  CLINIC: (id: string) => `/doctors/clinics/${id}`,
  CLINIC_TOGGLE_ACTIVE: (id: string) => `/doctors/clinics/${id}/toggle-active`,

  // Schedules
  CLINIC_SCHEDULES: (clinicId: string) => `/doctors/clinics/${clinicId}/schedules`,
  CLINIC_SCHEDULE: (clinicId: string, scheduleId: string) =>
    `/doctors/clinics/${clinicId}/schedules/${scheduleId}`,

  // Services
  CLINIC_SERVICES: (clinicId: string) => `/doctors/clinics/${clinicId}/services`,
  CLINIC_SERVICE: (clinicId: string, serviceId: string) =>
    `/doctors/clinics/${clinicId}/services/${serviceId}`,
  CLINIC_SERVICE_TOGGLE_ACTIVE: (clinicId: string, serviceId: string) =>
    `/doctors/clinics/${clinicId}/services/${serviceId}/toggle-active`,

  // Appointments
  APPOINTMENTS: '/doctors/appointments',
  APPOINTMENT: (id: string) => `/doctors/appointments/${id}`,
  APPOINTMENT_STATUS: (id: string) => `/doctors/appointments/${id}/status`,
  APPOINTMENT_MEDICAL_NOTES: (id: string) => `/doctors/appointments/${id}/medical-notes`,
  APPOINTMENT_PAYMENT: (id: string) => `/doctors/appointments/${id}/payment`,

  // Ratings
  RATINGS: '/doctors/ratings',
} as const;

// Secretary endpoints (requires SECRETARY role)
export const SECRETARY_ENDPOINTS = {
  // Clinics
  CLINICS: '/secretary/appointments/clinics',

  // Appointments
  APPOINTMENTS: '/secretary/appointments',
  APPOINTMENT: (id: string) => `/secretary/appointments/${id}`,
  APPOINTMENT_STATUS: (id: string) => `/secretary/appointments/${id}/status`,
  APPOINTMENT_PAYMENT: (id: string) => `/secretary/appointments/${id}/payment`,
} as const;

// Admin endpoints (requires ADMIN role)
export const ADMIN_ENDPOINTS = {
  // Doctors management
  PENDING_DOCTORS: '/admin/doctors/pending',
  APPROVE_DOCTOR: (id: string) => `/admin/doctors/${id}/approve`,
  REJECT_DOCTOR: (id: string) => `/admin/doctors/${id}/reject`,
  SUSPEND_DOCTOR: (id: string) => `/admin/doctors/${id}/suspend`,

  // Specialties (CRUD)
  SPECIALTIES: '/specialties',
  SPECIALTY: (id: string) => `/specialties/${id}`,

  // Locations (CRUD)
  STATES: '/states',
  STATE: (id: string) => `/states/${id}`,
  CITIES: '/cities',
  CITY: (id: string) => `/cities/${id}`,
} as const;
