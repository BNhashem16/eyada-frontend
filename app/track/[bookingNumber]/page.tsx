"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import {
  Clock,
  Calendar,
  Building2,
  Stethoscope,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Users,
  Timer,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { PUBLIC_TRACKING_ENDPOINTS, API_BASE_URL } from "@/lib/api/endpoints";

interface QueueData {
  found: boolean;
  bookingNumber: string;
  queueNumber: number | null;
  positionInQueue: number | null;
  estimatedWaitMinutes: number | null;
  status: string;
  appointmentDate: string;
  clinicName: { ar: string; en: string };
  serviceName: { ar: string; en: string };
}

export default function TrackQueuePage() {
  const { t, locale } = useTranslation();
  const params = useParams();
  const bookingNumber = params.bookingNumber as string;

  const [data, setData] = useState<QueueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQueuePosition = async () => {
    try {
      setLoading(true);
      setError(null);

      // Decode URL-encoded booking number
      const decodedBookingNumber = decodeURIComponent(bookingNumber);
      const url = `${API_BASE_URL}${PUBLIC_TRACKING_ENDPOINTS.TRACK_QUEUE(decodedBookingNumber)}`;

      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          setData({ found: false } as QueueData);
          return;
        }
        throw new Error(`HTTP error: ${response.status}`);
      }

      const result = await response.json();

      // Handle wrapped response { success: true, data: {...} }
      if (result.success && result.data) {
        setData(result.data);
      } else if (result.found !== undefined) {
        setData(result);
      } else {
        setData({ found: true, ...result });
      }
    } catch (err) {
      setError(t("errors.networkError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueuePosition();
    // Refresh every 30 seconds
    const interval = setInterval(fetchQueuePosition, 30000);
    return () => clearInterval(interval);
  }, [bookingNumber]);

  const dateLocale = locale === "ar" ? ar : enUS;

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          label: t("status.pending"),
          color:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
          icon: Clock,
        };
      case "CONFIRMED":
        return {
          label: t("status.confirmed"),
          color:
            "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
          icon: CheckCircle2,
        };
      case "CHECKED_IN":
        return {
          label: t("status.checkedIn"),
          color:
            "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
          icon: Users,
        };
      case "COMPLETED":
        return {
          label: t("status.completed"),
          color:
            "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
          icon: CheckCircle2,
        };
      case "CANCELLED":
        return {
          label: t("status.cancelled"),
          color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
          icon: XCircle,
        };
      case "NO_SHOW":
        return {
          label: t("status.noShow"),
          color:
            "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
          icon: AlertCircle,
        };
      default:
        return {
          label: status,
          color: "bg-gray-100 text-gray-800",
          icon: Clock,
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-lg mx-auto pt-8 space-y-6">
          <Skeleton className="h-12 w-48 mx-auto" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-lg mx-auto pt-8">
          <Card className="border-destructive">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive font-medium">{error}</p>
              <Button onClick={fetchQueuePosition} className="mt-4">
                {t("common.tryAgain")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!data?.found) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-lg mx-auto pt-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">{t("track.notFound")}</h2>
              <p className="text-muted-foreground mb-4">
                {t("track.notFoundDesc")}
              </p>
              <p className="font-mono text-lg bg-muted p-2 rounded">
                {bookingNumber}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(data.status);
  const StatusIcon = statusInfo.icon;

  // Check if appointment is for today and in waiting status
  const isToday =
    data.appointmentDate === new Date().toISOString().split("T")[0];
  const isWaiting = ["PENDING", "CONFIRMED"].includes(data.status);

  // Show position if available (less than 10 people ahead)
  const hasExactPosition = data.positionInQueue !== null;
  // Show "10+" if today and waiting but no exact position (means 10+ people ahead)
  const showTenPlus = isToday && isWaiting && !hasExactPosition;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-lg mx-auto pt-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {t("track.title")}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t("track.subtitle")}
          </p>
        </div>

        {/* Booking Number */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">
                {t("appointments.bookingNumber")}
              </p>
              <p className="font-mono text-xl font-bold text-primary">
                {data.bookingNumber}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Queue Position - Show exact number if < 10 people ahead, or "10+" if more */}
        {(hasExactPosition || showTenPlus) && (
          <Card className="border-primary bg-primary-50 dark:bg-primary-900/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    {t("track.yourPosition")}
                  </span>
                </div>
                <p className="text-4xl sm:text-5xl font-bold text-primary mb-2">
                  {hasExactPosition ? data.positionInQueue : "10+"}
                </p>
                {hasExactPosition && data.estimatedWaitMinutes !== null && (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Timer className="h-4 w-4" />
                    <span>
                      {t("track.estimatedWait")}: ~{data.estimatedWaitMinutes}{" "}
                      {t("appointments.minutes")}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {t("appointments.status")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${statusInfo.color}`}>
                <StatusIcon className="h-6 w-6" />
              </div>
              <div>
                <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                {data.queueNumber && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("appointments.queueNumber")}: {data.queueNumber}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointment Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {t("track.appointmentDetails")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Date */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("appointments.date")}
                </p>
                <p className="font-medium">
                  {format(parseISO(data.appointmentDate), "EEEE, d MMMM yyyy", {
                    locale: dateLocale,
                  })}
                </p>
              </div>
            </div>

            {/* Clinic */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("appointments.clinic")}
                </p>
                <p className="font-medium">
                  {getLocalizedText(data.clinicName, locale)}
                </p>
              </div>
            </div>

            {/* Service */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Stethoscope className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("appointments.service")}
                </p>
                <p className="font-medium">
                  {getLocalizedText(data.serviceName, locale)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Refresh Button */}
        <div className="text-center">
          <Button
            variant="outline"
            onClick={fetchQueuePosition}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin me-2" />
            ) : (
              <Clock className="h-4 w-4 me-2" />
            )}
            {t("track.refresh")}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            {t("track.autoRefresh")}
          </p>
        </div>
      </div>
    </div>
  );
}
