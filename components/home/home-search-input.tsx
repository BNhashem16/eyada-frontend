"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

export function HomeSearchInput() {
  const { t } = useTranslation();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    const trimmed = searchQuery.trim();
    router.push(
      trimmed ? `/doctors?search=${encodeURIComponent(trimmed)}` : "/doctors",
    );
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 shadow-xl md:flex-row">
      <div className="flex flex-1 items-center gap-2 rounded-xl border border-border px-4 py-3">
        <Search className="h-5 w-5 text-muted-foreground" />
        <input
          type="search"
          aria-label={t("home.searchPlaceholder")}
          placeholder={t("home.searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          className="w-full border-none bg-transparent text-sm outline-none placeholder:text-muted-foreground text-foreground rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        />
      </div>
      <Button size="lg" className="md:px-8" onClick={handleSearch}>
        {t("home.searchButton")}
      </Button>
    </div>
  );
}
