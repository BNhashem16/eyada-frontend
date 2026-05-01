"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Package,
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  ArrowLeft,
  StickyNote,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "@/lib/i18n";
import { getLocalizedText } from "@/lib/utils/multilingual";
import {
  useDriverDelivery,
  usePickupDelivery,
  useCompleteDelivery,
} from "../hooks";
import { OrderStatus } from "@/types/enums";

export function DriverDeliveryDetail() {
  const { t, locale } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: delivery, isLoading } = useDriverDelivery(id);
  const pickupMutation = usePickupDelivery();
  const completeMutation = useCompleteDelivery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
        <p>{t("common.noData")}</p>
      </div>
    );
  }

  const isReadyForPickup = delivery.status === OrderStatus.READY_FOR_PICKUP;
  const isOutForDelivery = delivery.status === OrderStatus.OUT_FOR_DELIVERY;
  const isDelivered = delivery.status === OrderStatus.DELIVERED;
  const deliveryAddress = delivery.deliveryAddress
    ? getLocalizedText(
        {
          ar: delivery.deliveryAddress.ar || "",
          en: delivery.deliveryAddress.en || "",
        },
        locale,
      )
    : null;

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/driver/deliveries")}
      >
        <ArrowLeft className="h-4 w-4 me-2 rtl:rotate-180" />
        {t("common.back")}
      </Button>

      {/* Order Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {t("driver.orderNumber")}
              {delivery.orderNumber}
            </h2>
            <Badge
              variant={
                isOutForDelivery
                  ? "default"
                  : isDelivered
                    ? "secondary"
                    : "outline"
              }
              className={
                isDelivered
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : ""
              }
            >
              {isReadyForPickup
                ? t("driver.assigned")
                : isOutForDelivery
                  ? t("driver.pickedUp")
                  : isDelivered
                    ? t("driver.delivered")
                    : delivery.status}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {t("driver.totalAmount")}
              </p>
              <p className="font-medium">
                {delivery.totalAmount} {t("common.egp")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {t("driver.deliveryFee")}
              </p>
              <p className="font-medium">
                {delivery.deliveryFee} {t("common.egp")}
              </p>
            </div>
            {delivery.delivery?.estimatedTime && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {t("driver.estimatedTime")}
                </p>
                <p className="font-medium flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {delivery.delivery.estimatedTime} {t("driver.minutes")}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pharmacy & Customer Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pharmacy */}
        {delivery.pharmacy && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">{t("driver.pharmacy")}</h3>
              <p className="font-medium">
                {getLocalizedText(delivery.pharmacy.name, locale)}
              </p>
              {delivery.pharmacy.phoneNumbers?.[0] && (
                <a
                  href={`tel:${delivery.pharmacy.phoneNumbers[0]}`}
                  className="flex items-center gap-2 text-sm text-primary mt-2"
                >
                  <Phone className="h-4 w-4" />
                  {delivery.pharmacy.phoneNumbers[0]}
                </a>
              )}
            </CardContent>
          </Card>
        )}

        {/* Customer */}
        {delivery.user && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">{t("driver.customer")}</h3>
              <p className="font-medium">{delivery.user.fullName}</p>
              <a
                href={`tel:${delivery.user.phoneNumber}`}
                className="flex items-center gap-2 text-sm text-primary mt-2"
              >
                <Phone className="h-4 w-4" />
                {delivery.user.phoneNumber}
              </a>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delivery Address */}
      {deliveryAddress && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {t("driver.deliveryAddress")}
            </h3>
            <p className="text-sm">{deliveryAddress}</p>
            {delivery.deliveryNotes && (
              <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                <StickyNote className="h-4 w-4 mt-0.5 shrink-0" />
                <p>{delivery.deliveryNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Items */}
      {delivery.items?.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">{t("driver.items")}</h3>
            <div className="divide-y">
              {delivery.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <p className="font-medium">
                      {getLocalizedText(item.productName, locale)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      x{item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">
                    {item.totalPrice} {t("common.egp")}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">{t("driver.timeline")}</h3>
          <div className="space-y-4">
            <TimelineItem
              label={t("driver.assigned")}
              done={true}
              icon={<Package className="h-4 w-4" />}
            />
            <TimelineItem
              label={t("driver.pickedUp")}
              done={!!delivery.delivery?.pickedUpAt}
              timestamp={delivery.delivery?.pickedUpAt}
              icon={<CheckCircle className="h-4 w-4" />}
            />
            <TimelineItem
              label={t("driver.delivered")}
              done={!!delivery.delivery?.deliveredAt}
              timestamp={delivery.delivery?.deliveredAt}
              icon={<CheckCircle className="h-4 w-4" />}
              isLast
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {(isReadyForPickup || isOutForDelivery) && (
        <div className="flex justify-end gap-3">
          {isReadyForPickup && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="lg">{t("driver.markPickedUp")}</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t("driver.confirmPickup")}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("driver.confirmPickupDesc")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => pickupMutation.mutate(id)}
                    disabled={pickupMutation.isPending}
                  >
                    {t("common.confirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {isOutForDelivery && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  {t("driver.markDelivered")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t("driver.confirmDelivery")}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("driver.confirmDeliveryDesc")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => completeMutation.mutate(id)}
                    disabled={completeMutation.isPending}
                  >
                    {t("common.confirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      )}
    </div>
  );
}

function TimelineItem({
  label,
  done,
  timestamp,
  icon,
  isLast,
}: {
  label: string;
  done: boolean;
  timestamp?: string;
  icon: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`h-8 w-8 rounded-full flex items-center justify-center ${
            done
              ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {icon}
        </div>
        {!isLast && (
          <div
            className={`w-0.5 h-6 ${done ? "bg-green-300 dark:bg-green-700" : "bg-muted"}`}
          />
        )}
      </div>
      <div className="pt-1">
        <p
          className={`font-medium text-sm ${done ? "" : "text-muted-foreground"}`}
        >
          {label}
        </p>
        {timestamp && (
          <p className="text-xs text-muted-foreground">
            {new Date(timestamp).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
