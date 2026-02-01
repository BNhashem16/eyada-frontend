'use client';

import { useState } from 'react';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  User,
  CheckCircle,
  XCircle,
  UserCheck,
  Play,
  Phone,
  Calendar,
  Filter,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  useDoctorAppointments,
  useDoctorClinics,
  useUpdateAppointmentStatus,
} from '../hooks/use-doctor-portal';
import { useToast } from '@/hooks/use-toast';
import { Appointment } from '@/types';
import { AppointmentStatus } from '@/types/enums';
import { formatDate, formatTime, addDays } from '@/lib/utils/date';
import { getInitials } from '@/lib/utils';

const statusLabels: Record<AppointmentStatus, string> = {
  [AppointmentStatus.PENDING]: 'قيد الانتظار',
  [AppointmentStatus.CONFIRMED]: 'مؤكد',
  [AppointmentStatus.CHECKED_IN]: 'في العيادة',
  [AppointmentStatus.COMPLETED]: 'مكتمل',
  [AppointmentStatus.CANCELLED]: 'ملغي',
  [AppointmentStatus.NO_SHOW]: 'لم يحضر',
};

const statusColors: Record<AppointmentStatus, string> = {
  [AppointmentStatus.PENDING]: 'bg-warning-100 text-warning-700',
  [AppointmentStatus.CONFIRMED]: 'bg-success-100 text-success-700',
  [AppointmentStatus.CHECKED_IN]: 'bg-primary-100 text-primary-700',
  [AppointmentStatus.COMPLETED]: 'bg-muted text-muted-foreground',
  [AppointmentStatus.CANCELLED]: 'bg-error-100 text-error-700',
  [AppointmentStatus.NO_SHOW]: 'bg-muted/70 text-muted-foreground',
};

export function AppointmentQueue() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date(), 'yyyy-MM-dd'));
  const [selectedClinic, setSelectedClinic] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | ''>('');

  const { data: clinics } = useDoctorClinics();
  const { data: appointmentsData, isLoading } = useDoctorAppointments({
    date: selectedDate,
    clinicId: selectedClinic || undefined,
    status: statusFilter || undefined,
    limit: 50,
  });

  const updateStatusMutation = useUpdateAppointmentStatus();

  const appointments = appointmentsData?.data ?? [];

  const handleStatusUpdate = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ appointmentId, status: newStatus });
      toast({
        title: 'تم التحديث',
        description: 'تم تحديث حالة الموعد بنجاح',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'فشل التحديث',
        description: 'حدث خطأ أثناء تحديث حالة الموعد',
        variant: 'error',
      });
    }
  };

  const goToPreviousDay = () => {
    const date = new Date(selectedDate);
    setSelectedDate(formatDate(addDays(date, -1), 'yyyy-MM-dd'));
  };

  const goToNextDay = () => {
    const date = new Date(selectedDate);
    setSelectedDate(formatDate(addDays(date, 1), 'yyyy-MM-dd'));
  };

  const getAvailableActions = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.PENDING:
        return [
          { status: AppointmentStatus.CONFIRMED, label: 'تأكيد', icon: CheckCircle, color: 'success' },
          { status: AppointmentStatus.CANCELLED, label: 'إلغاء', icon: XCircle, color: 'destructive' },
        ];
      case AppointmentStatus.CONFIRMED:
        return [
          { status: AppointmentStatus.CHECKED_IN, label: 'وصل', icon: UserCheck, color: 'primary' },
          { status: AppointmentStatus.NO_SHOW, label: 'لم يحضر', icon: XCircle, color: 'secondary' },
        ];
      case AppointmentStatus.CHECKED_IN:
        return [
          { status: AppointmentStatus.COMPLETED, label: 'إنهاء', icon: CheckCircle, color: 'success' },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Date Navigation */}
            <div className="flex items-center gap-2">
              <Button variant="outline" className="text-xs" onClick={goToPreviousDay}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40"
              />
              <Button variant="outline" className="text-xs" onClick={goToNextDay}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>

            {/* Clinic Filter */}
            <Select value={selectedClinic || 'all'} onValueChange={(v) => setSelectedClinic(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="كل العيادات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل العيادات</SelectItem>
                {clinics?.map((clinic) => (
                  <SelectItem key={clinic.id} value={clinic.id}>
                    {clinic.name?.ar || clinic.name?.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={statusFilter || 'all'}
              onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v as AppointmentStatus)}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="كل الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                {Object.entries(statusLabels).map(([status, label]) => (
                  <SelectItem key={status} value={status}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Date Header */}
      <div className="flex items-center gap-3">
        <Calendar className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        <h2 className="text-xl font-bold text-foreground">
          {formatDate(new Date(selectedDate), 'EEEE, d MMMM yyyy')}
        </h2>
        <Badge variant="outline">{appointments.length} موعد</Badge>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-9 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && appointments.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Calendar className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              لا توجد مواعيد
            </h3>
            <p className="text-muted-foreground">
              لا توجد مواعيد في هذا اليوم
            </p>
          </CardContent>
        </Card>
      )}

      {/* Appointments List */}
      {!isLoading && appointments.length > 0 && (
        <div className="space-y-3">
          {appointments
            .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime))
            .map((appointment) => {
              const actions = getAvailableActions(appointment.status);
              const isUpdating = updateStatusMutation.isPending;

              return (
                <Card
                  key={appointment.id}
                  className={
                    appointment.status === AppointmentStatus.CHECKED_IN
                      ? 'border-primary-300 dark:border-primary-700 bg-primary-50/30 dark:bg-primary-900/20'
                      : ''
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Time */}
                      <div className="flex items-center gap-3 sm:w-24">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <span className="font-mono font-semibold" dir="ltr">
                          {formatTime(appointment.appointmentTime)}
                        </span>
                      </div>

                      {/* Patient Info */}
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={appointment.patientProfile?.user?.profilePicture || undefined}
                          />
                          <AvatarFallback>
                            {getInitials(appointment.patientName || '')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {appointment.patientName}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>
                              {appointment.serviceName?.ar || appointment.serviceName?.en}
                            </span>
                            {appointment.patientProfile?.user?.phoneNumber && (
                              <>
                                <span className="text-muted-foreground/50">|</span>
                                <a
                                  href={`tel:${appointment.patientProfile.user.phoneNumber}`}
                                  className="flex items-center gap-1 hover:text-primary-600"
                                >
                                  <Phone className="h-3 w-3" />
                                  <span dir="ltr">{appointment.patientProfile.user.phoneNumber}</span>
                                </a>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            statusColors[appointment.status]
                          }`}
                        >
                          {statusLabels[appointment.status]}
                        </span>

                        {actions.map((action) => {
                          const Icon = action.icon;
                          return (
                            <Button
                              key={action.status}
                              variant={action.color as any}
                              className="text-xs"
                              onClick={() =>
                                handleStatusUpdate(appointment.id, action.status)
                              }
                              disabled={isUpdating}
                            >
                              {isUpdating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Icon className="h-4 w-4 ms-1" />
                                  {action.label}
                                </>
                              )}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}
    </div>
  );
}
