"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppointmentQueue } from "@/features/doctor-portal";
import { useTranslation } from "@/lib/i18n";
import { useTour, DOCTOR_APPOINTMENTS_TOUR_ID, doctorAppointmentsSteps } from "@/lib/tour";

export function DoctorAppointmentsContent() {
  const { t } = useTranslation();
  const { startTour } = useTour();

  useEffect(() => {
    const timer = setTimeout(() => {
      startTour(DOCTOR_APPOINTMENTS_TOUR_ID, doctorAppointmentsSteps);
    }, 1500);
    return () => clearTimeout(timer);
  }, [startTour]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Calendar className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {t("doctor.appointmentsPage.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("doctor.appointmentsPage.subtitle")}
            </p>
          </div>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/doctor/appointments/new">
            <Plus className="h-4 w-4 me-2" />
            {t("doctor.walkIn.title")}
          </Link>
        </Button>
      </div>

      {/* Appointment Queue */}
      <AppointmentQueue />
    </div>
  );
}
