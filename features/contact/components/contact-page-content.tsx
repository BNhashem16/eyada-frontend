"use client";

import {
  Phone,
  Mail,
  Globe,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  MessageCircle,
  ExternalLink,
  Frown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useContactLinks } from "../hooks";
import { useTranslation } from "@/lib/i18n";
import { ContactLinkPlatform } from "@/types";
import type { ContactLink } from "@/types";

const DIRECT_PLATFORMS: ContactLinkPlatform[] = [
  ContactLinkPlatform.PHONE,
  ContactLinkPlatform.EMAIL,
  ContactLinkPlatform.WHATSAPP,
];

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  PHONE: Phone,
  EMAIL: Mail,
  WHATSAPP: MessageCircle,
  WEBSITE: Globe,
  FACEBOOK: Facebook,
  INSTAGRAM: Instagram,
  YOUTUBE: Youtube,
  LINKEDIN: Linkedin,
};

function getPlatformHref(link: ContactLink): string {
  switch (link.platform) {
    case "PHONE":
      return `tel:${link.value}`;
    case "EMAIL":
      return `mailto:${link.value}`;
    case "WHATSAPP":
      return `https://wa.me/${link.value.replace(/[^0-9]/g, "")}`;
    default:
      return link.value;
  }
}

function ContactLinkCard({ link }: { link: ContactLink }) {
  const { locale } = useTranslation();
  const Icon = PLATFORM_ICONS[link.platform] || ExternalLink;
  const label = locale === "ar" ? link.label.ar : link.label.en;

  return (
    <a
      href={getPlatformHref(link)}
      target={
        link.platform === "PHONE" || link.platform === "EMAIL"
          ? undefined
          : "_blank"
      }
      rel="noopener noreferrer"
      className="group block"
    >
      <Card className="transition-all duration-200 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0 group-hover:bg-primary-200 dark:group-hover:bg-primary-900/50 transition-colors">
            <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground">{label}</p>
            <p className="text-sm text-muted-foreground truncate" dir="ltr">
              {link.value}
            </p>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary-500 transition-colors shrink-0" />
        </CardContent>
      </Card>
    </a>
  );
}

export function ContactPageContent() {
  const { t } = useTranslation();
  const { data: links, isLoading, isError } = useContactLinks();

  const directLinks =
    links?.filter((l) => DIRECT_PLATFORMS.includes(l.platform)) || [];
  const socialLinks =
    links?.filter((l) => !DIRECT_PLATFORMS.includes(l.platform)) || [];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-12 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-900/20">
          <CardContent className="py-10 text-center">
            <p className="text-error-600 dark:text-error-400">
              {t("errors.loadError")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasLinks = (links?.length || 0) > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Phone className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {t("contact.title")}
          </h1>
        </div>
        <p className="text-muted-foreground">{t("contact.subtitle")}</p>
      </div>

      {!hasLinks ? (
        <div className="text-center py-16">
          <Frown className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">{t("contact.noLinks")}</p>
        </div>
      ) : (
        <div className="space-y-8 max-w-4xl mx-auto">
          {/* Direct Contact */}
          {directLinks.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                {t("contact.directContact")}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {directLinks.map((link) => (
                  <ContactLinkCard key={link.id} link={link} />
                ))}
              </div>
            </section>
          )}

          {/* Social Media */}
          {socialLinks.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                {t("contact.socialMedia")}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {socialLinks.map((link) => (
                  <ContactLinkCard key={link.id} link={link} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
