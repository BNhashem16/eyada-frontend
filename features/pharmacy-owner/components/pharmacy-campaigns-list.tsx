"use client";

import { useEffect, useMemo, useState } from "react";
import { Megaphone, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { PaginationControls } from "@/components/ui/pagination-controls";
import {
  ConfirmDialog,
  Currency,
  ListSkeleton,
  PharmacyEmptyState,
  RefreshButton,
} from "@/components/pharmacy";
import {
  useMyPharmacies,
  usePharmacyCampaigns,
  useCreateCampaign,
  useUpdateCampaign,
  useUpdateCampaignStatus,
  useDeleteCampaign,
} from "../hooks";
import { useTranslation } from "@/lib/i18n";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { CampaignCalculationType, CampaignStatus, DiscountType } from "@/types";
import { pharmacyCampaignKeys } from "@/lib/query-keys";
import type { PharmacyCampaign, CreateCampaignDto } from "@/types/campaign";

const STATUS_VARIANTS: Record<string, string> = {
  DRAFT: "secondary",
  ACTIVE: "success",
  PAUSED: "warning",
  ENDED: "error",
};

const DISCOUNT_TYPE_KEYS: Record<string, string> = {
  PLATFORM_SUBSIDY: "discountPlatformSubsidy",
  PHARMACY_FUNDED: "discountPharmacyFunded",
  COUPON: "discountCoupon",
  FREE_DELIVERY: "discountFreeDelivery",
  FIRST_ORDER: "discountFirstOrder",
};

const STATUS_KEYS: Record<string, string> = {
  DRAFT: "statusDraft",
  ACTIVE: "statusActive",
  PAUSED: "statusPaused",
  ENDED: "statusEnded",
};

const CALCULATION_TYPE_KEYS: Record<string, string> = {
  PERCENTAGE: "calculationPercentage",
  FIXED: "calculationFixed",
};

export function PharmacyCampaignsList() {
  const { t, locale } = useTranslation();
  const queryClient = useQueryClient();
  const { data: pharmacies, isLoading: loadingPharmacies } = useMyPharmacies();

  const [selectedPharmacy, setSelectedPharmacy] = useState("");
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "ALL">(
    "ALL",
  );
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Form dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PharmacyCampaign | null>(null);
  const [formData, setFormData] = useState<CreateCampaignDto>({
    name: "",
    description: "",
    discountType: DiscountType.PHARMACY_FUNDED,
    discountValue: 0,
    startDate: "",
    endDate: "",
  });

  // Delete dialog
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const pharmacyList = pharmacies?.data;
  const pharmacyId = selectedPharmacy || pharmacyList?.[0]?.id || "";

  // Default to first pharmacy in an effect (no setState during render).
  useEffect(() => {
    if (!selectedPharmacy && pharmacyList?.length) {
      setSelectedPharmacy(pharmacyList[0].id);
    }
  }, [pharmacyList, selectedPharmacy]);

  const handleRefresh = useMemo(
    () => async () => {
      if (!pharmacyId) return;
      await queryClient.invalidateQueries({
        queryKey: pharmacyCampaignKeys.lists(pharmacyId),
      });
    },
    [queryClient, pharmacyId],
  );

  const { data: campaigns, isLoading: loadingCampaigns } = usePharmacyCampaigns(
    pharmacyId,
    {
      status: statusFilter === "ALL" ? undefined : statusFilter,
      page,
      limit,
    },
  );
  const createCampaign = useCreateCampaign(pharmacyId);
  const updateCampaign = useUpdateCampaign(pharmacyId);
  const updateCampaignStatus = useUpdateCampaignStatus(pharmacyId);
  const deleteCampaign = useDeleteCampaign(pharmacyId);

  const openCreateForm = () => {
    setEditing(null);
    setFormData({
      name: "",
      description: "",
      discountType: DiscountType.PHARMACY_FUNDED,
      calculationType: CampaignCalculationType.PERCENTAGE,
      discountValue: 0,
      startDate: "",
      endDate: "",
    });
    setFormOpen(true);
  };

  const openEditForm = (campaign: PharmacyCampaign) => {
    setEditing(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description || "",
      discountType: campaign.discountType,
      calculationType:
        campaign.calculationType || CampaignCalculationType.PERCENTAGE,
      discountValue: Number(campaign.discountValue),
      minOrderAmount: campaign.minOrderAmount
        ? Number(campaign.minOrderAmount)
        : undefined,
      maxDiscount: campaign.maxDiscount
        ? Number(campaign.maxDiscount)
        : undefined,
      startDate: campaign.startDate.slice(0, 10),
      endDate: campaign.endDate.slice(0, 10),
      usageLimit: campaign.usageLimit || undefined,
      perUserLimit: campaign.perUserLimit || undefined,
    });
    setFormOpen(true);
  };

  const handleSubmit = () => {
    if (editing) {
      updateCampaign.mutate(
        { campaignId: editing.id, ...formData },
        { onSuccess: () => setFormOpen(false) },
      );
    } else {
      createCampaign.mutate(formData, {
        onSuccess: () => setFormOpen(false),
      });
    }
  };

  const handleStatusChange = (
    campaignId: string,
    newStatus: CampaignStatus,
  ) => {
    updateCampaignStatus.mutate({ campaignId, status: newStatus });
  };

  const confirmDelete = async () => {
    if (deleteId) await deleteCampaign.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const isLoading = loadingPharmacies || loadingCampaigns;
  const isMutating = createCampaign.isPending || updateCampaign.isPending;

  return (
    <div className="space-y-4">
      {/* Sticky filter bar (mobile) */}
      <Card className="sticky top-0 z-10 border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:static sm:bg-card sm:backdrop-blur-none">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
            {pharmacyList && pharmacyList.length > 1 ? (
              <Select
                value={selectedPharmacy}
                onValueChange={setSelectedPharmacy}
              >
                <SelectTrigger
                  className="min-h-[44px] w-full sm:min-h-9 sm:w-48"
                  aria-label={t("pharmacyOwner.selectPharmacy")}
                >
                  <SelectValue
                    placeholder={t("pharmacyOwner.selectPharmacy")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {pharmacyList.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {getLocalizedText(p.name, locale)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v as CampaignStatus | "ALL");
                setPage(1);
              }}
            >
              <SelectTrigger
                className="min-h-[44px] w-full sm:min-h-9 sm:w-40"
                aria-label={t("pharmacyOwner.allStatuses")}
              >
                <SelectValue placeholder={t("pharmacyOwner.allStatuses")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">
                  {t("pharmacyOwner.allStatuses")}
                </SelectItem>
                {Object.values(CampaignStatus).map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`pharmacyOwner.${STATUS_KEYS[s]}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <RefreshButton onRefresh={handleRefresh} />
            <div className="md:ms-auto">
              <Button
                onClick={openCreateForm}
                disabled={!pharmacyId}
                className="min-h-[44px] w-full sm:min-h-9 sm:w-auto"
              >
                <Plus className="me-2 size-4" aria-hidden="true" />
                {t("pharmacyOwner.createCampaign")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t("pharmacyOwner.campaignsTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ListSkeleton rows={3} />
          ) : !campaigns?.data?.length ? (
            <PharmacyEmptyState
              icon={Megaphone}
              title={t("pharmacyOwner.noCampaigns")}
            />
          ) : (
            <>
              <div className="space-y-3">
                {campaigns.data.map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="truncate font-semibold">{c.name}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          {t(
                            `pharmacyOwner.${DISCOUNT_TYPE_KEYS[c.discountType]}`,
                          )}
                          :{" "}
                          {c.calculationType ===
                          CampaignCalculationType.FIXED ? (
                            <Currency amount={c.discountValue} />
                          ) : (
                            <span>{Number(c.discountValue)}%</span>
                          )}
                        </span>
                        <span aria-hidden="true">|</span>
                        <span>
                          {new Date(c.startDate).toLocaleDateString(
                            locale === "ar" ? "ar-EG" : "en-US",
                          )}{" "}
                          -{" "}
                          {new Date(c.endDate).toLocaleDateString(
                            locale === "ar" ? "ar-EG" : "en-US",
                          )}
                        </span>
                        {c.usageLimit ? (
                          <>
                            <span aria-hidden="true">|</span>
                            <span className="tabular-nums">
                              {c.usageCount}/{c.usageLimit}
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Select
                        value={c.status}
                        onValueChange={(v) =>
                          handleStatusChange(c.id, v as CampaignStatus)
                        }
                      >
                        <SelectTrigger
                          className="h-10 w-32 sm:h-8"
                          aria-label={t("pharmacyOwner.allStatuses")}
                        >
                          <Badge
                            variant={STATUS_VARIANTS[c.status] as any}
                            className="text-xs"
                          >
                            {t(`pharmacyOwner.${STATUS_KEYS[c.status]}`)}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(CampaignStatus).map((s) => (
                            <SelectItem key={s} value={s}>
                              {t(`pharmacyOwner.${STATUS_KEYS[s]}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={t("common.edit")}
                        className="size-11 sm:size-9"
                        onClick={() => openEditForm(c)}
                      >
                        <Pencil className="size-3.5" aria-hidden="true" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={t("common.delete")}
                        className="size-11 text-destructive sm:size-9"
                        onClick={() => setDeleteId(c.id)}
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {campaigns.meta && (
                <div className="mt-4">
                  <PaginationControls
                    meta={campaigns.meta}
                    page={page}
                    onPageChange={setPage}
                    limit={limit}
                    onLimitChange={(l) => {
                      setLimit(l);
                      setPage(1);
                    }}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing
                ? t("pharmacyOwner.editCampaign")
                : t("pharmacyOwner.createCampaign")}
            </DialogTitle>
            <DialogDescription>
              {t("pharmacyOwner.campaignsSubtitle")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label required>{t("pharmacyOwner.campaignName")}</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={t("pharmacyOwner.campaignNamePlaceholder")}
              />
            </div>
            <div>
              <Label>{t("pharmacyOwner.campaignDesc")}</Label>
              <Input
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder={t("pharmacyOwner.campaignDescPlaceholder")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label required>{t("pharmacyOwner.discountType")}</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(v) =>
                    setFormData({
                      ...formData,
                      discountType: v as DiscountType,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(DiscountType).map((dt) => (
                      <SelectItem key={dt} value={dt}>
                        {t(`pharmacyOwner.${DISCOUNT_TYPE_KEYS[dt]}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label required>{t("pharmacyOwner.calculationType")}</Label>
                <Select
                  value={
                    formData.calculationType ||
                    CampaignCalculationType.PERCENTAGE
                  }
                  onValueChange={(v) =>
                    setFormData({
                      ...formData,
                      calculationType: v as CampaignCalculationType,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CampaignCalculationType).map((ct) => (
                      <SelectItem key={ct} value={ct}>
                        {t(`pharmacyOwner.${CALCULATION_TYPE_KEYS[ct]}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label required>{t("pharmacyOwner.discountValue")}</Label>
              <Input
                type="number"
                value={formData.discountValue}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountValue: Number(e.target.value),
                  })
                }
                min={0}
                placeholder={t("pharmacyOwner.discountValuePlaceholder")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("pharmacyOwner.minOrderAmount")}</Label>
                <Input
                  type="number"
                  value={formData.minOrderAmount || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minOrderAmount: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  min={0}
                  placeholder={t("pharmacyOwner.minOrderAmountPlaceholder")}
                />
              </div>
              <div>
                <Label>{t("pharmacyOwner.maxDiscount")}</Label>
                <Input
                  type="number"
                  value={formData.maxDiscount || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxDiscount: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  min={0}
                  placeholder={t("pharmacyOwner.maxDiscountPlaceholder")}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label required>{t("pharmacyOwner.startDate")}</Label>
                <DatePickerInput
                  value={formData.startDate}
                  onChange={(v) => setFormData({ ...formData, startDate: v })}
                  placeholder={t("pharmacyOwner.startDate")}
                  locale={locale as "ar" | "en"}
                />
              </div>
              <div>
                <Label required>{t("pharmacyOwner.endDate")}</Label>
                <DatePickerInput
                  value={formData.endDate}
                  onChange={(v) => setFormData({ ...formData, endDate: v })}
                  placeholder={t("pharmacyOwner.endDate")}
                  locale={locale as "ar" | "en"}
                  disableBefore={
                    formData.startDate
                      ? new Date(formData.startDate)
                      : undefined
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("pharmacyOwner.usageLimit")}</Label>
                <Input
                  type="number"
                  value={formData.usageLimit || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      usageLimit: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  min={1}
                  placeholder={t("pharmacyOwner.campaignUsageLimitPlaceholder")}
                />
              </div>
              <div>
                <Label>{t("pharmacyOwner.perUserLimit")}</Label>
                <Input
                  type="number"
                  value={formData.perUserLimit || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      perUserLimit: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  min={1}
                  placeholder={t("pharmacyOwner.perUserLimitPlaceholder")}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isMutating ||
                !formData.name ||
                !formData.startDate ||
                !formData.endDate
              }
            >
              {isMutating && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
              {editing
                ? t("common.saveChanges")
                : t("pharmacyOwner.createCampaign")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t("common.delete")}
        description={t("pharmacyOwner.deleteCampaignConfirm")}
        tone="destructive"
        confirmLabel={t("common.delete")}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
