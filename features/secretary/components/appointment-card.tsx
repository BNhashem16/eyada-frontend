'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  Clock,
  User,
  Phone,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Eye,
  Stethoscope,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Appointment } from '@/types';
import { AppointmentStatus, PaymentStatus } from '@/types/enums';
import { getLocalizedText } from '@/lib/utils/multilingual';
import { formatTime } from '@/lib/utils/date';
import { useUpdateAppointmentStatus, useUpdatePayment } from '../hooks';
import { useTranslation } from '@/lib/i18n';

interface AppointmentCardProps {
  appointment: Appointment;
}

const getStatusConfig = (t: (key: string) => string): Record<
  AppointmentStatus,
  { label: string; color: string; icon: React.ReactNode }
> => ({
  [AppointmentStatus.PENDING]: {
    label: t('secretary.waiting'),
    color: 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-400',
    icon: <AlertCircle className="h-4 w-4" />,
  },
  [AppointmentStatus.CONFIRMED]: {
    label: t('secretary.confirmed'),
    color: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400',
    icon: <CheckCircle className="h-4 w-4" />,
  },
  [AppointmentStatus.CHECKED_IN]: {
    label: t('secretary.attended'),
    color: 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400',
    icon: <CheckCircle className="h-4 w-4" />,
  },
  [AppointmentStatus.IN_PROGRESS]: {
    label: t('secretary.inProgress'),
    color: 'bg-info-100 text-info-800 dark:bg-info-900/30 dark:text-info-400',
    icon: <Stethoscope className="h-4 w-4" />,
  },
  [AppointmentStatus.COMPLETED]: {
    label: t('secretary.completed'),
    color: 'bg-muted text-muted-foreground',
    icon: <CheckCircle className="h-4 w-4" />,
  },
  [AppointmentStatus.CANCELLED]: {
    label: t('secretary.cancelled'),
    color: 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-400',
    icon: <XCircle className="h-4 w-4" />,
  },
  [AppointmentStatus.NO_SHOW]: {
    label: t('secretary.noShow'),
    color: 'bg-muted text-muted-foreground',
    icon: <XCircle className="h-4 w-4" />,
  },
});

const getPaymentStatusConfig = (t: (key: string) => string): Record<PaymentStatus, { label: string; color: string }> => ({
  [PaymentStatus.PENDING]: { label: t('secretary.unpaid'), color: 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-400' },
  [PaymentStatus.PAID]: { label: t('secretary.paid'), color: 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400' },
  [PaymentStatus.REFUNDED]: { label: t('secretary.refunded'), color: 'bg-muted text-muted-foreground' },
});

export const AppointmentCard = React.memo(function AppointmentCard({ appointment }: AppointmentCardProps) {
  const { t } = useTranslation();
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const updateStatus = useUpdateAppointmentStatus();
  const updatePayment = useUpdatePayment();

  const statusConfig = useMemo(() => getStatusConfig(t), [t]);
  const paymentStatusConfig = useMemo(() => getPaymentStatusConfig(t), [t]);

  const status = statusConfig[appointment.status];
  const paymentStatus = paymentStatusConfig[appointment.paymentStatus];
  const serviceName = getLocalizedText(appointment.serviceName, 'ar');

  const handleStatusChange = (newStatus: AppointmentStatus) => {
    updateStatus.mutate({
      appointmentId: appointment.id,
      status: newStatus,
    });
  };

  const handlePayment = (method: 'CASH' | 'CARD' | 'INSURANCE') => {
    updatePayment.mutate({
      appointmentId: appointment.id,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: method,
    });
  };

  const canConfirm = appointment.status === AppointmentStatus.PENDING;
  const canCheckIn =
    appointment.status === AppointmentStatus.CONFIRMED ||
    appointment.status === AppointmentStatus.PENDING;
  const canCancel =
    appointment.status === AppointmentStatus.PENDING ||
    appointment.status === AppointmentStatus.CONFIRMED;
  const canMarkPayment = appointment.paymentStatus === PaymentStatus.PENDING;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Patient Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                {appointment.queueNumber ? `#${appointment.queueNumber}` : '--'}
              </span>
              <Badge className={status.color}>
                {status.icon}
                <span className="ms-1">{status.label}</span>
              </Badge>
              <Badge className={paymentStatus.color}>{paymentStatus.label}</Badge>
            </div>

            <h3 className="font-semibold text-foreground mb-1 truncate">
              {appointment.patientName}
            </h3>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span dir="ltr">{formatTime(appointment.appointmentTime)}</span>
              </span>
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {serviceName}
              </span>
              <span className="flex items-center gap-1">
                <CreditCard className="h-4 w-4" />
                {appointment.price} {t('common.egp')}
              </span>
            </div>

            {appointment.patientNotes && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-1">
                {appointment.patientNotes}
              </p>
            )}
          </div>

          {/* Actions */}
          <DropdownMenu open={isActionsOpen} onOpenChange={setIsActionsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href={`/secretary/appointments/${appointment.id}`}>
                  <Eye className="h-4 w-4 me-2" />
                  {t('secretary.viewDetails')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {canConfirm && (
                <DropdownMenuItem
                  onClick={() => handleStatusChange(AppointmentStatus.CONFIRMED)}
                >
                  <CheckCircle className="h-4 w-4 me-2 text-blue-600" />
                  {t('secretary.confirmAppointment')}
                </DropdownMenuItem>
              )}
              {canCheckIn && (
                <DropdownMenuItem
                  onClick={() => handleStatusChange(AppointmentStatus.CHECKED_IN)}
                >
                  <CheckCircle className="h-4 w-4 me-2 text-green-600" />
                  {t('secretary.checkIn')}
                </DropdownMenuItem>
              )}
              {canCancel && (
                <DropdownMenuItem
                  onClick={() => handleStatusChange(AppointmentStatus.CANCELLED)}
                  className="text-error-600"
                >
                  <XCircle className="h-4 w-4 me-2" />
                  {t('secretary.cancelAppointment')}
                </DropdownMenuItem>
              )}

              {canMarkPayment && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handlePayment('CASH')}>
                    <CreditCard className="h-4 w-4 me-2" />
                    {t('secretary.cashPayment')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handlePayment('CARD')}>
                    <CreditCard className="h-4 w-4 me-2" />
                    {t('secretary.cardPayment')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handlePayment('INSURANCE')}>
                    <CreditCard className="h-4 w-4 me-2" />
                    {t('secretary.insurance')}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
});
