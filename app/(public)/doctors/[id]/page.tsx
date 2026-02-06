import { Metadata } from 'next';
import { DoctorProfileComponent } from '@/features/doctors';
import { getTranslation } from '@/lib/i18n';

interface DoctorPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: getTranslation('meta.doctorProfile.title'),
  description: getTranslation('meta.doctorProfile.description'),
};

export default async function DoctorPage({ params }: DoctorPageProps) {
  const { id } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <DoctorProfileComponent doctorId={id} />
    </div>
  );
}
