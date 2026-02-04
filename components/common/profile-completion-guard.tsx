'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { usePatientProfile } from '@/features/patients/hooks/use-patient';
import { useDoctorProfile } from '@/features/doctor-portal/hooks/use-doctor-portal';
import { Role, DoctorStatus, PatientStatus } from '@/types';

interface ProfileCompletionGuardProps {
  children: React.ReactNode;
  role: Role;
}

export function ProfileCompletionGuard({ children, role }: ProfileCompletionGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isPatient = role === Role.PATIENT;
  const isDoctor = role === Role.DOCTOR;

  // Only fetch the profile for the relevant role
  const patientProfile = usePatientProfile({ enabled: isPatient });
  const doctorProfile = useDoctorProfile({ enabled: isDoctor });

  useEffect(() => {
    // Skip if already on profile page
    if (pathname.includes('/profile')) {
      return;
    }

    if (isPatient) {
      // Skip if still loading
      if (patientProfile.isLoading) return;

      // Check if patient profile doesn't exist or is incomplete
      if (!patientProfile.data) {
        router.push('/patient/profile');
      } else {
        const profile = patientProfile.data;
        const isIncomplete = !profile.dateOfBirth || !profile.gender;
        // Redirect to profile if incomplete OR if pending approval
        if (isIncomplete || profile.status === PatientStatus.PENDING) {
          router.push('/patient/profile');
        }
      }
    }

    if (isDoctor) {
      // Skip if still loading
      if (doctorProfile.isLoading) return;

      // Check if doctor profile doesn't exist
      if (!doctorProfile.data) {
        router.push('/doctor/profile');
      } else {
        // Redirect to profile if pending approval
        if (doctorProfile.data.status === DoctorStatus.PENDING) {
          router.push('/doctor/profile');
        }
      }
    }
  }, [
    role,
    pathname,
    router,
    isPatient,
    isDoctor,
    patientProfile.isLoading,
    patientProfile.data,
    doctorProfile.isLoading,
    doctorProfile.data,
  ]);

  return <>{children}</>;
}
