"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Trash2, Plus, Minus, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ConfirmDialog,
  Currency,
  ListSkeleton,
  PharmacyEmptyState,
} from "@/components/pharmacy";
import {
  useCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart,
} from "../hooks";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { useTranslation } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import type { CartItem } from "@/types/cart";

export function PatientCart() {
  const { t, locale } = useTranslation();
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const { data: cart, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();

  if (isLoading) {
    return <ListSkeleton rows={4} />;
  }

  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <PharmacyEmptyState
        icon={ShoppingCart}
        title={t("pharmacyOwner.cartEmpty")}
        description={t("pharmacyOwner.cartEmptyDesc")}
        action={
          <Button asChild className="min-h-[44px] sm:min-h-9">
            <Link href="/patient/pharmacy">
              <Package className="me-2 size-4" aria-hidden="true" />
              {t("pharmacyOwner.browseProducts")}
            </Link>
          </Button>
        }
      />
    );
  }

  const subtotal = items.reduce((sum, item) => {
    const price = item.product.discountPrice || item.product.price;
    return sum + Number(price) * item.quantity;
  }, 0);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
      {/* Cart items */}
      <div className="space-y-3 lg:col-span-2 lg:space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {items.length} {t("pharmacyOwner.orderItems")}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setClearDialogOpen(true)}
            className="min-h-[44px] text-error-600 sm:min-h-9"
          >
            <Trash2 className="me-1 size-4" aria-hidden="true" />
            {t("pharmacyOwner.clearCart")}
          </Button>
        </div>

        {items.map((item) => (
          <CartItemRow
            key={item.id}
            item={item}
            locale={locale}
            isUpdating={updateItem.isPending}
            isRemoving={removeItem.isPending}
            onIncrement={() =>
              updateItem.mutate({
                itemId: item.id,
                quantity: item.quantity + 1,
              })
            }
            onDecrement={() =>
              updateItem.mutate({
                itemId: item.id,
                quantity: item.quantity - 1,
              })
            }
            onRemove={() => removeItem.mutate(item.id)}
          />
        ))}
      </div>

      {/* Order summary — sticky on desktop, normal flow on mobile */}
      <aside>
        <Card className="lg:sticky lg:top-4">
          <CardContent className="space-y-4 p-5 sm:p-6">
            <h3 className="text-lg font-semibold">
              {t("pharmacyOwner.orderSummary")}
            </h3>
            <dl className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <dt className="text-muted-foreground">
                  {t("pharmacyOwner.subtotal")}
                </dt>
                <dd className="font-medium">
                  <Currency amount={subtotal} />
                </dd>
              </div>
              <div className="flex items-center justify-between border-t pt-3 font-semibold">
                <dt>{t("pharmacyOwner.total")}</dt>
                <dd>
                  <Currency amount={subtotal} />
                </dd>
              </div>
            </dl>
            <Button asChild className="w-full min-h-[44px] sm:min-h-10">
              <Link href="/patient/checkout">
                {t("pharmacyOwner.proceedToCheckout")}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full min-h-[44px] sm:min-h-10"
            >
              <Link href="/patient/pharmacy">
                {t("pharmacyOwner.continueShopping")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </aside>

      <ConfirmDialog
        open={clearDialogOpen}
        onOpenChange={setClearDialogOpen}
        title={t("pharmacyOwner.clearCart")}
        description={t("pharmacyOwner.clearCartConfirm")}
        tone="destructive"
        confirmLabel={t("pharmacyOwner.clearCart")}
        onConfirm={() => clearCart.mutateAsync()}
      />
    </div>
  );
}

interface CartItemRowProps {
  item: CartItem;
  locale: Locale;
  isUpdating: boolean;
  isRemoving: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

function CartItemRow({
  item,
  locale,
  isUpdating,
  isRemoving,
  onIncrement,
  onDecrement,
  onRemove,
}: CartItemRowProps) {
  const { t } = useTranslation();
  const price = item.product.discountPrice || item.product.price;
  const stockMax = item.product.stockQuantity ?? 0;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <div
            className="grid size-14 shrink-0 place-items-center rounded-xl bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 sm:size-16"
            aria-hidden="true"
          >
            <Package className="size-7 sm:size-8" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="truncate font-semibold text-foreground">
              {getLocalizedText(item.product.name, locale)}
            </h4>
            <p className="text-sm text-muted-foreground">
              <Currency
                amount={price}
                className="font-semibold text-foreground"
              />
              {item.product.discountPrice ? (
                <span className="ms-2 line-through">
                  <Currency amount={item.product.price} />
                </span>
              ) : null}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            <Button
              variant="outline"
              size="icon"
              className="size-11 sm:size-9"
              aria-label={t("common.previous")}
              disabled={item.quantity <= 1 || isUpdating}
              onClick={onDecrement}
            >
              <Minus className="size-4" aria-hidden="true" />
            </Button>
            <span
              className="w-8 text-center text-base font-medium tabular-nums"
              aria-live="polite"
            >
              {item.quantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="size-11 sm:size-9"
              aria-label={t("common.next")}
              disabled={item.quantity >= stockMax || isUpdating}
              onClick={onIncrement}
            >
              <Plus className="size-4" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-11 text-error-600 sm:size-9"
              aria-label={t("common.delete")}
              disabled={isRemoving}
              onClick={onRemove}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
