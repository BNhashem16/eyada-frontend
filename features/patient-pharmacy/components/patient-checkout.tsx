"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Package,
  FileText,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  X,
  Truck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Currency, ListSkeleton } from "@/components/pharmacy";
import { useCart } from "../hooks";
import { useCreateOrder, usePreviewOrder } from "../hooks";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { useTranslation } from "@/lib/i18n";
import { AddressSelectCard } from "./address-select-card";
import type { PatientAddress } from "@/types/address";
import type { OrderPreviewResult } from "@/types/order";

export function PatientCheckout() {
  const { t, locale } = useTranslation();
  const router = useRouter();

  const { data: cart, isLoading } = useCart();
  const createOrder = useCreateOrder();
  const previewOrder = usePreviewOrder();

  const [selectedAddress, setSelectedAddress] = useState<PatientAddress | null>(
    null,
  );
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [prescriptionNotes, setPrescriptionNotes] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(
    null,
  );
  const [preview, setPreview] = useState<OrderPreviewResult | null>(null);

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  // Fetch preview when cart loads (no coupon)
  const fetchPreview = useCallback(
    (coupon?: string) => {
      previewOrder.mutate(
        { couponCode: coupon },
        {
          onSuccess: (result) => {
            setPreview(result);
          },
        },
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    if (!isEmpty && !isLoading) {
      fetchPreview();
    }
  }, [isEmpty, isLoading, fetchPreview]);

  useEffect(() => {
    if (isEmpty && !isLoading) {
      router.push("/patient/cart");
    }
  }, [isEmpty, isLoading, router]);

  if (isLoading) {
    return <ListSkeleton rows={5} />;
  }

  if (isEmpty) {
    return null;
  }

  const needsPrescription = items.some(
    (item) => item.product.requiresPrescription,
  );

  // Use preview data for invoice, fallback to local calculation
  const subtotal =
    preview?.subtotal ??
    items.reduce((sum, item) => {
      const price = item.product.discountPrice || item.product.price;
      return sum + Number(price) * item.quantity;
    }, 0);
  const deliveryFee = preview?.deliveryFee ?? 0;
  const discountAmount = preview?.discountAmount ?? 0;
  const totalAmount = preview?.totalAmount ?? subtotal;

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;

    const code = couponCode.trim();
    previewOrder.mutate(
      { couponCode: code },
      {
        onSuccess: (result) => {
          setPreview(result);
          setAppliedCouponCode(result.couponCode || code);
        },
      },
    );
  };

  const handleRemoveCoupon = () => {
    setAppliedCouponCode(null);
    setCouponCode("");
    previewOrder.reset();
    fetchPreview();
  };

  const handlePlaceOrder = () => {
    createOrder.mutate(
      {
        idempotencyKey: crypto.randomUUID(),
        deliveryAddress: selectedAddress
          ? {
              ar: selectedAddress.address,
              en: selectedAddress.address,
            }
          : undefined,
        deliveryNotes: deliveryNotes || selectedAddress?.notes || undefined,
        prescriptionNotes: prescriptionNotes || undefined,
        couponCode: appliedCouponCode || undefined,
      },
      {
        onSuccess: () => {
          router.push("/patient/orders");
        },
      },
    );
  };

  // Determine what kind of discount is applied
  const hasCoupon = !!preview?.couponCode;
  const hasCampaign =
    !!preview?.campaignId && (preview?.campaignDiscount ?? 0) > 0;
  const hasFirstOrderDiscount =
    !hasCoupon && !hasCampaign && discountAmount > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Checkout Form */}
      <div className="lg:col-span-2 space-y-6">
        {/* Prescription Warning */}
        {needsPrescription && (
          <Card className="border-warning-300 bg-warning-50 dark:bg-warning-900/10">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-warning-800 dark:text-warning-200">
                    {t("pharmacyOwner.prescriptionRequired")}
                  </p>
                  <div className="mt-3">
                    <Label>{t("pharmacyOwner.prescriptionNotes")}</Label>
                    <Textarea
                      value={prescriptionNotes}
                      onChange={(e) => setPrescriptionNotes(e.target.value)}
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delivery Address Selection */}
        <AddressSelectCard
          onAddressSelect={setSelectedAddress}
          selectedAddressId={selectedAddress?.id}
        />

        {/* Delivery Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {t("pharmacyOwner.deliveryNotesLabel")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder={t("pharmacyOwner.deliveryNotesPlaceholder")}
              rows={2}
            />
          </CardContent>
        </Card>

        {/* Coupon */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5" />
              {t("pharmacyOwner.couponCode")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appliedCouponCode && hasCoupon ? (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-success-200 bg-success-50 p-3 dark:border-success-800 dark:bg-success-900/20">
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className="size-5 text-success-700 dark:text-success-200"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-medium text-success-700 dark:text-success-100">
                      {t("pharmacyOwner.couponApplied")}
                    </p>
                    <p className="text-xs text-success-700 dark:text-success-300">
                      {preview?.couponCode} &mdash; -
                      <Currency amount={preview?.couponDiscount ?? 0} />
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveCoupon}
                  className="min-h-[44px] text-error-600 hover:bg-error-50 hover:text-error-700 dark:hover:bg-error-900/20 sm:min-h-9"
                >
                  <X className="me-1 size-4" aria-hidden="true" />
                  {t("pharmacyOwner.removeCoupon")}
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder={t("pharmacyOwner.couponCode")}
                  className="min-h-[44px] flex-1 sm:min-h-9"
                  disabled={previewOrder.isPending}
                  aria-label={t("pharmacyOwner.couponCode")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleApplyCoupon();
                    }
                  }}
                />
                <Button
                  variant="outline"
                  onClick={handleApplyCoupon}
                  disabled={!couponCode.trim() || previewOrder.isPending}
                  className="min-h-[44px] sm:min-h-9"
                >
                  {previewOrder.isPending ? (
                    <>
                      <Loader2
                        className="me-1 size-4 animate-spin"
                        aria-hidden="true"
                      />
                      {t("pharmacyOwner.applyingCoupon")}
                    </>
                  ) : (
                    t("pharmacyOwner.applyCoupon")
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Items Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-5 w-5" />
              {t("pharmacyOwner.orderItems")} ({items.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item) => {
              const price = item.product.discountPrice || item.product.price;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {getLocalizedText(item.product.name, locale)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("pharmacyOwner.quantity")}: {item.quantity} ×{" "}
                        <Currency amount={price} />
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.product.requiresPrescription ? (
                      <Badge variant="warning" className="text-xs">
                        {t("pharmacyOwner.requiresPrescription")}
                      </Badge>
                    ) : null}
                    <span className="text-sm font-semibold">
                      <Currency amount={Number(price) * item.quantity} />
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Order Summary Sidebar */}
      <div>
        <Card className="sticky top-4">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {t("pharmacyOwner.orderSummary")}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("pharmacyOwner.subtotal")}
                </span>
                <span className="font-medium">
                  <Currency amount={subtotal} />
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Truck className="size-3.5" aria-hidden="true" />
                  {t("pharmacyOwner.deliveryFeeLabel")}
                </span>
                {deliveryFee === 0 ? (
                  <Badge variant="success" className="px-2 py-0.5 text-xs">
                    {t("pharmacyOwner.freeDelivery")}
                  </Badge>
                ) : (
                  <span className="font-medium">
                    <Currency amount={deliveryFee} />
                  </span>
                )}
              </div>

              {hasCoupon && (preview?.couponDiscount ?? 0) > 0 ? (
                <div className="flex justify-between text-sm text-success-700 dark:text-success-200">
                  <span>{t("pharmacyOwner.couponDiscount")}</span>
                  <span className="font-medium">
                    -<Currency amount={preview?.couponDiscount ?? 0} />
                  </span>
                </div>
              ) : null}

              {hasCampaign ? (
                <div className="flex justify-between text-sm text-success-700 dark:text-success-200">
                  <span>{t("pharmacyOwner.campaignDiscount")}</span>
                  <span className="font-medium">
                    -<Currency amount={preview?.campaignDiscount ?? 0} />
                  </span>
                </div>
              ) : null}

              {hasFirstOrderDiscount ? (
                <div className="flex justify-between text-sm text-success-700 dark:text-success-200">
                  <span>{t("pharmacyOwner.firstOrderDiscount")}</span>
                  <span className="font-medium">
                    -<Currency amount={discountAmount} />
                  </span>
                </div>
              ) : null}

              <div className="flex justify-between border-t pt-3 text-lg font-semibold">
                <span>{t("pharmacyOwner.total")}</span>
                <Currency amount={totalAmount} />
              </div>
            </div>
            <Button
              className="mt-6 w-full min-h-[44px] sm:min-h-10"
              disabled={createOrder.isPending || !selectedAddress}
              onClick={handlePlaceOrder}
            >
              {createOrder.isPending ? (
                <>
                  <Loader2
                    className="me-2 size-4 animate-spin"
                    aria-hidden="true"
                  />
                  {t("pharmacyOwner.placingOrder")}
                </>
              ) : (
                <>
                  <ShoppingCart className="me-2 size-4" aria-hidden="true" />
                  {t("pharmacyOwner.placeOrder")}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
