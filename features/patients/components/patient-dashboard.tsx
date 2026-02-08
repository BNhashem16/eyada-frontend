"use client";

import Link from "next/link";
import {
  Calendar,
  Clock,
  User,
  Users,
  ChevronLeft,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { usePatientAppointments } from "../hooks/use-patient";
import { useAuthStore } from "@/lib/auth/store";
import { AppointmentStatus } from "@/types/enums";
import { formatDate, formatTime, isPast } from "@/lib/utils/date";
import { getInitials } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export function PatientDashboard() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { data: appointmentsData, isLoading } = usePatientAppointments({
    limit: 5,
  });

  const appointments = appointmentsData?.data ?? [];
  const upcomingAppointments = appointments.filter(
    (a) =>
      a.status === AppointmentStatus.PENDING ||
      a.status === AppointmentStatus.CONFIRMED,
  );

  const getStatusLabel = (status: AppointmentStatus) => {
    const statusMap: Record<AppointmentStatus, string> = {
      [AppointmentStatus.PENDING]: t("status.pending"),
      [AppointmentStatus.CONFIRMED]: t("status.confirmed"),
      [AppointmentStatus.CHECKED_IN]: t("status.checkedIn"),
      [AppointmentStatus.IN_PROGRESS]: t("status.inProgress"),
      [AppointmentStatus.COMPLETED]: t("status.completed"),
      [AppointmentStatus.CANCELLED]: t("status.cancelled"),
      [AppointmentStatus.NO_SHOW]: t("status.noShow"),
    };
    return statusMap[status];
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-l from-primary-500 to-primary-700 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          {t("patient.greeting")}، {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-primary-100 mb-4">{t("patient.greetingMessage")}</p>
        <Button
          asChild
          variant="secondary"
          className="bg-white text-primary-600 hover:bg-primary-50"
        >
          <Link href="/doctors">
            <Stethoscope className="h-4 w-4 ms-2" />
            {t("appointments.bookNew")}
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("appointments.upcomingAppointments")}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {isLoading ? "-" : upcomingAppointments.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-success-600 dark:text-success-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("appointments.completed")}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {isLoading
                    ? "-"
                    : appointments.filter(
                        (a) => a.status === AppointmentStatus.COMPLETED,
                      ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-warning-600 dark:text-warning-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("appointments.alert")}
                  </p>
                  <p className="font-semibold text-foreground">
                    {upcomingAppointments.length > 0
                      ? t("appointments.hasUpcomingAppointments").replace(
                          "{count}",
                          String(upcomingAppointments.length),
                        )
                      : t("appointments.noUpcomingAppointments")}
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" className="text-xs">
                <Link href="/patient/appointments">
                  {t("common.viewAll")}
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            {t("appointments.upcomingAppointments")}
          </CardTitle>
          <Button asChild variant="ghost" className="text-xs">
            <Link href="/patient/appointments">
              {t("common.viewAll")}
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 bg-muted rounded-lg"
                >
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : upcomingAppointments.length > 0 ? (
            <div className="space-y-3">
              {upcomingAppointments.slice(0, 3).map((appointment) => {
                return (
                  <div
                    key={appointment.id}
                    className="flex items-center gap-4 p-3 bg-muted rounded-lg hover:bg-accent transition-colors"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={
                          appointment.clinic?.doctorProfile?.user
                            ?.profilePicture || undefined
                        }
                      />
                      <AvatarFallback>
                        {getInitials(
                          appointment.clinic?.doctorProfile?.user?.fullName ||
                            "",
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {t("auth.doctor")}.{" "}
                        {appointment.clinic?.doctorProfile?.user?.fullName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(
                          appointment.appointmentDate,
                          "EEEE, d MMMM",
                        )}{" "}
                        -{" "}
                        <span dir="ltr">
                          {formatTime(appointment.appointmentTime)}
                        </span>
                      </p>
                    </div>
                    <Badge
                      variant={
                        appointment.status === AppointmentStatus.CONFIRMED
                          ? "success"
                          : "warning"
                      }
                    >
                      {getStatusLabel(appointment.status)}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">
                {t("appointments.noUpcomingAppointments")}
              </p>
              <Button asChild className="mt-4">
                <Link href="/doctors">{t("appointments.bookNow")}</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/doctors">
          <Card className="hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all cursor-pointer h-full">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Stethoscope className="h-7 w-7 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {t("patient.findDoctor")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("patient.browseAndBook")}
                </p>
              </div>
              <ChevronLeft className="h-5 w-5 text-muted-foreground ms-auto" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/patient/profile">
          <Card className="hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all cursor-pointer h-full">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center">
                <User className="h-7 w-7 text-secondary-600 dark:text-secondary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {t("patient.profile")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("patient.updateProfile")}
                </p>
              </div>
              <ChevronLeft className="h-5 w-5 text-muted-foreground ms-auto" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/patient/family">
          <Card className="hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all cursor-pointer h-full">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
                <Users className="h-7 w-7 text-warning-600 dark:text-warning-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {t("patient.family")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("patient.manageFamilyMembers")}
                </p>
              </div>
              <ChevronLeft className="h-5 w-5 text-muted-foreground ms-auto" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
