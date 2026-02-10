"use client";

import Link from "next/link";
import {
  Shield,
  Database,
  Settings,
  Share2,
  Lock,
  UserCheck,
  Cookie,
  RefreshCw,
  Mail,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export function PrivacyPageContent() {
  const { t } = useTranslation();

  const sections = [
    {
      icon: Shield,
      title: t("privacy.section1Title"),
      content: t("privacy.section1Content"),
    },
    {
      icon: Database,
      title: t("privacy.section2Title"),
      items: [
        t("privacy.section2Item1"),
        t("privacy.section2Item2"),
        t("privacy.section2Item3"),
        t("privacy.section2Item4"),
        t("privacy.section2Item5"),
        t("privacy.section2Item6"),
      ],
    },
    {
      icon: Settings,
      title: t("privacy.section3Title"),
      items: [
        t("privacy.section3Item1"),
        t("privacy.section3Item2"),
        t("privacy.section3Item3"),
        t("privacy.section3Item4"),
        t("privacy.section3Item5"),
      ],
    },
    {
      icon: Share2,
      title: t("privacy.section4Title"),
      content: t("privacy.section4Content"),
    },
    {
      icon: Lock,
      title: t("privacy.section5Title"),
      content: t("privacy.section5Content"),
    },
    {
      icon: UserCheck,
      title: t("privacy.section6Title"),
      items: [
        t("privacy.section6Item1"),
        t("privacy.section6Item2"),
        t("privacy.section6Item3"),
        t("privacy.section6Item4"),
      ],
    },
    {
      icon: Cookie,
      title: t("privacy.section7Title"),
      content: t("privacy.section7Content"),
    },
    {
      icon: RefreshCw,
      title: t("privacy.section8Title"),
      content: t("privacy.section8Content"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50/50 to-background dark:from-primary-950/20 dark:to-background">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-900/30">
              <Shield className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {t("privacy.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("privacy.lastUpdated", { date: t("legal.updateDate") })}
            </p>
          </div>
        </div>
        <div className="absolute -bottom-20 -start-20 h-64 w-64 rounded-full bg-primary-100 dark:bg-primary-900/30 opacity-30 blur-3xl" />
        <div className="absolute -top-20 -end-20 h-64 w-64 rounded-full bg-secondary-100 dark:bg-secondary-900/30 opacity-30 blur-3xl" />
      </section>

      {/* Content */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            {/* Intro */}
            <div className="mb-10 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <p className="leading-relaxed text-muted-foreground">
                {t("privacy.intro")}
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-6">
              {sections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <div
                    key={index}
                    className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30">
                        <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <h2 className="text-xl font-semibold text-foreground">
                        {section.title}
                      </h2>
                    </div>
                    {"content" in section && section.content && (
                      <p className="leading-relaxed text-muted-foreground">
                        {section.content}
                      </p>
                    )}
                    {"items" in section && section.items && (
                      <ul className="space-y-3">
                        {section.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                            <span className="text-muted-foreground">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}

              {/* Contact Section */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30">
                    <Mail className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {t("privacy.section9Title")}
                  </h2>
                </div>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  {t("privacy.section9Content")}
                </p>
                <div className="rounded-xl bg-muted p-4 space-y-2">
                  <p className="text-sm text-foreground" dir="ltr">
                    {t("legal.contactEmail")}
                  </p>
                  <p className="text-sm text-foreground" dir="ltr">
                    {t("legal.contactPhone")}
                  </p>
                </div>
              </div>
            </div>

            {/* Link to Terms */}
            <div className="mt-10 text-center">
              <p className="text-muted-foreground">
                {t("auth.agreeToTerms")}{" "}
                <Link
                  href="/terms"
                  className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline underline-offset-4"
                >
                  {t("auth.termsAndConditions")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
