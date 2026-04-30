"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Phone,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Stethoscope,
  Wallet,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clinic } from "@/types";
import { DayOfWeek } from "@/types/enums";
import { useTranslation } from "@/lib/i18n";
import { getLocalizedText } from "@/lib/utils/multilingual";

interface ClinicCardProps {
  clinic: Clinic;
  showBookButton?: boolean;
  /**
   * True when this clinic matches the logged-in patient's saved address.
   * Renders a "Near you" badge and a primary-tinted ring on the card.
   */
  isNearYou?: boolean;
  /** Optional distance in km — only shown when geo-matched. */
  distanceKm?: number;
}

export const ClinicCard = React.memo(function ClinicCard({
  clinic,
  showBookButton = false,
  isNearYou = false,
  distanceKm,
}: ClinicCardProps) {
  const { t, locale, isRtl } = useTranslation();
  const ChevronForward = isRtl ? ArrowLeft : ArrowRight;

  const { workingDays, consultationPrice } = useMemo(() => {
    const dayNames: Record<DayOfWeek, string> = {
      [DayOfWeek.SUNDAY]: t("days.sunday"),
      [DayOfWeek.MONDAY]: t("days.monday"),
      [DayOfWeek.TUESDAY]: t("days.tuesday"),
      [DayOfWeek.WEDNESDAY]: t("days.wednesday"),
      [DayOfWeek.THURSDAY]: t("days.thursday"),
      [DayOfWeek.FRIDAY]: t("days.friday"),
      [DayOfWeek.SATURDAY]: t("days.saturday"),
    };
    const days = clinic.schedules
      ?.filter((s) => s.isActive)
      .map((s) => dayNames[s.dayOfWeek])
      .slice(0, 3);
    const price = clinic.serviceTypes?.find((s) => s.isActive)?.price;
    return { workingDays: days, consultationPrice: price };
  }, [clinic.schedules, clinic.serviceTypes, t]);

  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
        isNearYou
          ? "border-primary-400/70 ring-1 ring-primary-400/40 shadow-md dark:border-primary-500/60 dark:ring-primary-500/30"
          : "hover:border-primary-200 dark:hover:border-primary-800"
      }`}
    >
      {isNearYou && (
        <div className="absolute top-0 start-0 end-0 h-1 bg-gradient-to-r from-primary-500 via-primary-400 to-primary-500" />
      )}
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Clinic Icon */}
          <div className="flex-shrink-0 h-20 w-20 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center">
            <Stethoscope className="h-10 w-10 text-primary-600 dark:text-primary-400" />
          </div>

          {/* Clinic Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/clinics/${clinic.id}`}
                    className="text-lg font-bold text-foreground hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {getLocalizedText(clinic.name, locale)}
                  </Link>
                  {clinic.isActive && (
                    <Badge variant="success" className="text-xs">
                      {t("clinics.available")}
                    </Badge>
                  )}
                  {isNearYou && (
                    <Badge className="gap-1 text-[11px] sm:text-xs">
                      <MapPin className="h-3 w-3" />
                      {typeof distanceKm === "number"
                        ? t("doctors.distanceAway", { km: distanceKm })
                        : t("doctors.nearYou")}
                    </Badge>
                  )}
                </div>
                {isNearYou && (
                  <p className="text-[11px] text-primary-700 dark:text-primary-300 mt-1">
                    {t("doctors.matchesYourLocation")}
                  </p>
                )}
              </div>
              {consultationPrice && (
                <div className="flex items-center gap-2 rounded-lg border border-primary-200/60 bg-primary-50/60 px-2.5 py-1.5 dark:border-primary-800/40 dark:bg-primary-900/20 shrink-0">
                  <Wallet className="h-4 w-4 text-primary-600 dark:text-primary-400 shrink-0" />
                  <div className="text-end leading-tight">
                    <span className="block text-[11px] text-muted-foreground">
                      {t("clinics.consultation")}
                    </span>
                    <span className="font-bold text-primary-700 dark:text-primary-300 text-sm">
                      {consultationPrice} {t("common.currency")}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {getLocalizedText(clinic.address, locale)}
                {clinic.city &&
                  `, ${getLocalizedText(clinic.city.name, locale)}`}
                {clinic.city?.state &&
                  `, ${getLocalizedText(clinic.city.state.name, locale)}`}
              </span>
            </div>

            {/* Working Hours */}
            {workingDays && workingDays.length > 0 && (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {workingDays.join(locale === "ar" ? "، " : ", ")}
                  {clinic.schedules && clinic.schedules.length > 3 && "..."}
                </span>
              </div>
            )}

            {/* Phone */}
            {clinic.phoneNumbers && clinic.phoneNumbers.length > 0 && (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <a
                  href={`tel:${clinic.phoneNumbers[0]}`}
                  className="hover:text-primary-600 hover:underline"
                  dir="ltr"
                >
                  {clinic.phoneNumbers[0]}
                </a>
              </div>
            )}

            {/* Services */}
            {clinic.serviceTypes && clinic.serviceTypes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {clinic.serviceTypes.slice(0, 4).map((service) => (
                  <Badge
                    key={service.id}
                    variant="secondary"
                    className="text-xs"
                  >
                    {getLocalizedText(service.name, locale) ||
                      service.serviceType}
                  </Badge>
                ))}
                {clinic.serviceTypes.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{clinic.serviceTypes.length - 4}
                  </Badge>
                )}
              </div>
            )}

            {/* Book Button */}
            {showBookButton && (
              <div className="mt-4 pt-4 border-t border-border">
                <Button asChild size="sm" className="gap-1 min-h-[44px]">
                  <Link href={`/clinics/${clinic.id}`}>
                    <Calendar className="h-4 w-4" />
                    {t("doctors.bookAppointment")}
                    <ChevronForward className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
