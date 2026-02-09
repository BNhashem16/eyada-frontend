"use client";

import Link from "next/link";
import {
  Calendar,
  Clock,
  Users,
  Star,
  ChevronLeft,
  Building2,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Banknote,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  useDoctorAppointments,
  useDoctorClinics,
  useDoctorProfile,
} from "../hooks/use-doctor-portal";
import { useTodayOverview } from "../hooks/use-doctor-statistics";
import { useAuthStore } from "@/lib/auth/store";
import { AppointmentStatus } from "@/types/enums";
import { formatDate, formatTime } from "@/lib/utils/date";
import { getInitials } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { useEffect } from "react";
import { useTour, DOCTOR_DASHBOARD_TOUR_ID, doctorDashboardSteps } from "@/lib/tour";

export function DoctorDashboard() {
  const { t, locale } = useTranslation();
  const { user } = useAuthStore();
  const { startTour } = useTour();

  useEffect(() => {
    const timer = setTimeout(() => {
      startTour(DOCTOR_DASHBOARD_TOUR_ID, doctorDashboardSteps);
    }, 1500);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const { data: profile, isLoading: profileLoading } = useDoctorProfile();
  const { data: clinics, isLoading: clinicsLoading } = useDoctorClinics();

  // Get today's overview stats from the new API
  const { data: todayOverview, isLoading: overviewLoading } =
    useTodayOverview();

  // Get today's appointments for the queue display
  const today = formatDate(new Date(), "yyyy-MM-dd");
  const { data: todayAppointments, isLoading: appointmentsLoading } =
    useDoctorAppointments({
      date: today,
      limit: 50,
    });

  const appointments = todayAppointments?.data ?? [];

  // Use the new API for stats, fallback to local calculation
  const pendingCount =
    todayOverview?.pending ??
    appointments.filter(
      (a) =>
        a.status === AppointmentStatus.PENDING ||
        a.status === AppointmentStatus.CONFIRMED,
    ).length;
  const waitingCount =
    todayOverview?.waiting ??
    appointments.filter((a) => a.status === AppointmentStatus.CHECKED_IN)
      .length;
  const completedCount =
    todayOverview?.completed ??
    appointments.filter((a) => a.status === AppointmentStatus.COMPLETED).length;
  const todayRevenue = todayOverview?.todayRevenue ?? 0;
  const totalAppointments =
    todayOverview?.totalAppointments ?? appointments.length;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG", {
      style: "currency",
      currency: "EGP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Queue - only confirmed and checked-in appointments, sorted by queue number
  const queueAppointments = appointments
    .filter(
      (a) =>
        a.status === AppointmentStatus.CONFIRMED ||
        a.status === AppointmentStatus.CHECKED_IN,
    )
    .sort((a, b) => (a.queueNumber || 0) - (b.queueNumber || 0));

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
      <div data-tour="doctor-welcome" className="bg-gradient-to-l from-primary-500 to-primary-700 rounded-2xl p-4 sm:p-6 text-white">
        <h1 className="text-xl sm:text-2xl font-bold mb-2">
          {t("doctor.greeting")} {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-primary-100 mb-4">
          {formatDate(new Date(), "EEEE, d MMMM yyyy")}
        </p>
        <div className="flex flex-wrap gap-4">
          {profileLoading ? (
            <Skeleton className="h-6 w-24 bg-primary-400" />
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-warning-300 text-warning-300" />
                <span className="font-semibold">
                  {profile?.averageRating?.toFixed(1) || "0"}
                </span>
                <span className="text-primary-200">
                  ({profile?.totalRatings || 0} {t("doctors.reviews")})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                <span>
                  {clinics?.length || 0} {t("clinics.clinicCount")}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Today's Stats */}
      <div data-tour="doctor-stats" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning-600 dark:text-warning-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("appointments.waitingForConfirmation")}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {overviewLoading ? "-" : pendingCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("appointments.inQueue")}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {overviewLoading ? "-" : waitingCount}
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
                  {t("appointments.completedToday")}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {overviewLoading ? "-" : completedCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("appointments.todayTotal")}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {overviewLoading ? "-" : totalAppointments}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 border-success-200 dark:border-success-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-success-200 dark:bg-success-900/50 flex items-center justify-center">
                <Banknote className="h-6 w-6 text-success-700 dark:text-success-400" />
              </div>
              <div>
                <p className="text-sm text-success-700 dark:text-success-400">
                  {t("statistics.todayRevenue")}
                </p>
                <p
                  className="text-2xl font-bold text-success-800 dark:text-success-300"
                  dir="ltr"
                >
                  {overviewLoading ? "-" : formatCurrency(todayRevenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Queue */}
      <Card data-tour="doctor-queue">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            {t("appointments.waitingList")}
          </CardTitle>
          <Button asChild variant="ghost" className="text-xs">
            <Link href="/doctor/appointments">
              {t("common.viewAll")}
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {appointmentsLoading ? (
            <div className="space-y-3">
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
                  <Skeleton className="h-9 w-24" />
                </div>
              ))}
            </div>
          ) : queueAppointments.length > 0 ? (
            <div className="space-y-3">
              {queueAppointments.slice(0, 5).map((appointment, index) => (
                <div
                  key={appointment.id}
                  className={`flex items-center gap-4 p-3 rounded-lg ${
                    index === 0
                      ? "bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800"
                      : "bg-muted"
                  }`}
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0
                        ? "bg-primary-500 text-white"
                        : "bg-muted-foreground/20 text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={
                        appointment.patientProfile?.user?.profilePicture ||
                        undefined
                      }
                    />
                    <AvatarFallback>
                      {getInitials(appointment.patientName || "")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {appointment.patientName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span dir="ltr">
                        {formatTime(appointment.appointmentTime)}
                      </span>
                      {" - "}
                      {appointment.serviceName?.ar ||
                        appointment.serviceName?.en}
                    </p>
                  </div>
                  <Badge
                    variant={
                      appointment.status === AppointmentStatus.CHECKED_IN
                        ? "default"
                        : "success"
                    }
                  >
                    {getStatusLabel(appointment.status)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">
                {t("appointments.noPatientsInQueue")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div data-tour="doctor-quick-actions" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/doctor/appointments">
          <Card className="hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all cursor-pointer h-full">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Calendar className="h-7 w-7 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {t("nav.appointments")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("doctor.managePatientAppointments")}
                </p>
              </div>
              <ChevronLeft className="h-5 w-5 text-muted-foreground ms-auto" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/doctor/clinics">
          <Card className="hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all cursor-pointer h-full">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center">
                <Building2 className="h-7 w-7 text-secondary-600 dark:text-secondary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {t("nav.clinics")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("doctor.manageClinicsAndSchedules")}
                </p>
              </div>
              <ChevronLeft className="h-5 w-5 text-muted-foreground ms-auto" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/doctor/profile">
          <Card className="hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all cursor-pointer h-full">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
                <Star className="h-7 w-7 text-warning-600 dark:text-warning-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {t("doctor.profile")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("doctor.updateProfileAndRatings")}
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
