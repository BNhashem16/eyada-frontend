"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Ban,
  UserCheck,
  Clock,
  Loader2,
  AlertTriangle,
  User,
  Calendar,
  Droplet,
  Heart,
  MessageCircle,
  Users,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  useAdminPatient,
  useApprovePatient,
  useRejectPatient,
  useSuspendPatient,
} from "../hooks";
import { getInitials, formatDate } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { PatientStatus, Gender } from "@/types/enums";

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

const getRelationshipLabel = (
  t: (key: string) => string,
  relationship?: string,
): string => {
  switch (relationship) {
    case "SPOUSE":
      return t("patient.spouse");
    case "CHILD":
      return t("patient.child");
    case "PARENT":
      return t("patient.parent");
    case "SIBLING":
      return t("patient.sibling");
    case "OTHER":
      return t("patient.other");
    case "SELF":
      return t("patient.self") || "Self";
    default:
      return relationship || "-";
  }
};

interface AdminPatientDetailsProps {
  patientId: string;
}

export function AdminPatientDetails({ patientId }: AdminPatientDetailsProps) {
  const { t, locale } = useTranslation();
  const statusConfig = useMemo(() => getStatusConfig(t), [t]);

  const {
    data: patient,
    isLoading,
    isError,
    error,
  } = useAdminPatient(patientId);
  const approvePatient = useApprovePatient();
  const rejectPatient = useRejectPatient();
  const suspendPatient = useSuspendPatient();

  const [action, setAction] = useState<"approve" | "reject" | "suspend" | null>(
    null,
  );

  const handleAction = () => {
    if (!action) return;

    const callbacks = {
      onSuccess: () => setAction(null),
    };

    switch (action) {
      case "approve":
        approvePatient.mutate(patientId, callbacks);
        break;
      case "reject":
        rejectPatient.mutate(patientId, callbacks);
        break;
      case "suspend":
        suspendPatient.mutate(patientId, callbacks);
        break;
    }
  };

  const isPending =
    approvePatient.isPending ||
    rejectPatient.isPending ||
    suspendPatient.isPending;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-40" />
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-60" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-5 w-32 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !patient) {
    return (
      <div className="space-y-6">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/patients">
            <ArrowRight className="h-4 w-4 me-2" />
            {t("admin.patientDetails.backToPatients")}
          </Link>
        </Button>
        <Card className="border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-900/20">
          <CardContent className="py-10 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-error-500 mb-4" />
            <p className="text-error-600 dark:text-error-400">
              {t("admin.loadError")}
            </p>
            <p className="text-sm text-error-500 mt-2">
              {error instanceof Error
                ? error.message
                : t("common.unknownError")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = statusConfig[patient.status || PatientStatus.PENDING];
  const StatusIcon = statusInfo.icon;

  const getGenderLabel = (gender?: Gender) => {
    if (gender === Gender.MALE) return t("admin.patientDetails.male");
    if (gender === Gender.FEMALE) return t("admin.patientDetails.female");
    return t("admin.patientDetails.notAvailable");
  };

  return (
    <div className="space-y-6">
      {/* Back Button + Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/patients">
            <ArrowRight className="h-4 w-4 me-2" />
            {t("admin.patientDetails.backToPatients")}
          </Link>
        </Button>

        <div className="flex gap-2 flex-wrap">
          {patient.status === PatientStatus.PENDING && (
            <>
              <Button
                size="sm"
                onClick={() => setAction("approve")}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 me-1" />
                {t("admin.approve")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAction("reject")}
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
              onClick={() => setAction("suspend")}
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
              onClick={() => setAction("approve")}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 me-1" />
              {t("admin.patients.reactivate")}
            </Button>
          )}
        </div>
      </div>

      {/* Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-xl">
                {getInitials(patient.user?.fullName || "")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h2 className="text-xl font-bold text-foreground">
                  {patient.user?.fullName}
                </h2>
                <Badge variant={statusInfo.variant}>
                  <StatusIcon className="h-3 w-3 me-1" />
                  {statusInfo.label}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                <a
                  href={`mailto:${patient.user?.email}`}
                  className="flex items-center gap-2 hover:text-primary-600"
                >
                  <Mail className="h-4 w-4" />
                  {patient.user?.email}
                </a>
                <a
                  href={`tel:${patient.user?.phoneNumber}`}
                  className="flex items-center gap-2 hover:text-primary-600"
                >
                  <Phone className="h-4 w-4" />
                  <span dir="ltr">{patient.user?.phoneNumber}</span>
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary-600" />
              {t("admin.patientDetails.personalInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow
              label={t("admin.patientDetails.email")}
              value={
                <a
                  href={`mailto:${patient.user?.email}`}
                  className="hover:text-primary-600 hover:underline"
                >
                  {patient.user?.email}
                </a>
              }
            />
            <Separator />
            <InfoRow
              label={t("admin.patientDetails.phone")}
              value={
                <a
                  href={`tel:${patient.user?.phoneNumber}`}
                  className="hover:text-primary-600 hover:underline"
                  dir="ltr"
                >
                  {patient.user?.phoneNumber}
                </a>
              }
            />
            {patient.whatsappNumber && (
              <>
                <Separator />
                <InfoRow
                  label={t("admin.patientDetails.whatsappNumber")}
                  value={
                    <a
                      href={`https://wa.me/${patient.whatsappNumber.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-green-600 hover:underline"
                      dir="ltr"
                    >
                      <MessageCircle className="h-3 w-3 text-green-500" />
                      {patient.whatsappNumber}
                    </a>
                  }
                />
              </>
            )}
            <Separator />
            <InfoRow
              label={t("admin.patientDetails.gender")}
              value={getGenderLabel(patient.gender)}
            />
            <Separator />
            <InfoRow
              label={t("admin.patientDetails.dateOfBirth")}
              value={
                patient.dateOfBirth
                  ? formatDate(patient.dateOfBirth, "PPP", locale)
                  : t("admin.patientDetails.notAvailable")
              }
            />
            {patient.age !== undefined && (
              <>
                <Separator />
                <InfoRow
                  label={t("admin.patientDetails.age")}
                  value={`${patient.age} ${t("admin.patientDetails.yearsOld")}`}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Medical Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="h-5 w-5 text-primary-600" />
              {t("admin.patientDetails.medicalInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow
              label={t("admin.patientDetails.bloodType")}
              value={
                patient.bloodType ? (
                  <Badge variant="outline">
                    <Droplet className="h-3 w-3 me-1 text-red-500" />
                    {patient.bloodType}
                  </Badge>
                ) : (
                  t("admin.patientDetails.notAvailable")
                )
              }
            />
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                {t("admin.patientDetails.chronicDiseases")}
              </p>
              {patient.chronicDiseases && patient.chronicDiseases.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {patient.chronicDiseases.map((disease, idx) => (
                    <Badge key={idx} variant="secondary">
                      <ShieldAlert className="h-3 w-3 me-1" />
                      {disease}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("admin.patientDetails.noChronicDiseases")}
                </p>
              )}
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                {t("admin.patientDetails.allergies")}
              </p>
              {patient.allergies && patient.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {patient.allergies.map((allergy, idx) => (
                    <Badge key={idx} variant="secondary">
                      <AlertTriangle className="h-3 w-3 me-1" />
                      {allergy}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("admin.patientDetails.noAllergies")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Approval Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5 text-primary-600" />
              {t("admin.patientDetails.approvalInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow
              label={t("admin.patientDetails.registeredAt")}
              value={
                patient.createdAt
                  ? formatDate(patient.createdAt, "PPP", locale)
                  : t("admin.patientDetails.notAvailable")
              }
            />
            {patient.approvedAt && (
              <>
                <Separator />
                <InfoRow
                  label={t("admin.patientDetails.approvedAt")}
                  value={formatDate(patient.approvedAt, "PPP", locale)}
                />
              </>
            )}
            {patient.approvedBy && (
              <>
                <Separator />
                <InfoRow
                  label={t("admin.patientDetails.approvedBy")}
                  value={patient.approvedBy}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Family Members - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary-600" />
            {t("admin.patientDetails.familyMembers")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!patient.familyMembers || patient.familyMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">
                {t("admin.patientDetails.noFamilyMembers")}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-start p-3 font-medium text-muted-foreground">
                      {t("admin.patientDetails.memberName")}
                    </th>
                    <th className="text-start p-3 font-medium text-muted-foreground">
                      {t("admin.patientDetails.memberRelationship")}
                    </th>
                    <th className="text-start p-3 font-medium text-muted-foreground">
                      {t("admin.patientDetails.memberAge")}
                    </th>
                    <th className="text-start p-3 font-medium text-muted-foreground">
                      {t("admin.patientDetails.memberGender")}
                    </th>
                    <th className="text-start p-3 font-medium text-muted-foreground">
                      {t("admin.patientDetails.memberBloodType")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {patient.familyMembers.map((member) => (
                    <tr key={member.id} className="border-b last:border-0">
                      <td className="p-3 text-foreground">{member.fullName}</td>
                      <td className="p-3">
                        <Badge variant="outline">
                          {getRelationshipLabel(
                            t,
                            member.relationshipToHead || member.relationship,
                          )}
                        </Badge>
                      </td>
                      <td className="p-3 text-foreground">
                        {member.age !== undefined
                          ? `${member.age} ${t("admin.patientDetails.yearsOld")}`
                          : "-"}
                      </td>
                      <td className="p-3 text-foreground">
                        {member.gender === Gender.MALE
                          ? t("admin.patientDetails.male")
                          : member.gender === Gender.FEMALE
                            ? t("admin.patientDetails.female")
                            : "-"}
                      </td>
                      <td className="p-3 text-foreground">
                        {member.bloodType || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!action} onOpenChange={() => setAction(null)}>
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
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}
