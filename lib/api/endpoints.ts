// API Base URL
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Public endpoints (no auth required)
export const PUBLIC_TRACKING_ENDPOINTS = {
  TRACK_QUEUE: (bookingNumber: string) =>
    `/appointments/track/${bookingNumber}`,
} as const;

// Public feedback endpoints
export const PUBLIC_FEEDBACK_ENDPOINTS = {
  CREATE: "/feedbacks",
} as const;

// Authentication endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  REFRESH: "/auth/refresh",
  LOGOUT: "/auth/logout",
  LOGOUT_ALL: "/auth/logout-all",
  ME: "/auth/me",
  CHANGE_PASSWORD: "/auth/change-password",
} as const;

// Public endpoints
export const PUBLIC_ENDPOINTS = {
  // Doctors
  DOCTORS: "/doctors",
  DOCTOR: (id: string) => `/doctors/${id}`,
  DOCTOR_RATINGS: (id: string) => `/doctors/${id}/ratings`,

  // Clinics
  CLINICS: "/clinics",
  CLINIC: (id: string) => `/clinics/${id}`,
  CLINIC_SCHEDULES: (id: string) => `/clinics/${id}/schedules`,
  CLINIC_SERVICES: (id: string) => `/clinics/${id}/services`,
  CLINIC_AVAILABLE_SLOTS: (id: string) => `/clinics/${id}/available-slots`,

  // Specialties
  SPECIALTIES: "/specialties",
  SPECIALTY: (id: string) => `/specialties/${id}`,

  // Contact Links
  CONTACT_LINKS: "/contact-links",

  // Locations
  STATES: "/states",
  STATE: (id: string) => `/states/${id}`,
  CITIES: "/cities",
  CITY: (id: string) => `/cities/${id}`,
} as const;

// Patient endpoints (requires PATIENT role)
export const PATIENT_ENDPOINTS = {
  // Profile
  PROFILE: "/patients/profile/me", // GET uses /me endpoint
  CREATE_PROFILE: "/patients/profile", // POST
  UPDATE_PROFILE: "/patients/profile", // PATCH
  MEDICAL: "/patients/profile/medical",

  // Family
  FAMILY: "/patients/family",
  FAMILY_MEMBER: (id: string) => `/patients/family/${id}`,

  // Appointments
  APPOINTMENTS: "/patients/appointments",
  APPOINTMENT: (id: string) => `/patients/appointments/${id}`,
  CANCEL_APPOINTMENT: (id: string) => `/patients/appointments/${id}/cancel`,
  APPOINTMENT_MEDICAL_NOTES: (id: string) =>
    `/patients/appointments/${id}/medical-notes`,

  // Ratings
  RATINGS: "/patients/ratings",
  RATING: (id: string) => `/patients/ratings/${id}`,
} as const;

// Doctor endpoints (requires DOCTOR role)
export const DOCTOR_ENDPOINTS = {
  // Profile
  PROFILE: "/doctors/profile/me",
  CREATE_PROFILE: "/doctors/profile",
  UPDATE_PROFILE: "/doctors/profile",

  // Clinics
  CLINICS: "/doctors/clinics",
  CLINIC: (id: string) => `/doctors/clinics/${id}`,
  DELETE_CLINIC: (id: string) => `/doctors/clinics/${id}`,
  CLINIC_TOGGLE_ACTIVE: (id: string) => `/doctors/clinics/${id}/toggle-active`,

  // Schedules
  CLINIC_SCHEDULES: (clinicId: string) =>
    `/doctors/clinics/${clinicId}/schedules`,
  CLINIC_SCHEDULE: (clinicId: string, scheduleId: string) =>
    `/doctors/clinics/${clinicId}/schedules/${scheduleId}`,

  // Services
  CLINIC_SERVICES: (clinicId: string) =>
    `/doctors/clinics/${clinicId}/services`,
  CLINIC_SERVICE: (clinicId: string, serviceId: string) =>
    `/doctors/clinics/${clinicId}/services/${serviceId}`,
  CLINIC_SERVICE_TOGGLE_ACTIVE: (clinicId: string, serviceId: string) =>
    `/doctors/clinics/${clinicId}/services/${serviceId}/toggle-active`,

  // Appointments
  APPOINTMENTS: "/doctors/appointments",
  APPOINTMENT: (id: string) => `/doctors/appointments/${id}`,
  APPOINTMENT_STATUS: (id: string) => `/doctors/appointments/${id}/status`,
  APPOINTMENT_MEDICAL_NOTES: (id: string) =>
    `/doctors/appointments/${id}/medical-notes`,
  APPOINTMENT_PAYMENT: (id: string) => `/doctors/appointments/${id}/payment`,

  // Statistics & Dashboard
  TODAY_OVERVIEW: "/doctors/appointments/today-overview",
  STATISTICS: "/doctors/appointments/statistics",
  PATIENT_HISTORY: "/doctors/appointments/patient-history",
  CHECK_REVISIT: "/doctors/appointments/check-revisit",

  // Ratings
  RATINGS: "/doctors/ratings",
} as const;

// Secretary endpoints (requires SECRETARY role)
export const SECRETARY_ENDPOINTS = {
  // Clinics
  CLINICS: "/secretary/appointments/clinics",

  // Schedules
  CLINIC_SCHEDULES: (clinicId: string) =>
    `/secretary/clinics/${clinicId}/schedules`,
  CLINIC_SCHEDULE: (clinicId: string, scheduleId: string) =>
    `/secretary/clinics/${clinicId}/schedules/${scheduleId}`,

  // Appointments
  APPOINTMENTS: "/secretary/appointments",
  APPOINTMENT: (id: string) => `/secretary/appointments/${id}`,
  APPOINTMENT_STATUS: (id: string) => `/secretary/appointments/${id}/status`,
  APPOINTMENT_PAYMENT: (id: string) => `/secretary/appointments/${id}/payment`,

  // Statistics & Dashboard
  TODAY_OVERVIEW: "/secretary/appointments/today-overview",
  STATISTICS: "/secretary/appointments/statistics",
  PATIENT_HISTORY: "/secretary/appointments/patient-history",
  CHECK_REVISIT: "/secretary/appointments/check-revisit",

  // Ratings
  RATINGS: "/secretary/ratings",

  // Patients search
  PATIENTS_SEARCH: "/secretary/patients/search",
  PATIENT: (id: string) => `/secretary/patients/${id}`,
} as const;

