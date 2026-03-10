"use client";

import { Link2 } from "lucide-react";
import { ContactLinksManagement } from "@/features/admin";
import { useTranslation } from "@/lib/i18n";

export function AdminContactLinksContent() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Link2 className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {t("admin.contactLinksPage.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("admin.contactLinksPage.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Links Management */}
      <ContactLinksManagement />
    </div>
  );
}
