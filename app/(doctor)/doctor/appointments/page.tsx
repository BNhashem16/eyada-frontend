'use client';

import { Calendar } from 'lucide-react';
import { AppointmentQueue } from '@/features/doctor-portal';
import { useTranslation } from '@/lib/i18n';

export default function DoctorAppointmentsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <Calendar className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t('doctor.appointmentsPage.title')}</h1>
          <p className="text-muted-foreground">{t('doctor.appointmentsPage.subtitle')}</p>
        </div>
      </div>

      {/* Appointment Queue */}
      <AppointmentQueue />
    </div>
  );
}
