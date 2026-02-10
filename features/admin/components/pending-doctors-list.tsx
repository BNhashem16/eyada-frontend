"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Award,
  CheckCircle,
  XCircle,
  Frown,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAdminDoctors, useApproveDoctor, useRejectDoctor } from "../hooks";
import { DoctorStatus } from "@/types/enums";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { getInitials } from "@/lib/utils";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useTranslation } from "@/lib/i18n";

export function PendingDoctorsList() {
  const { t, locale } = useTranslation();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const {
    data: doctors,
    isLoading,
    isError,
    error,
  } = useAdminDoctors({ status: DoctorStatus.PENDING, page, limit });
  const approveDoctor = useApproveDoctor();
  const rejectDoctor = useRejectDoctor();

  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);

  const handleAction = () => {
    if (!selectedDoctor || !action) return;

    if (action === "approve") {
      approveDoctor.mutate(selectedDoctor, {
        onSuccess: () => {
          setSelectedDoctor(null);
          setAction(null);
        },
      });
    } else {
      rejectDoctor.mutate(selectedDoctor, {
        onSuccess: () => {
          setSelectedDoctor(null);
          setAction(null);
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-900/20">
        <CardContent className="py-10 text-center">
          <p className="text-error-600 dark:text-error-400">
            {t("admin.loadError")}
          </p>
          <p className="text-sm text-error-500 dark:text-error-400 mt-2">
            {error instanceof Error ? error.message : t("common.unknownError")}
          </p>
        </CardContent>
      </Card>
    );
  }

  const doctorsList = doctors?.data || [];
  const meta = doctors?.meta;

  if (doctorsList.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <CheckCircle className="h-16 w-16 mx-auto text-green-300 dark:text-green-400 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {t("admin.noPendingRequests")}
          </h3>
          <p className="text-muted-foreground">
            {t("admin.allRequestsReviewed")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {doctorsList.map((doctor) => (
          <Card key={doctor.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {/* Avatar */}
                <Avatar className="h-16 w-16">
                  <AvatarImage src={doctor.profileImage || undefined} />
                  <AvatarFallback className="text-lg">
                    {getInitials(doctor.user.fullName)}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {t("doctors.doctorPrefix")} {doctor.user.fullName}
                    </h3>
                    <Badge variant="outline">
                      {getLocalizedText(doctor.specialty.name, locale)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {doctor.user.email}
                    </span>
                    <span className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {doctor.user.phoneNumber}
                    </span>
                    {doctor.licenseNumber && (
                      <span className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        {t("doctors.licenseNumber")}: {doctor.licenseNumber}
                      </span>
                    )}
                    {doctor.yearsOfExperience && (
                      <span className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {doctor.yearsOfExperience} {t("doctors.yearsExp")}
                      </span>
                    )}
                  </div>

                  {doctor.bio && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {getLocalizedText(doctor.bio, locale)}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 md:flex-col">
                  <Button
                    onClick={() => {
                      setSelectedDoctor(doctor.id);
                      setAction("approve");
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 me-2" />
                    {t("admin.approve")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedDoctor(doctor.id);
                      setAction("reject");
                    }}
                    className="text-error-600 border-error-300 hover:bg-error-50 dark:hover:bg-error-900/20"
                  >
                    <XCircle className="h-4 w-4 me-2" />
                    {t("admin.reject")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <PaginationControls
        meta={meta}
        page={page}
        onPageChange={setPage}
        limit={limit}
        onLimitChange={(v) => {
          setLimit(v);
          setPage(1);
        }}
      />

      {/* Confirmation Dialog */}
      <AlertDialog
        open={!!selectedDoctor && !!action}
        onOpenChange={() => {
          setSelectedDoctor(null);
          setAction(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action === "approve"
                ? t("admin.confirmApprove")
                : t("admin.confirmReject")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action === "approve"
                ? t("admin.approveMessage")
                : t("admin.rejectMessage")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              className={
                action === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-error-600 hover:bg-error-700"
              }
              disabled={approveDoctor.isPending || rejectDoctor.isPending}
            >
              {(approveDoctor.isPending || rejectDoctor.isPending) && (
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
              )}
              {action === "approve" ? t("admin.approve") : t("admin.reject")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
