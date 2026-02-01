'use client';

import { format } from 'date-fns';
import {
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  CreditCard,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSecretaryAppointments } from '../hooks';
import { AppointmentStatus, PaymentStatus } from '@/types/enums';
import { useTranslation } from '@/lib/i18n';

export function DashboardStats() {
  const { t } = useTranslation();
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data, isLoading } = useSecretaryAppointments({ date: today, limit: 100 });

  const appointments = data?.data ?? [];

  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === AppointmentStatus.PENDING).length,
    confirmed: appointments.filter((a) => a.status === AppointmentStatus.CONFIRMED).length,
    checkedIn: appointments.filter((a) => a.status === AppointmentStatus.CHECKED_IN).length,
    completed: appointments.filter((a) => a.status === AppointmentStatus.COMPLETED).length,
    cancelled: appointments.filter((a) => a.status === AppointmentStatus.CANCELLED).length,
    paid: appointments.filter((a) => a.paymentStatus === PaymentStatus.PAID).length,
    totalRevenue: appointments
      .filter((a) => a.paymentStatus === PaymentStatus.PAID)
      .reduce((sum, a) => sum + a.price, 0),
  };

  const statCards = [
    {
      label: t('secretary.totalAppointments'),
      value: stats.total,
      icon: Calendar,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
      label: t('secretary.waiting'),
      value: stats.pending,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    {
      label: t('secretary.confirmed'),
      value: stats.confirmed,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    },
    {
      label: t('secretary.attended'),
      value: stats.checkedIn,
      icon: Users,
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    },
    {
      label: t('secretary.completed'),
      value: stats.completed,
      icon: CheckCircle,
      color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    },
    {
      label: t('secretary.revenue'),
      value: `${stats.totalRevenue} ${t('common.currency')}`,
      icon: CreditCard,
      color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-10 w-10 rounded-lg mb-3" />
              <Skeleton className="h-6 w-16 mb-1" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className={`h-10 w-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
