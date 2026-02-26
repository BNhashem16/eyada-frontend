"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  MapPin,
  Clock,
  DollarSign,
  Settings,
  ChevronLeft,
  Phone,
  MessageCircle,
  Edit,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDoctorClinics } from "../hooks/use-doctor-portal";
import { useTranslation } from "@/lib/i18n";
import { DayOfWeek } from "@/types/enums";
import { getLocalizedText } from "@/lib/utils/multilingual";

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

export function ClinicManagement() {
  const { t, locale } = useTranslation();
  const { data: clinics, isLoading, isError } = useDoctorClinics();

  const dayNames = getDayNames(t);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex gap-4">
                <Skeleton className="h-16 w-16 rounded-xl" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-error-200 dark:border-error-800 bg-error-50 dark:bg-error-900/20">
        <CardContent className="py-10 text-center">
          <p className="text-error-600 dark:text-error-400">
            {t("clinics.loadError")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Clinic Button */}
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/doctor/clinics/new">
            <Plus className="h-4 w-4 ms-2" />
            {t("doctor.addNewClinic")}
          </Link>
        </Button>
      </div>

      {/* Clinics List */}
      {clinics && clinics.length > 0 ? (
        <div className="space-y-4">
          {clinics.map((clinic) => {
            const workingDays = clinic.schedules
              ?.filter((s) => s.isActive)
              .map((s) => dayNames[s.dayOfWeek]);

            const consultationPrice = clinic.serviceTypes?.find(
              (s) => s.isActive,
            )?.price;

            const clinicName = getLocalizedText(clinic.name, locale);
            const clinicAddress = getLocalizedText(clinic.address, locale);
            const cityName =
              getLocalizedText(clinic.city?.name, locale) ||
              (clinic.city as any)?.nameAr ||
              "";
            const phoneNumbers = clinic.phoneNumbers?.filter(Boolean) || [];
            const whatsappNumbers =
              clinic.whatsappNumbers?.filter(Boolean) || [];

            return (
              <Card
                key={clinic.id}
                className="overflow-hidden hover:border-primary-200 transition-colors"
              >
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 h-16 w-16 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-foreground">
                            {clinicName}
                          </h3>
                          {clinic.isActive ? (
                            <Badge variant="success" className="text-xs">
                              {t("common.active")}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              {t("common.inactive")}
                            </Badge>
                          )}
                        </div>
                        {consultationPrice && (
                          <div className="text-end">
                            <span className="text-sm text-muted-foreground">
                              {t("clinics.consultation")}
                            </span>
                            <div className="font-bold text-primary-600 dark:text-primary-400">
                              {consultationPrice} {t("common.currency")}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4 text-muted-foreground/70" />
                        <span>
                          {clinicAddress}
                          {cityName && `, ${cityName}`}
                        </span>
                      </div>

                      {/* Phone Numbers */}
                      {phoneNumbers.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Phone className="h-4 w-4 text-muted-foreground/70 flex-shrink-0" />
                          <span dir="ltr">
                            {phoneNumbers.map((phone, i) => (
                              <span key={i}>
                                {i > 0 && " / "}
                                <a
                                  href={`tel:${phone}`}
                                  className="hover:text-primary-600 hover:underline"
                                >
                                  {phone}
                                </a>
                              </span>
                            ))}
                          </span>
                        </div>
                      )}

                      {/* WhatsApp Numbers */}
                      {whatsappNumbers.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <MessageCircle className="h-4 w-4 text-muted-foreground/70 flex-shrink-0" />
                          <span dir="ltr">
                            {whatsappNumbers.map((num, i) => (
                              <span key={i}>
                                {i > 0 && " / "}
                                <a
                                  href={`https://wa.me/${num.replace(/[^0-9]/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-600 hover:underline"
                                >
                                  {num}
                                </a>
                              </span>
                            ))}
                          </span>
                        </div>
                      )}

                      {/* Working Days */}
                      {workingDays && workingDays.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <Clock className="h-4 w-4 text-muted-foreground/70" />
                          <span>
                            {workingDays.join(locale === "ar" ? "، " : ", ")}
                          </span>
                        </div>
                      )}

                      {/* Services Count */}
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          {clinic.serviceTypes?.length || 0}{" "}
                          {t("clinics.serviceCount")}
                        </span>
                        <span className="text-muted-foreground">
                          {clinic.schedules?.filter((s) => s.isActive).length ||
                            0}{" "}
                          {t("clinics.workDayCount")}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col gap-2">
                      <Button asChild variant="outline" className="text-xs">
                        <Link href={`/doctor/clinics/${clinic.id}`}>
                          <Settings className="h-4 w-4 ms-1" />
                          {t("clinics.manage")}
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" className="text-xs">
                        <Link href={`/doctor/clinics/${clinic.id}/edit`}>
                          <Edit className="h-4 w-4 ms-1" />
                          {t("common.edit")}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t("clinics.noClinics")}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t("clinics.noClinicsCta")}
            </p>
            <Button asChild>
              <Link href="/doctor/clinics/new">
                <Plus className="h-4 w-4 ms-2" />
                {t("doctor.addNewClinic")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
