'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Plus,
  MapPin,
  Clock,
  DollarSign,
  Settings,
  ChevronLeft,
  Phone,
  Edit,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoctorClinics } from '../hooks/use-doctor-portal';
import { DayOfWeek } from '@/types/enums';

const dayNames: Record<DayOfWeek, string> = {
  [DayOfWeek.SUNDAY]: 'الأحد',
  [DayOfWeek.MONDAY]: 'الاثنين',
  [DayOfWeek.TUESDAY]: 'الثلاثاء',
  [DayOfWeek.WEDNESDAY]: 'الأربعاء',
  [DayOfWeek.THURSDAY]: 'الخميس',
  [DayOfWeek.FRIDAY]: 'الجمعة',
  [DayOfWeek.SATURDAY]: 'السبت',
};

export function ClinicManagement() {
  const { data: clinics, isLoading, isError } = useDoctorClinics();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex gap-4">
                <Skeleton className="h-16 w-16 rounded-xl" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-error-200 bg-error-50">
        <CardContent className="py-10 text-center">
          <p className="text-error-600">
            حدث خطأ أثناء تحميل العيادات. يرجى المحاولة مرة أخرى.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Clinic Button */}
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/doctor/clinics/new">
            <Plus className="h-4 w-4 ms-2" />
            إضافة عيادة جديدة
          </Link>
        </Button>
      </div>

      {/* Clinics List */}
      {clinics && clinics.length > 0 ? (
        <div className="space-y-4">
          {clinics.map((clinic) => {
            const workingDays = clinic.schedules
              ?.filter((s) => s.isAvailable)
              .map((s) => dayNames[s.dayOfWeek]);

            const consultationPrice = clinic.services?.find(
              (s) => s.serviceType === 'CONSULTATION'
            )?.price;

            return (
              <Card
                key={clinic.id}
                className="overflow-hidden hover:border-primary-200 transition-colors"
              >
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 h-16 w-16 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-primary-600" />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {clinic.name}
                          </h3>
                          {clinic.isActive ? (
                            <Badge variant="success" size="sm">
                              نشطة
                            </Badge>
                          ) : (
                            <Badge variant="secondary" size="sm">
                              غير نشطة
                            </Badge>
                          )}
                        </div>
                        {consultationPrice && (
                          <div className="text-end">
                            <span className="text-sm text-gray-500">الكشف</span>
                            <div className="font-bold text-primary-600">
                              {consultationPrice} ج.م
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>
                          {clinic.addressLine1}
                          {clinic.city && `, ${clinic.city.nameAr}`}
                        </span>
                      </div>

                      {/* Phone */}
                      {clinic.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span dir="ltr">{clinic.phone}</span>
                        </div>
                      )}

                      {/* Working Days */}
                      {workingDays && workingDays.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{workingDays.join('، ')}</span>
                        </div>
                      )}

                      {/* Services Count */}
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-500">
                          {clinic.services?.length || 0} خدمة
                        </span>
                        <span className="text-gray-500">
                          {clinic.schedules?.filter((s) => s.isAvailable).length || 0} يوم عمل
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/doctor/clinics/${clinic.id}`}>
                          <Settings className="h-4 w-4 ms-1" />
                          إدارة
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/doctor/clinics/${clinic.id}/edit`}>
                          <Edit className="h-4 w-4 ms-1" />
                          تعديل
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Building2 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              لا توجد عيادات
            </h3>
            <p className="text-gray-600 mb-4">
              قم بإضافة عيادتك الأولى لبدء استقبال الحجوزات
            </p>
            <Button asChild>
              <Link href="/doctor/clinics/new">
                <Plus className="h-4 w-4 ms-2" />
                إضافة عيادة جديدة
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
