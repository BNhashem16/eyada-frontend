"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import {
  Package,
  DollarSign,
  Loader2,
  AlertTriangle,
  ImageIcon,
  Upload,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useMyProduct, useUpdateProduct, useImageUpload } from "../hooks";
import { usePublicCategories } from "@/features/admin/hooks";
import { useTranslation } from "@/lib/i18n";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { getImageUrl } from "@/lib/utils/storage";

const getProductSchema = (t: (key: string) => string) =>
  z.object({
    nameAr: z.string().min(2, t("validation.required")).max(200),
    nameEn: z.string().min(2, t("validation.required")).max(200),
    descriptionAr: z.string().max(2000).optional().or(z.literal("")),
    descriptionEn: z.string().max(2000).optional().or(z.literal("")),
    categoryId: z.string().optional().or(z.literal("")),
    sku: z.string().max(50).optional().or(z.literal("")),
    barcode: z.string().max(50).optional().or(z.literal("")),
    price: z.coerce.number().min(0.01, t("validation.required")).max(100000),
    discountPrice: z.coerce
      .number()
      .min(0)
      .max(100000)
      .optional()
      .or(z.literal("")),
    stockQuantity: z.coerce.number().int().min(0).optional().or(z.literal("")),
    lowStockThreshold: z.coerce
      .number()
      .int()
      .min(0)
      .optional()
      .or(z.literal("")),
    requiresPrescription: z.boolean(),
    isActive: z.boolean(),
  });

type ProductFormData = z.infer<ReturnType<typeof getProductSchema>>;

interface UploadedImage {
  url: string;
  fileKey: string;
}

interface EditProductFormProps {
  productId: string;
}

