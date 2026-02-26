"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { usePatientProfile } from "@/features/patients/hooks/use-patient";
import { useDoctorProfile } from "@/features/doctor-portal/hooks/use-doctor-portal";
import { usePharmacyOwnerProfile } from "@/features/pharmacy-owner/hooks/use-pharmacy-owner-profile";
import { Role, DoctorStatus, PatientStatus, PharmacyStatus } from "@/types";

interface ProfileCompletionGuardProps {
  children: React.ReactNode;
  role: Role;
}

export function ProfileCompletionGuard({
  children,
  role,
}: ProfileCompletionGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isPatient = role === Role.PATIENT;
  const isDoctor = role === Role.DOCTOR;
  const isPharmacyOwner = role === Role.PHARMACY_OWNER;

  // Only fetch the profile for the relevant role
  const patientProfile = usePatientProfile({ enabled: isPatient });
  const doctorProfile = useDoctorProfile({ enabled: isDoctor });
  const pharmacyOwnerProfile = usePharmacyOwnerProfile({
    enabled: isPharmacyOwner,
  });

  useEffect(() => {
    // Skip if already on profile page
    if (pathname.includes("/profile")) {
      return;
    }

    if (isPatient) {
      // Skip if still loading
      if (patientProfile.isLoading) return;

      // Check if patient profile doesn't exist or is incomplete
      if (!patientProfile.data) {
        router.push("/patient/profile");
      } else {
        const profile = patientProfile.data;
        const isIncomplete = !profile.dateOfBirth || !profile.gender;
        // Redirect to profile if incomplete OR if pending approval
        if (isIncomplete || profile.status === PatientStatus.PENDING) {
          router.push("/patient/profile");
        }
      }
    }

    if (isDoctor) {
      // Skip if still loading
      if (doctorProfile.isLoading) return;

      // Check if doctor profile doesn't exist
      if (!doctorProfile.data) {
        router.push("/doctor/profile");
      } else {
        // Redirect to profile if pending approval
        if (doctorProfile.data.status === DoctorStatus.PENDING) {
          router.push("/doctor/profile");
        }
      }
    }

    if (isPharmacyOwner) {
      // Skip if still loading
      if (pharmacyOwnerProfile.isLoading) return;

      // Only redirect if profile doesn't exist at all.
      // Don't block on PENDING — owner needs to create a pharmacy first,
      // then admin approves the pharmacy (which updates profile status).
      if (!pharmacyOwnerProfile.data) {
        router.push("/pharmacy-owner/profile");
      }
    }
  }, [
    role,
    pathname,
    router,
    isPatient,
    isDoctor,
    isPharmacyOwner,
    patientProfile.isLoading,
    patientProfile.data,
    doctorProfile.isLoading,
    doctorProfile.data,
    pharmacyOwnerProfile.isLoading,
    pharmacyOwnerProfile.data,
  ]);

  return <>{children}</>;
}
