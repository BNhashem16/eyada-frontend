"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Phone,
  Building2,
  Calendar,
  DollarSign,
  ChevronLeft,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useClinic } from "../hooks/use-clinics";
import { BookingWidget } from "./booking-widget";
import { DayOfWeek } from "@/types/enums";
import { useTranslation } from "@/lib/i18n";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { formatTime } from "@/lib/utils/date";

interface ClinicDetailsProps {
  clinicId: string;
}

const getDayNames = (
  t: (key: string) => string,
): Record<DayOfWeek, string> => ({
  [DayOfWeek.SUNDAY]: t("days.sunday"),
  [DayOfWeek.MONDAY]: t("days.monday"),
  [DayOfWeek.TUESDAY]: t("days.tuesday"),
  [DayOfWeek.WEDNESDAY]: t("days.wednesday"),
  [DayOfWeek.THURSDAY]: t("days.thursday"),
  [DayOfWeek.FRIDAY]: t("days.friday"),
  [DayOfWeek.SATURDAY]: t("days.saturday"),
});

const dayOrder = [
  DayOfWeek.SATURDAY,
  DayOfWeek.SUNDAY,
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
];

export function ClinicDetailsComponent({ clinicId }: ClinicDetailsProps) {
  const { t, locale } = useTranslation();
  const dayNames = getDayNames(t);
  const { data: clinic, isLoading, isError } = useClinic(clinicId);
  // Use embedded data from clinic response (reduces API calls from 3 to 1)
  const schedules = clinic?.schedules;
  const services = clinic?.serviceTypes;
  const [activeTab, setActiveTab] = useState("booking");

  if (isLoading) {
    return <ClinicDetailsSkeleton />;
  }

  if (isError || !clinic) {
    return (
      <Card className="border-error-200 dark:border-error-800 bg-error-50 dark:bg-error-900/20">
        <CardContent className="py-10 text-center">
          <p className="text-error-600 dark:text-error-400">
            {t("clinics.loadError")}
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/clinics">{t("doctors.backToSearch")}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Sort schedules by day
  const sortedSchedules = schedules
    ? [...schedules].sort(
        (a, b) => dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek),
      )
    : [];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-10 w-10 text-primary-600 dark:text-primary-400" />
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">
                      {getLocalizedText(clinic.name, locale)}
                    </h1>
                    {clinic.isActive && (
                      <Badge variant="success" className="mt-2">
                        {t("clinics.availableForBooking")}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Doctor Info */}
                {clinic.doctorProfile && (
                  <Link
                    href={`/doctors/${clinic.doctorProfile.id}`}
                    className="flex items-center gap-2 mt-4 text-primary-600 hover:underline"
                  >
                    <User className="h-4 w-4" />
                    <span>
                      {t("doctors.doctorPrefix")}{" "}
                      {clinic.doctorProfile.user?.fullName}
                    </span>
                    <ChevronLeft className="h-4 w-4" />
                  </Link>
                )}

                {/* Location */}
                <div className="flex items-start gap-2 mt-4 text-muted-foreground">
                  <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p>{getLocalizedText(clinic.address, locale)}</p>
                    <p>
                      {getLocalizedText(clinic.city?.name, locale)}
                      {clinic.city?.state &&
                        `, ${getLocalizedText(clinic.city.state.name, locale)}`}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                {clinic.phoneNumbers && clinic.phoneNumbers.length > 0 && (
                  <div className="flex items-center gap-2 mt-3 text-muted-foreground">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <a
                      href={`tel:${clinic.phoneNumbers[0]}`}
                      dir="ltr"
                      className="hover:text-primary-600"
                    >
                      {clinic.phoneNumbers[0]}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="booking">
              {t("clinics.bookAppointmentTab")}
            </TabsTrigger>
            <TabsTrigger value="schedule">
              {t("clinics.scheduleTab")}
            </TabsTrigger>
            <TabsTrigger value="services">
              {t("clinics.servicesTab")}
            </TabsTrigger>
          </TabsList>

          {/* Booking Tab */}
          <TabsContent value="booking" className="mt-6">
            <BookingWidget clinicId={clinicId} />
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  {t("clinics.weeklyWorkingHours")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sortedSchedules.length > 0 ? (
                  <div className="space-y-3">
                    {sortedSchedules.map((schedule) => {
                      const firstShift = schedule.shifts?.[0];
                      return (
                        <div
                          key={schedule.id}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            schedule.isActive
                              ? "bg-muted"
                              : "bg-muted/50 text-muted-foreground"
                          }`}
                        >
                          <span className="font-medium">
                            {dayNames[schedule.dayOfWeek]}
                          </span>
                          {schedule.isActive && firstShift ? (
                            <span dir="ltr">
                              {formatTime(firstShift.startTime)} -{" "}
                              {formatTime(firstShift.endTime)}
                            </span>
                          ) : (
                            <span className="text-sm">
                              {t("common.closed")}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-6">
                    {t("clinics.noWorkingHours")}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  {t("clinics.servicesAndPrices")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {services && services.length > 0 ? (
                  <div className="space-y-3">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted"
                      >
                        <div>
                          <p className="font-medium text-foreground">
                            {getLocalizedText(service.name, locale) ||
                              service.serviceType}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t("clinics.durationMinutes").replace(
                              "{duration}",
                              String(service.duration),
                            )}
                          </p>
                        </div>
                        <div className="text-end">
                          <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                            {service.price} {t("common.egp")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-6">
                    {t("clinics.noServicesYet")}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Sidebar - Quick Booking */}
      <div className="lg:col-span-1">
        <div className="sticky top-24">
          <Card className="border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                {t("clinics.quickBooking")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {t("clinics.bookingInstructions")}
              </p>
              <Button
                className="w-full"
                onClick={() => setActiveTab("booking")}
              >
                <Calendar className="h-4 w-4 ms-2" />
                {t("clinics.bookNow")}
              </Button>
              {clinic.phoneNumbers && clinic.phoneNumbers.length > 0 && (
                <Button variant="outline" className="w-full mt-3" asChild>
                  <a href={`tel:${clinic.phoneNumbers[0]}`}>
                    <Phone className="h-4 w-4 ms-2" />
                    {t("clinics.callClinic")}
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ClinicDetailsSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Skeleton className="h-20 w-20 rounded-xl" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-40" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
      <div>
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}
