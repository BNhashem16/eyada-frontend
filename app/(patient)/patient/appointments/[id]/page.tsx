import { Metadata } from 'next';
import { AppointmentDetails } from '@/features/patients/components/appointment-details';

export const metadata: Metadata = {
  title: 'تفاصيل الموعد - المريض',
  description: 'عرض تفاصيل الموعد',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientAppointmentDetailsPage({ params }: PageProps) {
  const { id } = await params;

  return <AppointmentDetails appointmentId={id} />;
}
