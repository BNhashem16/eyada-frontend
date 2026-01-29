import { Metadata } from 'next';
import { DoctorDashboard } from '@/features/doctor-portal';

export const metadata: Metadata = {
  title: 'لوحة التحكم - الطبيب',
  description: 'لوحة تحكم الطبيب',
};

export default function DoctorDashboardPage() {
  return <DoctorDashboard />;
}
