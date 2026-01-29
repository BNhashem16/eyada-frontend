'use client';

import { use } from 'react';
import Link from 'next/link';
import { Building2, ChevronRight, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScheduleManager, ServiceManager } from '@/features/doctor-portal';
import { useDoctorClinic } from '@/features/doctor-portal/hooks/use-doctor-portal';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface ClinicManagePageProps {
  params: Promise<{ id: string }>;
}

export default function ClinicManagePage({ params }: ClinicManagePageProps) {
  const { id } = use(params);
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
      <Card className="border-error-200 bg-error-50">
        <CardContent className="py-10 text-center">
          <p className="text-error-600">العيادة غير موجودة</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/doctor/clinics">العودة للعيادات</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/doctor/clinics" className="hover:text-primary-600">
          العيادات
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900">{clinic.name}</span>
      </nav>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary-100 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{clinic.name}</h1>
            <p className="text-gray-600">إدارة مواعيد العمل والخدمات</p>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href={`/doctor/clinics/${id}/edit`}>
            <Settings className="h-4 w-4 ms-2" />
            تعديل البيانات
          </Link>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="schedule">
        <TabsList>
          <TabsTrigger value="schedule">مواعيد العمل</TabsTrigger>
          <TabsTrigger value="services">الخدمات والأسعار</TabsTrigger>
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
