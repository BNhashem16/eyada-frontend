// User roles in the system
export enum Role {
  ADMIN = "ADMIN",
  DOCTOR = "DOCTOR",
  SECRETARY = "SECRETARY",
  PATIENT = "PATIENT",
  PHARMACY_OWNER = "PHARMACY_OWNER",
  DRIVER = "DRIVER",
}

// Gender options
export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

// Appointment lifecycle states
// Note: IN_PROGRESS is for future use (when doctor starts seeing patient)
// Backend currently uses CHECKED_IN for "patient arrived"
export enum AppointmentStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CHECKED_IN = "CHECKED_IN",
  IN_PROGRESS = "IN_PROGRESS", // Reserved for future use
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  NO_SHOW = "NO_SHOW",
}

// Payment status
export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  REFUNDED = "REFUNDED",
}

// Payment methods
export enum PaymentMethod {
  CASH = "CASH",
  CARD = "CARD",
  INSURANCE = "INSURANCE",
  INSTAPAY = "INSTAPAY",
  VODAFONE_CASH = "VODAFONE_CASH",
  ETISALAT_CASH = "ETISALAT_CASH",
}

// Booking source (how the appointment was booked)
export enum BookingSource {
  PHONE = "PHONE",
  CLINIC = "CLINIC",
}

// Types of medical services
export enum ServiceType {
  FIRST_VISIT = "FIRST_VISIT",
  RE_VISIT = "RE_VISIT",
  CONSULTATION_PHONE = "CONSULTATION_PHONE",
  CONSULTATION_VIDEO = "CONSULTATION_VIDEO",
}

// Days of the week
export enum DayOfWeek {
  SUNDAY = "SUNDAY",
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
}

// Doctor approval status
export enum DoctorStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  SUSPENDED = "SUSPENDED",
}

// Patient approval status
export enum PatientStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  SUSPENDED = "SUSPENDED",
}

// Family relationship types
export enum RelationshipType {
  SELF = "SELF",
  SPOUSE = "SPOUSE",
  CHILD = "CHILD",
  PARENT = "PARENT",
  SIBLING = "SIBLING",
  OTHER = "OTHER",
}

// Contact link platforms
export enum ContactLinkPlatform {
  FACEBOOK = "FACEBOOK",
  TWITTER = "TWITTER",
  INSTAGRAM = "INSTAGRAM",
  WHATSAPP = "WHATSAPP",
  PHONE = "PHONE",
  EMAIL = "EMAIL",
  WEBSITE = "WEBSITE",
  TIKTOK = "TIKTOK",
  YOUTUBE = "YOUTUBE",
  LINKEDIN = "LINKEDIN",
  SNAPCHAT = "SNAPCHAT",
  TELEGRAM = "TELEGRAM",
  OTHER = "OTHER",
}

// Pharmacy status
export enum PharmacyStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  SUSPENDED = "SUSPENDED",
}

export enum DriverStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  SUSPENDED = "SUSPENDED",
}

export enum VehicleType {
  MOTORCYCLE = "MOTORCYCLE",
  CAR = "CAR",
  VAN = "VAN",
  BICYCLE = "BICYCLE",
  TRUCK = "TRUCK",
  PICKUP = "PICKUP",
  SCOOTER = "SCOOTER",
}

// Pharmacy order status
export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PREPARING = "PREPARING",
  READY_FOR_PICKUP = "READY_FOR_PICKUP",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  RETURNED = "RETURNED",
  REFUNDED = "REFUNDED",
}

// Pharmacy order payment status
export enum PharmacyOrderPaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

// Delivery type
export enum DeliveryType {
  SELF_DELIVERY = "SELF_DELIVERY",
  PLATFORM_DRIVER = "PLATFORM_DRIVER",
  THIRD_PARTY = "THIRD_PARTY",
}

// Pharmacy commission type
export enum PharmacyCommissionType {
  PERCENTAGE = "PERCENTAGE",
  TIERED = "TIERED",
  PROMOTIONAL = "PROMOTIONAL",
}

// Coupon type
export enum CouponType {
  PERCENTAGE = "PERCENTAGE",
  FIXED = "FIXED",
  FREE_DELIVERY = "FREE_DELIVERY",
}

// Campaign calculation type
export enum CampaignCalculationType {
  PERCENTAGE = "PERCENTAGE",
  FIXED = "FIXED",
}

// Campaign status
export enum CampaignStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  ENDED = "ENDED",
}

// Discount type
export enum DiscountType {
  PLATFORM_SUBSIDY = "PLATFORM_SUBSIDY",
  PHARMACY_FUNDED = "PHARMACY_FUNDED",
  COUPON = "COUPON",
  FREE_DELIVERY = "FREE_DELIVERY",
  FIRST_ORDER = "FIRST_ORDER",
}

// Settlement status
export enum SettlementStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

// Blood types
export enum BloodType {
  A_POSITIVE = "A+",
  A_NEGATIVE = "A-",
  B_POSITIVE = "B+",
  B_NEGATIVE = "B-",
  AB_POSITIVE = "AB+",
  AB_NEGATIVE = "AB-",
  O_POSITIVE = "O+",
  O_NEGATIVE = "O-",
}
