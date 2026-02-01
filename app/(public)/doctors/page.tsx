'use client';

import { Stethoscope } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { DoctorList } from '@/features/doctors';
import { useMemo } from 'react';

export default function DoctorsPage() {
  const searchParams = useSearchParams();

  // Get initial filters from URL
  const initialFilters = useMemo(() => {
    const filters: {
      search?: string;
      specialtyId?: string;
      stateId?: string;
      cityId?: string;
    } = {};

    const search = searchParams.get('search');
    const specialty = searchParams.get('specialty');
    const state = searchParams.get('state');
    const city = searchParams.get('city');

    if (search) filters.search = search;
    if (specialty) filters.specialtyId = specialty;
    if (state) filters.stateId = state;
    if (city) filters.cityId = city;

    return filters;
  }, [searchParams]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Stethoscope className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">ابحث عن طبيب</h1>
        </div>
        <p className="text-muted-foreground">
          اعثر على أفضل الأطباء المتخصصين واحجز موعدك بسهولة
        </p>
      </div>

      {/* Doctor List with Filters */}
      <DoctorList initialFilters={initialFilters} />
    </div>
  );
}
