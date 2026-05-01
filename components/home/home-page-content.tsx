"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Calendar,
  Search,
  UserCheck,
  Clock,
  Star,
  Shield,
  Stethoscope,
  Heart,
  Brain,
  Eye,
  Bone,
  Baby,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicLayout } from "@/components/common";
import { useTranslation } from "@/lib/i18n";
import { useSpecialties } from "@/features/specialties";
import { useLanguage } from "@/components/providers";
import { HomeSearchInput } from "./home-search-input";
import { HomeTrackInput } from "./home-track-input";

// Auth CTA is below-the-fold and only one of three branches renders. Splitting
// it into its own chunk keeps the initial JS payload smaller without losing
// the SSR'd HTML on first paint.
const HomeAuthCta = dynamic(
  () => import("./home-auth-cta").then((m) => m.HomeAuthCta),
  {
    loading: () => (
      <section className="bg-gradient-medical py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <Skeleton className="mx-auto mb-4 h-10 w-64 bg-white/20" />
          <Skeleton className="mx-auto mb-8 h-6 w-96 bg-white/20" />
          <Skeleton className="mx-auto h-12 w-40 bg-white/20" />
        </div>
      </section>
    ),
  },
);

const defaultSpecialtyIcons: Record<
  string,
  { icon: typeof Heart; color: string }
> = {
  "internal-medicine": { icon: Heart, color: "text-red-500 dark:text-red-400" },
  pediatrics: { icon: Baby, color: "text-pink-500 dark:text-pink-400" },
  ophthalmology: { icon: Eye, color: "text-blue-500 dark:text-blue-400" },
  orthopedics: { icon: Bone, color: "text-amber-500 dark:text-amber-400" },
  neurology: { icon: Brain, color: "text-purple-500 dark:text-purple-400" },
  "general-medicine": {
    icon: Stethoscope,
    color: "text-teal-500 dark:text-teal-400",
  },
};

const fallbackIcon = { icon: Stethoscope, color: "text-primary-500" };

export function HomePageContent() {
  const { t } = useTranslation();
  const { locale } = useLanguage();

  const { data: specialties, isLoading: specialtiesLoading } = useSpecialties();

  const features = [
    {
      icon: Search,
      title: t("home.step1Title"),
      description: t("home.step1Desc"),
    },
    {
      icon: Calendar,
      title: t("home.step2Title"),
      description: t("home.step2Desc"),
    },
    {
      icon: UserCheck,
      title: t("home.step3Title"),
      description: t("home.step3Desc"),
    },
  ];

  const stats = [
    { value: "500+", label: t("home.stats.doctors") },
    { value: "50+", label: t("home.stats.specialties") },
    { value: "10,000+", label: t("home.stats.appointments") },
    { value: "4.8", label: t("home.stats.rating") },
  ];

  const getSpecialtyName = (specialty: {
    name: { ar: string; en: string };
  }) => (locale === "ar" ? specialty.name.ar : specialty.name.en);

  const getSpecialtyIcon = (specialtyIcon?: string) => {
    if (specialtyIcon && defaultSpecialtyIcons[specialtyIcon]) {
      return defaultSpecialtyIcons[specialtyIcon];
    }
    return fallbackIcon;
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-background dark:from-primary-950/50 dark:to-background py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
              {t("home.heroTitle")}
              <span className="text-primary-600 dark:text-primary-400">
                {" "}
                {t("home.heroTitleHighlight")}
              </span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              {t("home.heroSubtitle")}
            </p>

            <div className="mx-auto max-w-2xl">
              <HomeSearchInput />
            </div>
          </div>
        </div>

        <div className="absolute -bottom-20 -start-20 h-64 w-64 rounded-full bg-primary-100 dark:bg-primary-900/30 opacity-50 blur-3xl" />
        <div className="absolute -top-20 -end-20 h-64 w-64 rounded-full bg-secondary-100 dark:bg-secondary-900/30 opacity-50 blur-3xl" />
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 md:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Track Appointment Section */}
      <section className="py-12 bg-gradient-to-r from-secondary-50 to-primary-50 dark:from-secondary-950/50 dark:to-primary-950/50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Navigation className="h-8 w-8 text-secondary-600 dark:text-secondary-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                {t("home.trackAppointment")}
              </h2>
            </div>
            <p className="text-muted-foreground mb-6">
              {t("home.trackAppointmentDesc")}
            </p>
            <HomeTrackInput />
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              {t("home.popularSpecialties")}
            </h2>
            <p className="text-muted-foreground">{t("home.selectSpecialty")}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {specialtiesLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <Skeleton className="mx-auto mb-4 h-14 w-14 rounded-xl" />
                    <Skeleton className="mx-auto h-4 w-20" />
                  </CardContent>
                </Card>
              ))
            ) : specialties && specialties.length > 0 ? (
              specialties.slice(0, 6).map((specialty) => {
                const iconConfig = getSpecialtyIcon(specialty.icon);
                const Icon = iconConfig.icon;
                return (
                  <Link
                    key={specialty.id}
                    href={`/doctors?specialty=${specialty.id}`}
                  >
                    <Card hover className="text-center h-full">
                      <CardContent className="p-6">
                        <div
                          className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-muted ${iconConfig.color}`}
                        >
                          <Icon className="h-7 w-7" />
                        </div>
                        <h3 className="font-medium text-foreground">
                          {getSpecialtyName(specialty)}
                        </h3>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })
            ) : (
              <div className="col-span-full text-center text-muted-foreground py-8">
                {t("common.noData")}
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <Link href="/specialties">
              <Button variant="outline" size="lg">
                {t("home.viewAllSpecialties")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              {t("home.howItWorks")}
            </h2>
            <p className="text-muted-foreground">
              {t("home.howItWorksSubtitle")}
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="relative text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-900/30">
                  <feature.icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="absolute -top-2 start-1/2 -ms-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                  {index + 1}
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-foreground">
                {t("home.whyChooseUs")}
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30">
                    <Star className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-foreground">
                      {t("home.feature1Title")}
                    </h3>
                    <p className="text-muted-foreground">
                      {t("home.feature1Desc")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30">
                    <Clock className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-foreground">
                      {t("home.feature2Title")}
                    </h3>
                    <p className="text-muted-foreground">
                      {t("home.feature2Desc")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30">
                    <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-foreground">
                      {t("home.feature3Title")}
                    </h3>
                    <p className="text-muted-foreground">
                      {t("home.feature3Desc")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 p-8">
                <div className="flex h-full items-center justify-center">
                  <Stethoscope className="h-32 w-32 text-primary-200 dark:text-primary-800" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Auth-state-dependent (dynamic import; below the fold) */}
      <HomeAuthCta />
    </PublicLayout>
  );
}
