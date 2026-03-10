"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star,
  MapPin,
  Clock,
  GraduationCap,
  Phone,
  Calendar,
  ChevronLeft,
  Building2,
  Stethoscope,
  MessageCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useDoctor, useDoctorRatings } from "../hooks/use-doctors";
import { ClinicCard } from "@/features/clinics/components/clinic-card";
import { RatingsList } from "./ratings-list";
import { getInitials } from "@/lib/utils";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { useTranslation } from "@/lib/i18n";

interface DoctorProfileProps {
  doctorId: string;
}

export function DoctorProfileComponent({ doctorId }: DoctorProfileProps) {
  const { t, locale } = useTranslation();
  const { data: doctor, isLoading, isError } = useDoctor(doctorId);
  const [activeTab, setActiveTab] = useState("about");

  if (isLoading) {
    return <DoctorProfileSkeleton />;
  }

  if (isError || !doctor) {
    return (
      <Card className="border-error-200 dark:border-error-800 bg-error-50 dark:bg-error-900/20">
        <CardContent className="py-10 text-center">
          <p className="text-error-600 dark:text-error-400">
            {t("doctors.loadError")}
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/doctors">{t("doctors.backToSearch")}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const averageRating = doctor.averageRating ?? 0;
  const totalRatings = doctor.totalRatings ?? 0;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="overflow-hidden">
        <div className="relative h-32 bg-gradient-to-l from-primary-500 to-primary-700" />
        <CardContent className="relative pb-6">
          {/* Avatar */}
          <div className="absolute -top-16 start-6">
            <Avatar className="h-32 w-32 border-4 border-card shadow-lg">
              <AvatarImage
                src={doctor.user?.profilePicture || undefined}
                alt={doctor.user?.name}
              />
              <AvatarFallback className="text-3xl bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400">
                {getInitials(doctor.user?.name || "")}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Doctor Info */}
          <div className="pt-20 sm:pt-0 sm:ps-40">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                    {t("doctors.doctorPrefix")}{" "}
                    {doctor.user?.fullName || doctor.user?.name}
                  </h1>
                </div>
                <p className="text-muted-foreground mt-1">
                  {getLocalizedText(doctor.specialty?.name, locale)}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.round(averageRating)
                            ? "fill-warning-400 text-warning-400"
                            : "text-gray-300 dark:text-gray-500"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({totalRatings} {t("doctors.reviews")})
                  </span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-6 text-center">
                {doctor.yearsOfExperience && (
                  <div>
                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {doctor.yearsOfExperience}+
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t("doctors.yearsExp")}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {doctor.clinics?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t("clinics.clinicCount")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="about">{t("doctors.about")}</TabsTrigger>
          <TabsTrigger value="clinics">{t("clinics.title")}</TabsTrigger>
          <TabsTrigger value="ratings">{t("doctors.ratings")}</TabsTrigger>
        </TabsList>

        {/* About Tab */}
        <TabsContent value="about" className="mt-6 space-y-6">
          {/* Bio */}
          {doctor.bio && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("doctors.aboutDoctor")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-line">
                  {getLocalizedText(doctor.bio, locale)}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Qualifications */}
          {doctor.qualifications && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  {t("doctors.qualifications")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-line">
                  {getLocalizedText(doctor.qualifications, locale)}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Contact Info */}
          {(doctor.user?.phoneNumber ||
            (doctor.whatsappNumbers && doctor.whatsappNumbers.length > 0)) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  {t("doctors.contactInfo")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {doctor.user?.phoneNumber && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {t("doctors.phoneNumber")}
                    </p>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                      <a
                        href={`tel:${doctor.user.phoneNumber}`}
                        className="text-foreground hover:text-primary-600 dark:hover:text-primary-400 hover:underline"
                        dir="ltr"
                      >
                        {doctor.user.phoneNumber}
                      </a>
                    </div>
                  </div>
                )}
                {doctor.whatsappNumbers &&
                  doctor.whatsappNumbers.length > 0 && (
                    <>
                      {doctor.user?.phoneNumber && <Separator />}
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          {t("doctors.whatsappNumber")}
                        </p>
                        {doctor.whatsappNumbers.map(
                          (num: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2">
                              <MessageCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                              <a
                                href={`https://wa.me/${num.replace(/[^0-9]/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 dark:text-green-400 hover:underline"
                                dir="ltr"
                              >
                                {num}
                              </a>
                            </div>
                          ),
                        )}
                      </div>
                    </>
                  )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Clinics Tab */}
        <TabsContent value="clinics" className="mt-6">
          {doctor.clinics && doctor.clinics.length > 0 ? (
            <div className="space-y-4">
              {doctor.clinics.map((clinic) => (
                <ClinicCard key={clinic.id} clinic={clinic} showBookButton />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">
                  {t("clinics.noClinicsRegistered")}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Ratings Tab */}
        <TabsContent value="ratings" className="mt-6">
          <RatingsList doctorId={doctorId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DoctorProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <Skeleton className="h-32" />
        <CardContent className="relative pb-6">
          <div className="absolute -top-16 start-6">
            <Skeleton className="h-32 w-32 rounded-full" />
          </div>
          <div className="pt-20 sm:pt-0 sm:ps-40 space-y-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-40" />
          </div>
        </CardContent>
      </Card>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
