"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  Store,
  Tag,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  useMyPharmacies,
  useMyProducts,
  useDeleteProduct,
  OwnerProductFilters,
} from "../hooks";
import { usePublicCategories } from "@/features/admin/hooks";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useTranslation } from "@/lib/i18n";

export function PharmacyProductsList() {
  const { t, locale } = useTranslation();

  const [selectedPharmacy, setSelectedPharmacy] = useState<string>("");
  const [filters, setFilters] = useState<OwnerProductFilters>({
    page: 1,
    limit: 10,
  });
  const [searchInput, setSearchInput] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Get pharmacies for selection
  const { data: pharmaciesData, isLoading: pharmaciesLoading } =
    useMyPharmacies({ limit: 100 });
  const pharmacies = pharmaciesData?.data || [];

  // Get products for selected pharmacy
  const {
    data: productsData,
    isLoading: productsLoading,
    isError,
  } = useMyProducts(selectedPharmacy, filters);

  // Get categories for display
  const { data: categories } = usePublicCategories();

  const deleteProduct = useDeleteProduct(selectedPharmacy);

  const handleSearch = useCallback(() => {
    setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
  }, [searchInput]);

  const handleDelete = () => {
    if (!deleteId) return;
    deleteProduct.mutate(deleteId, {
      onSuccess: () => setDeleteId(null),
    });
  };

  // Auto-select first pharmacy
  if (pharmacies.length > 0 && !selectedPharmacy) {
    setSelectedPharmacy(pharmacies[0].id);
  }

  if (pharmaciesLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (pharmacies.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Store className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {t("pharmacyOwner.noPharmacies")}
          </h3>
          <p className="text-muted-foreground mb-4">
            {t("pharmacyOwner.pendingApproval")}
          </p>
          <Button asChild>
            <Link href="/pharmacy-owner/pharmacies/create">
              <Plus className="h-4 w-4 me-2" />
              {t("pharmacyOwner.addPharmacy")}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const products = productsData?.data || [];
  const meta = productsData?.meta;

  return (
    <>
      {/* Pharmacy Selector + Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Pharmacy select */}
            <Select
              value={selectedPharmacy}
              onValueChange={(v) => {
                setSelectedPharmacy(v);
                setFilters({ page: 1, limit: 10 });
                setSearchInput("");
              }}
            >
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder={t("pharmacyOwner.selectPharmacy")} />
              </SelectTrigger>
              <SelectContent>
                {pharmacies.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {getLocalizedText(p.name, locale)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Search */}
            <div className="flex-1 flex gap-2">
              <Input
                placeholder={t("common.search")}
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

            {/* Add Product */}
            {selectedPharmacy && (
              <Button asChild>
                <Link
                  href={`/pharmacy-owner/products/create?pharmacyId=${selectedPharmacy}`}
                >
                  <Plus className="h-4 w-4 me-2" />
                  {t("pharmacyOwner.addProduct")}
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {productsLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-16 w-16 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <Card className="border-error-200 bg-error-50">
          <CardContent className="py-10 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-error-500 mb-4" />
            <p className="text-error-600">{t("admin.loadError")}</p>
          </CardContent>
        </Card>
      )}

      {/* Products List */}
      {!productsLoading && !isError && selectedPharmacy && (
        <>
          {/* Count */}
          {meta && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {t("admin.pharmacies.totalResults")}{" "}
                <span className="font-semibold">{meta.total}</span>
              </p>
            </div>
          )}

          {products.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t("pharmacyOwner.noProducts")}
                </h3>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* Icon */}
                      <div className="h-16 w-16 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-lg font-semibold text-foreground">
                            {getLocalizedText(product.name, locale)}
                          </h3>
                          {!product.isActive && (
                            <Badge variant="secondary">
                              {t("common.inactive")}
                            </Badge>
                          )}
                          {product.requiresPrescription && (
                            <Badge variant="warning">
                              {t("pharmacyOwner.requiresPrescription")}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <span className="font-semibold text-foreground">
                            {product.discountPrice || product.price}{" "}
                            {t("common.egp")}
                            {product.discountPrice && (
                              <span className="line-through text-muted-foreground ms-1">
                                {product.price}
                              </span>
                            )}
                          </span>
                          <span>
                            {t("pharmacyOwner.stockQuantity")}:{" "}
                            {product.stockQuantity}
                          </span>
                          {product.category && (
                            <span className="flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              {getLocalizedText(product.category.name, locale)}
                            </span>
                          )}
                          {product.sku && <span>SKU: {product.sku}</span>}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4 md:mt-0">
                        <Button asChild size="sm" variant="outline">
                          <Link
                            href={`/pharmacy-owner/products/${product.id}/edit?pharmacyId=${selectedPharmacy}`}
                          >
                            <Pencil className="h-4 w-4 me-1" />
                            {t("common.edit")}
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteId(product.id)}
                          className="text-error-600 border-error-300 hover:bg-error-50"
                        >
                          <Trash2 className="h-4 w-4 me-1" />
                          {t("common.delete")}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <PaginationControls
            meta={meta}
            page={filters.page || 1}
            onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
            limit={filters.limit || 10}
            onLimitChange={(l) =>
              setFilters((prev) => ({ ...prev, limit: l, page: 1 }))
            }
          />
        </>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("common.deleteWarning")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-error-600 hover:bg-error-700"
              disabled={deleteProduct.isPending}
            >
              {deleteProduct.isPending && (
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
