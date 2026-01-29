'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Frown } from 'lucide-react';
import { ClinicCard } from './clinic-card';
import { ClinicFiltersComponent, ClinicFilters } from './clinic-filters';
import { useClinics } from '../hooks/use-clinics';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface ClinicListProps {
  initialFilters?: ClinicFilters;
}

export function ClinicList({ initialFilters = {} }: ClinicListProps) {
  const [filters, setFilters] = useState<ClinicFilters>(initialFilters);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError, error } = useClinics({ filters, page, limit });

  const clinics = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;
  const totalItems = data?.meta?.total ?? 0;

  const handleFiltersChange = (newFilters: ClinicFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar Filters */}
      <aside className="w-full lg:w-72 flex-shrink-0">
        <ClinicFiltersComponent filters={filters} onFiltersChange={handleFiltersChange} />
      </aside>

      {/* Results */}
      <main className="flex-1">
        {/* Results Count */}
        {!isLoading && !isError && (
          <div className="mb-4 text-sm text-gray-600">
            عرض {clinics.length} من {totalItems} عيادة
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    <Skeleton className="h-20 w-20 rounded-xl" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-64" />
                      <Skeleton className="h-4 w-40" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <Card className="border-error-200 bg-error-50">
            <CardContent className="py-10 text-center">
              <p className="text-error-600">
                حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.
              </p>
              <p className="text-sm text-error-500 mt-2">
                {error instanceof Error ? error.message : 'Unknown error'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !isError && clinics.length === 0 && (
          <Card>
            <CardContent className="py-16 text-center">
              <Frown className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                لم يتم العثور على عيادات
              </h3>
              <p className="text-gray-600 mb-4">
                جرب تغيير معايير البحث أو مسح الفلاتر
              </p>
              <Button variant="outline" onClick={() => handleFiltersChange({})}>
                مسح الفلاتر
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Clinics Grid */}
        {!isLoading && !isError && clinics.length > 0 && (
          <div className="space-y-4">
            {clinics.map((clinic) => (
              <ClinicCard key={clinic.id} clinic={clinic} showBookButton />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !isError && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronRight className="h-4 w-4" />
              السابق
            </Button>

            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? 'default' : 'ghost'}
                    size="sm"
                    className="w-9"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              التالي
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
