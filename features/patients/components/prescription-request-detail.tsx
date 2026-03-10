"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Package, Loader2, ClipboardCheck, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
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
import { ImageViewer } from "@/components/ui/image-viewer";
import {
  usePrescriptionRequest,
  useCancelPrescriptionRequest,
} from "../hooks/use-prescription-requests";
import { useTranslation } from "@/lib/i18n";
import { getImageUrl } from "@/lib/utils/storage";

interface Props {
  requestId: string;
}

export function PrescriptionRequestDetail({ requestId }: Props) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const { data: request, isLoading } = usePrescriptionRequest(requestId);
  const cancelRequest = useCancelPrescriptionRequest();

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (!request) return null;

  const canCancel = request.status === "PENDING_REVIEW";
  const isPendingReview = request.status === "PENDING_REVIEW";

  const handleCancel = async () => {
    await cancelRequest.mutateAsync(
      { requestId, reason: cancelReason || undefined },
      {
        onSuccess: () => {
          setShowCancelDialog(false);
          router.push("/patient/prescriptions");
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      {/* Request Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{request.requestNumber}</CardTitle>
            <Badge>
              {t(
                `prescription.status${
                  request.status.charAt(0) +
                  request.status
                    .slice(1)
                    .toLowerCase()
                    .replace(/_./g, (m) => m[1].toUpperCase())
                }`,
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Prescription images */}
          {request.prescriptionImages.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">
                {t("prescription.prescriptionImages")}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {request.prescriptionImages.map((key: string, i: number) => (
                  <div
                    key={key}
                    className="aspect-square rounded-lg overflow-hidden border cursor-pointer group relative"
                    onClick={() => {
                      setViewerIndex(i);
                      setViewerOpen(true);
                    }}
                  >
                    <img
                      src={getImageUrl(key)}
                      alt={`Prescription ${i + 1}`}
                      className="object-cover w-full h-full transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
              <ImageViewer
                images={request.prescriptionImages.map((key: string) =>
                  getImageUrl(key),
                )}
                initialIndex={viewerIndex}
                open={viewerOpen}
                onOpenChange={setViewerOpen}
                alt={t("prescription.prescriptionImages")}
              />
            </div>
          )}

          {request.prescriptionText && (
            <div>
              <h3 className="text-sm font-medium mb-1">
                {t("prescription.prescriptionText")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {request.prescriptionText}
              </p>
            </div>
          )}

          {request.notes && (
            <div>
              <h3 className="text-sm font-medium mb-1">
                {t("prescription.additionalNotes")}
              </h3>
              <p className="text-sm text-muted-foreground">{request.notes}</p>
            </div>
          )}

          {isPendingReview && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {t("prescription.pendingAdminReview")}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Orders Section (shown after assignment) */}
      {request.orders && request.orders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              {t("prescription.assignedOrders")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {request.orders.map((order) => (
              <Card key={order.id} className="border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">{order.orderNumber}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-green-600">
                        {Number(order.totalAmount).toFixed(2)}
                      </span>
                      <Badge variant="outline">{order.status}</Badge>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>{item.medicationName}</span>
                        <span className="text-muted-foreground">
                          {item.quantity} x {Number(item.unitPrice).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Total amount */}
      {request.totalAmount && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {t("prescription.orderDetails")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("prescription.totalPrice")}
                </span>
                <span className="font-semibold">
                  {Number(request.totalAmount).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {canCancel && (
          <Button
            variant="destructive"
            onClick={() => setShowCancelDialog(true)}
          >
            {t("prescription.cancelRequest")}
          </Button>
        )}
      </div>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("prescription.cancelRequest")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("prescription.cancelRequestConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder={t("prescription.cancelReason")}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="my-4"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelRequest.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelRequest.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("prescription.cancelRequest")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