// Doctor Secretaries endpoints (requires DOCTOR role)
export const DOCTOR_SECRETARIES_ENDPOINTS = {
  // Secretaries management
  SECRETARIES: "/doctors/secretaries",
  SECRETARY: (id: string) => `/doctors/secretaries/${id}`,
  ASSIGN: "/doctors/secretaries/assign",
  CLINIC_SECRETARIES: (clinicId: string) =>
    `/doctors/secretaries/clinic/${clinicId}`,
  ASSIGNMENT: (assignmentId: string) =>
    `/doctors/secretaries/assignment/${assignmentId}`,
} as const;

// Admin endpoints (requires ADMIN role)
export const ADMIN_ENDPOINTS = {
  // Dashboard
  DASHBOARD_STATISTICS: "/admin/dashboard/statistics",

  // Doctors management
  DOCTORS: "/admin/doctors",
  DOCTOR: (id: string) => `/admin/doctors/${id}`,
  DOCTORS_STATISTICS: "/admin/doctors/statistics",
  APPROVE_DOCTOR: (id: string) => `/admin/doctors/${id}/approve`,
  REJECT_DOCTOR: (id: string) => `/admin/doctors/${id}/reject`,
  SUSPEND_DOCTOR: (id: string) => `/admin/doctors/${id}/suspend`,

  // Patients management
  PATIENTS: "/admin/patients",
  PATIENT: (id: string) => `/admin/patients/${id}`,
  PATIENTS_STATISTICS: "/admin/patients/statistics",
  APPROVE_PATIENT: (id: string) => `/admin/patients/${id}/approve`,
  REJECT_PATIENT: (id: string) => `/admin/patients/${id}/reject`,
  SUSPEND_PATIENT: (id: string) => `/admin/patients/${id}/suspend`,

  // Specialties (CRUD) - per Swagger: /admin/specialties
  SPECIALTIES: "/admin/specialties",
  SPECIALTIES_STATISTICS: "/admin/specialties/statistics",
  SPECIALTY: (id: string) => `/admin/specialties/${id}`,

  // Locations (CRUD) - per Swagger: /admin/states, /admin/cities
  STATES: "/admin/states",
  STATE: (id: string) => `/admin/states/${id}`,
  CITIES: "/admin/cities",
  CITY: (id: string) => `/admin/cities/${id}`,

  // Secretaries management
  SECRETARIES: "/admin/secretaries",
  SECRETARY: (id: string) => `/admin/secretaries/${id}`,
  SECRETARIES_STATISTICS: "/admin/secretaries/statistics",
  ASSIGN_SECRETARY: "/admin/secretaries/assign",
  SECRETARY_ASSIGNMENT: (assignmentId: string) =>
    `/admin/secretaries/assignment/${assignmentId}`,

  // Appointments management
  APPOINTMENTS: "/admin/appointments",
  APPOINTMENT: (id: string) => `/admin/appointments/${id}`,
  APPOINTMENTS_STATISTICS: "/admin/appointments/statistics",

  // Clinics management
  CLINICS: "/admin/clinics",
  CLINIC: (id: string) => `/admin/clinics/${id}`,
  CLINICS_STATISTICS: "/admin/clinics/statistics",

  // Clinic Schedules
  CLINIC_SCHEDULES: (clinicId: string) =>
    `/admin/clinics/${clinicId}/schedules`,
  CLINIC_SCHEDULE: (clinicId: string, scheduleId: string) =>
    `/admin/clinics/${clinicId}/schedules/${scheduleId}`,

  // Ratings management
  RATINGS: "/admin/ratings",
  RATING: (id: string) => `/admin/ratings/${id}`,
  RATINGS_STATISTICS: "/admin/ratings/statistics",

  // Contact Links management
  CONTACT_LINKS: "/admin/contact-links",
  CONTACT_LINK: (id: string) => `/admin/contact-links/${id}`,

  // Feedbacks management
  FEEDBACKS: "/admin/feedbacks",
  FEEDBACKS_STATISTICS: "/admin/feedbacks/statistics",
  FEEDBACK: (id: string) => `/admin/feedbacks/${id}`,
  FEEDBACK_STATUS: (id: string) => `/admin/feedbacks/${id}/status`,

  // Commissions management
  COMMISSIONS: "/admin/commissions",
  COMMISSION: (id: string) => `/admin/commissions/${id}`,
  COMMISSION_SUMMARY: "/admin/commissions/summary",
  COMMISSION_BALANCES: "/admin/commissions/balances",
  COMMISSION_DOCTOR_REPORT: (doctorId: string) =>
    `/admin/commissions/balances/${doctorId}/report`,
  COMMISSION_PAYMENTS: "/admin/commissions/payments",
  COMMISSION_PAYMENT_HISTORY: (doctorId: string) =>
    `/admin/commissions/payments/${doctorId}`,
} as const;

// AI endpoints
export const AI_ENDPOINTS = {
  ADMIN_SETTINGS: "/admin/ai-settings",
  CHAT: "/ai/chat",
  CONVERSATIONS: "/ai/conversations",
  STATUS: "/ai/status",
} as const;
