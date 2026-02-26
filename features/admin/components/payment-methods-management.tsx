"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Frown, Loader2, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAdminPaymentMethods,
  useCreatePaymentMethod,
  useUpdatePaymentMethod,
  useDeletePaymentMethod,
} from "../hooks";
import { PaymentMethodModel, Multilingual } from "@/types";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useTranslation } from "@/lib/i18n";

interface PaymentMethodFormData {
  nameAr: string;
  nameEn: string;
  code: string;
  icon: string;
  sortOrder: string;
}

const initialFormData: PaymentMethodFormData = {
  nameAr: "",
  nameEn: "",
  code: "",
  icon: "",
  sortOrder: "0",
};

export function PaymentMethodsManagement() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState<string | undefined>();
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>();
  const {
    data: methodsResponse,
    isLoading,
    isError,
  } = useAdminPaymentMethods({ page, limit, search, isActive: isActiveFilter });
  const methods = methodsResponse?.data || [];
  const meta = methodsResponse?.meta;

  const handleSearch = () => {
    setSearch(searchInput || undefined);
    setPage(1);
  };
  const createMethod = useCreatePaymentMethod();
  const updateMethod = useUpdatePaymentMethod();
  const deleteMethod = useDeletePaymentMethod();

  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethodModel | null>(
    null,
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] =
    useState<PaymentMethodFormData>(initialFormData);

  const handleOpenCreate = () => {
    setEditingMethod(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (method: PaymentMethodModel) => {
    setEditingMethod(method);
    setFormData({
      nameAr: method.name.ar,
      nameEn: method.name.en,
      code: method.code,
      icon: method.icon || "",
      sortOrder: method.sortOrder.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    const name: Multilingual = { ar: formData.nameAr, en: formData.nameEn };

    if (editingMethod) {
      updateMethod.mutate(
        {
          id: editingMethod.id,
          name,
          code: formData.code || undefined,
          icon: formData.icon || undefined,
          sortOrder: formData.sortOrder
            ? parseInt(formData.sortOrder)
            : undefined,
        },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            setEditingMethod(null);
            setFormData(initialFormData);
          },
        },
      );
    } else {
      createMethod.mutate(
        {
          name,
          code: formData.code,
          icon: formData.icon || undefined,
          sortOrder: formData.sortOrder
            ? parseInt(formData.sortOrder)
            : undefined,
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
    deleteMethod.mutate(deleteId, {
      onSuccess: () => setDeleteId(null),
    });
  };

  const handleToggleActive = (method: PaymentMethodModel) => {
    setTogglingId(method.id);
    updateMethod.mutate(
      {
        id: method.id,
        isActive: !method.isActive,
      },
      { onSettled: () => setTogglingId(null) },
    );
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              {t("paymentMethods.title")} ({meta?.total || 0})
            </h3>
            <Button onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 me-2" />
              {t("paymentMethods.addNew")}
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder={t("prepayment.searchPlaceholder")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Select
              value={
                isActiveFilter === undefined ? "all" : isActiveFilter.toString()
              }
              onValueChange={(value) => {
                setIsActiveFilter(
                  value === "all" ? undefined : value === "true",
                );
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={t("table.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                <SelectItem value="true">{t("common.active")}</SelectItem>
                <SelectItem value="false">{t("common.inactive")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {methods.length === 0 ? (
            <div className="text-center py-10">
              <Frown className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">
                {t("paymentMethods.noMethods")}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("paymentMethods.nameAr")}</TableHead>
                    <TableHead>{t("paymentMethods.nameEn")}</TableHead>
                    <TableHead>{t("paymentMethods.code")}</TableHead>
                    <TableHead>{t("paymentMethods.icon")}</TableHead>
                    <TableHead>{t("table.status")}</TableHead>
                    <TableHead>{t("table.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {methods
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((method) => (
                      <TableRow
                        key={method.id}
                        className={
                          !method.isActive ? "opacity-60 bg-muted/30" : ""
                        }
                      >
                        <TableCell className="font-medium">
                          {method.name.ar}
                        </TableCell>
                        <TableCell>{method.name.en}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="font-mono text-xs"
                          >
                            {method.code}
                          </Badge>
                        </TableCell>
                        <TableCell>{method.icon || "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {togglingId === method.id &&
                            updateMethod.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : (
                              <Switch
                                checked={method.isActive}
                                onCheckedChange={() =>
                                  handleToggleActive(method)
                                }
                                disabled={updateMethod.isPending}
                              />
                            )}
                            <Badge
                              variant={
                                method.isActive ? "success" : "secondary"
                              }
                              className="text-xs"
                            >
                              {method.isActive
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
                              onClick={() => handleOpenEdit(method)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-error-600"
                              onClick={() => setDeleteId(method.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
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
              {editingMethod
                ? t("paymentMethods.editMethod")
                : t("paymentMethods.addNew")}
            </DialogTitle>
            <DialogDescription>{t("prepayment.formDesc")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="nameAr" required>
                  {t("paymentMethods.nameAr")}
                </Label>
                <Input
                  id="nameAr"
                  value={formData.nameAr}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, nameAr: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="nameEn" required>
                  {t("paymentMethods.nameEn")}
                </Label>
                <Input
                  id="nameEn"
                  value={formData.nameEn}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, nameEn: e.target.value }))
                  }
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="code" required>
                  {t("paymentMethods.code")}
                </Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      code: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="INSTAPAY"
                  dir="ltr"
                  disabled={!!editingMethod}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t("paymentMethods.codeHint")}
                </p>
              </div>
              <div>
                <Label htmlFor="icon">{t("paymentMethods.icon")}</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, icon: e.target.value }))
                  }
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="sortOrder">{t("paymentMethods.sortOrder")}</Label>
              <Input
                id="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, sortOrder: e.target.value }))
                }
                dir="ltr"
                className="w-32"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !formData.nameAr ||
                !formData.nameEn ||
                !formData.code ||
                createMethod.isPending ||
                updateMethod.isPending
              }
            >
              {(createMethod.isPending || updateMethod.isPending) && (
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
              )}
              {editingMethod ? t("common.update") : t("common.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("paymentMethods.deleteConfirm")}
              <br />
              <span className="text-warning-600 dark:text-warning-400 text-sm mt-1 block">
                {t("paymentMethods.deleteWarning")}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-error-600 hover:bg-error-700"
              disabled={deleteMethod.isPending}
            >
              {deleteMethod.isPending && (
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
