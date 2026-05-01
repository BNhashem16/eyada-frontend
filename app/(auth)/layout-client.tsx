"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Stethoscope,
  CalendarCheck,
  Pill,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { GuestRoute } from "@/lib/auth";
import { LanguageToggle, ThemeToggle } from "@/components/common";
import { useTranslation } from "@/lib/i18n";

export function AuthLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const isRegister = pathname?.startsWith("/register") ?? false;

  return (
    <GuestRoute>
      <div className="relative min-h-dvh w-full overflow-hidden bg-background">
        <BackgroundDecor />

        <div className="relative z-10 grid min-h-dvh w-full grid-cols-1 lg:grid-cols-2">
          <BrandPanel
            asideKey={
              isRegister ? "auth.brand.registerAside" : "auth.brand.loginAside"
            }
          />

          {/* Form column */}
          <div className="flex min-h-dvh w-full flex-col">
            {/* Top bar (mobile + desktop) */}
            <header className="flex w-full items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
              <Link
                href="/"
                className="flex items-center gap-2 lg:hidden"
                aria-label={t("app.name")}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-medical shadow-lg shadow-primary-500/30">
                  <Stethoscope className="h-5 w-5 text-white" />
                </span>
                <span className="text-lg font-bold text-primary-700 dark:text-primary-300">
                  {t("app.name")}
                </span>
              </Link>
              <div className="ms-auto flex items-center gap-2">
                <LanguageToggle />
                <ThemeToggle />
              </div>
            </header>

            <main className="flex w-full flex-1 items-center justify-center px-4 pb-10 sm:px-6 lg:px-8">
              <div className="w-full max-w-md">
                <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/95 p-6 shadow-2xl shadow-primary-500/5 backdrop-blur-sm sm:p-8 dark:bg-card/80 dark:shadow-black/40">
                  {/* Card top accent */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-medical"
                  />
                  {children}
                </div>

                <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck
                    className="h-3.5 w-3.5 text-success-500"
                    aria-hidden="true"
                  />
                  <span>{t("auth.brand.secureNote")}</span>
                </p>
              </div>
            </main>
          </div>
        </div>
      </div>
    </GuestRoute>
  );
}

function BackgroundDecor() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-0"
    >
      {/* Blobs */}
      <div className="absolute -top-32 -end-32 h-[28rem] w-[28rem] rounded-full bg-primary-200/60 blur-3xl dark:bg-primary-900/30" />
      <div className="absolute -bottom-40 -start-32 h-[32rem] w-[32rem] rounded-full bg-secondary-200/60 blur-3xl dark:bg-secondary-900/30" />
      <div className="absolute top-1/3 start-1/2 hidden h-72 w-72 -translate-x-1/2 rounded-full bg-primary-100/50 blur-3xl lg:block dark:bg-primary-800/20" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgb(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}

interface BrandPanelProps {
  asideKey: string;
}

function BrandPanel({ asideKey }: BrandPanelProps) {
  const { t } = useTranslation();

  const features = [
    {
      icon: Stethoscope,
      titleKey: "auth.brand.feature1Title",
      descriptionKey: "auth.brand.feature1Description",
    },
    {
      icon: CalendarCheck,
      titleKey: "auth.brand.feature2Title",
      descriptionKey: "auth.brand.feature2Description",
    },
    {
      icon: Pill,
      titleKey: "auth.brand.feature3Title",
      descriptionKey: "auth.brand.feature3Description",
    },
  ];

  return (
    <aside className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between bg-gradient-medical text-white">
      {/* Decorative shapes */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -end-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 -start-24 h-96 w-96 rounded-full bg-secondary-400/30 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Top — brand */}
      <div className="relative z-10 flex flex-col gap-10 p-10 xl:p-14">
        <Link
          href="/"
          className="flex items-center gap-3 self-start"
          aria-label={t("app.name")}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30 backdrop-blur-sm">
            <Stethoscope className="h-6 w-6 text-white" />
          </span>
          <span className="text-2xl font-bold tracking-tight">
            {t("app.name")}
          </span>
        </Link>

        <div className="space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium ring-1 ring-white/25 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {t("app.tagline")}
          </span>
          <h2 className="text-3xl font-bold leading-tight xl:text-4xl">
            {t("auth.brand.welcome")}
          </h2>
          <p className="max-w-lg text-base leading-relaxed text-white/85 xl:text-lg">
            {t("auth.brand.tagline")}
          </p>
          <p className="max-w-lg text-sm text-white/70">{t(asideKey)}</p>
        </div>
      </div>

      {/* Middle — features */}
      <div className="relative z-10 px-10 xl:px-14">
        <ul className="space-y-4">
          {features.map(({ icon: Icon, titleKey, descriptionKey }) => (
            <li
              key={titleKey}
              className="flex items-start gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
                <Icon className="h-5 w-5 text-white" aria-hidden="true" />
              </span>
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-semibold">{t(titleKey)}</p>
                <p className="text-sm text-white/75">{t(descriptionKey)}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom — trust */}
      <div className="relative z-10 flex items-center gap-3 p-10 text-sm text-white/80 xl:p-14">
        <ShieldCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span>{t("auth.brand.trustBadge")}</span>
      </div>
    </aside>
  );
}
