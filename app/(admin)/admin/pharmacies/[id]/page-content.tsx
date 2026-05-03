"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Store,
  MapPin,
  Phone,
  User,
  Package,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Ban,
  Loader2,
  ArrowLeft,
  Clock,
  UserCheck,
  Truck,
  Percent,
  Plus,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  useAdminPharmacy,
  useApprovePharmacy,
  useRejectPharmacy,
  useSuspendPharmacy,
  usePharmacyCommission,
  useSetPharmacyCommission,
  useDeletePharmacyCommission,
} from "@/features/admin/hooks";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { useTranslation } from "@/lib/i18n";
import { PharmacyStatus, PharmacyCommissionType } from "@/types/enums";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  SetCommissionDto,
  CommissionTier,
} from "@/types/pharmacy-commission";

interface AdminPharmacyDetailsContentProps {
  pharmacyId: string;
}

export function AdminPharmacyDetailsContent({
  pharmacyId,
}: AdminPharmacyDetailsContentProps) {
  const { t, locale } = useTranslation();
  const router = useRouter();

  const { data: pharmacy, isLoading } = useAdminPharmacy(pharmacyId);
  const approvePharmacy = useApprovePharmacy();
  const rejectPharmacy = useRejectPharmacy();
  const suspendPharmacy = useSuspendPharmacy();

  const { data: commissionData } = usePharmacyCommission(pharmacyId);
  const setCommission = useSetPharmacyCommission();
  const deleteCommission = useDeletePharmacyCommission();

  const [action, setAction] = useState<"approve" | "reject" | "suspend" | null>(
    null,
  );

  const [commissionForm, setCommissionForm] = useState<SetCommissionDto>({
    commissionType: PharmacyCommissionType.PERCENTAGE,
    commissionValue: 10,
  });
  const [showCommissionForm, setShowCommissionForm] = useState(false);
  const [deleteCommissionOpen, setDeleteCommissionOpen] = useState(false);

  const handleAction = () => {
    if (!action) return;
    const callbacks = { onSuccess: () => setAction(null) };
    switch (action) {
      case "approve":
        approvePharmacy.mutate(pharmacyId, callbacks);
        break;
      case "reject":
        rejectPharmacy.mutate(pharmacyId, callbacks);
        break;
      case "suspend":
        suspendPharmacy.mutate(pharmacyId, callbacks);
        break;
    }
  };

  const isPending =
    approvePharmacy.isPending ||
    rejectPharmacy.isPending ||
    suspendPharmacy.isPending;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!pharmacy) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <Store className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">
            {t("admin.pharmacies.noPharmaciesFound")}
          </p>
        </CardContent>
      </Card>
    );
  }

  const status =
    (pharmacy.ownerProfile?.status as PharmacyStatus) || PharmacyStatus.PENDING;

  const statusConfig: Record<
    PharmacyStatus,
    {
      label: string;
      variant: "warning" | "success" | "error" | "secondary";
      icon: typeof Clock;
    }
  > = {
    [PharmacyStatus.PENDING]: {
      label: t("admin.pharmacies.underReview"),
      variant: "warning",
      icon: Clock,
    },
    [PharmacyStatus.APPROVED]: {
      label: t("admin.pharmacies.approved"),
      variant: "success",
      icon: UserCheck,
    },
    [PharmacyStatus.REJECTED]: {
      label: t("admin.pharmacies.rejected"),
      variant: "error",
      icon: XCircle,
    },
    [PharmacyStatus.SUSPENDED]: {
      label: t("admin.pharmacies.suspended"),
      variant: "error",
      icon: Ban,
    },
  };

  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Store className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {t("admin.pharmacies.detailsTitle")}
            </h1>
            <p className="text-muted-foreground">
              {t("admin.pharmacies.detailsSubtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push("/admin/pharmacies")}
      >
        <ArrowLeft className="h-4 w-4 me-1" />
        {t("common.back")}
      </Button>

      {/* Pharmacy Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-xl">
              {getLocalizedText(pharmacy.name, locale)}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={statusInfo.variant}>
                <StatusIcon className="h-3 w-3 me-1" />
                {statusInfo.label}
              </Badge>
              {!pharmacy.isActive && (
                <Badge variant="secondary">{t("common.inactive")}</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {pharmacy.description && (
            <p className="text-muted-foreground">
              {getLocalizedText(pharmacy.description, locale)}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {pharmacy.ownerProfile?.user && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {t("admin.pharmacies.owner")}:
                </span>
                <span className="font-medium">
                  {pharmacy.ownerProfile.user.fullName}
                </span>
              </div>
            )}

            {pharmacy.city && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {t("admin.pharmacies.city")}:
                </span>
                <span className="font-medium">
                  {getLocalizedText(pharmacy.city.name, locale)}
                  {pharmacy.city.state &&
                    `, ${getLocalizedText(pharmacy.city.state.name, locale)}`}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {t("pharmacyOwner.address")}:
              </span>
              <span className="font-medium">
                {getLocalizedText(pharmacy.address, locale)}
              </span>
            </div>

            {pharmacy.phoneNumbers?.map((phone, i) => (
              <a
                key={i}
                href={`tel:${phone}`}
                className="flex items-center gap-2 hover:text-primary-600"
                dir="ltr"
              >
                <Phone className="h-4 w-4 text-muted-foreground" />
                {phone}
              </a>
            ))}

            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {t("pharmacyOwner.deliveryType")}:
              </span>
              <span className="font-medium">{pharmacy.deliveryType}</span>
            </div>

            {pharmacy._count?.products !== undefined && (
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {t("admin.pharmacies.productCount")}:
                </span>
                <span className="font-medium">{pharmacy._count.products}</span>
              </div>
            )}

            {pharmacy._count?.orders !== undefined && (
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {t("admin.pharmacies.orderCount")}:
                </span>
                <span className="font-medium">{pharmacy._count.orders}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3 flex-wrap">
            {status === PharmacyStatus.PENDING && (
              <>
                <Button
                  onClick={() => setAction("approve")}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 me-2" />
                  {t("admin.approve")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setAction("reject")}
                  className="text-error-600 border-error-300 hover:bg-error-50"
                >
                  <XCircle className="h-4 w-4 me-2" />
                  {t("admin.reject")}
                </Button>
              </>
            )}
            {status === PharmacyStatus.APPROVED && (
              <Button
                variant="outline"
                onClick={() => setAction("suspend")}
                className="text-warning-600 border-warning-300 hover:bg-warning-50"
              >
                <Ban className="h-4 w-4 me-2" />
                {t("admin.suspend")}
              </Button>
            )}
            {(status === PharmacyStatus.REJECTED ||
              status === PharmacyStatus.SUSPENDED) && (
              <Button
                onClick={() => setAction("approve")}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 me-2" />
                {t("admin.pharmacies.reactivate")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Commission Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              <Percent className="h-5 w-5 inline me-2" />
              {t("pharmacyOwner.commissionSettings")}
            </CardTitle>
            {commissionData?.commission && !showCommissionForm && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCommissionForm({
                      commissionType: commissionData.commission!
                        .commissionType as PharmacyCommissionType,
                      commissionValue: Number(
                        commissionData.commission!.commissionValue,
                      ),
                      tiers:
                        (commissionData.commission!
                          .tiers as CommissionTier[]) || undefined,
                    });
                    setShowCommissionForm(true);
                  }}
                >
                  <Percent className="h-4 w-4 me-1" />
                  {t("common.edit")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-error-600"
                  onClick={() => setDeleteCommissionOpen(true)}
                >
                  <Trash2 className="h-4 w-4 me-1" />
                  {t("pharmacyOwner.deleteCommission")}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {commissionData?.commission && !showCommissionForm ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">
                  {t("pharmacyOwner.commissionType")}:
                </span>
                <p className="font-medium">
                  {commissionData.commission.commissionType}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {t("pharmacyOwner.commissionValue")}:
                </span>
                <p className="font-medium">
                  {Number(commissionData.commission.commissionValue)}%
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {t("common.status")}:
                </span>
                <p className="font-medium">
                  {commissionData.commission.isActive
                    ? t("pharmacyOwner.active")
                    : t("pharmacyOwner.inactive")}
                </p>
              </div>
              {commissionData.commission.tiers &&
                (commissionData.commission.tiers as CommissionTier[]).length >
                  0 && (
                  <div className="col-span-full">
                    <span className="text-muted-foreground block mb-2">
                      {t("pharmacyOwner.commissionTiers")}:
                    </span>
                    <div className="space-y-1">
                      {(
                        commissionData.commission.tiers as CommissionTier[]
                      ).map((tier, i) => (
                        <div key={i} className="flex gap-4 text-sm">
                          <span>
                            {tier.minAmount} - {tier.maxAmount}{" "}
                            {t("common.egp")}
                          </span>
                          <span className="font-medium">
                            {tier.percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          ) : showCommissionForm ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t("pharmacyOwner.commissionType")}</Label>
                  <Select
                    value={commissionForm.commissionType}
                    onValueChange={(v) =>
                      setCommissionForm({
                        ...commissionForm,
                        commissionType: v as PharmacyCommissionType,
                        tiers:
                          v === PharmacyCommissionType.TIERED
                            ? commissionForm.tiers || [
                                { minAmount: 0, maxAmount: 500, percentage: 5 },
                              ]
                            : undefined,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PharmacyCommissionType.PERCENTAGE}>
                        {t("pharmacyOwner.commissionPercentage")}
                      </SelectItem>
                      <SelectItem value={PharmacyCommissionType.TIERED}>
                        {t("pharmacyOwner.commissionTiered")}
                      </SelectItem>
                      <SelectItem value={PharmacyCommissionType.PROMOTIONAL}>
                        {t("pharmacyOwner.commissionPromotional")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t("pharmacyOwner.commissionValue")} (%)</Label>
                  <Input
                    type="number"
                    value={commissionForm.commissionValue}
                    onChange={(e) =>
                      setCommissionForm({
                        ...commissionForm,
                        commissionValue: Number(e.target.value),
                      })
                    }
                    min={0}
                    max={100}
                  />
                </div>
              </div>

              {commissionForm.commissionType ===
                PharmacyCommissionType.TIERED &&
                commissionForm.tiers && (
                  <div className="space-y-2">
                    <Label>{t("pharmacyOwner.commissionTiers")}</Label>
                    {commissionForm.tiers.map((tier, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder={t("pharmacyOwner.tierMinAmount")}
                          value={tier.minAmount}
                          onChange={(e) => {
                            const tiers = [...commissionForm.tiers!];
                            tiers[i] = {
                              ...tier,
                              minAmount: Number(e.target.value),
                            };
                            setCommissionForm({ ...commissionForm, tiers });
                          }}
                          className="w-24"
                          min={0}
                        />
                        <span>-</span>
                        <Input
                          type="number"
                          placeholder={t("pharmacyOwner.tierMaxAmount")}
                          value={tier.maxAmount}
                          onChange={(e) => {
                            const tiers = [...commissionForm.tiers!];
                            tiers[i] = {
                              ...tier,
                              maxAmount: Number(e.target.value),
                            };
                            setCommissionForm({ ...commissionForm, tiers });
                          }}
                          className="w-24"
                          min={0}
                        />
                        <span>{t("common.egp")} →</span>
                        <Input
                          type="number"
                          placeholder={t("placeholder.percent")}
                          value={tier.percentage}
                          onChange={(e) => {
                            const tiers = [...commissionForm.tiers!];
                            tiers[i] = {
                              ...tier,
                              percentage: Number(e.target.value),
                            };
                            setCommissionForm({ ...commissionForm, tiers });
                          }}
                          className="w-20"
                          min={0}
                          max={100}
                        />
                        <span>%</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-error-600"
                          onClick={() => {
                            const tiers = commissionForm.tiers!.filter(
                              (_, j) => j !== i,
                            );
                            setCommissionForm({ ...commissionForm, tiers });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCommissionForm({
                          ...commissionForm,
                          tiers: [
                            ...commissionForm.tiers!,
                            { minAmount: 0, maxAmount: 0, percentage: 0 },
                          ],
                        })
                      }
                    >
                      <Plus className="h-4 w-4 me-1" />
                      {t("pharmacyOwner.addTier")}
                    </Button>
                  </div>
                )}

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setCommission.mutate(
                      { pharmacyId, ...commissionForm },
                      { onSuccess: () => setShowCommissionForm(false) },
                    );
                  }}
                  disabled={setCommission.isPending}
                  size="sm"
                >
                  {setCommission.isPending && (
                    <Loader2 className="h-4 w-4 me-2 animate-spin" />
                  )}
                  {t("common.save")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCommissionForm(false)}
                >
                  {t("common.cancel")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Percent className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                {t("pharmacyOwner.noCommission")}
              </p>
              <Button
                size="sm"
                onClick={() => {
                  setCommissionForm({
                    commissionType: PharmacyCommissionType.PERCENTAGE,
                    commissionValue: 10,
                  });
                  setShowCommissionForm(true);
                }}
              >
                <Plus className="h-4 w-4 me-1" />
                {t("pharmacyOwner.setCommission")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Commission Dialog */}
      <AlertDialog
        open={deleteCommissionOpen}
        onOpenChange={setDeleteCommissionOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("pharmacyOwner.deleteCommission")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("pharmacyOwner.deleteCommissionConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deleteCommission.mutate(pharmacyId, {
                  onSuccess: () => setDeleteCommissionOpen(false),
                });
              }}
              className="bg-error-600 hover:bg-error-700"
              disabled={deleteCommission.isPending}
            >
              {deleteCommission.isPending && (
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
              )}
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!action} onOpenChange={() => setAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action === "approve" && t("admin.pharmacies.confirmApprove")}
              {action === "reject" && t("admin.pharmacies.confirmReject")}
              {action === "suspend" && t("admin.pharmacies.confirmSuspend")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action === "approve" && t("admin.pharmacies.approveMessage")}
              {action === "reject" && t("admin.pharmacies.rejectMessage")}
              {action === "suspend" && t("admin.pharmacies.suspendMessage")}
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
