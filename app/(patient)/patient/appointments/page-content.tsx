"use client";

import { Calendar, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppointmentList } from "@/features/patients";
import { useTranslation } from "@/lib/i18n";

export function PatientAppointmentsContent() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Calendar className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t("patient.appointmentsPage.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("patient.appointmentsPage.subtitle")}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/doctors">
            <Plus className="h-4 w-4" />
            {t("appointments.bookNew")}
          </Link>
        </Button>
      </div>

      {/* Appointment List */}
      <AppointmentList />
    </div>
  );
}
