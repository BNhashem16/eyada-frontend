"use client";

import { useState } from "react";
import {
  Ticket,
  Plus,
  Search,
  Loader2,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Label } from "@/components/ui/label";
import {
  useAdminCoupons,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
} from "../hooks";
import { useTranslation } from "@/lib/i18n";
import { CouponType } from "@/types/enums";
import type {
  PharmacyCoupon,
  CreateCouponDto,
  UpdateCouponDto,
} from "@/types/coupon";
import { PaginationControls } from "@/components/ui/pagination-controls";

const COUPON_TYPE_LABELS: Record<CouponType, string> = {
  [CouponType.PERCENTAGE]: "couponPercentage",
  [CouponType.FIXED]: "couponFixed",
  [CouponType.FREE_DELIVERY]: "couponFreeDelivery",
};

export function AdminCouponsManagement() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>();

  const { data, isLoading } = useAdminCoupons({
    page,
    limit: 10,
    search: search || undefined,
    isActive: isActiveFilter,
  });
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<PharmacyCoupon | null>(
    null,
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<CreateCouponDto>>({
    code: "",
    couponType: CouponType.PERCENTAGE,
    value: 0,
    perUserLimit: 1,
    startDate: "",
    endDate: "",
  });

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const openCreate = () => {
    setEditingCoupon(null);
    setFormData({
      code: "",
      couponType: CouponType.PERCENTAGE,
      value: 0,
      perUserLimit: 1,
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
    });
    setFormOpen(true);
  };

  const openEdit = (coupon: PharmacyCoupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      couponType: coupon.couponType as CouponType,
      value: Number(coupon.value),
      minOrderAmount: coupon.minOrderAmount
        ? Number(coupon.minOrderAmount)
        : undefined,
      maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : undefined,
      usageLimit: coupon.usageLimit ?? undefined,
      perUserLimit: coupon.perUserLimit,
      startDate: coupon.startDate.split("T")[0],
      endDate: coupon.endDate.split("T")[0],
    });
    setFormOpen(true);
  };

  const handleSubmit = () => {
    if (editingCoupon) {
      const { code, ...updateData } = formData;
      updateCoupon.mutate(
        {
          couponId: editingCoupon.id,
          ...(updateData as UpdateCouponDto),
        },
        { onSuccess: () => setFormOpen(false) },
      );
    } else {
      createCoupon.mutate(formData as CreateCouponDto, {
        onSuccess: () => setFormOpen(false),
      });
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteCoupon.mutate(deleteId, {
      onSuccess: () => setDeleteId(null),
    });
  };

  const isCouponExpired = (endDate: string) => new Date(endDate) < new Date();
  const isMutating = createCoupon.isPending || updateCoupon.isPending;

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
              value={
                isActiveFilter === undefined ? "all" : isActiveFilter.toString()
              }
              onValueChange={(v) => {
                setIsActiveFilter(v === "all" ? undefined : v === "true");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                <SelectItem value="true">
                  {t("pharmacyOwner.active")}
                </SelectItem>
                <SelectItem value="false">
                  {t("pharmacyOwner.inactive")}
                </SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={openCreate} size="sm">
              <Plus className="h-4 w-4 me-1" />
              {t("pharmacyOwner.createCoupon")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coupons List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            <Ticket className="h-5 w-5 inline me-2" />
            {t("pharmacyOwner.couponManagement")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : !data?.data?.length ? (
            <div className="py-10 text-center">
              <Ticket className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">
                {t("pharmacyOwner.noCoupons")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.data.map((coupon) => {
                const expired = isCouponExpired(coupon.endDate);
                return (
                  <div
                    key={coupon.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-lg">
                          {coupon.code}
                        </span>
                        <Badge
                          variant={
                            expired
                              ? "secondary"
                              : coupon.isActive
                                ? "success"
                                : "warning"
                          }
                        >
                          {expired
                            ? t("pharmacyOwner.expired")
                            : coupon.isActive
                              ? t("pharmacyOwner.active")
                              : t("pharmacyOwner.inactive")}
                        </Badge>
                        <Badge variant="outline">
                          {t(
                            `pharmacyOwner.${COUPON_TYPE_LABELS[coupon.couponType as CouponType]}`,
                          )}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>
                          {t("pharmacyOwner.couponValue")}:{" "}
                          {coupon.couponType === "PERCENTAGE"
                            ? `${Number(coupon.value)}%`
                            : coupon.couponType === "FIXED"
                              ? `${Number(coupon.value)} ${t("common.egp")}`
                              : "-"}
                        </span>
                        <span>
                          {t("pharmacyOwner.usageCount")}: {coupon.usageCount}
                          {coupon.usageLimit
                            ? ` / ${coupon.usageLimit}`
                            : ` (${t("pharmacyOwner.unlimited")})`}
                        </span>
                        <span>
                          {t("pharmacyOwner.couponScope")}:{" "}
                          {coupon.pharmacyId
                            ? t("pharmacyOwner.pharmacySpecific")
                            : t("pharmacyOwner.platformWide")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(coupon)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(coupon.id)}
                        className="text-error-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
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

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCoupon
                ? t("pharmacyOwner.editCoupon")
                : t("pharmacyOwner.createCoupon")}
            </DialogTitle>
            <DialogDescription>
              {t("pharmacyOwner.couponManagement")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!editingCoupon && (
              <div>
                <Label required>{t("pharmacyOwner.couponCode")}</Label>
                <Input
                  value={formData.code || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="WELCOME10"
                  maxLength={20}
                />
              </div>
            )}

            <div>
              <Label required>{t("pharmacyOwner.couponType")}</Label>
              <Select
                value={formData.couponType}
                onValueChange={(v) =>
                  setFormData({ ...formData, couponType: v as CouponType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CouponType.PERCENTAGE}>
                    {t("pharmacyOwner.couponPercentage")}
                  </SelectItem>
                  <SelectItem value={CouponType.FIXED}>
                    {t("pharmacyOwner.couponFixed")}
                  </SelectItem>
                  <SelectItem value={CouponType.FREE_DELIVERY}>
                    {t("pharmacyOwner.couponFreeDelivery")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.couponType !== CouponType.FREE_DELIVERY && (
              <div>
                <Label required>{t("pharmacyOwner.couponValue")}</Label>
                <Input
                  type="number"
                  value={formData.value || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, value: Number(e.target.value) })
                  }
                  min={0}
                  placeholder={t("pharmacyOwner.couponValuePlaceholder")}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
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
                  placeholder={t("pharmacyOwner.couponMinOrderPlaceholder")}
                />
              </div>
              <div>
                <Label>{t("pharmacyOwner.maxDiscountAmount")}</Label>
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

            <div className="grid grid-cols-2 gap-3">
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
                  placeholder={t("pharmacyOwner.unlimited")}
                />
              </div>
              <div>
                <Label>{t("pharmacyOwner.perUserLimit")}</Label>
                <Input
                  type="number"
                  value={formData.perUserLimit || 1}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      perUserLimit: Number(e.target.value) || 1,
                    })
                  }
                  min={1}
                  max={10}
                  placeholder={t("pharmacyOwner.perUserLimitPlaceholder")}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label required>{t("pharmacyOwner.startDate")}</Label>
                <Input
                  type="date"
                  value={formData.startDate || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>
              <div>
                <Label required>{t("pharmacyOwner.endDate")}</Label>
                <Input
                  type="date"
                  value={formData.endDate || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSubmit} disabled={isMutating}>
              {isMutating && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
              {editingCoupon
                ? t("common.save")
                : t("pharmacyOwner.createCoupon")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("pharmacyOwner.deleteCoupon")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("pharmacyOwner.deleteCouponConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-error-600 hover:bg-error-700"
              disabled={deleteCoupon.isPending}
            >
              {deleteCoupon.isPending && (
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
              )}
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
