"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

export function HomeTrackInput() {
  const { t } = useTranslation();
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState("");

  const handleTrack = () => {
    const trimmed = trackingNumber.trim();
    if (trimmed) router.push(`/track/${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 rounded-2xl bg-card p-4 shadow-lg">
      <div className="flex flex-1 items-center gap-2 rounded-xl border border-border px-4 py-3">
        <Navigation className="h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          placeholder={t("home.trackAppointmentPlaceholder")}
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleTrack();
          }}
          className="w-full border-none bg-transparent text-sm outline-none placeholder:text-muted-foreground text-foreground"
          dir="ltr"
        />
      </div>
      <Button
        size="lg"
        variant="secondary"
        className="sm:px-8"
        onClick={handleTrack}
        disabled={!trackingNumber.trim()}
      >
        <Navigation className="h-4 w-4 ms-2" />
        {t("home.trackButton")}
      </Button>
    </div>
  );
}
