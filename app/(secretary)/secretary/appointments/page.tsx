"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Calendar, Plus } from "lucide-react";
import { AppointmentList } from "@/features/secretary";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { useTour, SECRETARY_APPOINTMENTS_TOUR_ID, secretaryAppointmentsSteps } from "@/lib/tour";

export default function SecretaryAppointmentsPage() {
  const { t } = useTranslation();
  const { startTour } = useTour();

  useEffect(() => {
    const timer = setTimeout(() => {
      startTour(SECRETARY_APPOINTMENTS_TOUR_ID, secretaryAppointmentsSteps);
    }, 1500);
    return () => clearTimeout(timer);
  }, [startTour]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Calendar className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t("secretary.appointmentsPage.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("secretary.appointmentsPage.subtitle")}
            </p>
          </div>
        </div>
        <Button asChild data-tour="secretary-book-btn">
          <Link href="/secretary/appointments/new">
            <Plus className="h-4 w-4 me-2" />
            {t("secretary.bookAppointment")}
          </Link>
        </Button>
      </div>

      {/* Appointments List */}
      <AppointmentList showBookButton={false} />
    </div>
  );
}
