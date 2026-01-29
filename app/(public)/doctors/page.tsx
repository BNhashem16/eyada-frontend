import { Metadata } from 'next';
import { Stethoscope } from 'lucide-react';
import { DoctorList } from '@/features/doctors';

export const metadata: Metadata = {
  title: 'ابحث عن طبيب',
  description: 'ابحث عن أفضل الأطباء في مصر واحجز موعدك الآن',
};

export default function DoctorsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-primary-100 flex items-center justify-center">
            <Stethoscope className="h-6 w-6 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ابحث عن طبيب</h1>
        </div>
        <p className="text-gray-600">
          اعثر على أفضل الأطباء المتخصصين واحجز موعدك بسهولة
        </p>
      </div>

      {/* Doctor List with Filters */}
      <DoctorList />
    </div>
  );
}