export function EditProductForm({ productId }: EditProductFormProps) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pharmacyId = searchParams.get("pharmacyId") || "";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: product,
    isLoading,
    isError,
  } = useMyProduct(pharmacyId, productId);
  const updateMutation = useUpdateProduct(pharmacyId);
  const { data: categories } = usePublicCategories();
  const { uploadImage, isUploading, progress } = useImageUpload();

  const [formReady, setFormReady] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [selectedParentCategoryId, setSelectedParentCategoryId] =
    useState<string>("");

  const productSchema = getProductSchema(t);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nameAr: "",
      nameEn: "",
      descriptionAr: "",
      descriptionEn: "",
      categoryId: "",
      sku: "",
      barcode: "",
      price: "" as any,
      discountPrice: "",
      stockQuantity: 0,
      lowStockThreshold: 5,
      requiresPrescription: false,
      isActive: true,
    },
  });

  // Cascading categories
  const rootCategories = useMemo(
    () => (categories || []).filter((cat) => !cat.parentId),
    [categories],
  );

  const childCategories = useMemo(() => {
    if (!selectedParentCategoryId) return [];
    const parent = rootCategories.find(
      (cat) => cat.id === selectedParentCategoryId,
    );
    return parent?.children || [];
  }, [selectedParentCategoryId, rootCategories]);

  const parentCategoryOptions = rootCategories.map((cat) => ({
    value: cat.id,
    label: getLocalizedText(cat.name, locale) || "",
  }));

  const childCategoryOptions = childCategories.map((cat) => ({
    value: cat.id,
    label: getLocalizedText(cat.name, locale) || "",
  }));

  // Populate form when product data loads
  useEffect(() => {
    if (product && !formReady) {
      reset({
        nameAr: product.name?.ar || "",
        nameEn: product.name?.en || "",
        descriptionAr: product.description?.ar || "",
        descriptionEn: product.description?.en || "",
        categoryId: product.categoryId || "",
        sku: product.sku || "",
        barcode: product.barcode || "",
        price: Number(product.price) as any,
        discountPrice: product.discountPrice
          ? Number(product.discountPrice)
          : ("" as any),
        stockQuantity: product.stockQuantity ?? 0,
        lowStockThreshold: product.lowStockThreshold ?? 5,
        requiresPrescription: product.requiresPrescription ?? false,
        isActive: product.isActive ?? true,
      });

      // Restore uploaded images from existing product
      if (product.images?.length > 0) {
        setUploadedImages(
          product.images.map((key) => ({
            url: getImageUrl(key),
            fileKey: key,
          })),
        );
      }

      // Determine which parent category is selected based on product's categoryId
      if (product.categoryId && categories?.length) {
        // Check if categoryId is a root category
        const isRoot = rootCategories.find(
          (cat) => cat.id === product.categoryId,
        );
        if (isRoot) {
          setSelectedParentCategoryId(product.categoryId);
        } else {
          // Find parent of the selected category
          const parent = rootCategories.find((cat) =>
            cat.children?.some((child) => child.id === product.categoryId),
          );
          if (parent) {
            setSelectedParentCategoryId(parent.id);
          }
        }
      }

      setFormReady(true);
    }
  }, [product, formReady, reset, categories, rootCategories]);

  const handleParentCategoryChange = (value: string) => {
    setSelectedParentCategoryId(value);
    const parent = rootCategories.find((cat) => cat.id === value);
    if (!parent?.children?.length) {
      setValue("categoryId", value, { shouldDirty: true });
    } else {
      setValue("categoryId", "", { shouldDirty: true });
    }
  };

  const handleChildCategoryChange = (value: string) => {
    setValue("categoryId", value || selectedParentCategoryId, {
      shouldDirty: true,
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    for (const file of Array.from(files)) {
      if (uploadedImages.length >= 10) break;
      const result = await uploadImage(file);
      if (result) {
        setUploadedImages((prev) => [...prev, result]);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductFormData) => {
    const payload = {
      productId,
      name: { ar: data.nameAr, en: data.nameEn },
      description:
        data.descriptionAr || data.descriptionEn
          ? { ar: data.descriptionAr || "", en: data.descriptionEn || "" }
          : undefined,
      categoryId: data.categoryId || undefined,
      sku: data.sku || undefined,
      barcode: data.barcode || undefined,
      price: Number(data.price),
      discountPrice: data.discountPrice
        ? Number(data.discountPrice)
        : undefined,
      stockQuantity: data.stockQuantity ? Number(data.stockQuantity) : 0,
      lowStockThreshold: data.lowStockThreshold
        ? Number(data.lowStockThreshold)
        : 5,
      images: uploadedImages.map((img) => img.fileKey),
      requiresPrescription: data.requiresPrescription,
      isActive: data.isActive,
    };

    updateMutation.mutate(payload, {
      onSuccess: () => {
        router.push("/pharmacy-owner/products");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || (!isLoading && !product)) {
    return (
      <Card className="border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-900/20">
        <CardContent className="py-10 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-error-500 mb-4" />
          <p className="text-error-600 dark:text-error-400">
            {t("admin.loadError")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Product Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            {t("pharmacyOwner.productInfo")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nameAr" required>
              {t("pharmacyOwner.productNameAr")}
            </Label>
            <Input
              id="nameAr"
              {...register("nameAr")}
              placeholder={t("pharmacyOwner.productNameArPlaceholder")}
              className="bg-background text-foreground"
            />
            {errors.nameAr && (
              <p className="text-sm text-error-600 dark:text-error-400">
                {errors.nameAr.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nameEn" required>
              {t("pharmacyOwner.productNameEn")}
            </Label>
            <Input
              id="nameEn"
              {...register("nameEn")}
              placeholder={t("pharmacyOwner.productNameEnPlaceholder")}
              dir="ltr"
              className="bg-background text-foreground"
            />
            {errors.nameEn && (
              <p className="text-sm text-error-600 dark:text-error-400">
                {errors.nameEn.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descriptionAr">
              {t("pharmacyOwner.descriptionAr")}
            </Label>
            <Textarea
              id="descriptionAr"
              {...register("descriptionAr")}
              placeholder={t("pharmacyOwner.productDescriptionArPlaceholder")}
              className="bg-background text-foreground min-h-[80px]"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descriptionEn">
              {t("pharmacyOwner.descriptionEn")}
            </Label>
            <Textarea
              id="descriptionEn"
              {...register("descriptionEn")}
              placeholder={t("pharmacyOwner.productDescriptionEnPlaceholder")}
              dir="ltr"
              className="bg-background text-foreground min-h-[80px]"
              rows={3}
            />
          </div>

          {/* Cascading Category Selection */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("pharmacyOwner.parentCategory")}</Label>
              <SearchableSelect
                options={[
                  {
                    value: "",
                    label: t("pharmacyOwner.noParentCategory"),
                  },
                  ...parentCategoryOptions,
                ]}
                value={selectedParentCategoryId}
                onValueChange={handleParentCategoryChange}
                placeholder={t("pharmacyOwner.selectParentCategory")}
                className="bg-background text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label>{t("pharmacyOwner.subCategory")}</Label>
              <SearchableSelect
                options={
                  childCategories.length > 0
                    ? [
                        {
                          value: "",
                          label: t("pharmacyOwner.noSubCategory"),
                        },
                        ...childCategoryOptions,
                      ]
                    : []
                }
                value={watch("categoryId") || ""}
                onValueChange={handleChildCategoryChange}
                placeholder={
                  !selectedParentCategoryId
                    ? t("pharmacyOwner.selectParentFirst")
                    : t("pharmacyOwner.selectSubCategory")
                }
                className="bg-background text-foreground"
                disabled={
                  !selectedParentCategoryId || childCategories.length === 0
                }
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sku">{t("pharmacyOwner.sku")}</Label>
              <Input
                id="sku"
                {...register("sku")}
                placeholder={t("pharmacyOwner.skuPlaceholder")}
                dir="ltr"
                className="bg-background text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode">{t("pharmacyOwner.barcode")}</Label>
              <Input
                id="barcode"
                {...register("barcode")}
                placeholder={t("pharmacyOwner.barcodePlaceholder")}
                dir="ltr"
                className="bg-background text-foreground"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Stock */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            {t("pharmacyOwner.pricingInfo")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price" required>
                {t("pharmacyOwner.price")} ({t("common.egp")})
              </Label>
              <Input
                id="price"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                {...register("price")}
                placeholder={t("pharmacyOwner.pricePlaceholder")}
                dir="ltr"
                className="bg-background text-foreground"
              />
              {errors.price && (
                <p className="text-sm text-error-600 dark:text-error-400">
                  {errors.price.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountPrice">
                {t("pharmacyOwner.discountPrice")} ({t("common.egp")})
              </Label>
              <Input
                id="discountPrice"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                {...register("discountPrice")}
                placeholder={t("pharmacyOwner.discountPricePlaceholder")}
                dir="ltr"
                className="bg-background text-foreground"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="stockQuantity">
                {t("pharmacyOwner.stockQuantity")}
              </Label>
              <Input
                id="stockQuantity"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                {...register("stockQuantity")}
                placeholder={t("pharmacyOwner.stockQuantityPlaceholder")}
                dir="ltr"
                className="bg-background text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">
                {t("pharmacyOwner.lowStockThreshold")}
              </Label>
              <Input
                id="lowStockThreshold"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                {...register("lowStockThreshold")}
                placeholder={t("pharmacyOwner.lowStockThresholdPlaceholder")}
                dir="ltr"
                className="bg-background text-foreground"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ImageIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            {t("pharmacyOwner.productImages")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("pharmacyOwner.maxImages").replace("{max}", "10")}
          </p>

          {/* Uploaded images grid */}
          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {uploadedImages.map((img, index) => (
                <div
                  key={img.fileKey + index}
                  className="relative group aspect-square rounded-lg overflow-hidden border border-border"
                >
                  <Image
                    src={img.url}
                    alt={`${t("pharmacyOwner.productImages")} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 end-1 bg-error-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title={t("pharmacyOwner.removeImage")}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload button */}
          {uploadedImages.length < 10 && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                capture="environment"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("pharmacyOwner.uploadingImage")} ({progress}%)
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    {t("pharmacyOwner.uploadImage")}
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <Checkbox
              id="requiresPrescription"
              checked={watch("requiresPrescription")}
              onCheckedChange={(checked) =>
                setValue("requiresPrescription", !!checked)
              }
            />
            <Label htmlFor="requiresPrescription" className="cursor-pointer">
              {t("pharmacyOwner.requiresPrescription")}
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              id="isActive"
              checked={watch("isActive")}
              onCheckedChange={(checked) => setValue("isActive", !!checked)}
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              {t("common.active")}
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/pharmacy-owner/products")}
        >
          {t("common.cancel")}
        </Button>
        <Button
          type="submit"
          disabled={updateMutation.isPending || isUploading}
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin ms-2" />
              {t("common.saving")}
            </>
          ) : (
            t("common.saveChanges")
          )}
        </Button>
      </div>
    </form>
  );
}
