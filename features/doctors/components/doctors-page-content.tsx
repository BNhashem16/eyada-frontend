"use client";

import dynamic from "next/dynamic";
import { Stethoscope } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n";

const DoctorList = dynamic(
  () =>
    import("@/features/doctors/components/doctor-list").then(
      (mod) => ({ default: mod.DoctorList }),
    ),
  {
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      </div>
    ),
  },
);

export function DoctorsPageContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();

  // Get initial filters from URL
  const initialFilters = useMemo(() => {
    const filters: {
      search?: string;
      specialtyId?: string;
      stateId?: string;
      cityId?: string;
    } = {};

    const search = searchParams.get("search");
    const specialty = searchParams.get("specialty");
    const state = searchParams.get("state");
    const city = searchParams.get("city");

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
          <h1 className="text-2xl font-bold text-foreground">
            {t("pages.doctors.title")}
          </h1>
        </div>
        <p className="text-muted-foreground">{t("pages.doctors.subtitle")}</p>
      </div>

      {/* Doctor List with Filters */}
      <DoctorList initialFilters={initialFilters} />
    </div>
  );
}
