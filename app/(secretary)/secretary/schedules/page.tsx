'use client';

import { useState } from 'react';
import { Clock, Building2, Frown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScheduleManager } from '@/features/doctor-portal/components/schedule-manager';
import {
  useSecretaryClinics,
  useSecretaryClinicSchedules,
  useSecretaryCreateSchedule,
  useSecretaryUpdateSchedule,
} from '@/features/secretary';
import { useTranslation } from '@/lib/i18n';
import { getLocalizedText } from '@/lib/utils/multilingual';

export default function SecretarySchedulesPage() {
  const { t, locale } = useTranslation();
  const { data: clinics, isLoading: clinicsLoading } = useSecretaryClinics();
  const [selectedClinicId, setSelectedClinicId] = useState<string>('');

  if (clinicsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!clinics || clinics.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Clock className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('secretary.schedulesPage.title')}</h1>
            <p className="text-muted-foreground">{t('secretary.schedulesPage.subtitle')}</p>
          </div>
        </div>
        <Card>
          <CardContent className="py-10 text-center">
            <Frown className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">{t('secretary.noClinicsAssigned')}</p>
            <p className="text-sm text-muted-foreground mt-1">{t('secretary.contactAdmin')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <Clock className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('secretary.schedulesPage.title')}</h1>
          <p className="text-muted-foreground">{t('secretary.schedulesPage.subtitle')}</p>
        </div>
      </div>

      {/* Clinic Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Label className="flex items-center gap-2 whitespace-nowrap">
              <Building2 className="h-4 w-4" />
              {t('secretary.selectClinic')}
            </Label>
            <Select value={selectedClinicId} onValueChange={setSelectedClinicId}>
              <SelectTrigger className="w-72">
                <SelectValue placeholder={t('secretary.selectClinic')} />
              </SelectTrigger>
              <SelectContent>
                {clinics.map((clinic) => (
                  <SelectItem key={clinic.id} value={clinic.id}>
                    {getLocalizedText(clinic.name, locale)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Manager */}
      {selectedClinicId ? (
        <ScheduleManager
          clinicId={selectedClinicId}
          schedulesHook={useSecretaryClinicSchedules}
          createHook={useSecretaryCreateSchedule}
          updateHook={useSecretaryUpdateSchedule}
        />
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">{t('secretary.selectClinic')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
