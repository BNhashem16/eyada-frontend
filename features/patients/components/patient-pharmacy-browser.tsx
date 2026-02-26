"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Search,
  Star,
  ShoppingCart,
  Loader2,
  Package,
  MapPin,
  Truck,
  FileText,
  Store,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PaginationControls } from "@/components/ui/pagination-controls";
import {
  usePublicPharmacies,
  usePublicProducts,
  useCategories,
  useAddToCart,
  type PharmacyBrowseFilters,
  type ProductBrowseFilters,
} from "../hooks";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { getImageUrl } from "@/lib/utils/storage";
import { useTranslation } from "@/lib/i18n";
import type { Pharmacy } from "@/types/pharmacy";
import type { PharmacyProduct } from "@/types/product";
import type { PharmacyCategory } from "@/types/category";

// --- Debounce hook (inline since useDebounce doesn't exist in the project) ---

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// --- Main Component ---

export function PatientPharmacyBrowser() {
  const { t, locale } = useTranslation();
  const [activeTab, setActiveTab] = useState<"pharmacies" | "products">(
    "products",
  );

  // Pharmacy filters
  const [pharmacySearch, setPharmacySearch] = useState("");
  const [pharmacyPage, setPharmacyPage] = useState(1);
  const [pharmacyLimit, setPharmacyLimit] = useState(12);

  // Product filters
  const [productSearch, setProductSearch] = useState("");
  const [productPage, setProductPage] = useState(1);
  const [productLimit, setProductLimit] = useState(12);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedPharmacy, setSelectedPharmacy] = useState<string>("");

  // Debounce search values
  const debouncedPharmacySearch = useDebounce(pharmacySearch, 400);
  const debouncedProductSearch = useDebounce(productSearch, 400);

  // Reset page when filters change
  useEffect(() => {
    setPharmacyPage(1);
  }, [debouncedPharmacySearch]);

  useEffect(() => {
    setProductPage(1);
  }, [debouncedProductSearch, selectedCategory, selectedPharmacy]);

  // Build filter objects
  const pharmacyFilters: PharmacyBrowseFilters = {
    search: debouncedPharmacySearch || undefined,
    page: pharmacyPage,
    limit: pharmacyLimit,
  };

  const productFilters: ProductBrowseFilters = {
    search: debouncedProductSearch || undefined,
    categoryId: selectedCategory || undefined,
    pharmacyId: selectedPharmacy || undefined,
    page: productPage,
    limit: productLimit,
  };

  // Queries
  const pharmaciesQuery = usePublicPharmacies(pharmacyFilters);
  const productsQuery = usePublicProducts(productFilters);
  const categoriesQuery = useCategories();
  const addToCart = useAddToCart();

  // When a pharmacy is clicked from pharmacies tab, switch to products tab and filter by it
  const handleViewPharmacyProducts = useCallback((pharmacyId: string) => {
    setSelectedPharmacy(pharmacyId);
    setActiveTab("products");
    setProductPage(1);
  }, []);

  const handleAddToCart = useCallback(
    (productId: string) => {
      addToCart.mutate({ productId, quantity: 1 });
    },
    [addToCart],
  );

  const categories = categoriesQuery.data || [];

  return (
    <div className="space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "pharmacies" | "products")}
      >
        <TabsList className="grid w-full grid-cols-2 max-w-xs">
          <TabsTrigger value="products">
            <Package className="h-4 w-4 me-2" />
            {t("pharmacyOwner.products")}
          </TabsTrigger>
          <TabsTrigger value="pharmacies">
            <Store className="h-4 w-4 me-2" />
            {t("pharmacyOwner.pharmacies")}
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4 mt-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("pharmacyOwner.searchProducts")}
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="ps-10"
            />
          </div>

          {/* Category pills */}
          <CategoryPills
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
            locale={locale}
            t={t}
          />

          {/* Selected pharmacy indicator */}
          {selectedPharmacy && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Store className="h-3 w-3" />
                {t("pharmacyOwner.pharmacyInfo")}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPharmacy("")}
              >
                {t("common.all")}
              </Button>
            </div>
          )}

          {/* Products grid */}
          {productsQuery.isLoading ? (
            <ProductsGridSkeleton />
          ) : productsQuery.data?.data?.length === 0 ? (
            <EmptyState
              icon={Package}
              title={t("pharmacyOwner.noProductsFound")}
              description={t("pharmacyOwner.noProductsMatchFilters")}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {productsQuery.data?.data?.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    locale={locale}
                    t={t}
                    onAddToCart={handleAddToCart}
                    isAdding={
                      addToCart.isPending &&
                      addToCart.variables?.productId === product.id
                    }
                  />
                ))}
              </div>
              <PaginationControls
                meta={productsQuery.data?.meta}
                page={productPage}
                onPageChange={setProductPage}
                limit={productLimit}
                onLimitChange={(l) => {
                  setProductLimit(l);
                  setProductPage(1);
                }}
                limitOptions={[12, 24, 36]}
              />
            </>
          )}
        </TabsContent>

        {/* Pharmacies Tab */}
        <TabsContent value="pharmacies" className="space-y-4 mt-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("pharmacyOwner.searchPharmacies")}
              value={pharmacySearch}
              onChange={(e) => setPharmacySearch(e.target.value)}
              className="ps-10"
            />
          </div>

          {/* Pharmacies grid */}
          {pharmaciesQuery.isLoading ? (
            <PharmaciesGridSkeleton />
          ) : pharmaciesQuery.data?.data?.length === 0 ? (
            <EmptyState
              icon={Store}
              title={t("pharmacyOwner.noPharmacies")}
              description=""
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pharmaciesQuery.data?.data?.map((pharmacy) => (
                  <PharmacyCard
                    key={pharmacy.id}
                    pharmacy={pharmacy}
                    locale={locale}
                    t={t}
                    onViewProducts={handleViewPharmacyProducts}
                  />
                ))}
              </div>
              <PaginationControls
                meta={pharmaciesQuery.data?.meta}
                page={pharmacyPage}
                onPageChange={setPharmacyPage}
                limit={pharmacyLimit}
                onLimitChange={(l) => {
                  setPharmacyLimit(l);
                  setPharmacyPage(1);
                }}
                limitOptions={[12, 24, 36]}
              />
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// --- Sub-components ---

function CategoryPills({
  categories,
  selectedCategory,
  onSelect,
  locale,
  t,
}: {
  categories: PharmacyCategory[];
  selectedCategory: string;
  onSelect: (id: string) => void;
  locale: string;
  t: (key: string) => string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (categories.length === 0) return null;

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin"
    >
      <Button
        variant={selectedCategory === "" ? "default" : "outline"}
        size="sm"
        className="whitespace-nowrap shrink-0"
        onClick={() => onSelect("")}
      >
        {t("pharmacyOwner.allCategories")}
      </Button>
      {categories.map((cat) => (
        <Button
          key={cat.id}
          variant={selectedCategory === cat.id ? "default" : "outline"}
          size="sm"
          className="whitespace-nowrap shrink-0"
          onClick={() => onSelect(cat.id)}
        >
          {getLocalizedText(cat.name, locale)}
        </Button>
      ))}
    </div>
  );
}

function ProductCard({
  product,
  locale,
  t,
  onAddToCart,
  isAdding,
}: {
  product: PharmacyProduct;
  locale: string;
  t: (key: string) => string;
  onAddToCart: (productId: string) => void;
  isAdding: boolean;
}) {
  const hasDiscount =
    product.discountPrice &&
    Number(product.discountPrice) < Number(product.price);
  const isOutOfStock = product.stockQuantity <= 0;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {/* Product image */}
      {product.images?.[0] ? (
        <div className="aspect-square bg-muted relative overflow-hidden">
          <img
            src={getImageUrl(product.images[0])}
            alt={getLocalizedText(product.name, locale)}
            className="w-full h-full object-cover"
          />
          {product.requiresPrescription && (
            <Badge
              variant="destructive"
              className="absolute top-2 start-2 gap-1"
            >
              <FileText className="h-3 w-3" />
              {t("pharmacyOwner.prescriptionBadge")}
            </Badge>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Badge variant="secondary" className="text-sm">
                {t("pharmacyOwner.outOfStock")}
              </Badge>
            </div>
          )}
        </div>
      ) : (
        <div className="aspect-square bg-muted flex items-center justify-center relative">
          <Package className="h-12 w-12 text-muted-foreground/30" />
          {product.requiresPrescription && (
            <Badge
              variant="destructive"
              className="absolute top-2 start-2 gap-1"
            >
              <FileText className="h-3 w-3" />
              {t("pharmacyOwner.prescriptionBadge")}
            </Badge>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Badge variant="secondary" className="text-sm">
                {t("pharmacyOwner.outOfStock")}
              </Badge>
            </div>
          )}
        </div>
      )}

      <CardContent className="p-4 space-y-3">
        {/* Name */}
        <h3 className="font-semibold text-foreground line-clamp-2 min-h-[2.5rem]">
          {getLocalizedText(product.name, locale)}
        </h3>

        {/* Pharmacy name */}
        {product.pharmacy && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Store className="h-3 w-3" />
            {getLocalizedText(product.pharmacy.name, locale)}
          </p>
        )}

        {/* Category */}
        {product.category && (
          <Badge variant="outline" className="text-xs">
            {getLocalizedText(product.category.name, locale)}
          </Badge>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary">
            {Number(displayPrice).toFixed(2)} {t("common.egp")}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {Number(product.price).toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock status */}
        {!isOutOfStock && (
          <p className="text-xs text-green-600 dark:text-green-400">
            {t("pharmacyOwner.inStock")}
          </p>
        )}

        {/* Add to cart */}
        <Button
          className="w-full"
          size="sm"
          disabled={isOutOfStock || isAdding}
          onClick={() => onAddToCart(product.id)}
        >
          {isAdding ? (
            <Loader2 className="h-4 w-4 animate-spin me-2" />
          ) : (
            <ShoppingCart className="h-4 w-4 me-2" />
          )}
          {t("pharmacyOwner.addToCart")}
        </Button>
      </CardContent>
    </Card>
  );
}

function PharmacyCard({
  pharmacy,
  locale,
  t,
  onViewProducts,
}: {
  pharmacy: Pharmacy;
  locale: string;
  t: (key: string) => string;
  onViewProducts: (pharmacyId: string) => void;
}) {
  const deliveryFee = Number(pharmacy.deliveryFee);

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {/* Logo / header */}
      <div className="h-32 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative">
        {pharmacy.logo ? (
          <img
            src={getImageUrl(pharmacy.logo!)}
            alt={getLocalizedText(pharmacy.name, locale)}
            className="h-20 w-20 rounded-full object-cover border-2 border-background shadow"
          />
        ) : (
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Store className="h-10 w-10 text-primary/40" />
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Name */}
        <h3 className="font-semibold text-foreground text-lg text-center">
          {getLocalizedText(pharmacy.name, locale)}
        </h3>

        {/* Address */}
        <p className="text-sm text-muted-foreground flex items-center gap-1 justify-center">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">
            {getLocalizedText(pharmacy.address, locale)}
          </span>
        </p>

        {/* City */}
        {pharmacy.city && (
          <p className="text-xs text-muted-foreground text-center">
            {getLocalizedText(pharmacy.city.name, locale)}
            {pharmacy.city.state &&
              ` - ${getLocalizedText(pharmacy.city.state.name, locale)}`}
          </p>
        )}

        {/* Rating */}
        {pharmacy.totalRatings > 0 && (
          <div className="flex items-center justify-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">
              {Number(pharmacy.averageRating).toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">
              ({pharmacy.totalRatings})
            </span>
          </div>
        )}

        {/* Delivery info */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <Badge variant="outline" className="gap-1">
            <Truck className="h-3 w-3" />
            {deliveryFee > 0
              ? `${deliveryFee.toFixed(2)} ${t("common.egp")}`
              : t("pharmacyOwner.freeDeliveryBadge")}
          </Badge>
          {Number(pharmacy.minOrderAmount) > 0 && (
            <Badge variant="outline" className="gap-1">
              {t("pharmacyOwner.minOrder")}:{" "}
              {Number(pharmacy.minOrderAmount).toFixed(2)} {t("common.egp")}
            </Badge>
          )}
        </div>

        {/* Product count */}
        {pharmacy._count?.products !== undefined && (
          <p className="text-xs text-muted-foreground text-center">
            {pharmacy._count.products} {t("pharmacyOwner.products")}
          </p>
        )}

        {/* View products button */}
        <Button
          variant="outline"
          className="w-full"
          size="sm"
          onClick={() => onViewProducts(pharmacy.id)}
        >
          <Package className="h-4 w-4 me-2" />
          {t("pharmacyOwner.viewProducts")}
        </Button>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="py-16 text-center">
        <Icon className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        {description && <p className="text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}

// --- Loading skeletons ---

function ProductsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-square w-full" />
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PharmaciesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="h-32 w-full" />
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-6 w-2/3 mx-auto" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
