"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";
import type { AdminDashboardStatistics } from "@/types/dashboard";

interface AppointmentsChartProps {
  data: AdminDashboardStatistics["growth"]["monthlyAppointments"];
}

export function AppointmentsChart({ data }: AppointmentsChartProps) {
  const { t, locale } = useTranslation();

  const chartData = data.map((item) => ({
    month: formatMonth(item.month, locale),
    [t("admin.stats.total")]: item.total,
    [t("admin.stats.completed")]: item.completed,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          {t("admin.stats.monthlyAppointments")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              />
              <Legend />
              <Bar
                dataKey={t("admin.stats.total")}
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey={t("admin.stats.completed")}
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function formatMonth(monthStr: string, locale: string): string {
  const [year, month] = monthStr.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
    month: "short",
  });
}
