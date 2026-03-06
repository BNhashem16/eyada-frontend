"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  ClipboardCheck,
  Plus,
  Trash2,
  Loader2,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useAdminPrescriptionRequests,
  useAssignPrescription,
} from "@/features/admin/hooks/use-admin-prescriptions";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { ImageViewer } from "@/components/ui/image-viewer";
import { useTranslation } from "@/lib/i18n";
import { PrescriptionRequestStatus } from "@/types/prescription";
import { getImageUrl } from "@/lib/utils";
import { apiGet } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

interface AssignmentItem {
  medicationNameAr: string;
  medicationNameEn: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

interface PharmacyAssignment {
  pharmacyId: string;
  items: AssignmentItem[];
}

export function AdminPrescriptionRequestsPageContent() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: undefined as string | undefined,
  });
  const { data, isLoading } = useAdminPrescriptionRequests(filters);
  const assignMutation = useAssignPrescription();

  const [assignRequestId, setAssignRequestId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<PharmacyAssignment[]>([
    {
      pharmacyId: "",
      items: [
        {
          medicationNameAr: "",
          medicationNameEn: "",
          quantity: 1,
          unitPrice: 0,
        },
      ],
    },
  ]);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerOpen, setViewerOpen] = useState(false);

  // Fetch pharmacies for assignment dialog
  const { data: pharmaciesData } = useQuery({
    queryKey: ["admin-pharmacies-for-assignment"],
    queryFn: () => apiGet<any>("/admin/pharmacies?limit=100&status=APPROVED"),
    enabled: !!assignRequestId,
  });
  const pharmacies = pharmaciesData?.data || [];

  const addAssignment = () => {
    setAssignments((prev) => [
      ...prev,
      {
        pharmacyId: "",
        items: [
          {
            medicationNameAr: "",
            medicationNameEn: "",
            quantity: 1,
            unitPrice: 0,
          },
        ],
      },
    ]);
  };

  const removeAssignment = (index: number) => {
    setAssignments((prev) => prev.filter((_, i) => i !== index));
  };

  const addItem = (assignmentIndex: number) => {
    setAssignments((prev) =>
      prev.map((a, i) =>
        i === assignmentIndex
          ? {
              ...a,
              items: [
                ...a.items,
                {
                  medicationNameAr: "",
                  medicationNameEn: "",
                  quantity: 1,
                  unitPrice: 0,
                },
              ],
            }
          : a,
      ),
    );
  };

  const removeItem = (assignmentIndex: number, itemIndex: number) => {
    setAssignments((prev) =>
      prev.map((a, i) =>
        i === assignmentIndex
          ? { ...a, items: a.items.filter((_, j) => j !== itemIndex) }
          : a,
      ),
    );
  };

  const updateItem = (
    assignmentIndex: number,
    itemIndex: number,
    field: keyof AssignmentItem,
    value: any,
  ) => {
    setAssignments((prev) =>
      prev.map((a, i) =>
        i === assignmentIndex
          ? {
              ...a,
              items: a.items.map((item, j) =>
                j === itemIndex ? { ...item, [field]: value } : item,
              ),
            }
          : a,
      ),
    );
  };

  const handleAssign = async () => {
    if (!assignRequestId) return;
    await assignMutation.mutateAsync({
      requestId: assignRequestId,
      assignments,
      deliveryFee: deliveryFee || undefined,
    });
    setAssignRequestId(null);
    resetForm();
  };

  const resetForm = () => {
    setAssignments([
      {
        pharmacyId: "",
        items: [
          {
            medicationNameAr: "",
            medicationNameEn: "",
            quantity: 1,
            unitPrice: 0,
          },
        ],
      },
    ]);
    setDeliveryFee(0);
  };

  const isFormValid = assignments.every(
    (a) =>
      a.pharmacyId &&
      a.items.length > 0 &&
      a.items.every(
        (i) =>
          i.medicationNameAr &&
          i.medicationNameEn &&
          i.quantity > 0 &&
          i.unitPrice >= 0,
      ),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          {t("prescription.allRequests")}
        </h1>
      </div>

      <div className="flex justify-end">
        <Select
          value={filters.status || "ALL"}
          onValueChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              status: value === "ALL" ? undefined : value,
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("common.all")}</SelectItem>
            {Object.values(PrescriptionRequestStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="space-y-3">
          {(data?.data || []).map((req: any) => (
            <Card key={req.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{req.requestNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("prescription.patient")}: {req.patient?.fullName} •{" "}
                      {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("prescription.orders")}: {req.orders?.length || 0}
                      {req.totalAmount &&
                        ` • ${t("prescription.total")}: ${Number(req.totalAmount).toFixed(2)}`}
                    </p>
                    {/* Prescription image thumbnails */}
                    {req.prescriptionImages?.length > 0 && (
                      <div
                        className="flex gap-1 mt-2 cursor-pointer"
                        onClick={() => {
                          setViewerImages(
                            req.prescriptionImages.map((k: string) =>
                              getImageUrl(k),
                            ),
                          );
                          setViewerOpen(true);
                        }}
                      >
                        {req.prescriptionImages
                          .slice(0, 3)
                          .map((key: string, i: number) => (
                            <img
                              key={key}
                              src={getImageUrl(key)}
                              alt={`Rx ${i + 1}`}
                              className="h-12 w-12 object-cover rounded border hover:opacity-80 transition-opacity"
                            />
                          ))}
                        {req.prescriptionImages.length > 3 && (
                          <span className="h-12 w-12 rounded border flex items-center justify-center text-xs text-muted-foreground bg-muted">
                            +{req.prescriptionImages.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {req.status === "PENDING_REVIEW" && (
                      <Button
                        size="sm"
                        onClick={() => setAssignRequestId(req.id)}
                      >
                        <ClipboardCheck className="h-3 w-3 mr-1" />
                        {t("prescription.assign")}
                      </Button>
                    )}
                    <Badge>{req.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {data?.meta && data.meta.totalPages > 1 && (
            <PaginationControls
              meta={data.meta}
              page={filters.page}
              onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
              limit={filters.limit}
              onLimitChange={(limit) =>
                setFilters((prev) => ({ ...prev, limit, page: 1 }))
              }
            />
          )}
        </div>
      )}

      {/* Image Viewer */}
      <ImageViewer
        images={viewerImages}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        alt="Prescription"
      />

      {/* Assignment Dialog */}
      <Dialog
        open={!!assignRequestId}
        onOpenChange={() => {
          setAssignRequestId(null);
          resetForm();
        }}
      >
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("prescription.assignToPharmacy")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {assignments.map((assignment, aIdx) => (
              <Card key={aIdx}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">
                      {t("prescription.pharmacyAssignment")} {aIdx + 1}
                    </CardTitle>
                    {assignments.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeAssignment(aIdx)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Pharmacy Selector */}
                  <div>
                    <Label>{t("prescription.selectPharmacy")}</Label>
                    <Select
                      value={assignment.pharmacyId}
                      onValueChange={(v) =>
                        setAssignments((prev) =>
                          prev.map((a, i) =>
                            i === aIdx ? { ...a, pharmacyId: v } : a,
                          ),
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("prescription.selectPharmacy")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {pharmacies.map((p: any) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name?.en || p.name?.ar || p.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Items */}
                  {assignment.items.map((item, iIdx) => (
                    <div key={iIdx} className="border rounded p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">
                          {t("prescription.medication")} {iIdx + 1}
                        </span>
                        {assignment.items.length > 1 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeItem(aIdx, iIdx)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">
                            {t("prescription.medicationNameAr")}
                          </Label>
                          <Input
                            value={item.medicationNameAr}
                            onChange={(e) =>
                              updateItem(
                                aIdx,
                                iIdx,
                                "medicationNameAr",
                                e.target.value,
                              )
                            }
                            dir="rtl"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">
                            {t("prescription.medicationNameEn")}
                          </Label>
                          <Input
                            value={item.medicationNameEn}
                            onChange={(e) =>
                              updateItem(
                                aIdx,
                                iIdx,
                                "medicationNameEn",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label className="text-xs">
                            {t("prescription.quantity")}
                          </Label>
                          <Input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(
                                aIdx,
                                iIdx,
                                "quantity",
                                parseInt(e.target.value) || 1,
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label className="text-xs">
                            {t("prescription.unitPrice")}
                          </Label>
                          <Input
                            type="number"
                            min={0}
                            step={0.01}
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateItem(
                                aIdx,
                                iIdx,
                                "unitPrice",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addItem(aIdx)}
                    className="w-full"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {t("prescription.addMedication")}
                  </Button>
                </CardContent>
              </Card>
            ))}

            <Button
              variant="outline"
              onClick={addAssignment}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("prescription.addPharmacy")}
            </Button>

            <div>
              <Label>{t("prescription.deliveryFee")}</Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={deliveryFee}
                onChange={(e) =>
                  setDeliveryFee(parseFloat(e.target.value) || 0)
                }
              />
            </div>

            <Button
              onClick={handleAssign}
              disabled={assignMutation.isPending || !isFormValid}
              className="w-full"
            >
              {assignMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ClipboardCheck className="h-4 w-4 mr-2" />
              )}
              {t("prescription.assignPrescription")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
