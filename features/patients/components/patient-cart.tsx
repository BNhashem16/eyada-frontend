"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Loader2,
  Package,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
  useCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart,
} from "../hooks";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { useTranslation } from "@/lib/i18n";

export function PatientCart() {
  const { t, locale } = useTranslation();
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const { data: cart, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {t("pharmacyOwner.cartEmpty")}
          </h3>
          <p className="text-muted-foreground mb-4">
            {t("pharmacyOwner.cartEmptyDesc")}
          </p>
          <Button asChild>
            <Link href="/patient/pharmacy">
              <Package className="h-4 w-4 me-2" />
              {t("pharmacyOwner.browseProducts")}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => {
    const price = item.product.discountPrice || item.product.price;
    return sum + Number(price) * item.quantity;
  }, 0);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">
              {items.length} {t("pharmacyOwner.orderItems")}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setClearDialogOpen(true)}
              className="text-error-600"
            >
              <Trash2 className="h-4 w-4 me-1" />
              {t("pharmacyOwner.clearCart")}
            </Button>
          </div>

          {items.map((item) => {
            const price = item.product.discountPrice || item.product.price;
            return (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                      <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground">
                        {getLocalizedText(item.product.name, locale)}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {Number(price).toFixed(2)} {t("common.egp")}
                        {item.product.discountPrice && (
                          <span className="line-through ms-2">
                            {Number(item.product.price).toFixed(2)}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={item.quantity <= 1 || updateItem.isPending}
                        onClick={() =>
                          updateItem.mutate({
                            itemId: item.id,
                            quantity: item.quantity - 1,
                          })
                        }
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={
                          item.quantity >= item.product.stockQuantity ||
                          updateItem.isPending
                        }
                        onClick={() =>
                          updateItem.mutate({
                            itemId: item.id,
                            quantity: item.quantity + 1,
                          })
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-error-600"
                        disabled={removeItem.isPending}
                        onClick={() => removeItem.mutate(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Order Summary */}
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
                    {subtotal.toFixed(2)} {t("common.egp")}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between font-semibold">
                  <span>{t("pharmacyOwner.total")}</span>
                  <span>
                    {subtotal.toFixed(2)} {t("common.egp")}
                  </span>
                </div>
              </div>
              <Button asChild className="w-full mt-6">
                <Link href="/patient/checkout">
                  {t("pharmacyOwner.proceedToCheckout")}
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full mt-2">
                <Link href="/patient/pharmacy">
                  {t("pharmacyOwner.continueShopping")}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Clear Cart Confirmation */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("pharmacyOwner.clearCart")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("pharmacyOwner.clearCartConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                clearCart.mutate();
                setClearDialogOpen(false);
              }}
              className="bg-error-600 hover:bg-error-700"
              disabled={clearCart.isPending}
            >
              {clearCart.isPending && (
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
              )}
              {t("pharmacyOwner.clearCart")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
