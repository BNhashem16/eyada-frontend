'use client';

import Link from 'next/link';
import {
  Calendar,
  Clock,
  User,
  Users,
  ChevronLeft,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { usePatientAppointments } from '../hooks/use-patient';
import { useAuthStore } from '@/lib/auth/store';
import { AppointmentStatus } from '@/types/enums';
import { formatDate, formatTime, isPast } from '@/lib/utils/date';
import { getInitials } from '@/lib/utils';

const statusLabels: Record<AppointmentStatus, string> = {
  [AppointmentStatus.PENDING]: 'قيد الانتظار',
  [AppointmentStatus.CONFIRMED]: 'مؤكد',
  [AppointmentStatus.CHECKED_IN]: 'في العيادة',
  [AppointmentStatus.COMPLETED]: 'مكتمل',
  [AppointmentStatus.CANCELLED]: 'ملغي',
  [AppointmentStatus.NO_SHOW]: 'لم يحضر',
};

export function PatientDashboard() {
  const { user } = useAuthStore();
  const { data: appointmentsData, isLoading } = usePatientAppointments({ limit: 5 });

  const appointments = appointmentsData?.data ?? [];
  const upcomingAppointments = appointments.filter(
    (a) =>
      a.status === AppointmentStatus.PENDING ||
      a.status === AppointmentStatus.CONFIRMED
  );

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-l from-primary-500 to-primary-700 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          أهلاً، {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-primary-100 mb-4">
          نتمنى لك يوماً سعيداً وصحة جيدة
        </p>
        <Button asChild variant="secondary" className="bg-white text-primary-600 hover:bg-primary-50">
          <Link href="/doctors">
            <Stethoscope className="h-4 w-4 ms-2" />
            احجز موعد جديد
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">المواعيد القادمة</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '-' : upcomingAppointments.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-success-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-success-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">المواعيد المكتملة</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading
                    ? '-'
                    : appointments.filter((a) => a.status === AppointmentStatus.COMPLETED)
                        .length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-warning-100 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-warning-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">تنبيه</p>
                  <p className="font-semibold text-gray-900">
                    {upcomingAppointments.length > 0
                      ? `لديك ${upcomingAppointments.length} موعد قادم`
                      : 'لا توجد مواعيد قادمة'}
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/patient/appointments">
                  عرض الكل
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary-600" />
            المواعيد القادمة
          </CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/patient/appointments">
              عرض الكل
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : upcomingAppointments.length > 0 ? (
            <div className="space-y-3">
              {upcomingAppointments.slice(0, 3).map((appointment) => {
                const date = new Date(appointment.appointmentDate);

                return (
                  <div
                    key={appointment.id}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={appointment.clinic?.doctor?.user?.profilePicture || undefined}
                      />
                      <AvatarFallback>
                        {getInitials(appointment.clinic?.doctor?.user?.name || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        د. {appointment.clinic?.doctor?.user?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(date, 'EEEE, d MMMM')} -{' '}
                        <span dir="ltr">{formatTime(appointment.startTime)}</span>
                      </p>
                    </div>
                    <Badge
                      variant={
                        appointment.status === AppointmentStatus.CONFIRMED
                          ? 'success'
                          : 'warning'
                      }
                    >
                      {statusLabels[appointment.status]}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-600">لا توجد مواعيد قادمة</p>
              <Button asChild className="mt-4">
                <Link href="/doctors">احجز موعد الآن</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/doctors">
          <Card className="hover:border-primary-300 hover:shadow-md transition-all cursor-pointer h-full">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-primary-100 flex items-center justify-center">
                <Stethoscope className="h-7 w-7 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">ابحث عن طبيب</h3>
                <p className="text-sm text-gray-500">تصفح الأطباء واحجز موعد</p>
              </div>
              <ChevronLeft className="h-5 w-5 text-gray-400 ms-auto" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/patient/profile">
          <Card className="hover:border-primary-300 hover:shadow-md transition-all cursor-pointer h-full">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-secondary-100 flex items-center justify-center">
                <User className="h-7 w-7 text-secondary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">الملف الشخصي</h3>
                <p className="text-sm text-gray-500">تحديث بياناتك الشخصية</p>
              </div>
              <ChevronLeft className="h-5 w-5 text-gray-400 ms-auto" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/patient/family">
          <Card className="hover:border-primary-300 hover:shadow-md transition-all cursor-pointer h-full">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-warning-100 flex items-center justify-center">
                <Users className="h-7 w-7 text-warning-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">أفراد العائلة</h3>
                <p className="text-sm text-gray-500">إدارة أفراد عائلتك</p>
              </div>
              <ChevronLeft className="h-5 w-5 text-gray-400 ms-auto" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
