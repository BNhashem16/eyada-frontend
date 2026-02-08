"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  MoreVertical,
  X,
  Star,
  ChevronLeft,
  Navigation,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Appointment } from "@/types";
import { AppointmentStatus } from "@/types/enums";
import { formatDate, formatTime, isPast } from "@/lib/utils/date";
import { getInitials } from "@/lib/utils";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { useTranslation } from "@/lib/i18n";

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel?: (id: string) => void;
  onRate?: (appointment: Appointment) => void;
}

const statusVariants: Record<
  AppointmentStatus,
  "warning" | "success" | "default" | "error" | "secondary"
> = {
  [AppointmentStatus.PENDING]: "warning",
  [AppointmentStatus.CONFIRMED]: "success",
  [AppointmentStatus.CHECKED_IN]: "default",
  [AppointmentStatus.IN_PROGRESS]: "default",
  [AppointmentStatus.COMPLETED]: "secondary",
  [AppointmentStatus.CANCELLED]: "error",
  [AppointmentStatus.NO_SHOW]: "secondary",
};

export const AppointmentCard = React.memo(function AppointmentCard({
  appointment,
  onCancel,
  onRate,
}: AppointmentCardProps) {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);

  const statusLabels = useMemo(
    () => ({
      [AppointmentStatus.PENDING]: t("status.pending"),
      [AppointmentStatus.CONFIRMED]: t("status.confirmed"),
      [AppointmentStatus.CHECKED_IN]: t("status.checkedIn"),
      [AppointmentStatus.IN_PROGRESS]: t("status.inProgress"),
      [AppointmentStatus.COMPLETED]: t("status.completed"),
      [AppointmentStatus.CANCELLED]: t("status.cancelled"),
      [AppointmentStatus.NO_SHOW]: t("status.noShow"),
    }),
    [t],
  );

  const canCancel =
    appointment.status === AppointmentStatus.PENDING ||
    appointment.status === AppointmentStatus.CONFIRMED;

  const canRate =
    appointment.status === AppointmentStatus.COMPLETED && !appointment.rating;

  // Use parseISO for date-only strings to avoid timezone issues
  // Pass the string directly to formatDate which handles it correctly
  const appointmentDateStr = appointment.appointmentDate;
  const isUpcoming =
    !isPast(new Date(appointmentDateStr + "T12:00:00")) && canCancel;

  return (
    <Card
      className={`overflow-hidden ${isUpcoming ? "border-primary-200 dark:border-primary-800" : ""}`}
    >
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Date Column */}
          <div
            className={`p-4 sm:p-5 sm:w-32 flex flex-row sm:flex-col items-center justify-center gap-2 sm:gap-1 text-center ${
              isUpcoming ? "bg-primary-50 dark:bg-primary-900/20" : "bg-muted"
            }`}
          >
            <span
              className={`text-3xl font-bold ${isUpcoming ? "text-primary-600 dark:text-primary-400" : "text-foreground"}`}
            >
              {formatDate(appointmentDateStr, "d")}
            </span>
            <div className="text-sm text-muted-foreground">
              <div>{formatDate(appointmentDateStr, "MMM")}</div>
              <div>{formatDate(appointmentDateStr, "yyyy")}</div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {/* Doctor Info */}
                {appointment.clinic?.doctorProfile && (
                  <Link
                    href={`/doctors/${appointment.clinic.doctorProfile.id}`}
                    className="flex items-center gap-3 mb-3 group"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={
                          appointment.clinic.doctorProfile.user
                            ?.profilePicture || undefined
                        }
                      />
                      <AvatarFallback>
                        {getInitials(
                          appointment.clinic.doctorProfile.user?.name || "",
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {t("doctors.doctorPrefix")}{" "}
                        {appointment.clinic.doctorProfile.user?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {getLocalizedText(
                          appointment.clinic.doctorProfile.specialty?.name,
                          "ar",
                        )}
                      </p>
                    </div>
                  </Link>
                )}

                {/* Time */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Clock className="h-4 w-4" />
                  <span dir="ltr">
                    {formatTime(appointment.appointmentTime)}
                  </span>
                  <span className="text-border">|</span>
                  <span>{formatDate(appointmentDateStr, "EEEE")}</span>
                </div>

                {/* Clinic */}
                {appointment.clinic && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {getLocalizedText(appointment.clinic.name, "ar")}
                    </span>
                    {appointment.clinic.city && (
                      <>
                        <span className="text-border">-</span>
                        <span>
                          {getLocalizedText(appointment.clinic.city.name, "ar")}
                        </span>
                      </>
                    )}
                  </div>
                )}

                {/* Service */}
                {appointment.serviceName && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{t("appointments.service")}:</span>
                    <span>
                      {getLocalizedText(appointment.serviceName, "ar")}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {appointment.price} {t("common.currency")}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Status & Actions */}
              <div className="flex flex-col items-end gap-2">
                <Badge variant={statusVariants[appointment.status]}>
                  {statusLabels[appointment.status]}
                </Badge>

                {/* Actions Menu */}
                {(canCancel || canRate) && (
                  <div className="relative">
                    <Button
                      variant="ghost"
                      className="text-xs"
                      onClick={() => setShowMenu(!showMenu)}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>

                    {showMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowMenu(false)}
                        />
                        <div className="absolute end-0 mt-1 w-40 rounded-lg bg-card border border-border shadow-lg z-50 py-1">
                          {canCancel && (
                            <button
                              onClick={() => {
                                setShowMenu(false);
                                onCancel?.(appointment.id);
                              }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20"
                            >
                              <X className="h-4 w-4" />
                              {t("appointments.cancel")}
                            </button>
                          )}
                          {canRate && (
                            <button
                              onClick={() => {
                                setShowMenu(false);
                                onRate?.(appointment);
                              }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-warning-600 dark:text-warning-400 hover:bg-warning-50 dark:hover:bg-warning-900/20"
                            >
                              <Star className="h-4 w-4" />
                              {t("patient.rateDoctor")}
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Rating Badge */}
            {appointment.rating && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-muted-foreground">
                    {t("rating.yourRating")}:
                  </span>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < appointment.rating!.rating
                          ? "fill-warning-400 text-warning-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* View Details & Track Links */}
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-2">
              <Link
                href={`/patient/appointments/${appointment.id}`}
                className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                {t("common.viewDetails")}
                <ChevronLeft className="h-4 w-4" />
              </Link>
              {appointment.bookingNumber && isUpcoming && (
                <Link
                  href={`/track/${encodeURIComponent(appointment.bookingNumber)}`}
                  className="flex items-center gap-1 text-sm text-secondary-600 dark:text-secondary-400 hover:underline"
                >
                  <Navigation className="h-4 w-4" />
                  {t("track.trackBooking")}
                </Link>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
