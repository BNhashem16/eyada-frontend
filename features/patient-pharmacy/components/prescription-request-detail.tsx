"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  ClipboardCheck,
  Clock,
  Copy,
  Eye,
  FileText,
  ImageIcon,
  MapPin,
  Package,
  Phone,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageViewer } from "@/components/ui/image-viewer";
import {
  CardSkeleton,
  Currency,
  OrderStatusBadge,
  OrderTimeline,
  PharmacyErrorState,
  PrescriptionStatusBadge,
} from "@/components/pharmacy";
import {
  usePrescriptionRequest,
  useCancelPrescriptionRequest,
} from "../hooks/use-prescription-requests";
import { mapPrescriptionToTimeline } from "../utils/timeline-mapper";
import { useTranslation } from "@/lib/i18n";
import { getImageUrl } from "@/lib/utils/storage";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { toastSuccess } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type {
  PrescriptionOrder,
  PrescriptionRequest,
} from "@/types/prescription";

type Translator = (
  key: string,
  params?: Record<string, string | number>,
) => string;

const TYPE_LABEL_KEY: Record<string, string> = {
  IMAGE: "prescription.typeImage",
  TEXT: "prescription.typeText",
  MIXED: "prescription.typeMixed",
};

interface Props {
  requestId: string;
}

