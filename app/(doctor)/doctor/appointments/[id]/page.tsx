import { Metadata } from 'next';
import { DoctorAppointmentDetails } from '@/features/doctor-portal/components/appointment-details';

export const metadata: Metadata = {
  title: 'تفاصيل الموعد - الطبيب',
  description: 'عرض وإدارة تفاصيل الموعد',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DoctorAppointmentDetailsPage({ params }: PageProps) {
  const { id } = await params;

  return <DoctorAppointmentDetails appointmentId={id} />;
}
