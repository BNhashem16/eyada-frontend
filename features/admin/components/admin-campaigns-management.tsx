"use client";

import { useState } from "react";
import { Megaphone, Search, Loader2, Trash2, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  ConfirmDialog,
  ListSkeleton,
  PharmacyEmptyState,
} from "@/components/pharmacy";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import {
  useAdminCampaigns,
  useUpdateAdminCampaign,
  useUpdateAdminCampaignStatus,
  useDeleteAdminCampaign,
} from "../hooks";
import { useTranslation } from "@/lib/i18n";
import { getLocalizedText } from "@/lib/utils/multilingual";
import {
  CampaignCalculationType,
  CampaignStatus,
  DiscountType,
} from "@/types/enums";
import type { PharmacyCampaign, UpdateCampaignDto } from "@/types/campaign";
import { PaginationControls } from "@/components/ui/pagination-controls";

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

export function AdminCampaignsManagement() {
  const { t, locale } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "ALL">(
    "ALL",
  );

  const { data, isLoading } = useAdminCampaigns({
    page,
    limit: 10,
    search: search || undefined,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });
  const updateCampaign = useUpdateAdminCampaign();
  const updateCampaignStatus = useUpdateAdminCampaignStatus();
  const deleteCampaign = useDeleteAdminCampaign();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PharmacyCampaign | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<UpdateCampaignDto>({});

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const openEdit = (campaign: PharmacyCampaign) => {
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
    if (!editing) return;
    updateCampaign.mutate(
      { campaignId: editing.id, ...formData },
      { onSuccess: () => setFormOpen(false) },
    );
  };

  const handleStatusChange = (
    campaignId: string,
    newStatus: CampaignStatus,
  ) => {
    updateCampaignStatus.mutate({ campaignId, status: newStatus });
  };

  return (
    <>
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px] flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("common.search")}
                  className="ps-9"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button variant="outline" size="sm" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v as CampaignStatus | "ALL");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue />
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
          </div>
        </CardContent>
      </Card>

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            <Megaphone className="h-5 w-5 inline me-2" />
            {t("pharmacyOwner.campaignsTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ListSkeleton rows={3} />
          ) : !data?.data?.length ? (
            <PharmacyEmptyState
              icon={Megaphone}
              title={t("pharmacyOwner.noCampaigns")}
            />
          ) : (
            <div className="space-y-3">
              {data.data.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{campaign.name}</span>
                      <Badge variant="outline">
                        {t(
                          `pharmacyOwner.${DISCOUNT_TYPE_KEYS[campaign.discountType]}`,
                        )}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>
                        {t("pharmacyOwner.discountValue")}:{" "}
                        {Number(campaign.discountValue)}
                      </span>
                      <span>
                        {new Date(campaign.startDate).toLocaleDateString(
                          locale === "ar" ? "ar-EG" : "en-US",
                        )}{" "}
                        -{" "}
                        {new Date(campaign.endDate).toLocaleDateString(
                          locale === "ar" ? "ar-EG" : "en-US",
                        )}
                      </span>
                      {campaign.usageLimit && (
                        <span>
                          {t("pharmacyOwner.usageCount")}: {campaign.usageCount}
                          /{campaign.usageLimit}
                        </span>
                      )}
                      {campaign.pharmacy && (
                        <span>
                          {getLocalizedText(campaign.pharmacy.name, locale)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={campaign.status}
                      onValueChange={(v) =>
                        handleStatusChange(campaign.id, v as CampaignStatus)
                      }
                    >
                      <SelectTrigger className="w-32 h-8">
                        <Badge
                          variant={STATUS_VARIANTS[campaign.status] as any}
                          className="text-xs"
                        >
                          {t(`pharmacyOwner.${STATUS_KEYS[campaign.status]}`)}
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
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(campaign)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(campaign.id)}
                      className="text-error-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {data?.meta && data.meta.totalPages > 1 && (
            <div className="mt-4">
              <PaginationControls
                meta={data.meta}
                page={page}
                onPageChange={setPage}
                limit={10}
                onLimitChange={() => {}}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("pharmacyOwner.editCampaign")}</DialogTitle>
            <DialogDescription>
              {t("pharmacyOwner.campaignsSubtitle")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("pharmacyOwner.campaignName")}</Label>
              <Input
                value={formData.name || ""}
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
                <Label>{t("pharmacyOwner.discountType")}</Label>
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
                <Label>{t("pharmacyOwner.calculationType")}</Label>
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
              <Label>{t("pharmacyOwner.discountValue")}</Label>
              <Input
                type="number"
                value={formData.discountValue ?? ""}
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
                <Label>{t("pharmacyOwner.startDate")}</Label>
                <DatePickerInput
                  value={formData.startDate || ""}
                  onChange={(v) => setFormData({ ...formData, startDate: v })}
                  placeholder={t("pharmacyOwner.startDate")}
                  locale={locale as "ar" | "en"}
                />
              </div>
              <div>
                <Label>{t("pharmacyOwner.endDate")}</Label>
                <DatePickerInput
                  value={formData.endDate || ""}
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
            <Button onClick={handleSubmit} disabled={updateCampaign.isPending}>
              {updateCampaign.isPending && (
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
              )}
              {t("common.save")}
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
        onConfirm={async () => {
          if (deleteId) await deleteCampaign.mutateAsync(deleteId);
          setDeleteId(null);
        }}
      />
    </>
  );
}
