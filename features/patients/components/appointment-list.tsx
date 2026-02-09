"use client";

import { useState, useCallback, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Frown,
  Clock,
  CheckCircle,
  UserCheck,
  Stethoscope,
  XCircle,
  Ban,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { AppointmentCard } from "./appointment-card";
import { RatingDialog } from "./rating-dialog";
import { CancelDialog } from "./cancel-dialog";
import {
  usePatientAppointments,
  useCancelAppointment,
} from "../hooks/use-patient";
import { Appointment } from "@/types";
import { AppointmentStatus } from "@/types/enums";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

export function AppointmentList() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [ratingAppointment, setRatingAppointment] =
    useState<Appointment | null>(null);

  const statusFilterOptions = useMemo(
    () => [
      {
        value: "all",
        label: t("common.all"),
        icon: <Calendar className="h-4 w-4" />,
      },
      {
        value: AppointmentStatus.PENDING,
        label: t("status.pending"),
        icon: <Clock className="h-4 w-4 text-warning-500" />,
      },
      {
        value: AppointmentStatus.CONFIRMED,
        label: t("status.confirmed"),
        icon: <CheckCircle className="h-4 w-4 text-primary-500" />,
      },
      {
        value: AppointmentStatus.CHECKED_IN,
        label: t("status.checkedIn"),
        icon: <UserCheck className="h-4 w-4 text-success-500" />,
      },
      {
        value: AppointmentStatus.IN_PROGRESS,
        label: t("status.inProgress"),
        icon: <Stethoscope className="h-4 w-4 text-info-500" />,
      },
      {
        value: AppointmentStatus.COMPLETED,
        label: t("status.completed"),
        icon: <CheckCircle className="h-4 w-4 text-muted-foreground" />,
      },
      {
        value: AppointmentStatus.CANCELLED,
        label: t("status.cancelled"),
        icon: <XCircle className="h-4 w-4 text-error-500" />,
      },
      {
        value: AppointmentStatus.NO_SHOW,
        label: t("status.noShow"),
        icon: <Ban className="h-4 w-4 text-muted-foreground" />,
      },
    ],
    [t],
  );

  const handleStatusChange = useCallback((value: string) => {
    setSelectedStatus(value);
    setPage(1);
  }, []);

  const statusFilter =
    selectedStatus === "all"
      ? undefined
      : (selectedStatus as AppointmentStatus);

  const { data, isLoading, isError } = usePatientAppointments({
    status: statusFilter,
    page,
    limit: 10,
  });

  const cancelMutation = useCancelAppointment();

  const appointments = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  const handleCancel = useCallback((id: string) => {
    setCancelingId(id);
  }, []);

  const handleRate = useCallback((appointment: Appointment) => {
    setRatingAppointment(appointment);
  }, []);

  const confirmCancel = async () => {
    if (!cancelingId) return;

    try {
      await cancelMutation.mutateAsync({ appointmentId: cancelingId });
      toast({
        title: t("appointments.cancelSuccess"),
        description: t("common.success"),
        variant: "success",
      });
    } catch (error) {
      toast({
        title: t("toast.error"),
        description: t("errors.somethingWentWrong"),
        variant: "error",
      });
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Filter */}
      <SearchableSelect
        options={statusFilterOptions}
        value={selectedStatus}
        onValueChange={handleStatusChange}
        placeholder={t("appointments.status")}
        showSearch={false}
        className="w-full sm:w-56"
      />

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  <Skeleton className="h-24 w-full sm:w-32 sm:h-32" />
                  <div className="flex-1 p-4 sm:p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full sm:w-48" />
                    <Skeleton className="h-4 w-3/4 sm:w-40" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <Card className="border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-900/20">
          <CardContent className="py-10 text-center">
            <p className="text-error-600 dark:text-error-400">
              {t("errors.loadError")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !isError && appointments.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Calendar className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t("common.noResults")}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t("appointments.noUpcomingAppointments")}
            </p>
            <Button asChild>
              <Link href="/doctors">{t("appointments.bookNow")}</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Appointments List */}
      {!isLoading && !isError && appointments.length > 0 && (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onCancel={handleCancel}
              onRate={handleRate}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !isError && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            className="text-xs"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronRight className="h-4 w-4" />
            {t("common.previous")}
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            className="text-xs"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            {t("common.next")}
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Cancel Dialog */}
      <CancelDialog
        open={!!cancelingId}
        onOpenChange={(open) => !open && setCancelingId(null)}
        onConfirm={confirmCancel}
        isLoading={cancelMutation.isPending}
      />

      {/* Rating Dialog */}
      <RatingDialog
        appointment={ratingAppointment}
        onClose={() => setRatingAppointment(null)}
      />
    </div>
  );
}
