'use client';

import { Frown } from 'lucide-react';
import { SpecialtyCard } from './specialty-card';
import { useSpecialties } from '../hooks/use-specialties';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export function SpecialtyList() {
  const { data: specialties, isLoading, isError, error } = useSpecialties();

  // Loading State
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6 flex flex-col items-center">
              <Skeleton className="h-16 w-16 rounded-2xl mb-4" />
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <Card className="border-error-200 bg-error-50">
        <CardContent className="py-10 text-center">
          <p className="text-error-600">
            حدث خطأ أثناء تحميل التخصصات. يرجى المحاولة مرة أخرى.
          </p>
          <p className="text-sm text-error-500 mt-2">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Empty State
  if (!specialties || specialties.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Frown className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            لا توجد تخصصات متاحة
          </h3>
          <p className="text-gray-600">
            سيتم إضافة التخصصات قريباً
          </p>
        </CardContent>
      </Card>
    );
  }

  // Specialties Grid
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {specialties
        .filter((s) => s.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((specialty) => (
          <SpecialtyCard key={specialty.id} specialty={specialty} />
        ))}
    </div>
  );
}
