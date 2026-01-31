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

export function DashboardStats() {
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
      label: 'إجمالي المواعيد',
      value: stats.total,
      icon: Calendar,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'في الانتظار',
      value: stats.pending,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      label: 'مؤكد',
      value: stats.confirmed,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'حضر',
      value: stats.checkedIn,
      icon: Users,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      label: 'مكتمل',
      value: stats.completed,
      icon: CheckCircle,
      color: 'bg-gray-100 text-gray-600',
    },
    {
      label: 'الإيرادات',
      value: `${stats.totalRevenue} ج.م`,
      icon: CreditCard,
      color: 'bg-emerald-100 text-emerald-600',
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
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
