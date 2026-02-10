"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, QrCode, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/lib/i18n";

export function TrackPageContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const [bookingNumber, setBookingNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bookingNumber.trim()) {
      router.push(`/track/${bookingNumber.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-lg mx-auto pt-12 space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {t("track.pageTitle")}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t("track.pageSubtitle")}
          </p>
        </div>

        {/* Search Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              {t("track.enterBookingNumber")}
            </CardTitle>
            <CardDescription>
              {t("track.enterBookingNumberDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bookingNumber">
                  {t("appointments.bookingNumber")}
                </Label>
                <Input
                  id="bookingNumber"
                  value={bookingNumber}
                  onChange={(e) => setBookingNumber(e.target.value)}
                  placeholder={t("placeholder.bookingNumber")}
                  className="font-mono text-center text-base sm:text-lg"
                  dir="ltr"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={!bookingNumber.trim()}
              >
                <Search className="h-4 w-4 me-2" />
                {t("track.checkQueue")}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>{t("track.bookingNumberHint")}</p>
        </div>
      </div>
    </div>
  );
}
