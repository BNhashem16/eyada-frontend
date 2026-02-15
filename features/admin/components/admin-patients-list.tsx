"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Ban,
  UserCheck,
  Clock,
  AlertTriangle,
  Calendar,
  Droplet,
  Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  useAdminPatients,
  useApprovePatient,
  useRejectPatient,
  useSuspendPatient,
  AdminPatientsFilters,
} from "../hooks";
import { getInitials, formatDate } from "@/lib/utils";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useTranslation } from "@/lib/i18n";
import { PatientStatus } from "@/types/enums";

const getStatusConfig = (
  t: (key: string) => string,
): Record<
  PatientStatus,
  {
    label: string;
    variant: "warning" | "success" | "error" | "secondary";
    icon: typeof Clock;
  }
> => ({
  [PatientStatus.PENDING]: {
    label: t("admin.patients.underReview"),
    variant: "warning",
    icon: Clock,
  },
  [PatientStatus.APPROVED]: {
    label: t("admin.patients.approved"),
    variant: "success",
    icon: UserCheck,
  },
  [PatientStatus.REJECTED]: {
    label: t("admin.patients.rejected"),
    variant: "error",
    icon: XCircle,
  },
  [PatientStatus.SUSPENDED]: {
    label: t("admin.patients.suspended"),
    variant: "error",
    icon: Ban,
  },
});

