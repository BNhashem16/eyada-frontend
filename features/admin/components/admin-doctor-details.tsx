"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Mail,
  Phone,
  Award,
  Star,
  Calendar,
  CheckCircle,
  XCircle,
  Ban,
  UserCheck,
  Clock,
  Loader2,
  AlertTriangle,
  Stethoscope,
  Building2,
  GraduationCap,
  User,
  MessageCircle,
  Eye,
  EyeOff,
  CreditCard,
  Plus,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  useAdminDoctor,
  useApproveDoctor,
  useRejectDoctor,
  useSuspendDoctor,
  useUpdateDoctorPrepayment,
  useAdminDoctorPaymentAccounts,
  useAddDoctorPaymentAccount,
  useRemoveDoctorPaymentAccount,
} from "../hooks";
import { usePaymentMethods } from "@/hooks/use-payment-methods";
import { getLocalizedText, getInitials, formatDate } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { DoctorStatus } from "@/types/enums";
import type { PaymentMethodModel } from "@/types";

const getStatusConfig = (
  t: (key: string) => string,
): Record<
  DoctorStatus,
  {
    label: string;
    variant: "warning" | "success" | "error" | "secondary";
    icon: typeof Clock;
  }
> => ({
  [DoctorStatus.PENDING]: {
    label: t("admin.doctors.underReview"),
    variant: "warning",
    icon: Clock,
  },
  [DoctorStatus.APPROVED]: {
    label: t("admin.doctors.approved"),
    variant: "success",
    icon: UserCheck,
  },
  [DoctorStatus.REJECTED]: {
    label: t("admin.doctors.rejected"),
    variant: "error",
    icon: XCircle,
  },
  [DoctorStatus.SUSPENDED]: {
    label: t("admin.doctors.suspended"),
    variant: "error",
    icon: Ban,
  },
});

interface AdminDoctorDetailsProps {
  doctorId: string;
}

