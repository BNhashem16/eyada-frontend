import { Metadata } from 'next';
import { DoctorProfileComponent } from '@/features/doctors';

interface DoctorPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'الملف الشخصي للطبيب',
  description: 'عرض الملف الشخصي للطبيب وحجز موعد',
};

export default async function DoctorPage({ params }: DoctorPageProps) {
  const { id } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <DoctorProfileComponent doctorId={id} />
    </div>
  );
}
