"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  Pencil,
  Trash2,
  Store,
  Tag,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ConfirmDialog,
  Currency,
  ListSkeleton,
  PharmacyEmptyState,
  PharmacyErrorState,
  RefreshButton,
  StockBadge,
} from "@/components/pharmacy";
import { PaginationControls } from "@/components/ui/pagination-controls";
import {
  useMyPharmacies,
  useMyProducts,
  useDeleteProduct,
  type OwnerProductFilters,
} from "../hooks";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { useTranslation } from "@/lib/i18n";
import { pharmacyProductKeys } from "@/lib/query-keys";
import type { PharmacyProduct } from "@/types/product";

export function PharmacyProductsList() {
  const { t, locale } = useTranslation();
  const queryClient = useQueryClient();

  const [selectedPharmacy, setSelectedPharmacy] = useState("");
  const [filters, setFilters] = useState<OwnerProductFilters>({
    page: 1,
    limit: 10,
  });
  const [searchInput, setSearchInput] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: pharmaciesData, isLoading: pharmaciesLoading } =
    useMyPharmacies({ limit: 100 });
  const pharmacies = pharmaciesData?.data ?? [];

  // Default first pharmacy in an effect (no setState during render).
  useEffect(() => {
    if (!selectedPharmacy && pharmacies.length > 0) {
      setSelectedPharmacy(pharmacies[0].id);
    }
  }, [pharmacies, selectedPharmacy]);

  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
  } = useMyProducts(selectedPharmacy, filters);
  const deleteProduct = useDeleteProduct(selectedPharmacy);

  const handleSearch = useCallback(() => {
    setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
  }, [searchInput]);

  const handleRefresh = useMemo(
    () => async () => {
      if (!selectedPharmacy) return;
      await queryClient.invalidateQueries({
        queryKey: pharmacyProductKeys.lists(selectedPharmacy),
      });
    },
    [queryClient, selectedPharmacy],
  );

  const confirmDelete = async () => {
    if (!deleteId) return;
    await deleteProduct.mutateAsync(deleteId);
  };

  if (pharmaciesLoading) {
    return <ListSkeleton rows={4} />;
  }

  if (pharmacies.length === 0) {
    return (
      <PharmacyEmptyState
        icon={Store}
        title={t("pharmacyOwner.noPharmacies")}
        description={t("pharmacyOwner.pendingApproval")}
        action={
          <Button asChild className="min-h-[44px] sm:min-h-9">
            <Link href="/pharmacy-owner/pharmacies/create">
              <Plus className="me-2 size-4" aria-hidden="true" />
              {t("pharmacyOwner.addPharmacy")}
            </Link>
          </Button>
        }
      />
    );
  }

  const products = productsData?.data ?? [];
  const meta = productsData?.meta;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Sticky filter bar (mobile) */}
      <Card className="sticky top-0 z-10 border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:static sm:bg-card sm:backdrop-blur-none">
        <CardContent className="space-y-3 p-3 sm:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <Select
              value={selectedPharmacy}
              onValueChange={(v) => {
                setSelectedPharmacy(v);
                setFilters({ page: 1, limit: 10 });
                setSearchInput("");
              }}
            >
              <SelectTrigger
                className="min-h-[44px] w-full sm:min-h-9 md:w-64"
                aria-label={t("pharmacyOwner.selectPharmacy")}
              >
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

            <div className="flex flex-1 gap-2">
              <Input
                placeholder={t("common.search")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                inputMode="search"
                className="min-h-[44px] flex-1 sm:min-h-9"
                aria-label={t("common.search")}
              />
              <Button
                onClick={handleSearch}
                variant="outline"
                aria-label={t("common.search")}
                className="min-h-[44px] min-w-[44px] sm:min-h-9 sm:min-w-9"
              >
                <Search className="size-4" aria-hidden="true" />
              </Button>
              <RefreshButton onRefresh={handleRefresh} />
            </div>

            {selectedPharmacy ? (
              <Button asChild className="min-h-[44px] sm:min-h-9">
                <Link
                  href={`/pharmacy-owner/products/create?pharmacyId=${selectedPharmacy}`}
                >
                  <Plus className="me-2 size-4" aria-hidden="true" />
                  {t("pharmacyOwner.addProduct")}
                </Link>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Body */}
      {productsLoading ? (
        <ListSkeleton rows={5} />
      ) : productsError ? (
        <PharmacyErrorState onRetry={handleRefresh} />
      ) : !selectedPharmacy ? null : products.length === 0 ? (
        <PharmacyEmptyState
          icon={Package}
          title={t("pharmacyOwner.noProducts")}
        />
      ) : (
        <>
          {meta ? (
            <p className="text-sm text-muted-foreground">
              {t("admin.pharmacies.totalResults")}{" "}
              <span className="font-semibold text-foreground">
                {meta.total}
              </span>
            </p>
          ) : null}

          <div className="space-y-3 sm:space-y-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                pharmacyId={selectedPharmacy}
                onDelete={() => setDeleteId(product.id)}
              />
            ))}
          </div>

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

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t("common.confirmDelete")}
        description={t("common.deleteWarning")}
        tone="destructive"
        confirmLabel={t("common.delete")}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

interface ProductCardProps {
  product: PharmacyProduct;
  pharmacyId: string;
  onDelete: () => void;
}

function ProductCard({ product, pharmacyId, onDelete }: ProductCardProps) {
  const { t, locale } = useTranslation();
  const stock = product.stockQuantity ?? 0;
  const lowThreshold = product.lowStockThreshold ?? 5;

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div
            className="grid size-14 shrink-0 place-items-center rounded-xl bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 sm:size-16"
            aria-hidden="true"
          >
            <Package className="size-7 sm:size-8" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-semibold text-foreground sm:text-lg">
                {getLocalizedText(product.name, locale)}
              </h3>
              {!product.isActive ? (
                <Badge variant="secondary">{t("common.inactive")}</Badge>
              ) : null}
              {product.requiresPrescription ? (
                <Badge variant="warning">
                  {t("pharmacyOwner.requiresPrescription")}
                </Badge>
              ) : null}
              <StockBadge stock={stock} lowThreshold={lowThreshold} />
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                <Currency amount={product.discountPrice || product.price} />
                {product.discountPrice ? (
                  <span className="ms-2 text-sm font-normal text-muted-foreground line-through">
                    <Currency amount={product.price} />
                  </span>
                ) : null}
              </span>
              {product.category ? (
                <span className="inline-flex items-center gap-1">
                  <Tag className="size-3" aria-hidden="true" />
                  {getLocalizedText(product.category.name, locale)}
                </span>
              ) : null}
              {product.sku ? <span>SKU: {product.sku}</span> : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:flex-nowrap">
            <Button
              asChild
              size="sm"
              variant="outline"
              className="min-h-[44px] sm:min-h-9"
            >
              <Link
                href={`/pharmacy-owner/products/${product.id}/edit?pharmacyId=${pharmacyId}`}
              >
                <Pencil className="me-1 size-4" aria-hidden="true" />
                {t("common.edit")}
              </Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onDelete}
              className="min-h-[44px] border-error-300 text-error-600 hover:bg-error-50 sm:min-h-9"
            >
              <Trash2 className="me-1 size-4" aria-hidden="true" />
              {t("common.delete")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
