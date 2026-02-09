"use client";

import { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Frown,
  Loader2,
  Search,
  Percent,
  DollarSign,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCommissions,
  useCreateCommission,
  useUpdateCommission,
  useDeleteCommission,
  Commission,
  CommissionType,
} from "../hooks";
import { useAdminDoctors } from "../hooks";
import { DoctorStatus } from "@/types/enums";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useTranslation } from "@/lib/i18n";

interface CommissionFormData {
  doctorProfileId: string;
  commissionType: CommissionType;
  commissionValue: string;
  isActive: boolean;
}

const initialFormData: CommissionFormData = {
  doctorProfileId: "",
  commissionType: "PERCENTAGE",
  commissionValue: "",
  isActive: true,
};

export function CommissionsManagement() {
  const { t, locale } = useTranslation();
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const {
    data: commissionsResponse,
    isLoading,
    isError,
  } = useCommissions({ search, page, limit });
  const commissions = commissionsResponse?.data || [];
  const meta = commissionsResponse?.meta;
  const { data: doctorsResponse } = useAdminDoctors({
    limit: 100,
    status: DoctorStatus.APPROVED,
  });
  const doctors = doctorsResponse?.data || [];

  const createCommission = useCreateCommission();
  const updateCommission = useUpdateCommission();
  const deleteCommission = useDeleteCommission();

  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCommission, setEditingCommission] = useState<Commission | null>(
    null,
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CommissionFormData>(initialFormData);

  // Filter out doctors who already have commission
  const availableDoctors = doctors.filter(
    (doctor) => !commissions.some((c) => c.doctorProfileId === doctor.id),
  );

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleOpenCreate = () => {
    setEditingCommission(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (commission: Commission) => {
    setEditingCommission(commission);
    setFormData({
      doctorProfileId: commission.doctorProfileId,
      commissionType: commission.commissionType,
      commissionValue: commission.commissionValue.toString(),
      isActive: commission.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    const value = parseFloat(formData.commissionValue);
    if (isNaN(value) || value <= 0) return;

    if (editingCommission) {
      updateCommission.mutate(
        {
          id: editingCommission.id,
          commissionType: formData.commissionType,
          commissionValue: value,
          isActive: formData.isActive,
        },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            setEditingCommission(null);
            setFormData(initialFormData);
          },
        },
      );
    } else {
      createCommission.mutate(
        {
          doctorProfileId: formData.doctorProfileId,
          commissionType: formData.commissionType,
          commissionValue: value,
          isActive: formData.isActive,
        },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            setFormData(initialFormData);
          },
        },
      );
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteCommission.mutate(deleteId, {
      onSuccess: () => setDeleteId(null),
    });
  };

  const handleToggleActive = (commission: Commission) => {
    setTogglingId(commission.id);
    updateCommission.mutate(
      {
        id: commission.id,
        isActive: !commission.isActive,
      },
      { onSettled: () => setTogglingId(null) },
    );
  };

  const formatCommissionValue = (commission: Commission) => {
    if (commission.commissionType === "FIXED") {
      return `${commission.commissionValue} ${t("common.currency")}`;
    }
    return `${commission.commissionValue}%`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-900/20">
        <CardContent className="py-10 text-center">
          <p className="text-error-600 dark:text-error-400">
            {t("errors.loadError")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-semibold text-foreground">
              {t("admin.commissions.list")} ({meta?.total || 0})
            </h3>
            <div className="flex gap-2">
              <div className="flex gap-2">
                <Input
                  placeholder={t("admin.commissions.searchDoctor")}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  inputMode="search"
                  className="w-48"
                />
                <Button variant="outline" size="icon" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={handleOpenCreate}>
                <Plus className="h-4 w-4 me-2" />
                {t("admin.commissions.add")}
              </Button>
            </div>
          </div>

          {commissions.length === 0 ? (
            <div className="text-center py-10">
              <Frown className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">
                {t("admin.commissions.noCommissions")}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.commissions.doctor")}</TableHead>
                  <TableHead>{t("admin.commissions.specialty")}</TableHead>
                  <TableHead>{t("admin.commissions.type")}</TableHead>
                  <TableHead>{t("admin.commissions.value")}</TableHead>
                  <TableHead>{t("table.status")}</TableHead>
                  <TableHead>{t("table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.map((commission) => (
                  <TableRow
                    key={commission.id}
                    className={
                      !commission.isActive ? "opacity-60 bg-muted/30" : ""
                    }
                  >
                    <TableCell className="font-medium">
                      {commission.doctorProfile?.user.fullName || "-"}
                    </TableCell>
                    <TableCell>
                      {commission.doctorProfile?.specialty
                        ? getLocalizedText(
                            commission.doctorProfile.specialty.name,
                            locale,
                          )
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        {commission.commissionType === "FIXED" ? (
                          <DollarSign className="h-3 w-3" />
                        ) : (
                          <Percent className="h-3 w-3" />
                        )}
                        {commission.commissionType === "FIXED"
                          ? t("admin.commissions.fixed")
                          : t("admin.commissions.percentage")}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCommissionValue(commission)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {togglingId === commission.id && updateCommission.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : (
                          <Switch
                            checked={commission.isActive}
                            onCheckedChange={() => handleToggleActive(commission)}
                            disabled={updateCommission.isPending}
                          />
                        )}
                        <Badge
                          variant={
                            commission.isActive ? "success" : "secondary"
                          }
                          className="text-xs"
                        >
                          {commission.isActive
                            ? t("common.active")
                            : t("common.inactive")}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(commission)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-error-600"
                          onClick={() => setDeleteId(commission.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

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
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCommission
                ? t("admin.commissions.edit")
                : t("admin.commissions.addNew")}
            </DialogTitle>
            <DialogDescription>
              {t("admin.commissions.formDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!editingCommission && (
              <div>
                <Label>{t("admin.commissions.selectDoctor")} *</Label>
                <Select
                  value={formData.doctorProfileId}
                  onValueChange={(value) =>
                    setFormData((f) => ({ ...f, doctorProfileId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        "admin.commissions.selectDoctorPlaceholder",
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDoctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.user.fullName} -{" "}
                        {getLocalizedText(doctor.specialty.name, locale)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>{t("admin.commissions.type")} *</Label>
              <Select
                value={formData.commissionType}
                onValueChange={(value: CommissionType) =>
                  setFormData((f) => ({ ...f, commissionType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIXED">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      {t("admin.commissions.fixed")}
                    </div>
                  </SelectItem>
                  <SelectItem value="PERCENTAGE">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      {t("admin.commissions.percentage")}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>
                {formData.commissionType === "FIXED"
                  ? t("admin.commissions.fixedValue")
                  : t("admin.commissions.percentageValue")}{" "}
                *
              </Label>
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                step={formData.commissionType === "FIXED" ? "1" : "0.1"}
                value={formData.commissionValue}
                onChange={(e) =>
                  setFormData((f) => ({
                    ...f,
                    commissionValue: e.target.value,
                  }))
                }
                placeholder={
                  formData.commissionType === "FIXED"
                    ? t("admin.commissions.fixedPlaceholder")
                    : t("admin.commissions.percentagePlaceholder")
                }
                dir="ltr"
              />
              {formData.commissionType === "PERCENTAGE" && (
                <p className="text-xs text-muted-foreground mt-1">
                  {t("admin.commissions.percentageHint")}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((f) => ({ ...f, isActive: checked }))
                }
              />
              <Label>{t("admin.commissions.activeLabel")}</Label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                (!editingCommission && !formData.doctorProfileId) ||
                !formData.commissionValue ||
                parseFloat(formData.commissionValue) <= 0 ||
                createCommission.isPending ||
                updateCommission.isPending
              }
            >
              {(createCommission.isPending || updateCommission.isPending) && (
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
              )}
              {editingCommission ? t("common.update") : t("common.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.commissions.delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.commissions.deleteConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
    </>
  );
}
