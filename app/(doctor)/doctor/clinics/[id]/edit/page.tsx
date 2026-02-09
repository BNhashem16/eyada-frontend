"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ClinicForm } from "@/features/doctor-portal";
import { useDoctorClinic } from "@/features/doctor-portal/hooks/use-doctor-portal";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";
import { getLocalizedText } from "@/lib/utils/multilingual";

interface EditClinicPageProps {
  params: Promise<{ id: string }>;
}

export default function EditClinicPage({ params }: EditClinicPageProps) {
  const { id } = use(params);
  const { t, locale } = useTranslation();
  const { data: clinic, isLoading } = useDoctorClinic(id);

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/doctor/clinics"
          className="hover:text-primary-600 dark:hover:text-primary-400"
        >
          {t("nav.clinics")}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          href={`/doctor/clinics/${id}`}
          className="hover:text-primary-600 dark:hover:text-primary-400"
        >
          {getLocalizedText(clinic?.name, locale)}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{t("common.edit")}</span>
      </nav>

      <ClinicForm clinicId={id} />
    </div>
  );
}
