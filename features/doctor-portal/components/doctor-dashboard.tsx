'use client';

import Link from 'next/link';
import {
  Calendar,
  Clock,
  Users,
  Star,
  ChevronLeft,
  Building2,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useDoctorAppointments, useDoctorClinics, useDoctorProfile } from '../hooks/use-doctor-portal';
import { useAuthStore } from '@/lib/auth/store';
import { AppointmentStatus } from '@/types/enums';
import { formatDate, formatTime } from '@/lib/utils/date';
import { getInitials } from '@/lib/utils';

const statusLabels: Record<AppointmentStatus, string> = {
  [AppointmentStatus.PENDING]: 'قيد الانتظار',
  [AppointmentStatus.CONFIRMED]: 'مؤكد',
  [AppointmentStatus.CHECKED_IN]: 'في العيادة',
  [AppointmentStatus.COMPLETED]: 'مكتمل',
  [AppointmentStatus.CANCELLED]: 'ملغي',
  [AppointmentStatus.NO_SHOW]: 'لم يحضر',
};

export function DoctorDashboard() {
  const { user } = useAuthStore();
  const { data: profile, isLoading: profileLoading } = useDoctorProfile();
  const { data: clinics, isLoading: clinicsLoading } = useDoctorClinics();

  // Get today's appointments
  const today = formatDate(new Date(), 'yyyy-MM-dd');
  const { data: todayAppointments, isLoading: appointmentsLoading } = useDoctorAppointments({
    date: today,
    limit: 50,
  });

  const appointments = todayAppointments?.data ?? [];
  const pendingCount = appointments.filter((a) => a.status === AppointmentStatus.PENDING).length;
  const confirmedCount = appointments.filter((a) => a.status === AppointmentStatus.CONFIRMED).length;
  const checkedInCount = appointments.filter((a) => a.status === AppointmentStatus.CHECKED_IN).length;
  const completedCount = appointments.filter((a) => a.status === AppointmentStatus.COMPLETED).length;

  // Queue - only confirmed and checked-in appointments
  const queueAppointments = appointments
    .filter(
      (a) =>
        a.status === AppointmentStatus.CONFIRMED || a.status === AppointmentStatus.CHECKED_IN
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-l from-primary-500 to-primary-700 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          مرحباً، د. {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-primary-100 mb-4">
          {formatDate(new Date(), 'EEEE, d MMMM yyyy')}
        </p>
        <div className="flex flex-wrap gap-4">
          {profileLoading ? (
            <Skeleton className="h-6 w-24 bg-primary-400" />
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-warning-300 text-warning-300" />
                <span className="font-semibold">{profile?.averageRating?.toFixed(1) || '0'}</span>
                <span className="text-primary-200">({profile?.totalRatings || 0} تقييم)</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                <span>{clinics?.length || 0} عيادة</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-warning-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">بانتظار التأكيد</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointmentsLoading ? '-' : pendingCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">في الانتظار</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointmentsLoading ? '-' : confirmedCount + checkedInCount}
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
                <p className="text-sm text-gray-500">مكتمل اليوم</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointmentsLoading ? '-' : completedCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-secondary-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-secondary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">إجمالي اليوم</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointmentsLoading ? '-' : appointments.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Queue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary-600" />
            قائمة الانتظار
          </CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/doctor/appointments">
              عرض الكل
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {appointmentsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-9 w-24" />
                </div>
              ))}
            </div>
          ) : queueAppointments.length > 0 ? (
            <div className="space-y-3">
              {queueAppointments.slice(0, 5).map((appointment, index) => (
                <div
                  key={appointment.id}
                  className={`flex items-center gap-4 p-3 rounded-lg ${
                    index === 0 ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'
                  }`}
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={appointment.patient?.user?.profilePicture || undefined}
                    />
                    <AvatarFallback>
                      {getInitials(appointment.patient?.user?.name || '')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {appointment.patient?.user?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span dir="ltr">{formatTime(appointment.startTime)}</span>
                      {' - '}
                      {appointment.service?.nameAr || appointment.service?.nameEn}
                    </p>
                  </div>
                  <Badge
                    variant={
                      appointment.status === AppointmentStatus.CHECKED_IN
                        ? 'primary'
                        : 'success'
                    }
                  >
                    {statusLabels[appointment.status]}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-600">لا يوجد مرضى في قائمة الانتظار</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/doctor/appointments">
          <Card className="hover:border-primary-300 hover:shadow-md transition-all cursor-pointer h-full">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-primary-100 flex items-center justify-center">
                <Calendar className="h-7 w-7 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">المواعيد</h3>
                <p className="text-sm text-gray-500">إدارة مواعيد المرضى</p>
              </div>
              <ChevronLeft className="h-5 w-5 text-gray-400 ms-auto" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/doctor/clinics">
          <Card className="hover:border-primary-300 hover:shadow-md transition-all cursor-pointer h-full">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-secondary-100 flex items-center justify-center">
                <Building2 className="h-7 w-7 text-secondary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">العيادات</h3>
                <p className="text-sm text-gray-500">إدارة العيادات والمواعيد</p>
              </div>
              <ChevronLeft className="h-5 w-5 text-gray-400 ms-auto" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/doctor/profile">
          <Card className="hover:border-primary-300 hover:shadow-md transition-all cursor-pointer h-full">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-warning-100 flex items-center justify-center">
                <Star className="h-7 w-7 text-warning-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">الملف الشخصي</h3>
                <p className="text-sm text-gray-500">تحديث بياناتك والتقييمات</p>
              </div>
              <ChevronLeft className="h-5 w-5 text-gray-400 ms-auto" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
