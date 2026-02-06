import { Metadata } from 'next';
import { DoctorDashboard } from '@/features/doctor-portal';
import { getTranslation } from '@/lib/i18n';

export const metadata: Metadata = {
  title: getTranslation('meta.doctorDashboard.title'),
  description: getTranslation('meta.doctorDashboard.description'),
};

export default function DoctorDashboardPage() {
  return <DoctorDashboard />;
}
