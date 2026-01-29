import { Metadata } from 'next';
import { PatientDashboard } from '@/features/patients';

export const metadata: Metadata = {
  title: 'لوحة التحكم - المريض',
  description: 'لوحة تحكم المريض',
};

export default function PatientDashboardPage() {
  return <PatientDashboard />;
}