export function PrescriptionRequestDetail({ requestId }: Props) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const {
    data: request,
    isLoading,
    isError,
  } = usePrescriptionRequest(requestId);
  const cancelRequest = useCancelPrescriptionRequest();

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (isError || !request) {
    return <PharmacyErrorState />;
  }

  const canCancel = request.status === "PENDING_REVIEW";
  const hasOrders = (request.orders?.length ?? 0) > 0;

  const handleCancel = async () => {
    await cancelRequest.mutateAsync({
      requestId,
      reason: cancelReason || undefined,
    });
    router.push("/patient/prescriptions");
  };

  const handleCopyRequestNumber = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(request.requestNumber);
      toastSuccess(t("toast.success"), t("prescription.requestNumberCopied"));
    } catch {
      // Clipboard API unavailable or denied — silent no-op (UX falls back to manual copy).
    }
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-2">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="min-h-[44px] sm:min-h-9"
        >
          <Link href="/patient/prescriptions">
            <ArrowLeft
              className="me-2 size-4 rtl:rotate-180"
              aria-hidden="true"
            />
            {t("prescription.backToList")}
          </Link>
        </Button>
      </div>

      <HeroCard
        request={request}
        locale={locale}
        t={t}
        onCopyNumber={handleCopyRequestNumber}
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <PrescriptionAttachmentsCard
            request={request}
            t={t}
            viewerOpen={viewerOpen}
            setViewerOpen={setViewerOpen}
            viewerIndex={viewerIndex}
            setViewerIndex={setViewerIndex}
          />

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarClock
                  className="size-5 text-primary-600 dark:text-primary-400"
                  aria-hidden="true"
                />
                {t("timeline.label")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline {...mapPrescriptionToTimeline(request)} />
            </CardContent>
          </Card>

          {hasOrders ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ClipboardCheck
                    className="size-5 text-success-600 dark:text-success-400"
                    aria-hidden="true"
                  />
                  {t("prescription.assignedOrders")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {request.orders!.map((order) => (
                  <AssignedOrderCard
                    key={order.id}
                    order={order}
                    t={t}
                    locale={locale}
                  />
                ))}
              </CardContent>
            </Card>
          ) : (
            <AwaitingAssignmentCard t={t} />
          )}
        </div>

        <div className="space-y-6">
          <SummaryCard request={request} t={t} locale={locale} />
          <DeliveryAddressCard request={request} t={t} />
          <WhatsNextCard request={request} t={t} />

          {canCancel ? (
            <Button
              variant="outline"
              className="min-h-[44px] w-full border-error-300 text-error-600 hover:bg-error-50 dark:border-error-700 dark:text-error-200 dark:hover:bg-error-900/30 sm:min-h-10"
              onClick={() => setShowCancelDialog(true)}
            >
              {t("prescription.cancelRequest")}
            </Button>
          ) : null}
        </div>
      </div>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("prescription.cancelRequest")}</DialogTitle>
            <DialogDescription>
              {t("prescription.cancelRequestConfirm")}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder={t("prescription.cancelReason")}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={3}
            aria-label={t("prescription.cancelReason")}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={cancelRequest.isPending}
              className="min-h-[44px] sm:min-h-9"
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelRequest.isPending}
              className="min-h-[44px] sm:min-h-9"
            >
              {t("prescription.cancelRequest")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function formatDate(
  iso: string | null | undefined,
  locale: Locale,
  withTime = true,
): string | null {
  if (!iso) return null;
  const fmt = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
  return fmt.format(new Date(iso));
}

function HeroCard({
  request,
  locale,
  t,
  onCopyNumber,
}: {
  request: PrescriptionRequest;
  locale: Locale;
  t: Translator;
  onCopyNumber: () => void;
}) {
  const submittedAt = formatDate(request.createdAt, locale, false);
  const typeKey = TYPE_LABEL_KEY[request.type];
  const typeLabel = typeKey ? t(typeKey) : null;

  return (
    <Card className="overflow-hidden border-primary-200/60 bg-gradient-to-br from-primary-50/60 via-background to-background dark:border-primary-900/40 dark:from-primary-950/30">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200">
              <FileText className="size-6" aria-hidden="true" />
            </div>
            <div className="min-w-0 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                {t("prescription.requestDetails")}
              </p>
              <div className="flex min-w-0 items-center gap-2">
                <h2 className="truncate text-lg font-bold sm:text-xl">
                  {request.requestNumber}
                </h2>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-8 shrink-0"
                  onClick={onCopyNumber}
                  aria-label={t("prescription.copyRequestNumber")}
                >
                  <Copy className="size-4" aria-hidden="true" />
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {typeLabel ? (
                  <Badge variant="secondary" className="font-normal">
                    {typeLabel}
                  </Badge>
                ) : null}
                {submittedAt ? (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" aria-hidden="true" />
                    {t("prescription.submittedOn")} {submittedAt}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          <div className="md:text-end">
            <PrescriptionStatusBadge
              status={request.status}
              className="text-sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PrescriptionAttachmentsCard({
  request,
  t,
  viewerOpen,
  setViewerOpen,
  viewerIndex,
  setViewerIndex,
}: {
  request: PrescriptionRequest;
  t: Translator;
  viewerOpen: boolean;
  setViewerOpen: (open: boolean) => void;
  viewerIndex: number;
  setViewerIndex: (i: number) => void;
}) {
  const hasImages = request.prescriptionImages.length > 0;
  const hasText = !!request.prescriptionText;
  const hasNotes = !!request.notes;

  if (!hasImages && !hasText && !hasNotes) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Package
            className="size-5 text-blue-600 dark:text-blue-400"
            aria-hidden="true"
          />
          {t("prescription.detailsCardTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {hasImages && (
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="inline-flex items-center gap-2 text-sm font-medium">
                <ImageIcon
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                {t("prescription.prescriptionImages")}
              </h3>
              <span className="text-xs text-muted-foreground">
                {t("prescription.imagesCount", {
                  count: request.prescriptionImages.length,
                })}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {request.prescriptionImages.map((key, i) => (
                <button
                  type="button"
                  key={key}
                  className="group relative aspect-square overflow-hidden rounded-lg border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  onClick={() => {
                    setViewerIndex(i);
                    setViewerOpen(true);
                  }}
                  aria-label={`${t("prescription.prescriptionImages")} ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getImageUrl(key)}
                    alt={`${t("prescription.prescriptionImages")} ${i + 1}`}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <span className="absolute inset-0 grid place-items-center bg-black/0 transition-colors group-hover:bg-black/30">
                    <Eye
                      className="size-6 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </span>
                </button>
              ))}
            </div>
            <ImageViewer
              images={request.prescriptionImages.map((key) => getImageUrl(key))}
              initialIndex={viewerIndex}
              open={viewerOpen}
              onOpenChange={setViewerOpen}
              alt={t("prescription.prescriptionImages")}
            />
          </div>
        )}

        {hasText && (
          <div className="rounded-lg border bg-muted/30 p-3">
            <h3 className="mb-1 text-sm font-medium">
              {t("prescription.prescriptionText")}
            </h3>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {request.prescriptionText}
            </p>
          </div>
        )}

        {hasNotes && (
          <div className="rounded-lg border bg-muted/30 p-3">
            <h3 className="mb-1 text-sm font-medium">
              {t("prescription.additionalNotes")}
            </h3>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {request.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AssignedOrderCard({
  order,
  t,
  locale,
}: {
  order: PrescriptionOrder;
  t: Translator;
  locale: Locale;
}) {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const pharmacyName = order.pharmacy
    ? getLocalizedText(order.pharmacy.name as never, locale)
    : null;
  const phone = order.pharmacy?.phoneNumbers?.[0];
  const hasFee = Number(order.deliveryFee) > 0;

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b p-4">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">{order.orderNumber}</span>
            <OrderStatusBadge status={order.status} />
          </div>
          {pharmacyName ? (
            <p className="text-sm font-medium">{pharmacyName}</p>
          ) : null}
          {phone ? (
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline dark:text-primary-300"
              dir="ltr"
            >
              <Phone className="size-3.5" aria-hidden="true" />
              {phone}
            </a>
          ) : null}
        </div>
        <div className="text-end">
          <p className="text-base font-bold">
            <Currency amount={order.totalAmount} />
          </p>
          <p className="text-xs text-muted-foreground">
            {t("prescription.itemsCount", { count: itemCount })}
          </p>
        </div>
      </div>

      <div className="divide-y">
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 p-4 text-sm"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                <Package className="size-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium">{item.medicationName}</p>
                {item.notes ? (
                  <p className="truncate text-xs text-muted-foreground">
                    {item.notes}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="shrink-0 text-end">
              <Badge variant="outline" className="font-semibold">
                ×{item.quantity}
              </Badge>
              <p className="mt-1 text-xs text-muted-foreground">
                <Currency amount={item.unitPrice} />
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-1 border-t bg-muted/30 p-4 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>{t("prescription.orderSubtotal")}</span>
          <Currency amount={order.subtotal} />
        </div>
        {hasFee ? (
          <div className="flex justify-between text-muted-foreground">
            <span>{t("prescription.deliveryFeeLabel")}</span>
            <Currency amount={order.deliveryFee} />
          </div>
        ) : null}
        <div className="flex justify-between border-t pt-2 font-semibold">
          <span>{t("prescription.orderTotal")}</span>
          <Currency amount={order.totalAmount} />
        </div>
      </div>
    </div>
  );
}

function AwaitingAssignmentCard({ t }: { t: Translator }) {
  return (
    <Card className="border-dashed">
      <CardContent className="space-y-2 p-6 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-200">
          <Sparkles className="size-6" aria-hidden="true" />
        </div>
        <h3 className="font-semibold text-foreground">
          {t("prescription.awaitingAssignment")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t("prescription.awaitingAssignmentDescription")}
        </p>
      </CardContent>
    </Card>
  );
}

function SummaryCard({
  request,
  t,
  locale,
}: {
  request: PrescriptionRequest;
  t: Translator;
  locale: Locale;
}) {
  const submittedAt = formatDate(request.createdAt, locale);
  const updatedAt = formatDate(request.updatedAt, locale);
  const assignedAt = formatDate(request.assignedAt, locale);
  const cancelledAt = formatDate(request.cancelledAt, locale);
  const typeKey = TYPE_LABEL_KEY[request.type];
  const typeLabel = typeKey ? t(typeKey) : null;
  const totalItems = (request.orders ?? []).reduce(
    (sum, order) =>
      sum + order.items.reduce((s, item) => s + item.quantity, 0),
    0,
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          {t("prescription.requestSummary")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <SummaryRow
          label={t("prescription.orderNumber")}
          value={request.requestNumber}
          mono
        />
        {typeLabel ? (
          <SummaryRow label={t("prescription.type")} value={typeLabel} />
        ) : null}
        {submittedAt ? (
          <SummaryRow
            label={t("prescription.submittedOn")}
            value={submittedAt}
          />
        ) : null}
        {assignedAt ? (
          <SummaryRow
            label={t("prescription.assignedAt")}
            value={assignedAt}
          />
        ) : null}
        {updatedAt && updatedAt !== submittedAt ? (
          <SummaryRow
            label={t("prescription.lastUpdated")}
            value={updatedAt}
          />
        ) : null}
        {cancelledAt ? (
          <SummaryRow
            label={t("prescription.cancelledOn")}
            value={cancelledAt}
          />
        ) : null}
        {request.cancelReason ? (
          <SummaryRow
            label={t("prescription.cancellationReason")}
            value={request.cancelReason}
            multiline
          />
        ) : null}

        {totalItems > 0 ? (
          <>
            <div className="my-2 border-t" />
            <SummaryRow
              label={t("prescription.orderItems")}
              value={t("prescription.itemsCount", { count: totalItems })}
            />
          </>
        ) : null}

        {request.totalAmount ? (
          <div className="mt-2 flex items-center justify-between border-t pt-3 text-base font-semibold">
            <span>{t("prescription.totalPrice")}</span>
            <Currency amount={request.totalAmount} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function SummaryRow({
  label,
  value,
  mono = false,
  multiline = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  multiline?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex gap-3",
        multiline ? "flex-col" : "items-start justify-between",
      )}
    >
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "break-words font-medium",
          multiline ? "text-start whitespace-pre-wrap" : "text-end",
          mono && "font-mono text-xs",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function DeliveryAddressCard({
  request,
  t,
}: {
  request: PrescriptionRequest;
  t: Translator;
}) {
  const address = request.deliveryAddress;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin
            className="size-5 text-primary-600 dark:text-primary-400"
            aria-hidden="true"
          />
          {t("prescription.deliveryAddress")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        {address ? (
          <>
            <p className="font-semibold">{address.label}</p>
            <p className="text-muted-foreground">{address.addressLine1}</p>
            {address.city ? (
              <p className="text-muted-foreground">{address.city}</p>
            ) : null}
          </>
        ) : (
          <p className="text-muted-foreground">
            {t("prescription.addressNotProvided")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function WhatsNextCard({
  request,
  t,
}: {
  request: PrescriptionRequest;
  t: Translator;
}) {
  const messageKey = `prescription.nextSteps.${request.status}`;
  const message = t(messageKey);

  // t() returns the raw key when nothing matches. Hide the card in that case.
  if (message === messageKey) return null;

  return (
    <Card className="border-primary-200/60 bg-primary-50/40 dark:border-primary-900/40 dark:bg-primary-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles
            className="size-5 text-primary-600 dark:text-primary-400"
            aria-hidden="true"
          />
          {t("prescription.whatsNext")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed">{message}</p>
      </CardContent>
    </Card>
  );
}
