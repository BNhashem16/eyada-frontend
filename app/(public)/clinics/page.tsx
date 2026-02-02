'use client';

import { Building2 } from 'lucide-react';
import { ClinicList } from '@/features/clinics';
import { useTranslation } from '@/lib/i18n';

export default function ClinicsPage() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t('pages.clinics.title')}</h1>
        </div>
        <p className="text-muted-foreground">
          {t('pages.clinics.subtitle')}
        </p>
      </div>

      {/* Clinic List with Filters */}
      <ClinicList />
    </div>
  );
}