export function AdminDoctorDetails({ doctorId }: AdminDoctorDetailsProps) {
  const { t, locale } = useTranslation();
  const statusConfig = useMemo(() => getStatusConfig(t), [t]);

  const { data: doctor, isLoading, isError, error } = useAdminDoctor(doctorId);
  const approveDoctor = useApproveDoctor();
  const rejectDoctor = useRejectDoctor();
  const suspendDoctor = useSuspendDoctor();

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
        approveDoctor.mutate(doctorId, callbacks);
        break;
      case "reject":
        rejectDoctor.mutate(doctorId, callbacks);
        break;
      case "suspend":
        suspendDoctor.mutate(doctorId, callbacks);
        break;
    }
  };

  const isPending =
    approveDoctor.isPending ||
    rejectDoctor.isPending ||
    suspendDoctor.isPending;

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
          {[...Array(4)].map((_, i) => (
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

  if (isError || !doctor) {
    return (
      <div className="space-y-6">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/doctors">
            <ArrowRight className="h-4 w-4 me-2" />
            {t("admin.doctorDetails.backToDoctors")}
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

  const statusInfo = statusConfig[doctor.status];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6">
      {/* Back Button + Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/doctors">
            <ArrowRight className="h-4 w-4 me-2" />
            {t("admin.doctorDetails.backToDoctors")}
          </Link>
        </Button>

        <div className="flex gap-2 flex-wrap">
          {doctor.status === DoctorStatus.PENDING && (
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
          {doctor.status === DoctorStatus.APPROVED && (
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
          {(doctor.status === DoctorStatus.REJECTED ||
            doctor.status === DoctorStatus.SUSPENDED) && (
            <Button
              size="sm"
              onClick={() => setAction("approve")}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 me-1" />
              {t("admin.doctors.reactivate")}
            </Button>
          )}
        </div>
      </div>

      {/* Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={doctor.profileImage || undefined} />
              <AvatarFallback className="text-xl">
                {getInitials(doctor.user?.fullName || "")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h2 className="text-xl font-bold text-foreground">
                  {t("doctors.doctorPrefix")} {doctor.user?.fullName}
                </h2>
                <Badge variant={statusInfo.variant}>
                  <StatusIcon className="h-3 w-3 me-1" />
                  {statusInfo.label}
                </Badge>
                {doctor.specialty && (
                  <Badge variant="outline">
                    <Stethoscope className="h-3 w-3 me-1" />
                    {getLocalizedText(doctor.specialty.name, locale)}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                <a
                  href={`mailto:${doctor.user?.email}`}
                  className="flex items-center gap-2 hover:text-primary-600"
                >
                  <Mail className="h-4 w-4" />
                  {doctor.user?.email}
                </a>
                <a
                  href={`tel:${doctor.user?.phoneNumber}`}
                  className="flex items-center gap-2 hover:text-primary-600"
                >
                  <Phone className="h-4 w-4" />
                  <span dir="ltr">{doctor.user?.phoneNumber}</span>
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
              {t("admin.doctorDetails.personalInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow
              label={t("admin.doctorDetails.email")}
              value={
                <a
                  href={`mailto:${doctor.user?.email}`}
                  className="hover:text-primary-600 hover:underline"
                >
                  {doctor.user?.email}
                </a>
              }
            />
            <Separator />
            <InfoRow
              label={t("admin.doctorDetails.phone")}
              value={
                <a
                  href={`tel:${doctor.user?.phoneNumber}`}
                  className="hover:text-primary-600 hover:underline"
                  dir="ltr"
                >
                  {doctor.user?.phoneNumber}
                </a>
              }
            />
            <Separator />
            <InfoRow
              label={t("admin.doctorDetails.showPhoneNumber")}
              value={
                <span className="flex items-center gap-1">
                  {doctor.showPhoneNumber ? (
                    <>
                      <Eye className="h-4 w-4 text-green-500" />{" "}
                      {t("admin.doctorDetails.yes")}
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4 text-muted-foreground" />{" "}
                      {t("admin.doctorDetails.no")}
                    </>
                  )}
                </span>
              }
            />
            <Separator />
            <InfoRow
              label={t("admin.doctorDetails.showWhatsappNumber")}
              value={
                <span className="flex items-center gap-1">
                  {doctor.showWhatsappNumber ? (
                    <>
                      <Eye className="h-4 w-4 text-green-500" />{" "}
                      {t("admin.doctorDetails.yes")}
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4 text-muted-foreground" />{" "}
                      {t("admin.doctorDetails.no")}
                    </>
                  )}
                </span>
              }
            />
            {doctor.whatsappNumbers && doctor.whatsappNumbers.length > 0 && (
              <>
                <Separator />
                <InfoRow
                  label={t("admin.doctorDetails.whatsappNumbers")}
                  value={
                    <div className="flex flex-col gap-1">
                      {doctor.whatsappNumbers.map((num, idx) => (
                        <a
                          key={idx}
                          href={`https://wa.me/${num.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-green-600 hover:underline"
                          dir="ltr"
                        >
                          <MessageCircle className="h-3 w-3 text-green-500" />
                          {num}
                        </a>
                      ))}
                    </div>
                  }
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="h-5 w-5 text-primary-600" />
              {t("admin.doctorDetails.professionalInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow
              label={t("admin.doctorDetails.specialty")}
              value={
                doctor.specialty
                  ? getLocalizedText(doctor.specialty.name, locale)
                  : t("admin.doctorDetails.notAvailable")
              }
            />
            <Separator />
            <InfoRow
              label={t("admin.doctorDetails.licenseNumber")}
              value={
                doctor.licenseNumber || t("admin.doctorDetails.notAvailable")
              }
            />
            <Separator />
            <InfoRow
              label={t("admin.doctorDetails.yearsOfExperience")}
              value={
                doctor.yearsOfExperience !== undefined
                  ? String(doctor.yearsOfExperience)
                  : t("admin.doctorDetails.notAvailable")
              }
            />
            {doctor.qualifications && (
              <>
                <Separator />
                <InfoRow
                  label={t("admin.doctorDetails.qualifications")}
                  value={
                    getLocalizedText(doctor.qualifications, locale) ||
                    t("admin.doctorDetails.notAvailable")
                  }
                />
              </>
            )}
            {doctor.bio && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {t("admin.doctorDetails.bio")}
                  </p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {getLocalizedText(doctor.bio, locale)}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="h-5 w-5 text-primary-600" />
              {t("admin.doctorDetails.statistics")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-2xl font-bold text-foreground">
                    {doctor.averageRating?.toFixed(1) || "0.0"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("admin.doctorDetails.averageRating")}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-2xl font-bold text-foreground">
                  {doctor.totalRatings || 0}
                </span>
                <p className="text-xs text-muted-foreground">
                  {t("admin.doctorDetails.totalRatings")}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-2xl font-bold text-foreground">
                  {doctor.totalAppointments || 0}
                </span>
                <p className="text-xs text-muted-foreground">
                  {t("admin.doctorDetails.totalAppointments")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Approval Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5 text-primary-600" />
              {t("admin.doctorDetails.approvalInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow
              label={t("admin.doctorDetails.registeredAt")}
              value={
                doctor.createdAt
                  ? formatDate(doctor.createdAt, "PPP", locale)
                  : t("admin.doctorDetails.notAvailable")
              }
            />
            {doctor.approvedAt && (
              <>
                <Separator />
                <InfoRow
                  label={t("admin.doctorDetails.approvedAt")}
                  value={formatDate(doctor.approvedAt, "PPP", locale)}
                />
              </>
            )}
            {doctor.approvedBy && (
              <>
                <Separator />
                <InfoRow
                  label={t("admin.doctorDetails.approvedBy")}
                  value={doctor.approvedBy}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Clinics - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-primary-600" />
            {t("admin.doctorDetails.clinicsInfo")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!doctor.clinics || doctor.clinics.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">
                {t("admin.doctorDetails.noClinics")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {doctor.clinics.map((clinic) => (
                <div
                  key={clinic.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">
                        {getLocalizedText(clinic.name, locale)}
                      </p>
                      {clinic.city && (
                        <p className="text-sm text-muted-foreground">
                          {getLocalizedText(clinic.city.name, locale)}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant={clinic.isActive ? "success" : "secondary"}>
                    {clinic.isActive
                      ? t("common.active")
                      : t("common.inactive")}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prepayment Settings */}
      <PrepaymentSettingsCard doctorId={doctorId} doctor={doctor} />

      {/* Confirmation Dialog */}
      <AlertDialog open={!!action} onOpenChange={() => setAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action === "approve" && t("admin.confirmApprove")}
              {action === "reject" && t("admin.confirmReject")}
              {action === "suspend" && t("admin.doctors.confirmSuspend")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action === "approve" && t("admin.doctors.approveMessage")}
              {action === "reject" && t("admin.doctors.rejectConfirmMessage")}
              {action === "suspend" && t("admin.doctors.suspendMessage")}
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

function PrepaymentSettingsCard({
  doctorId,
  doctor,
}: {
  doctorId: string;
  doctor: import("@/types").DoctorProfile;
}) {
  const { t, locale } = useTranslation();
  const updatePrepayment = useUpdateDoctorPrepayment();
  const { data: accounts, isLoading: accountsLoading } =
    useAdminDoctorPaymentAccounts(doctorId);
  const addAccount = useAddDoctorPaymentAccount();
  const removeAccount = useRemoveDoctorPaymentAccount();
  const { data: paymentMethods } = usePaymentMethods();

  const [whatsapp, setWhatsapp] = useState(doctor.prepaymentWhatsapp || "");
  const [newAccountMethodId, setNewAccountMethodId] = useState("");
  const [newAccountNumber, setNewAccountNumber] = useState("");
  const [newAccountName, setNewAccountName] = useState("");

  const handleTogglePrepayment = () => {
    updatePrepayment.mutate({
      doctorId,
      requirePrepayment: !doctor.requirePrepayment,
      prepaymentWhatsapp: whatsapp || undefined,
    });
  };

  const handleSaveWhatsapp = () => {
    updatePrepayment.mutate({
      doctorId,
      requirePrepayment: doctor.requirePrepayment,
      prepaymentWhatsapp: whatsapp || undefined,
    });
  };

  const handleAddAccount = () => {
    if (!newAccountMethodId || !newAccountNumber) return;
    addAccount.mutate(
      {
        doctorId,
        paymentMethodId: newAccountMethodId,
        accountNumber: newAccountNumber,
        accountName: newAccountName || undefined,
      },
      {
        onSuccess: () => {
          setNewAccountMethodId("");
          setNewAccountNumber("");
          setNewAccountName("");
        },
      },
    );
  };

  const handleRemoveAccount = (accountId: string) => {
    removeAccount.mutate({ doctorId, accountId });
  };

  // Filter out methods that already have accounts
  const usedMethodIds = new Set(accounts?.map((a) => a.paymentMethodId) || []);
  const availableMethods =
    paymentMethods?.filter((m) => !usedMethodIds.has(m.id) && m.isActive) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CreditCard className="h-5 w-5 text-primary-600" />
          {t("prepayment.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Toggle + WhatsApp */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">
                {t("prepayment.enable")}
              </p>
              <p className="text-sm text-muted-foreground">
                {doctor.requirePrepayment
                  ? t("prepayment.enabled")
                  : t("prepayment.disabled")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {updatePrepayment.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Switch
                  checked={doctor.requirePrepayment}
                  onCheckedChange={handleTogglePrepayment}
                />
              )}
              <Badge
                variant={doctor.requirePrepayment ? "success" : "secondary"}
              >
                {doctor.requirePrepayment
                  ? t("prepayment.required")
                  : t("prepayment.notRequired")}
              </Badge>
            </div>
          </div>

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label>{t("prepayment.whatsappNumber")}</Label>
              <Input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="01xxxxxxxxx"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t("prepayment.whatsappHint")}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSaveWhatsapp}
              disabled={updatePrepayment.isPending}
            >
              {updatePrepayment.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("common.save")
              )}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Payment Accounts */}
        <div>
          <h4 className="font-medium text-foreground mb-3">
            {t("prepayment.paymentAccounts")}
          </h4>

          {accountsLoading ? (
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : accounts && accounts.length > 0 ? (
            <div className="space-y-2 mb-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {account.paymentMethod
                        ? getLocalizedText(account.paymentMethod.name, locale)
                        : account.paymentMethodId}
                    </p>
                    <p className="text-sm text-muted-foreground" dir="ltr">
                      {account.accountNumber}
                      {account.accountName && ` - ${account.accountName}`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-error-600"
                    onClick={() => handleRemoveAccount(account.id)}
                    disabled={removeAccount.isPending}
                  >
                    {removeAccount.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mb-4">
              {t("prepayment.noAccounts")}
            </p>
          )}

          {/* Add Account Form */}
          {availableMethods.length > 0 && (
            <div className="p-4 rounded-lg border border-dashed space-y-3">
              <p className="text-sm font-medium text-foreground">
                {t("prepayment.addAccount")}
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <Select
                  value={newAccountMethodId}
                  onValueChange={setNewAccountMethodId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("prepayment.selectMethod")} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        {getLocalizedText(method.name, locale)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={newAccountNumber}
                  onChange={(e) => setNewAccountNumber(e.target.value)}
                  placeholder={t("prepayment.accountNumber")}
                  dir="ltr"
                />
                <Input
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  placeholder={t("prepayment.accountName")}
                />
              </div>
              <Button
                size="sm"
                onClick={handleAddAccount}
                disabled={
                  !newAccountMethodId ||
                  !newAccountNumber ||
                  addAccount.isPending
                }
              >
                {addAccount.isPending ? (
                  <Loader2 className="h-4 w-4 me-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 me-2" />
                )}
                {t("common.add")}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
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
