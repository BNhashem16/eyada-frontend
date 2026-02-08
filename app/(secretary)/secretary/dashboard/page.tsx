"use client";

import Link from "next/link";
import { LayoutDashboard, Plus, Calendar, Building2 } from "lucide-react";
import { DashboardStats, AppointmentList } from "@/features/secretary";
import { useSecretaryClinics } from "@/features/secretary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";
import { getLocalizedText } from "@/lib/utils/multilingual";

export default function SecretaryDashboardPage() {
  const { t } = useTranslation();
  const { data: clinics } = useSecretaryClinics();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <LayoutDashboard className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t("secretary.dashboardPage.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("secretary.dashboardPage.subtitle")}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/secretary/appointments/new">
            <Plus className="h-4 w-4 me-2" />
            {t("secretary.bookAppointment")}
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <DashboardStats />

      {/* Quick Actions & Assigned Clinics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Assigned Clinics Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              {t("secretary.assignedClinics")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clinics && clinics.length > 0 ? (
              <div className="space-y-2">
                {clinics.map((clinic) => (
                  <div
                    key={clinic.id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <span className="font-medium text-sm">
                      {getLocalizedText(clinic.name, "ar")}
                    </span>
                    {clinic.isActive && (
                      <span
                        className="w-2 h-2 rounded-full bg-success-500"
                        title={t("common.active")}
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t("secretary.noClinicsAssigned")}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t("common.actions")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                variant="outline"
                asChild
                className="h-auto py-4 flex-col gap-2"
              >
                <Link href="/secretary/appointments/new">
                  <Plus className="h-5 w-5" />
                  <span>{t("secretary.bookAppointment")}</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="h-auto py-4 flex-col gap-2"
              >
                <Link href="/secretary/appointments">
                  <Calendar className="h-5 w-5" />
                  <span>{t("nav.appointments")}</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Appointments */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          {t("secretary.dashboardPage.todayAppointments")}
        </h2>
        <AppointmentList showBookButton={false} />
      </div>
    </div>
  );
}
