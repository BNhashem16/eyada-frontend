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

  // Payment Methods
  PAYMENT_METHODS: "/payment-methods",
  PAYMENT_METHOD: (id: string) => `/payment-methods/${id}`,

  // Clinic Prepayment Info
  CLINIC_PREPAYMENT_INFO: (id: string) => `/clinics/${id}/prepayment-info`,

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

  // Addresses
  ADDRESSES: "/patients/addresses",
  ADDRESS: (id: string) => `/patients/addresses/${id}`,
  ADDRESS_SET_DEFAULT: (id: string) => `/patients/addresses/${id}/set-default`,
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

  // Payment Accounts
  PAYMENT_ACCOUNTS: "/doctors/payment-accounts",
  PAYMENT_ACCOUNT: (id: string) => `/doctors/payment-accounts/${id}`,

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

  // Payment Methods management
  PAYMENT_METHODS: "/admin/payment-methods",
  PAYMENT_METHODS_STATISTICS: "/admin/payment-methods/statistics",
  PAYMENT_METHOD: (id: string) => `/admin/payment-methods/${id}`,

  // Doctor Prepayment management
  DOCTOR_PREPAYMENT: (id: string) => `/admin/doctors/${id}/prepayment`,
  DOCTOR_PAYMENT_ACCOUNTS: (id: string) =>
    `/admin/doctors/${id}/payment-accounts`,
  DOCTOR_PAYMENT_ACCOUNT: (doctorId: string, accountId: string) =>
    `/admin/doctors/${doctorId}/payment-accounts/${accountId}`,

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

  // Drivers management
  DRIVERS: "/admin/drivers",
  DRIVER: (id: string) => `/admin/drivers/${id}`,
  APPROVE_DRIVER: (id: string) => `/admin/drivers/${id}/approve`,
  REJECT_DRIVER: (id: string) => `/admin/drivers/${id}/reject`,
  SUSPEND_DRIVER: (id: string) => `/admin/drivers/${id}/suspend`,
  ACTIVATE_DRIVER: (id: string) => `/admin/drivers/${id}/activate`,
  ASSIGN_DRIVER_TO_ORDER: (orderId: string) =>
    `/admin/pharmacy-orders/${orderId}/assign-driver`,
  AVAILABLE_DRIVERS_FOR_ORDER: (orderId: string) =>
    `/admin/pharmacy-orders/${orderId}/available-drivers`,
} as const;

