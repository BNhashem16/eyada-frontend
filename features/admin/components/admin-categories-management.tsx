"use client";

import { useState, useMemo } from "react";
import {
  Grid3X3,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ChevronRight,
  Package,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ConfirmDialog,
  ListSkeleton,
  PharmacyEmptyState,
  PharmacyErrorState,
} from "@/components/pharmacy";
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "../hooks";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { useTranslation } from "@/lib/i18n";
import type { PharmacyCategory } from "@/types/category";

interface CategoryFormData {
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string;
  parentId: string;
  sortOrder: number;
  isActive: boolean;
}

const defaultFormData: CategoryFormData = {
  nameAr: "",
  nameEn: "",
  descriptionAr: "",
  descriptionEn: "",
  icon: "",
  parentId: "",
  sortOrder: 0,
  isActive: true,
};

export function AdminCategoriesManagement() {
  const { t, locale } = useTranslation();
  const { data: categories, isLoading, isError } = useAdminCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(defaultFormData);

  // Build flat list of root categories for parent select
  const rootCategories = useMemo(
    () => (categories || []).filter((c) => !c.parentId),
    [categories],
  );

  const handleEdit = (category: PharmacyCategory) => {
    setEditingId(category.id);
    setFormData({
      nameAr: (category.name as any)?.ar || "",
      nameEn: (category.name as any)?.en || "",
      descriptionAr: (category.description as any)?.ar || "",
      descriptionEn: (category.description as any)?.en || "",
      icon: category.icon || "",
      parentId: category.parentId || "",
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    });
    setShowDialog(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData(defaultFormData);
    setShowDialog(true);
  };

  const handleSubmit = () => {
    const payload = {
      name: { ar: formData.nameAr, en: formData.nameEn },
      description:
        formData.descriptionAr || formData.descriptionEn
          ? { ar: formData.descriptionAr, en: formData.descriptionEn }
          : undefined,
      icon: formData.icon || undefined,
      parentId: formData.parentId || undefined,
      sortOrder: formData.sortOrder,
      isActive: formData.isActive,
    };

    const callbacks = {
      onSuccess: () => {
        setShowDialog(false);
        setEditingId(null);
      },
    };

    if (editingId) {
      updateCategory.mutate({ categoryId: editingId, ...payload }, callbacks);
    } else {
      createCategory.mutate(payload, callbacks);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteCategory.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const isPending = createCategory.isPending || updateCategory.isPending;

  if (isLoading) {
    return <ListSkeleton rows={4} />;
  }

  if (isError) {
    return <PharmacyErrorState />;
  }

  const allCategories = categories || [];

  const renderCategory = (category: PharmacyCategory, depth: number = 0) => (
    <div key={category.id} style={{ marginInlineStart: depth * 24 }}>
      <div className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3">
          {depth > 0 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {getLocalizedText(category.name, locale)}
              </span>
              {!category.isActive && (
                <Badge variant="secondary">{t("common.inactive")}</Badge>
              )}
              {category._count?.products !== undefined && (
                <Badge variant="outline">
                  <Package className="h-3 w-3 me-1" />
                  {category._count.products}
                </Badge>
              )}
            </div>
            {category.icon && (
              <span className="text-xs text-muted-foreground">
                {category.icon}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEdit(category)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeleteId(category.id)}
            className="text-error-600 hover:text-error-700 hover:bg-error-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {category.children?.map((child) => renderCategory(child, depth + 1))}
    </div>
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Grid3X3 className="h-5 w-5" />
              {t("admin.categories.title")}
            </CardTitle>
            <Button size="sm" onClick={handleCreate}>
              <Plus className="h-4 w-4 me-2" />
              {t("admin.categories.addCategory")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {allCategories.length === 0 ? (
            <PharmacyEmptyState
              icon={Grid3X3}
              title={t("admin.categories.noCategories")}
              description={t("admin.categories.addFirst")}
            />
          ) : (
            <div className="divide-y">
              {rootCategories.map((cat) => renderCategory(cat))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingId
                ? t("admin.categories.editCategory")
                : t("admin.categories.addCategory")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label required>{t("admin.categories.nameAr")}</Label>
              <Input
                value={formData.nameAr}
                onChange={(e) =>
                  setFormData({ ...formData, nameAr: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label required>{t("admin.categories.nameEn")}</Label>
              <Input
                value={formData.nameEn}
                onChange={(e) =>
                  setFormData({ ...formData, nameEn: e.target.value })
                }
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("admin.categories.descriptionAr")}</Label>
              <Input
                value={formData.descriptionAr}
                onChange={(e) =>
                  setFormData({ ...formData, descriptionAr: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t("admin.categories.descriptionEn")}</Label>
              <Input
                value={formData.descriptionEn}
                onChange={(e) =>
                  setFormData({ ...formData, descriptionEn: e.target.value })
                }
                dir="ltr"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("admin.categories.icon")}</Label>
                <Input
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  placeholder={t("placeholder.iconExample")}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("admin.categories.sortOrder")}</Label>
                <Input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sortOrder: parseInt(e.target.value) || 0,
                    })
                  }
                  dir="ltr"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("admin.categories.parentCategory")}</Label>
              <Select
                value={formData.parentId || "none"}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    parentId: v === "none" ? "" : v,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    {t("admin.categories.noParent")}
                  </SelectItem>
                  {rootCategories
                    .filter((c) => c.id !== editingId)
                    .map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {getLocalizedText(cat.name, locale)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending || !formData.nameAr || !formData.nameEn}
            >
              {isPending && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
              {editingId ? t("common.saveChanges") : t("common.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t("common.confirmDelete")}
        description={t("admin.categories.deleteConfirm")}
        tone="destructive"
        confirmLabel={t("common.delete")}
        onConfirm={handleDelete}
      />
    </>
  );
}
