import {
  Role,
  Gender,
  AppointmentStatus,
  PaymentStatus,
  ServiceType,
  DayOfWeek,
  DoctorStatus,
  PatientStatus,
  RelationshipType,
} from "./enums";

// Bilingual text support
export interface Multilingual {
  ar: string;
  en: string;
}

// Base timestamps for all models
export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

// User model
export interface User extends Timestamps {
  id: string;
  email: string;
  phoneNumber: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  isApproved: boolean;
  lastLoginAt?: string;
  profilePicture?: string;
  // Alias for fullName (some components use name)
  name?: string;
}

// Auth response from login/register
// Backend may return tokens nested or flat depending on wrapper
export interface AuthResponse {
  // Nested format: { tokens: { accessToken, refreshToken }, user }
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
  // Flat format: { accessToken, refreshToken, user }
  accessToken?: string;
  refreshToken?: string;
  user: User;
}

// Auth tokens
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Specialty model
export interface Specialty extends Timestamps {
  id: string;
  name: Multilingual;
  description?: Multilingual;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
}

// State (Governorate) model
export interface State extends Timestamps {
  id: string;
  name: Multilingual;
  code: string;
  isActive: boolean;
  sortOrder: number;
}

// City model
export interface City extends Timestamps {
  id: string;
  stateId: string;
  name: Multilingual;
  isActive: boolean;
  sortOrder: number;
  state?: State;
}

// Doctor Profile model
export interface DoctorProfile extends Timestamps {
  id: string;
  userId: string;
  specialtyId: string;
  licenseNumber?: string;
  yearsOfExperience?: number;
  qualifications?: Multilingual;
  bio?: Multilingual;
  profileImage?: string;
  showPhoneNumber: boolean;
  showWhatsappNumber: boolean;
  whatsappNumbers: string[];
  status: DoctorStatus;
  averageRating: number;
  totalRatings: number;
  totalAppointments: number;
  approvedAt?: string;
  approvedBy?: string;
  user: User;
  specialty: Specialty;
  clinics?: Clinic[];
}

// Patient Profile model
export interface PatientProfile extends Timestamps {
  id: string;
  userId: string;
  dateOfBirth?: string;
  age?: number;
  gender?: Gender;
  whatsappNumber?: string;
  usePhoneAsWhatsapp: boolean;
  bloodType?: string;
  chronicDiseases?: string[];
  allergies?: string[];
  familyHeadId?: string;
  relationshipToHead: RelationshipType;
  // Approval Status
  status?: PatientStatus;
  approvedAt?: string;
  approvedBy?: string;
  user: User;
  familyMembers?: FamilyMember[];
}

// Family Member model (matching Swagger AddFamilyMemberDto)
export interface FamilyMember extends Timestamps {
  id: string;
  patientId: string;
  fullName: string;
  dateOfBirth?: string;
  age?: number;
  gender?: Gender;
  relationship?: RelationshipType;
  relationshipToHead?: RelationshipType;
  bloodType?: string;
  user?: User;
}

// Clinic model
export interface Clinic extends Timestamps {
  id: string;
  doctorProfileId: string;
  cityId: string;
  name: Multilingual;
  description?: Multilingual;
  address: Multilingual;
  buildingNumber?: string;
  floorNumber?: string;
  clinicNumber?: string;
  landmark?: Multilingual;
  latitude?: number;
  longitude?: number;
  phoneNumber?: string;
  phoneNumbers: string[];
  whatsappNumbers: string[];
  images: string[];
  slotDurationMinutes?: number;
  isActive: boolean;
  doctorProfile?: DoctorProfile;
  city?: City;
  schedules?: ClinicSchedule[];
  serviceTypes?: ClinicServiceType[];
  secretaries?: ClinicSecretary[];
}

// Clinic Secretary model
export interface ClinicSecretary extends Timestamps {
  id: string;
  clinicId: string;
  userId: string;
  isActive: boolean;
  user?: User;
}

// Clinic Schedule model
export interface ClinicSchedule extends Timestamps {
  id: string;
  clinicId: string;
  dayOfWeek: DayOfWeek;
  shifts: ScheduleShift[];
  slotDuration: number;
  maxPatients?: number;
  isActive: boolean;
}

// Schedule Shift
export interface ScheduleShift {
  startTime: string;
  endTime: string;
  breakTime?: string;
}

// Clinic Service Type model
// Note: API returns price as string (e.g., "50") despite Swagger specifying number
export interface ClinicServiceType extends Timestamps {
  id: string;
  doctorProfileId: string;
  clinicId?: string;
  serviceType: ServiceType;
  name?: Multilingual;
  price: number | string; // API returns string, Swagger says number
  duration: number;
  reVisitValidityDays?: number;
  isActive: boolean;
}

// Appointment model
export interface Appointment extends Timestamps {
  id: string;
  bookingNumber: string;
  clinicId: string;
  doctorProfileId: string;
  patientProfileId: string;
  bookedForPatientId: string;
  serviceTypeId: string;
  appointmentDate: string;
  appointmentTime: string;
  queueNumber?: number;
  estimatedWaitTime?: number;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  patientName: string;
  patientAge?: number;
  serviceName: Multilingual;
  price: number;
  patientNotes?: string;
  symptoms?: string;
  diagnosis?: string;
  prescription?: string;
  doctorNotes?: string;
  cancellationReason?: string;
  cancelledById?: string;
  cancelledAt?: string;
  bookedBy: string;
  bookedById: string;
  completedAt?: string;
  clinic?: Clinic;
  doctorProfile?: DoctorProfile;
  patientProfile?: PatientProfile;
  bookedForPatient?: PatientProfile;
  serviceType?: ClinicServiceType;
  rating?: Rating;
}

// Rating model
export interface Rating extends Timestamps {
  id: string;
  appointmentId: string;
  doctorProfileId: string;
  patientProfileId: string;
  rating: number;
  review?: string;
  isVisible: boolean;
  appointment?: Appointment;
  doctorProfile?: DoctorProfile;
  patientProfile?: PatientProfile;
}

// Public doctor ratings response - GET /doctors/{doctorId}/ratings
export interface PublicDoctorRatingsResponse {
  ratings: Rating[];
  averageRating: number;
  totalRatings: number;
}

// Doctor's own ratings response with statistics - GET /doctors/ratings
export interface DoctorRatingsWithStats {
  ratings: Rating[];
  statistics: {
    averageRating: number;
    totalRatings: number;
    ratingDistribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  };
}

// Available slot for booking
export interface AvailableSlot {
  time: string;
  isAvailable: boolean;
}

// Pagination metadata
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// API Error response
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
  errorCode?: string;
}

// Secretary assignment model
export interface SecretaryAssignment extends Timestamps {
  id: string;
  clinicId: string;
  userId: string;
  isActive: boolean;
  assignedBy?: string;
  clinic?: Clinic;
  user?: User;
}

// Secretary with clinics
export interface SecretaryWithClinics extends User {
  clinics: {
    id: string;
    name: Multilingual;
    assignmentId: string;
    isActive: boolean;
    assignedAt: string;
  }[];
}

// Secretary ratings response
export interface SecretaryRatingsResponse {
  ratings: Rating[];
  statistics: {
    averageRating: number;
    totalRatings: number;
  };
}