// Pharmacy Owner endpoints (requires PHARMACY_OWNER role)
export const PHARMACY_OWNER_ENDPOINTS = {
  // Profile
  PROFILE: "/pharmacy-owner/profile",

  // Pharmacies
  PHARMACIES: "/pharmacy-owner/pharmacies",
  PHARMACY: (id: string) => `/pharmacy-owner/pharmacies/${id}`,

  // Products
  PRODUCTS: (pharmacyId: string) =>
    `/pharmacy-owner/pharmacies/${pharmacyId}/products`,
  PRODUCT: (pharmacyId: string, productId: string) =>
    `/pharmacy-owner/pharmacies/${pharmacyId}/products/${productId}`,

  // Orders
  ORDERS: (pharmacyId: string) =>
    `/pharmacy-owner/pharmacies/${pharmacyId}/orders`,
  ORDER: (pharmacyId: string, orderId: string) =>
    `/pharmacy-owner/pharmacies/${pharmacyId}/orders/${orderId}`,
  ORDER_STATUS: (pharmacyId: string, orderId: string) =>
    `/pharmacy-owner/pharmacies/${pharmacyId}/orders/${orderId}/status`,

  // Wallet
  WALLET: (pharmacyId: string) =>
    `/pharmacy-owner/pharmacies/${pharmacyId}/wallet`,
  WALLET_TRANSACTIONS: (pharmacyId: string) =>
    `/pharmacy-owner/pharmacies/${pharmacyId}/wallet/transactions`,
  REQUEST_SETTLEMENT: (pharmacyId: string) =>
    `/pharmacy-owner/pharmacies/${pharmacyId}/wallet/settlements`,

  // Campaigns
  CAMPAIGNS: (pharmacyId: string) =>
    `/pharmacy-owner/pharmacies/${pharmacyId}/campaigns`,
  CAMPAIGN: (pharmacyId: string, campaignId: string) =>
    `/pharmacy-owner/pharmacies/${pharmacyId}/campaigns/${campaignId}`,
  CAMPAIGN_STATUS: (pharmacyId: string, campaignId: string) =>
    `/pharmacy-owner/pharmacies/${pharmacyId}/campaigns/${campaignId}/status`,

  // Dashboard
  DASHBOARD: (pharmacyId: string) =>
    `/pharmacy-owner/pharmacies/${pharmacyId}/dashboard`,

  // Drivers
  DRIVERS: (pharmacyId: string) =>
    `/pharmacy-owner/pharmacies/${pharmacyId}/drivers`,
  DRIVER: (pharmacyId: string, driverId: string) =>
    `/pharmacy-owner/pharmacies/${pharmacyId}/drivers/${driverId}`,
  APPROVE_DRIVER: (pharmacyId: string, driverId: string) =>
    `/pharmacy-owner/pharmacies/${pharmacyId}/drivers/${driverId}/approve`,
  REJECT_DRIVER: (pharmacyId: string, driverId: string) =>
    `/pharmacy-owner/pharmacies/${pharmacyId}/drivers/${driverId}/reject`,
  SUSPEND_DRIVER: (pharmacyId: string, driverId: string) =>
    `/pharmacy-owner/pharmacies/${pharmacyId}/drivers/${driverId}/suspend`,
  ACTIVATE_DRIVER: (pharmacyId: string, driverId: string) =>
    `/pharmacy-owner/pharmacies/${pharmacyId}/drivers/${driverId}/activate`,

  // Driver Assignment
  ASSIGN_DRIVER: (pharmacyId: string, orderId: string) =>
    `/pharmacy-owner/pharmacies/${pharmacyId}/orders/${orderId}/assign-driver`,
  REASSIGN_DRIVER: (pharmacyId: string, orderId: string) =>
    `/pharmacy-owner/pharmacies/${pharmacyId}/orders/${orderId}/reassign-driver`,
  AVAILABLE_DRIVERS: (pharmacyId: string, orderId: string) =>
    `/pharmacy-owner/pharmacies/${pharmacyId}/orders/${orderId}/available-drivers`,
} as const;

// Public pharmacy endpoints (no auth required)
export const PUBLIC_PHARMACY_ENDPOINTS = {
  // Pharmacies
  PHARMACIES: "/pharmacies",
  PHARMACY: (id: string) => `/pharmacies/${id}`,

  // Products
  PRODUCTS: "/pharmacy-products",
  PRODUCT: (id: string) => `/pharmacy-products/${id}`,

  // Categories
  CATEGORIES: "/pharmacy-categories",
  CATEGORY: (id: string) => `/pharmacy-categories/${id}`,
} as const;

// Patient pharmacy endpoints (requires PATIENT role)
export const PATIENT_PHARMACY_ENDPOINTS = {
  // Cart
  CART: "/patients/cart",
  CART_ITEM: (itemId: string) => `/patients/cart/items/${itemId}`,
  CART_ADD: "/patients/cart/items",

  // Orders
  ORDERS: "/patients/pharmacy-orders",
  PREVIEW_ORDER: "/patients/pharmacy-orders/preview",
  ORDER: (id: string) => `/patients/pharmacy-orders/${id}`,
  ORDER_CANCEL: (id: string) => `/patients/pharmacy-orders/${id}/cancel`,

  // Coupons
  VALIDATE_COUPON: "/patients/pharmacy-coupons/validate",

  // Campaigns
  PHARMACY_CAMPAIGNS: (pharmacyId: string) =>
    `/patients/pharmacies/${pharmacyId}/campaigns`,

  // Prescriptions
  UPLOAD_PRESCRIPTION: "/patients/prescriptions/upload",
} as const;

