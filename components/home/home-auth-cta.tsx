"use client";

import Link from "next/link";
import { LayoutDashboard, Search, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";
import { useUser, useIsAuthenticated, useIsHydrated } from "@/lib/auth/store";

function dashboardPathFor(role: string | undefined): string {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "DOCTOR":
      return "/doctor/dashboard";
    case "SECRETARY":
      return "/secretary/dashboard";
    case "PATIENT":
    default:
      return "/patient/dashboard";
  }
}

export function HomeAuthCta() {
  const { t } = useTranslation();
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  const isHydrated = useIsHydrated();

  if (!isHydrated) {
    return (
      <section className="bg-gradient-medical py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <Skeleton className="mx-auto mb-4 h-10 w-64 bg-white/20" />
          <Skeleton className="mx-auto mb-8 h-6 w-96 bg-white/20" />
          <Skeleton className="mx-auto h-12 w-40 bg-white/20" />
        </div>
      </section>
    );
  }

  if (isAuthenticated && user) {
    return (
      <section className="bg-gradient-medical py-12 sm:py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-3 sm:mb-4 text-xl sm:text-3xl font-bold">
            {t("home.welcomeBack")}, {user.name || user.fullName}!
          </h2>
          <p className="mb-6 sm:mb-8 text-sm sm:text-lg text-white/90">
            {t("home.welcomeBackDesc")}
          </p>
          <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-3 sm:gap-4">
            <Link
              href={dashboardPathFor(user.role)}
              className="w-full sm:w-auto"
            >
              <Button
                size="default"
                className="w-full sm:w-auto bg-white text-primary-600 hover:bg-white/90"
              >
                <LayoutDashboard className="h-4 w-4 sm:h-5 sm:w-5 ms-2" />
                {t("nav.dashboard")}
              </Button>
            </Link>
            {user.role === "PATIENT" && (
              <>
                <Link href="/doctors" className="w-full sm:w-auto">
                  <Button
                    size="default"
                    variant="outline"
                    className="w-full sm:w-auto border-white text-white hover:bg-white/10"
                  >
                    <Search className="h-4 w-4 sm:h-5 sm:w-5 ms-2" />
                    {t("nav.findDoctor")}
                  </Button>
                </Link>
                <Link
                  href="/patient/appointments"
                  className="w-full sm:w-auto"
                >
                  <Button
                    size="default"
                    variant="outline"
                    className="w-full sm:w-auto border-white text-white hover:bg-white/10"
                  >
                    <CalendarCheck className="h-4 w-4 sm:h-5 sm:w-5 ms-2" />
                    {t("nav.myAppointments")}
                  </Button>
                </Link>
              </>
            )}
            {user.role === "DOCTOR" && (
              <Link href="/doctor/appointments" className="w-full sm:w-auto">
                <Button
                  size="default"
                  variant="outline"
                  className="w-full sm:w-auto border-white text-white hover:bg-white/10"
                >
                  <CalendarCheck className="h-4 w-4 sm:h-5 sm:w-5 ms-2" />
                  {t("nav.myAppointments")}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-medical py-20 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="mb-4 text-3xl font-bold">{t("home.doctorCta")}</h2>
        <p className="mb-8 text-lg text-white/90">{t("home.doctorCtaDesc")}</p>
        <Link href="/register?role=doctor">
          <Button
            size="lg"
            className="bg-white text-primary-600 hover:bg-white/90"
          >
            {t("home.registerAsDoctor")}
          </Button>
        </Link>
      </div>
    </section>
  );
}
