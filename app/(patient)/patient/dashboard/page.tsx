import { Metadata } from 'next';
import { PatientDashboard } from '@/features/patients';
import { getTranslation } from '@/lib/i18n';

export const metadata: Metadata = {
  title: getTranslation('meta.patientDashboard.title'),
  description: getTranslation('meta.patientDashboard.description'),
};

export default function PatientDashboardPage() {
  return <PatientDashboard />;
}