// Admin pharmacy endpoints (requires ADMIN role)
export const ADMIN_PHARMACY_ENDPOINTS = {
  // Pharmacy owners management
  PHARMACY_OWNERS: "/admin/pharmacy-owners",
  APPROVE_OWNER: (id: string) => `/admin/pharmacy-owners/${id}/approve`,
  REJECT_OWNER: (id: string) => `/admin/pharmacy-owners/${id}/reject`,
  SUSPEND_OWNER: (id: string) => `/admin/pharmacy-owners/${id}/suspend`,

  // Pharmacies management
  PHARMACIES: "/admin/pharmacies",
  PHARMACY: (id: string) => `/admin/pharmacies/${id}`,
  APPROVE_PHARMACY: (id: string) => `/admin/pharmacies/${id}/approve`,
  REJECT_PHARMACY: (id: string) => `/admin/pharmacies/${id}/reject`,
  SUSPEND_PHARMACY: (id: string) => `/admin/pharmacies/${id}/suspend`,

  // Categories management
  CATEGORIES: "/admin/pharmacy-categories",
  CATEGORY: (id: string) => `/admin/pharmacy-categories/${id}`,

  // Orders management
  ORDERS: "/admin/pharmacy-orders",
  ORDER: (id: string) => `/admin/pharmacy-orders/${id}`,
  ORDER_STATUS: (id: string) => `/admin/pharmacy-orders/${id}/status`,

  // Commissions
  PHARMACY_COMMISSIONS: "/admin/pharmacy-commissions",
  PHARMACY_COMMISSION: (pharmacyId: string) =>
    `/admin/pharmacy-commissions/${pharmacyId}`,

  // Coupons
  COUPONS: "/admin/pharmacy-coupons",
  COUPON: (id: string) => `/admin/pharmacy-coupons/${id}`,

  // Campaigns
  CAMPAIGNS: "/admin/pharmacy-campaigns",
  CAMPAIGN: (id: string) => `/admin/pharmacy-campaigns/${id}`,
  CAMPAIGN_STATUS: (id: string) => `/admin/pharmacy-campaigns/${id}/status`,

  // Settlements
  SETTLEMENTS: "/admin/pharmacy-settlements",
  SETTLEMENT: (id: string) => `/admin/pharmacy-settlements/${id}`,
  PROCESS_SETTLEMENT: (id: string) =>
    `/admin/pharmacy-settlements/${id}/process`,

  // Products management
  PRODUCTS: "/admin/pharmacy-products",

  // Dashboard
  PHARMACY_DASHBOARD: "/admin/pharmacy-dashboard",
} as const;

// Driver endpoints (requires DRIVER role)
export const DRIVER_ENDPOINTS = {
  PROFILE: "/driver/profile",
  AVAILABILITY: "/driver/availability",
  LOCATION: "/driver/location",
  DELIVERIES: "/driver/deliveries",
  DELIVERY: (id: string) => `/driver/deliveries/${id}`,
  PICKUP_DELIVERY: (id: string) => `/driver/deliveries/${id}/pickup`,
  COMPLETE_DELIVERY: (id: string) => `/driver/deliveries/${id}/complete`,
} as const;

// Upload endpoints
export const UPLOAD_ENDPOINTS = {
  IMAGE: "/uploads/image",
} as const;

// AI endpoints
export const AI_ENDPOINTS = {
  ADMIN_SETTINGS: "/admin/ai-settings",
  CHAT: "/ai/chat",
  CONVERSATIONS: "/ai/conversations",
  STATUS: "/ai/status",
} as const;
