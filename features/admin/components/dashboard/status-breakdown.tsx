"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";

interface StatusBreakdownProps {
  title: string;
  data: {
    pending: number;
    approved: number;
    rejected: number;
    suspended: number;
  };
}

const statusColors: Record<string, { bg: string; bar: string }> = {
  pending: { bg: "bg-yellow-100 dark:bg-yellow-900/30", bar: "bg-yellow-500" },
  approved: {
    bg: "bg-green-100 dark:bg-green-900/30",
    bar: "bg-green-500",
  },
  rejected: { bg: "bg-red-100 dark:bg-red-900/30", bar: "bg-red-500" },
  suspended: {
    bg: "bg-gray-100 dark:bg-gray-900/30",
    bar: "bg-gray-500",
  },
};

export function StatusBreakdown({ title, data }: StatusBreakdownProps) {
  const { t } = useTranslation();

  const total =
    data.pending + data.approved + data.rejected + data.suspended || 1;

  const items = [
    { key: "approved", label: t("admin.stats.approved"), count: data.approved },
    { key: "pending", label: t("admin.stats.pending"), count: data.pending },
    { key: "rejected", label: t("admin.stats.rejected"), count: data.rejected },
    {
      key: "suspended",
      label: t("admin.stats.suspended"),
      count: data.suspended,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => {
          const pct = Math.round((item.count / total) * 100);
          const colors = statusColors[item.key];
          return (
            <div key={item.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">
                  {item.label}
                </span>
                <span className="text-sm font-semibold">
                  {item.count}{" "}
                  <span className="text-muted-foreground font-normal">
                    ({pct}%)
                  </span>
                </span>
              </div>
              <div
                className={`h-2 rounded-full ${colors.bg} overflow-hidden`}
              >
                <div
                  className={`h-full rounded-full ${colors.bar} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
