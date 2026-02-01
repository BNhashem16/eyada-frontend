'use client';

import {
  Users,
  UserCheck,
  Grid3X3,
  MapPin,
  Building2,
  Calendar,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePendingDoctors, useAdminSpecialties, useAdminStates, useAdminCities } from '../hooks';
import { useTranslation } from '@/lib/i18n';

export function AdminDashboardStats() {
  const { t } = useTranslation();
  const { data: pendingDoctors, isLoading: doctorsLoading } = usePendingDoctors();
  const { data: specialties, isLoading: specialtiesLoading } = useAdminSpecialties();
  const { data: states, isLoading: statesLoading } = useAdminStates();
  const { data: cities, isLoading: citiesLoading } = useAdminCities();

  const isLoading = doctorsLoading || specialtiesLoading || statesLoading || citiesLoading;

  const stats = [
    {
      label: t('admin.pendingDoctors'),
      value: pendingDoctors?.length || 0,
      icon: Users,
      color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
      href: '/admin/doctors',
    },
    {
      label: t('admin.specialties'),
      value: specialties?.length || 0,
      icon: Grid3X3,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      href: '/admin/specialties',
    },
    {
      label: t('admin.states'),
      value: states?.length || 0,
      icon: MapPin,
      color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      href: '/admin/locations',
    },
    {
      label: t('admin.cities'),
      value: cities?.length || 0,
      icon: Building2,
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
      href: '/admin/locations',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-10 w-10 rounded-lg mb-3" />
              <Skeleton className="h-6 w-16 mb-1" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div
                className={`h-10 w-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}
              >
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