export function AdminPatientsList() {
  const { t } = useTranslation();
  const statusConfig = useMemo(() => getStatusConfig(t), [t]);

  // Filters state
  const [filters, setFilters] = useState<AdminPatientsFilters>({
    page: 1,
    limit: 30,
  });
  const [searchInput, setSearchInput] = useState("");

  // Queries
  const { data, isLoading, isError, error } = useAdminPatients(filters);

  // Mutations
  const approvePatient = useApprovePatient();
  const rejectPatient = useRejectPatient();
  const suspendPatient = useSuspendPatient();

  // Dialog state
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | "suspend" | null>(
    null,
  );

  const handleSearch = useCallback(() => {
    setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
  }, [searchInput]);

  const handleFilterChange = useCallback(
    (key: keyof AdminPatientsFilters, value: any) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value === "all" ? undefined : value,
        page: 1,
      }));
    },
    [],
  );

  const handleAction = () => {
    if (!selectedPatient || !action) return;

    const callbacks = {
      onSuccess: () => {
        setSelectedPatient(null);
        setAction(null);
      },
    };

    switch (action) {
      case "approve":
        approvePatient.mutate(selectedPatient, callbacks);
        break;
      case "reject":
        rejectPatient.mutate(selectedPatient, callbacks);
        break;
      case "suspend":
        suspendPatient.mutate(selectedPatient, callbacks);
        break;
    }
  };

  const isPending =
    approvePatient.isPending ||
    rejectPatient.isPending ||
    suspendPatient.isPending;

  const statusFilterOptions = useMemo(
    () => [
      {
        value: "",
        label: t("admin.patients.allStatuses"),
        icon: <Clock className="h-4 w-4" />,
      },
      {
        value: PatientStatus.PENDING,
        label: t("admin.patients.underReview"),
        icon: <Clock className="h-4 w-4 text-warning-500" />,
      },
      {
        value: PatientStatus.APPROVED,
        label: t("admin.patients.approved"),
        icon: <UserCheck className="h-4 w-4 text-success-500" />,
      },
      {
        value: PatientStatus.REJECTED,
        label: t("admin.patients.rejected"),
        icon: <XCircle className="h-4 w-4 text-error-500" />,
      },
      {
        value: PatientStatus.SUSPENDED,
        label: t("admin.patients.suspended"),
        icon: <Ban className="h-4 w-4 text-error-500" />,
      },
    ],
    [t],
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-40" />
            </div>
          </CardContent>
        </Card>
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-9 w-24" />
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
          <AlertTriangle className="h-12 w-12 mx-auto text-error-500 mb-4" />
          <p className="text-error-600 dark:text-error-400">
            {t("admin.loadError")}
          </p>
          <p className="text-sm text-error-500 mt-2">
            {error instanceof Error ? error.message : t("common.unknownError")}
          </p>
        </CardContent>
      </Card>
    );
  }

  const patients = data?.data || [];
  const meta = data?.meta;

  return (
    <>
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 flex gap-2">
              <Input
                placeholder={t("admin.patients.searchPlaceholder")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                inputMode="search"
                className="flex-1"
              />
              <Button onClick={handleSearch} variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Status Filter */}
            <SearchableSelect
              options={statusFilterOptions}
              value={filters.status || ""}
              onValueChange={(value) =>
                handleFilterChange("status", value || undefined)
              }
              placeholder={t("appointments.status")}
              showSearch={false}
              className="w-full sm:w-40"
            />

            {/* Active Status Filter */}
            <Select
              value={
                filters.isActive === undefined
                  ? "all"
                  : filters.isActive.toString()
              }
              onValueChange={(value) =>
                handleFilterChange(
                  "isActive",
                  value === "all" ? undefined : value === "true",
                )
              }
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={t("admin.patients.activeStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                <SelectItem value="true">{t("common.active")}</SelectItem>
                <SelectItem value="false">{t("common.inactive")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      {meta && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {t("admin.patients.totalResults")}{" "}
            <span className="font-semibold">{meta.total}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            {t("admin.patients.pageOf")
              .replace("{current}", String(meta.page))
              .replace("{total}", String(meta.totalPages))}
          </p>
        </div>
      )}

      {/* Patients List */}
      {patients.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <User className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t("admin.patients.noPatientsFound")}
            </h3>
            <p className="text-muted-foreground">
              {t("admin.patients.noPatientsMatchFilters")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {patients.map((patient) => {
            const statusInfo =
              statusConfig[patient.status || PatientStatus.PENDING];
            const StatusIcon = statusInfo.icon;

            return (
              <Card
                key={patient.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Avatar */}
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="text-lg">
                        {getInitials(patient.user?.fullName || "")}
                      </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-foreground">
                          {patient.user?.fullName}
                        </h3>
                        <Badge variant={statusInfo.variant}>
                          <StatusIcon className="h-3 w-3 me-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {patient.user?.email}
                        </span>
                        <span className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {patient.user?.phoneNumber}
                        </span>
                        {patient.dateOfBirth && (
                          <span className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {formatDate(patient.dateOfBirth)}
                          </span>
                        )}
                        {patient.bloodType && (
                          <span className="flex items-center gap-2">
                            <Droplet className="h-4 w-4" />
                            {patient.bloodType}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/patients/${patient.id}`}>
                          <Eye className="h-4 w-4 me-1" />
                          {t("common.viewDetails")}
                        </Link>
                      </Button>
                      {patient.status === PatientStatus.PENDING && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedPatient(patient.id);
                              setAction("approve");
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 me-1" />
                            {t("admin.approve")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedPatient(patient.id);
                              setAction("reject");
                            }}
                            className="text-error-600 border-error-300 hover:bg-error-50"
                          >
                            <XCircle className="h-4 w-4 me-1" />
                            {t("admin.reject")}
                          </Button>
                        </>
                      )}
                      {patient.status === PatientStatus.APPROVED && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedPatient(patient.id);
                            setAction("suspend");
                          }}
                          className="text-warning-600 border-warning-300 hover:bg-warning-50"
                        >
                          <Ban className="h-4 w-4 me-1" />
                          {t("admin.suspend")}
                        </Button>
                      )}
                      {(patient.status === PatientStatus.REJECTED ||
                        patient.status === PatientStatus.SUSPENDED) && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedPatient(patient.id);
                            setAction("approve");
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 me-1" />
                          {t("admin.patients.reactivate")}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <PaginationControls
        meta={meta}
        page={filters.page || 1}
        onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
        limit={filters.limit || 30}
        onLimitChange={(l) =>
          setFilters((prev) => ({ ...prev, limit: l, page: 1 }))
        }
      />

      {/* Confirmation Dialog */}
      <AlertDialog
        open={!!selectedPatient && !!action}
        onOpenChange={() => {
          setSelectedPatient(null);
          setAction(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action === "approve" && t("admin.patients.confirmApprove")}
              {action === "reject" && t("admin.patients.confirmReject")}
              {action === "suspend" && t("admin.patients.confirmSuspend")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action === "approve" && t("admin.patients.approveMessage")}
              {action === "reject" && t("admin.patients.rejectMessage")}
              {action === "suspend" && t("admin.patients.suspendMessage")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              className={
                action === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : action === "suspend"
                    ? "bg-warning-600 hover:bg-warning-700"
                    : "bg-error-600 hover:bg-error-700"
              }
              disabled={isPending}
            >
              {isPending && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
              {action === "approve" && t("admin.approve")}
              {action === "reject" && t("admin.reject")}
              {action === "suspend" && t("admin.suspend")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
