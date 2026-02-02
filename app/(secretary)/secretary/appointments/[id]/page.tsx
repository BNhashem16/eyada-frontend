import { Metadata } from 'next';
import { SecretaryAppointmentDetails } from '@/features/secretary/components/appointment-details';

export const metadata: Metadata = {
  title: 'تفاصيل الموعد - السكرتير',
  description: 'عرض وإدارة تفاصيل الموعد',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SecretaryAppointmentDetailsPage({ params }: PageProps) {
  const { id } = await params;

  return <SecretaryAppointmentDetails appointmentId={id} />;
}
