"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import Link from "next/link";
import {
  Star,
  GraduationCap,
  Phone,
  Building2,
  MessageCircle,
  ArrowLeft,
  ArrowRight,
  Share2,
  BadgeCheck,
  AlertTriangle,
  Stethoscope,
  Search,
  User,
  Briefcase,
  MessagesSquare,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useDoctor } from "../hooks/use-doctors";
import { ClinicCard } from "@/features/clinics/components/clinic-card";
import {
  getInitials,
  sortClinicsByMatch,
  pickPrimaryAddress,
} from "@/lib/utils";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { useTranslation } from "@/lib/i18n";
import { toastSuccess } from "@/hooks/use-toast";
import { useUser, useIsAuthenticated } from "@/lib/auth/store";
import { usePatientAddresses } from "@/features/patients/hooks";
import { Role } from "@/types/enums";

const RatingsList = lazy(() =>
  import("./ratings-list").then((m) => ({ default: m.RatingsList })),
);

interface DoctorProfileProps {
  doctorId: string;
}

type TabValue = "clinics" | "about" | "ratings";
const TABS: TabValue[] = ["clinics", "about", "ratings"];
const DEFAULT_TAB: TabValue = "clinics";

function readHashTab(): TabValue {
  if (typeof window === "undefined") return DEFAULT_TAB;
  const hash = window.location.hash.replace("#", "") as TabValue;
  return TABS.includes(hash) ? hash : DEFAULT_TAB;
}

