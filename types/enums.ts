// User roles in the system
export enum Role {
  ADMIN = "ADMIN",
  DOCTOR = "DOCTOR",
  SECRETARY = "SECRETARY",
  PATIENT = "PATIENT",
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
