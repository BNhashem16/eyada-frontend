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
import { Skeleton } from "@/components/ui/skeleton";
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
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
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
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200 text-sm">
                      {t("pharmacyOwner.couponApplied")}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {preview?.couponCode} &mdash; -
                      {(preview?.couponDiscount ?? 0).toFixed(2)}{" "}
                      {t("common.egp")}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveCoupon}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <X className="h-4 w-4 me-1" />
                  {t("pharmacyOwner.removeCoupon")}
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder={t("pharmacyOwner.couponCode")}
                  className="flex-1"
                  disabled={previewOrder.isPending}
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
                >
                  {previewOrder.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 me-1 animate-spin" />
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
                        {t("pharmacyOwner.quantity")}: {item.quantity} x{" "}
                        {Number(price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.product.requiresPrescription && (
                      <Badge variant="warning" className="text-xs">
                        {t("pharmacyOwner.requiresPrescription")}
                      </Badge>
                    )}
                    <span className="font-semibold text-sm">
                      {(Number(price) * item.quantity).toFixed(2)}{" "}
                      {t("common.egp")}
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
              {/* Subtotal */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("pharmacyOwner.subtotal")}
                </span>
                <span className="font-medium">
                  {subtotal.toFixed(2)} {t("common.egp")}
                </span>
              </div>

              {/* Delivery Fee */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5" />
                  {t("pharmacyOwner.deliveryFeeLabel")}
                </span>
                {deliveryFee === 0 ? (
                  <Badge variant="success" className="text-xs px-2 py-0.5">
                    {t("pharmacyOwner.freeDelivery")}
                  </Badge>
                ) : (
                  <span className="font-medium">
                    {deliveryFee.toFixed(2)} {t("common.egp")}
                  </span>
                )}
              </div>

              {/* Coupon Discount */}
              {hasCoupon && (preview?.couponDiscount ?? 0) > 0 && (
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                  <span>{t("pharmacyOwner.couponDiscount")}</span>
                  <span className="font-medium">
                    -{(preview?.couponDiscount ?? 0).toFixed(2)}{" "}
                    {t("common.egp")}
                  </span>
                </div>
              )}

              {/* Campaign Discount */}
              {hasCampaign && (
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                  <span>{t("pharmacyOwner.campaignDiscount")}</span>
                  <span className="font-medium">
                    -{(preview?.campaignDiscount ?? 0).toFixed(2)}{" "}
                    {t("common.egp")}
                  </span>
                </div>
              )}

              {/* First Order Discount */}
              {hasFirstOrderDiscount && (
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                  <span>{t("pharmacyOwner.firstOrderDiscount")}</span>
                  <span className="font-medium">
                    -{discountAmount.toFixed(2)} {t("common.egp")}
                  </span>
                </div>
              )}

              {/* Total */}
              <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                <span>{t("pharmacyOwner.total")}</span>
                <span>
                  {totalAmount.toFixed(2)} {t("common.egp")}
                </span>
              </div>
            </div>
            <Button
              className="w-full mt-6"
              disabled={createOrder.isPending || !selectedAddress}
              onClick={handlePlaceOrder}
            >
              {createOrder.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 me-2 animate-spin" />
                  {t("pharmacyOwner.placingOrder")}
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 me-2" />
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
