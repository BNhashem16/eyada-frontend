"use client";

import { PageHeader } from "@/components/common";
import { DoctorRatings } from "@/features/doctor-portal/components";
import { useTranslation } from "@/lib/i18n";

export function DoctorRatingsContent() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.ratings")}
        description={t("doctor.ratingsPageDescription")}
      />
      <DoctorRatings />
    </div>
  );
}
