"use client";

import Link from "next/link";
import {
  FileText,
  AlertTriangle,
  UserCog,
  CalendarCheck,
  Stethoscope,
  Heart,
  Scale,
  RefreshCw,
  Gavel,
  Mail,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export function TermsPageContent() {
  const { t } = useTranslation();

  const sections = [
    {
      icon: FileText,
      title: t("terms.section1Title"),
      content: t("terms.section1Content"),
    },
    {
      icon: AlertTriangle,
      title: t("terms.section2Title"),
      items: [
        t("terms.section2Item1"),
        t("terms.section2Item2"),
        t("terms.section2Item3"),
        t("terms.section2Item4"),
        t("terms.section2Item5"),
      ],
      highlight: true,
    },
    {
      icon: UserCog,
      title: t("terms.section3Title"),
      items: [
        t("terms.section3Item1"),
        t("terms.section3Item2"),
        t("terms.section3Item3"),
        t("terms.section3Item4"),
      ],
    },
    {
      icon: CalendarCheck,
      title: t("terms.section4Title"),
      items: [
        t("terms.section4Item1"),
        t("terms.section4Item2"),
        t("terms.section4Item3"),
        t("terms.section4Item4"),
      ],
    },
    {
      icon: Stethoscope,
      title: t("terms.section5Title"),
      items: [
        t("terms.section5Item1"),
        t("terms.section5Item2"),
        t("terms.section5Item3"),
        t("terms.section5Item4"),
      ],
    },
    {
      icon: Heart,
      title: t("terms.section6Title"),
      items: [
        t("terms.section6Item1"),
        t("terms.section6Item2"),
        t("terms.section6Item3"),
        t("terms.section6Item4"),
      ],
    },
    {
      icon: Scale,
      title: t("terms.section7Title"),
      content: t("terms.section7Content"),
    },
    {
      icon: RefreshCw,
      title: t("terms.section8Title"),
      content: t("terms.section8Content"),
    },
    {
      icon: Gavel,
      title: t("terms.section9Title"),
      content: t("terms.section9Content"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary-50/50 to-background dark:from-secondary-950/20 dark:to-background">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary-100 dark:bg-secondary-900/30">
              <FileText className="h-8 w-8 text-secondary-600 dark:text-secondary-400" />
            </div>
            <h1 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {t("terms.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("terms.lastUpdated", { date: t("legal.updateDate") })}
            </p>
          </div>
        </div>
        <div className="absolute -bottom-20 -start-20 h-64 w-64 rounded-full bg-secondary-100 dark:bg-secondary-900/30 opacity-30 blur-3xl" />
        <div className="absolute -top-20 -end-20 h-64 w-64 rounded-full bg-primary-100 dark:bg-primary-900/30 opacity-30 blur-3xl" />
      </section>

      {/* Content */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            {/* Intro */}
            <div className="mb-10 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <p className="leading-relaxed text-muted-foreground">
                {t("terms.intro")}
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-6">
              {sections.map((section, index) => {
                const Icon = section.icon;
                const isHighlight = "highlight" in section && section.highlight;
                return (
                  <div
                    key={index}
                    className={`rounded-2xl border p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8 ${
                      isHighlight
                        ? "border-amber-200 bg-amber-50/50 dark:border-amber-800/50 dark:bg-amber-950/20"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          isHighlight
                            ? "bg-amber-100 dark:bg-amber-900/30"
                            : "bg-secondary-100 dark:bg-secondary-900/30"
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${
                            isHighlight
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-secondary-600 dark:text-secondary-400"
                          }`}
                        />
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
                            <span
                              className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${
                                isHighlight
                                  ? "bg-amber-500"
                                  : "bg-secondary-500"
                              }`}
                            />
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
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary-100 dark:bg-secondary-900/30">
                    <Mail className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {t("terms.section10Title")}
                  </h2>
                </div>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  {t("terms.section10Content")}
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

            {/* Link to Privacy */}
            <div className="mt-10 text-center">
              <p className="text-muted-foreground">
                {t("auth.agreeToTerms")}{" "}
                <Link
                  href="/privacy"
                  className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline underline-offset-4"
                >
                  {t("auth.privacyPolicy")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
