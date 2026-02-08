'use client';

import { use } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Building2, ChevronRight, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScheduleManager } from '@/features/doctor-portal';
import { useDoctorClinic } from '@/features/doctor-portal/hooks/use-doctor-portal';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';

const ServiceManager = dynamic(
  () => import('@/features/doctor-portal/components/service-manager').then(mod => ({ default: mod.ServiceManager })),
  {
    loading: () => (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    ),
  }
);

interface ClinicManagePageProps {
  params: Promise<{ id: string }>;
}

export default function ClinicManagePage({ params }: ClinicManagePageProps) {
  const { id } = use(params);
  const { t } = useTranslation();
  const { data: clinic, isLoading } = useDoctorClinic(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!clinic) {
    return (
      <Card className="border-error-200 dark:border-error-800 bg-error-50 dark:bg-error-900/20">
        <CardContent className="py-10 text-center">
          <p className="text-error-600 dark:text-error-400">{t('app.clinicNotFound')}</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/doctor/clinics">{t('app.backToClinics')}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/doctor/clinics" className="hover:text-primary-600 dark:hover:text-primary-400">
          {t('nav.clinics')}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{clinic.name?.ar || clinic.name?.en}</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
            <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">{clinic.name?.ar || clinic.name?.en}</h1>
            <p className="text-sm text-muted-foreground">{t('app.manageScheduleServices')}</p>
          </div>
        </div>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href={`/doctor/clinics/${id}/edit`}>
            <Settings className="h-4 w-4 ms-2" />
            {t('common.edit')}
          </Link>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="schedule">
        <TabsList className="w-full sm:w-auto overflow-x-auto">
          <TabsTrigger value="schedule">{t('app.workScheduleTab')}</TabsTrigger>
          <TabsTrigger value="services">{t('app.servicesAndPricesTab')}</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="mt-6">
          <ScheduleManager clinicId={id} />
        </TabsContent>

        <TabsContent value="services" className="mt-6">
          <ServiceManager clinicId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