export function DoctorProfileComponent({ doctorId }: DoctorProfileProps) {
  const { t, locale, isRtl } = useTranslation();
  const { data: doctor, isLoading, isError } = useDoctor(doctorId);

  // Only fetch the patient's saved addresses if the visitor is a logged-in patient.
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();
  const isPatient = isAuthenticated && user?.role === Role.PATIENT;
  const { data: addresses } = usePatientAddresses({ enabled: isPatient });
  const primaryAddress = pickPrimaryAddress(addresses);

  // Lazy initializer reads the hash on the first client render (and falls
  // back to DEFAULT_TAB during SSR), avoiding a cascading setState-in-effect.
  const [activeTab, setActiveTab] = useState<TabValue>(readHashTab);

  // Keep state in sync if the user navigates with back/forward.
  useEffect(() => {
    const onHashChange = () => setActiveTab(readHashTab());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const handleTabChange = (value: string) => {
    const next = TABS.includes(value as TabValue)
      ? (value as TabValue)
      : DEFAULT_TAB;
    setActiveTab(next);
    if (typeof window !== "undefined") {
      const url = `${window.location.pathname}${window.location.search}#${next}`;
      window.history.replaceState(null, "", url);
    }
  };

  const handleShare = async () => {
    if (typeof window === "undefined" || !doctor) return;
    const shareUrl = window.location.href;
    const title = `${t("doctors.doctorPrefix")} ${doctor.user?.fullName ?? doctor.user?.name ?? ""}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, url: shareUrl });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      toastSuccess(t("doctors.linkCopied"));
    } catch {
      // user cancelled / clipboard blocked — silently ignore
    }
  };

  if (isLoading) {
    return <DoctorProfileSkeleton />;
  }

  if (isError || !doctor) {
    return (
      <Card className="border-error-200 dark:border-error-800 bg-error-50/40 dark:bg-error-900/10">
        <CardContent className="py-10 sm:py-14 text-center space-y-4">
          <div className="mx-auto h-14 w-14 rounded-full bg-error-100 dark:bg-error-900/40 flex items-center justify-center">
            <AlertTriangle className="h-7 w-7 text-error-600 dark:text-error-400" />
          </div>
          <p className="text-error-700 dark:text-error-300 text-sm sm:text-base max-w-sm mx-auto">
            {t("doctors.loadError")}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button asChild variant="outline">
              <Link href="/doctors">{t("doctors.backToSearch")}</Link>
            </Button>
            <Button onClick={() => window.location.reload()}>
              {t("common.tryAgain")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const fullName = doctor.user?.fullName || doctor.user?.name || "";
  const drPrefix = t("doctors.doctorPrefix");
  const averageRating = doctor.averageRating ?? 0;
  const totalRatings = doctor.totalRatings ?? 0;
  const clinicsCount = doctor.clinics?.length ?? 0;
  const phone = doctor.user?.phoneNumber;
  const whatsappNumbers = doctor.whatsappNumbers ?? [];
  const primaryWhatsapp = whatsappNumbers[0];
  const isTopRated = averageRating >= 4.5 && totalRatings >= 5;

  const ChevronForward = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      {/* Back link — small, accessible, uses logical chevron */}
      <div>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground gap-1 -ms-2"
        >
          <Link href="/doctors">
            {isRtl ? (
              <ArrowRight className="h-4 w-4" />
            ) : (
              <ArrowLeft className="h-4 w-4" />
            )}
            {t("doctors.backToSearch")}
          </Link>
        </Button>
      </div>

      {/* Hero Card — layered, intentional hierarchy */}
      <Card className="overflow-hidden border-border/60">
        {/* Layered atmospheric background */}
        <div className="relative h-36 sm:h-40 bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 overflow-hidden">
          <div
            className="absolute inset-0 opacity-30 mix-blend-overlay"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.4) 0, transparent 45%), radial-gradient(circle at 80% 60%, rgba(255,255,255,0.25) 0, transparent 40%)",
            }}
            aria-hidden
          />
          {/* Decorative medical watermark — fills the empty colored bar */}
          <Stethoscope
            className="absolute -bottom-4 end-16 h-40 w-40 text-white/10 -rotate-12 sm:end-24 pointer-events-none"
            aria-hidden
          />
          {/* Share — pinned to logical end */}
          <div className="absolute top-3 end-3">
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="h-9 w-9 rounded-full bg-white/90 hover:bg-white text-foreground shadow-sm"
              onClick={handleShare}
              aria-label={t("doctors.shareProfile")}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <CardContent className="relative pb-6">
          {/* Avatar overlap */}
          <div className="absolute -top-14 sm:-top-16 start-4 sm:start-6">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-card shadow-lg ring-1 ring-border/40">
              <AvatarImage
                src={doctor.user?.profilePicture || undefined}
                alt={fullName}
              />
              <AvatarFallback className="text-2xl sm:text-3xl bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400">
                {getInitials(fullName)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Identity block */}
          <div className="pt-12 sm:pt-2 sm:ps-40 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                    {drPrefix} {fullName}
                  </h1>
                  {isTopRated && (
                    <Badge
                      variant="success"
                      className="gap-1 text-[11px] sm:text-xs"
                    >
                      <BadgeCheck className="h-3.5 w-3.5" />
                      {t("doctors.topRated")}
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base flex items-center gap-1.5">
                  <Stethoscope className="h-4 w-4 text-primary-600/70 dark:text-primary-400/70 shrink-0" />
                  <span className="truncate">
                    {getLocalizedText(doctor.specialty?.name, locale)}
                  </span>
                </p>

                {/* Rating */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <div className="flex items-center" dir="ltr">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 sm:h-5 sm:w-5 ${
                          i < Math.round(averageRating)
                            ? "fill-warning-400 text-warning-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-sm sm:text-base">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    ({totalRatings} {t("doctors.reviews")})
                  </span>
                </div>
              </div>
            </div>

            {/* Stats — pill cards instead of loose numbers */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {doctor.yearsOfExperience !== undefined && (
                <StatPill
                  icon={<Briefcase className="h-4 w-4" />}
                  value={`${doctor.yearsOfExperience}+`}
                  label={t("doctors.yearsExp")}
                />
              )}
              <StatPill
                icon={<Building2 className="h-4 w-4" />}
                value={String(clinicsCount)}
                label={
                  clinicsCount === 1
                    ? t("doctors.clinicsCountSingle").replace(/^1\s*/, "")
                    : t("clinics.clinicCount")
                }
              />
              <StatPill
                icon={<MessagesSquare className="h-4 w-4" />}
                value={totalRatings.toString()}
                label={t("doctors.reviews")}
              />
            </div>

            {/* Primary CTAs — surfaced on hero */}
            <div className="flex flex-wrap gap-2">
              <Button asChild size="default" className="min-h-[44px] gap-1.5">
                <a href={`#clinics`} onClick={() => handleTabChange("clinics")}>
                  <Building2 className="h-4 w-4" />
                  {t("doctors.bookAppointment")}
                  <ChevronForward className="h-4 w-4" />
                </a>
              </Button>
              {phone && (
                <Button
                  asChild
                  variant="outline"
                  size="default"
                  className="min-h-[44px] gap-1.5"
                >
                  <a href={`tel:${phone}`} aria-label={t("doctors.callNow")}>
                    <Phone className="h-4 w-4" />
                    {t("doctors.callNow")}
                  </a>
                </Button>
              )}
              {primaryWhatsapp && (
                <Button
                  asChild
                  variant="outline"
                  size="default"
                  className="min-h-[44px] gap-1.5 border-green-500/40 text-green-700 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                >
                  <a
                    href={`https://wa.me/${primaryWhatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t("doctors.messageOnWhatsapp")}
                  >
                    <MessageCircle className="h-4 w-4" />
                    {t("doctors.messageOnWhatsapp")}
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs — explicit dir so Radix keyboard nav respects locale */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="relative border-b border-border">
          <TabsList className="h-auto w-full sm:w-auto justify-start gap-1 overflow-x-auto bg-transparent p-0 rounded-none">
            <TabTriggerWithIndicator
              value="clinics"
              icon={<Building2 className="h-4 w-4" />}
              label={t("clinics.title")}
              count={clinicsCount}
            />
            <TabTriggerWithIndicator
              value="about"
              icon={<User className="h-4 w-4" />}
              label={t("doctors.about")}
            />
            <TabTriggerWithIndicator
              value="ratings"
              icon={<Star className="h-4 w-4" />}
              label={t("doctors.ratings")}
              count={totalRatings}
            />
          </TabsList>
          {/* mobile fade hint to indicate scroll */}
          <div
            className="pointer-events-none absolute top-0 bottom-0 end-0 w-6 bg-gradient-to-l from-background to-transparent sm:hidden rtl:bg-gradient-to-r"
            aria-hidden
          />
        </div>

        {/* Clinics Tab — DEFAULT, sorted by match to the user's saved address */}
        <TabsContent value="clinics" className="mt-6">
          {clinicsCount > 0 ? (
            (() => {
              const sortedClinics = sortClinicsByMatch(
                doctor.clinics ?? [],
                primaryAddress,
              );
              const matchingCount = sortedClinics.filter(
                (c) => c.match.isNearYou,
              ).length;
              return (
                <div className="space-y-4">
                  {primaryAddress && matchingCount > 0 && (
                    <div className="flex items-start gap-3 rounded-xl border border-primary-200/60 bg-primary-50/60 px-4 py-3 dark:border-primary-800/40 dark:bg-primary-900/20">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/50">
                        <MapPin className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-primary-700 dark:text-primary-300">
                          {t("doctors.matchingClinicsCount", {
                            count: matchingCount,
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {t("doctors.basedOnYourAddress")}
                          {primaryAddress.label
                            ? ` · ${primaryAddress.label}`
                            : ""}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="grid gap-4">
                    {sortedClinics.map((clinic) => (
                      <ClinicCard
                        key={clinic.id}
                        clinic={clinic}
                        showBookButton
                        isNearYou={clinic.match.isNearYou}
                        distanceKm={clinic.match.distanceKm}
                      />
                    ))}
                  </div>
                </div>
              );
            })()
          ) : (
            <EmptyClinics
              hint={t("doctors.noClinicsHint")}
              browse={t("doctors.browseDoctors")}
              backLabel={t("clinics.noClinicsRegistered")}
            />
          )}
        </TabsContent>

        {/* About Tab */}
        <TabsContent value="about" className="mt-6 space-y-6">
          {doctor.bio && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  {t("doctors.aboutDoctor")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-line leading-relaxed max-w-prose">
                  {getLocalizedText(doctor.bio, locale)}
                </p>
              </CardContent>
            </Card>
          )}

          {doctor.qualifications && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  {t("doctors.qualifications")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-line leading-relaxed max-w-prose">
                  {getLocalizedText(doctor.qualifications, locale)}
                </p>
              </CardContent>
            </Card>
          )}

          {(phone || whatsappNumbers.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  {t("doctors.contactInfo")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {phone && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {t("doctors.phoneNumber")}
                    </p>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary-600 dark:text-primary-400 shrink-0" />
                      <a
                        href={`tel:${phone}`}
                        className="text-foreground hover:text-primary-600 dark:hover:text-primary-400 hover:underline break-all"
                        dir="ltr"
                      >
                        {phone}
                      </a>
                    </div>
                  </div>
                )}
                {whatsappNumbers.length > 0 && (
                  <>
                    {phone && <Separator />}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        {t("doctors.whatsappNumber")}
                      </p>
                      {whatsappNumbers.map((num, idx) => (
                        <div
                          key={`${num}-${idx}`}
                          className="flex items-center gap-2"
                        >
                          <MessageCircle className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                          <a
                            href={`https://wa.me/${num.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 dark:text-green-400 hover:underline break-all"
                            dir="ltr"
                          >
                            {num}
                          </a>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {!doctor.bio &&
            !doctor.qualifications &&
            !phone &&
            whatsappNumbers.length === 0 && (
              <EmptyState
                icon={<Stethoscope className="h-10 w-10" />}
                text={t("common.noData")}
              />
            )}
        </TabsContent>

        {/* Ratings Tab — lazy loaded */}
        <TabsContent value="ratings" className="mt-6">
          {activeTab === "ratings" ? (
            <Suspense fallback={<RatingsSkeleton />}>
              <RatingsList doctorId={doctorId} />
            </Suspense>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TabTriggerWithIndicator({
  value,
  icon,
  label,
  count,
}: {
  value: string;
  icon: React.ReactNode;
  label: string;
  count?: number;
}) {
  return (
    <TabsTrigger
      value={value}
      className={[
        "group/tab relative min-h-[44px] gap-2 rounded-none border-b-2 border-transparent -mb-px",
        "px-3 sm:px-4 py-2.5 text-sm font-medium text-muted-foreground",
        "hover:text-foreground transition-colors",
        // active state — strong visual: primary text + primary underline + bold
        "data-[state=active]:text-primary-700 dark:data-[state=active]:text-primary-300",
        "data-[state=active]:border-primary-600 dark:data-[state=active]:border-primary-400",
        "data-[state=active]:font-semibold data-[state=active]:bg-primary-50/40 dark:data-[state=active]:bg-primary-900/20",
        "data-[state=active]:shadow-none",
      ].join(" ")}
    >
      <span className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
        {typeof count === "number" && count > 0 && (
          <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-muted text-[11px] font-medium text-muted-foreground group-data-[state=active]/tab:bg-primary-100 group-data-[state=active]/tab:text-primary-700 dark:group-data-[state=active]/tab:bg-primary-900/40 dark:group-data-[state=active]/tab:text-primary-300">
            {count}
          </span>
        )}
      </span>
    </TabsTrigger>
  );
}

function StatPill({
  icon,
  value,
  label,
}: {
  icon?: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card px-3 py-2.5 shadow-sm flex items-center gap-2.5">
      {icon && (
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100/70 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 shrink-0">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <div className="text-lg sm:text-xl font-bold text-foreground leading-none">
          {value}
        </div>
        <div className="mt-1 text-[11px] sm:text-xs text-muted-foreground truncate">
          {label}
        </div>
      </div>
    </div>
  );
}

function EmptyClinics({
  hint,
  browse,
  backLabel,
}: {
  hint: string;
  browse: string;
  backLabel: string;
}) {
  return (
    <Card>
      <CardContent className="py-10 sm:py-14 text-center space-y-4">
        <div className="mx-auto h-14 w-14 rounded-full bg-muted flex items-center justify-center">
          <Building2 className="h-7 w-7 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-foreground font-medium">{backLabel}</p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {hint}
          </p>
        </div>
        <Button asChild variant="outline" className="gap-1.5">
          <Link href="/doctors">
            <Search className="h-4 w-4" />
            {browse}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <Card>
      <CardContent className="py-10 text-center space-y-3">
        <div className="mx-auto h-14 w-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
        <p className="text-muted-foreground">{text}</p>
      </CardContent>
    </Card>
  );
}

function RatingsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(2)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function DoctorProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <Card className="overflow-hidden">
        <Skeleton className="h-36 sm:h-40" />
        <CardContent className="relative pb-6">
          <div className="absolute -top-14 sm:-top-16 start-4 sm:start-6">
            <Skeleton className="h-24 w-24 sm:h-32 sm:w-32 rounded-full" />
          </div>
          <div className="pt-12 sm:pt-2 sm:ps-40 space-y-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-40" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 pt-2">
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
            </div>
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-11 w-32" />
              <Skeleton className="h-11 w-28" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Skeleton className="h-12 w-full sm:w-72" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
