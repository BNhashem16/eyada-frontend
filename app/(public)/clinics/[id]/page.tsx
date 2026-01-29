import { Metadata } from 'next';
import { ClinicDetailsComponent } from '@/features/clinics';

interface ClinicPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'تفاصيل العيادة',
  description: 'عرض تفاصيل العيادة وحجز موعد',
};

export default async function ClinicPage({ params }: ClinicPageProps) {
  const { id } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <ClinicDetailsComponent clinicId={id} />
    </div>
  );
}
