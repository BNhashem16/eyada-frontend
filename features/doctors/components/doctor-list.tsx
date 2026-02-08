"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Frown } from "lucide-react";
import { DoctorCard } from "./doctor-card";
import { DoctorFiltersComponent, DoctorFilters } from "./doctor-filters";
import { useDoctors } from "../hooks/use-doctors";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";

interface DoctorListProps {
  initialFilters?: DoctorFilters;
}

export function DoctorList({ initialFilters = {} }: DoctorListProps) {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<DoctorFilters>(initialFilters);
  const [page, setPage] = useState(1);

  // Sync filters when initialFilters change (e.g., from URL params after hydration)
  useEffect(() => {
    if (Object.keys(initialFilters).length > 0) {
      setFilters(initialFilters);
    }
  }, [JSON.stringify(initialFilters)]);
  const limit = 10;

  const { data, isLoading, isError, error } = useDoctors({
    filters,
    page,
    limit,
  });

  const doctors = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;
  const totalItems = data?.meta?.total ?? 0;

  const handleFiltersChange = (newFilters: DoctorFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar Filters */}
      <aside className="w-full lg:w-72 lg:flex-shrink-0">
        <DoctorFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </aside>

      {/* Results */}
      <main className="flex-1">
        {/* Results Count */}
        {!isLoading && !isError && (
          <div className="mb-4 text-sm text-muted-foreground">
            {t("doctor.showingResults")
              .replace("{count}", String(doctors.length))
              .replace("{total}", String(totalItems))}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    <Skeleton className="h-48 w-full sm:h-auto sm:w-48 rounded-none" />
                    <div className="flex-1 p-5 space-y-3">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-36" />
                      </div>
                      <div className="flex justify-between pt-3 border-t">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-9 w-28" />
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
          <Card className="border-error-200 dark:border-error-800 bg-error-50 dark:bg-error-900/20">
            <CardContent className="py-10 text-center">
              <p className="text-error-600 dark:text-error-400">
                {t("doctor.loadError")}
              </p>
              <p className="text-sm text-error-500 dark:text-error-400 mt-2">
                {error instanceof Error ? error.message : t("common.error")}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !isError && doctors.length === 0 && (
          <Card>
            <CardContent className="py-16 text-center">
              <Frown className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t("doctor.noDoctorsFound")}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t("doctor.tryDifferentFilters")}
              </p>
              <Button variant="outline" onClick={() => handleFiltersChange({})}>
                {t("common.clearFilters")}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Doctors Grid */}
        {!isLoading && !isError && doctors.length > 0 && (
          <div className="space-y-4">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !isError && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              className="text-xs"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronRight className="h-4 w-4" />
              {t("common.previous")}
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
                    variant={page === pageNum ? "default" : "ghost"}
                    className="w-9 text-xs"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              className="text-xs"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              {t("common.next")}
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
