"use client";

import Link from "next/link";
import { Search, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <span className="text-9xl font-bold text-primary-200 dark:text-primary-800">
            404
          </span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {t("errors.pageNotFound")}
        </h1>
        <p className="text-muted-foreground mb-6">
          {t("errors.pageNotFoundDesc")}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="default">
            <Link href="/">
              <Home className="h-4 w-4 ms-2" />
              {t("errors.goHome")}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/doctors">
              <Search className="h-4 w-4 ms-2" />
              {t("errors.searchDoctor")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
