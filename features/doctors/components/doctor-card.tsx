"use client";

import React from "react";
import Link from "next/link";
import { Star, MapPin, Clock, Calendar, ChevronLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DoctorProfile } from "@/types";
import { DoctorStatus } from "@/types/enums";
import { getInitials } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { getLocalizedText } from "@/lib/utils/multilingual";

interface DoctorCardProps {
  doctor: DoctorProfile;
}

export const DoctorCard = React.memo(function DoctorCard({
  doctor,
}: DoctorCardProps) {
  const { t, locale } = useTranslation();
  const averageRating = doctor.averageRating ?? 0;
  const totalRatings = doctor.totalRatings ?? 0;

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Doctor Image */}
          <div className="relative h-48 w-full sm:h-auto sm:w-48 flex-shrink-0 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30">
            <Avatar className="h-full w-full rounded-none">
              <AvatarImage
                src={doctor.user?.profilePicture || undefined}
                alt={doctor.user?.fullName}
                className="object-cover"
              />
              <AvatarFallback className="rounded-none text-4xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 text-primary-700 dark:text-primary-300">
                {getInitials(doctor.user?.fullName || "")}
              </AvatarFallback>
            </Avatar>
            {doctor.status === DoctorStatus.APPROVED && (
              <Badge
                variant="success"
                className="absolute top-3 start-3 shadow-md"
              >
                {t("doctor.verified")}
              </Badge>
            )}
          </div>

          {/* Doctor Info */}
          <div className="flex-1 p-4 sm:p-5">
            <div className="mb-3">
              <Link
                href={`/doctors/${doctor.id}`}
                className="inline-block text-lg font-bold text-foreground hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                {t("doctors.doctorPrefix")} {doctor.user?.fullName}
              </Link>
              <p className="text-sm text-muted-foreground mt-0.5">
                {getLocalizedText(doctor.specialty?.name, locale)}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-warning-400 text-warning-400" />
                <span className="font-semibold text-foreground">
                  {averageRating.toFixed(1)}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                ({totalRatings} {t("doctor.rating")})
              </span>
            </div>

            {/* Location & Experience */}
            <div className="space-y-2 mb-4">
              {doctor.clinics && doctor.clinics.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {getLocalizedText(doctor.clinics[0].city?.name, locale)},{" "}
                    {getLocalizedText(doctor.clinics[0].city?.state?.name, locale)}
                  </span>
                </div>
              )}
              {doctor.yearsOfExperience && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    {doctor.yearsOfExperience} {t("doctors.yearsExp")}
                  </span>
                </div>
              )}
            </div>

            {/* Price & Book Button */}
            <div className="flex items-center justify-between gap-4 pt-3 border-t border-border">
              <div>
                {doctor.clinics &&
                  doctor.clinics[0]?.serviceTypes?.[0]?.price && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">
                        {t("doctor.consultationPrice")}{" "}
                      </span>
                      <span className="font-bold text-primary-600 dark:text-primary-400">
                        {doctor.clinics[0].serviceTypes[0].price}{" "}
                        {t("common.currency")}
                      </span>
                    </div>
                  )}
              </div>
              <Button
                asChild
                size="sm"
                className="gap-1 group-hover:gap-2 transition-all"
              >
                <Link href={`/doctors/${doctor.id}`}>
                  <Calendar className="h-4 w-4" />
                  {t("doctor.bookNow")}
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
