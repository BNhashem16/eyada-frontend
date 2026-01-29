import { Metadata } from 'next';
import { ClinicForm } from '@/features/doctor-portal';

export const metadata: Metadata = {
  title: 'إضافة عيادة جديدة',
  description: 'إضافة عيادة جديدة',
};

export default function NewClinicPage() {
  return (
    <div className="max-w-2xl">
      <ClinicForm />
    </div>
  );
}
