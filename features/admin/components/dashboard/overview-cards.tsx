"use client";

import {
  Users,
  Stethoscope,
  UserCheck,
  Building2,
  Calendar,
  DollarSign,
  CalendarCheck,
  UserPlus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";
import type { AdminDashboardStatistics } from "@/types/dashboard";

interface OverviewCardsProps {
  data: AdminDashboardStatistics;
}

export function OverviewCards({ data }: OverviewCardsProps) {
  const { t } = useTranslation();

  const stats = [
    {
      label: t("admin.stats.totalUsers"),
      value: data.overview.totalUsers,
      icon: Users,
      color:
        "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      label: t("admin.stats.totalDoctors"),
      value: data.overview.totalDoctors,
      icon: Stethoscope,
      color:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    {
      label: t("admin.stats.totalPatients"),
      value: data.overview.totalPatients,
      icon: UserCheck,
      color:
        "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
    },
    {
      label: t("admin.stats.activeClinics"),
      value: data.overview.activeClinics,
      icon: Building2,
      color:
        "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    },
    {
      label: t("admin.stats.totalAppointments"),
      value: data.overview.totalAppointments,
      icon: Calendar,
      color:
        "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
    },
    {
      label: t("admin.stats.todayAppointments"),
      value: data.appointments.todayTotal,
      icon: CalendarCheck,
      color:
        "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
    },
    {
      label: t("admin.stats.thisMonthRevenue"),
      value: data.revenue.thisMonthRevenue.toLocaleString(),
      icon: DollarSign,
      color:
        "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    },
    {
      label: t("admin.stats.newUsersThisMonth"),
      value: data.recentActivity.newUsersThisMonth,
      icon: UserPlus,
      color:
        "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className="hover:shadow-md transition-shadow"
          >
            <CardContent className="p-4">
              <div
                className={`h-10 w-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
