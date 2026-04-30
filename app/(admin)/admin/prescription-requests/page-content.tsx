"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  FileText,
  ClipboardCheck,
  Plus,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
  User,
  Mail,
  Phone,
  MapPin,
  StickyNote,
  Calendar,
  Package,
  Search,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useAdminPrescriptionRequests,
  useAssignPrescription,
} from "@/features/admin/hooks/use-admin-prescriptions";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { ImageViewer } from "@/components/ui/image-viewer";
import { useTranslation } from "@/lib/i18n";
import {
  PrescriptionRequestStatus,
  type PrescriptionRequest,
  type PrescriptionOrder,
} from "@/types/prescription";
import { getImageUrl } from "@/lib/utils";
import {
  useAdminPharmacies,
  useAdminPharmacy,
} from "@/features/admin/hooks/use-admin-pharmacies";
import { PharmacyStatus } from "@/types/enums";

interface AssignmentItem {
  medicationName: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

interface PharmacyAssignment {
  pharmacyId: string;
  items: AssignmentItem[];
}

const statusTranslationMap: Record<string, string> = {
  PENDING_REVIEW: "prescription.statusPendingReview",
  ASSIGNED: "prescription.statusAssigned",
  CONFIRMED: "prescription.statusConfirmed",
  PREPARING: "prescription.statusPreparing",
  READY_FOR_PICKUP: "prescription.statusReadyForPickup",
  OUT_FOR_DELIVERY: "prescription.statusOutForDelivery",
  DELIVERED: "prescription.statusDelivered",
  CANCELLED: "prescription.statusCancelled",
  PENDING: "prescription.paymentPending",
  PAID: "prescription.paymentPaid",
  FAILED: "prescription.paymentFailed",
  REFUNDED: "prescription.paymentRefunded",
};

function getStatusVariant(
  status: string,
): "default" | "secondary" | "success" | "error" | "warning" | "outline" {
  switch (status) {
    case "DELIVERED":
    case "PAID":
      return "success";
    case "CANCELLED":
    case "FAILED":
      return "error";
    case "PENDING_REVIEW":
    case "PENDING":
      return "warning";
    case "PREPARING":
    case "OUT_FOR_DELIVERY":
      return "default";
    default:
      return "secondary";
  }
}

function getTypeLabel(type: string, t: (key: string) => string): string {
  switch (type) {
    case "IMAGE":
      return t("prescription.typeImage");
    case "TEXT":
      return t("prescription.typeText");
    case "MIXED":
      return t("prescription.typeMixed");
    default:
      return type;
  }
}

const EMPTY_ITEM: AssignmentItem = {
  medicationName: "",
  quantity: 1,
  unitPrice: 0,
};

const EMPTY_ASSIGNMENT: PharmacyAssignment = {
  pharmacyId: "",
  items: [{ ...EMPTY_ITEM }],
};

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// Searchable pharmacy combobox component
function PharmacyCombobox({
  value,
  onSelect,
  enabled,
  t,
}: {
  value: string;
  onSelect: (pharmacyId: string) => void;
  enabled: boolean;
  t: (key: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data: pharmaciesData, isLoading } = useAdminPharmacies({
    page,
    limit: 10,
    status: PharmacyStatus.APPROVED,
    search: debouncedSearch.length >= 2 ? debouncedSearch : undefined,
  });

  const pharmacies = pharmaciesData?.data ?? [];
  const meta = pharmaciesData?.meta;
  const hasMore = meta ? page < meta.totalPages : false;

  // Get the selected pharmacy name for display
  const { data: selectedPharmacyData } = useAdminPharmacy(value);
  const selectedPharmacy = selectedPharmacyData ?? null;
  const rawName = selectedPharmacy?.name as
    | string
    | { ar?: string; en?: string }
    | undefined;
  const selectedName =
    typeof rawName === "string" ? rawName : (rawName?.ar ?? rawName?.en ?? "");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {value ? (
            <span className="truncate">{selectedName || value}</span>
          ) : (
            <span className="text-muted-foreground">
              {t("prescription.selectPharmacy")}
            </span>
          )}
          <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        {/* Search input */}
        <div className="flex items-center border-b px-3">
          <Search className="me-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            ref={inputRef}
            placeholder={t("prescription.searchPharmacy")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* Results */}
        <div className="max-h-[250px] overflow-y-auto p-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : pharmacies.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t("prescription.noPharmaciesFound")}
            </p>
          ) : (
            <>
              {pharmacies.map((p: any) => (
                <button
                  key={p.id}
                  type="button"
                  className="relative flex w-full cursor-pointer select-none items-start rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                  onClick={() => {
                    onSelect(p.id);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <Check
                    className={`me-2 h-4 w-4 shrink-0 mt-0.5 ${
                      value === p.id ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{p.name || p.id}</div>
                    {p.address && (
                      <div className="text-xs text-muted-foreground truncate">
                        <MapPin className="inline h-3 w-3 me-1" />
                        {p.address}
                        {p.city?.name ? `, ${p.city.name}` : ""}
                      </div>
                    )}
                  </div>
                </button>
              ))}

              {/* Load more button */}
              {hasMore && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-1"
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  {t("prescription.loadMore")}
                </Button>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function AdminPrescriptionRequestsPageContent() {
  const { t, locale } = useTranslation();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: undefined as string | undefined,
  });
  const { data, isLoading } = useAdminPrescriptionRequests(filters);
  const assignMutation = useAssignPrescription();

  const [assignRequestId, setAssignRequestId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<PharmacyAssignment[]>([
    { ...EMPTY_ASSIGNMENT, items: [{ ...EMPTY_ITEM }] },
  ]);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(
    new Set(),
  );

  const toggleExpanded = (id: string) => {
    setExpandedRequests((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const addAssignment = () => {
    setAssignments((prev) => [
      ...prev,
      { pharmacyId: "", items: [{ ...EMPTY_ITEM }] },
    ]);
  };

  const removeAssignment = (index: number) => {
    setAssignments((prev) => prev.filter((_, i) => i !== index));
  };

  const addItem = (assignmentIndex: number) => {
    setAssignments((prev) =>
      prev.map((a, i) =>
        i === assignmentIndex
          ? { ...a, items: [...a.items, { ...EMPTY_ITEM }] }
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

  const setPharmacyId = (assignmentIndex: number, pharmacyId: string) => {
    setAssignments((prev) =>
      prev.map((a, i) => (i === assignmentIndex ? { ...a, pharmacyId } : a)),
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
    setAssignments([{ pharmacyId: "", items: [{ ...EMPTY_ITEM }] }]);
    setDeliveryFee(0);
  };

  const isFormValid = assignments.every(
    (a) =>
      a.pharmacyId &&
      a.items.length > 0 &&
      a.items.every(
        (i) => i.medicationName.trim() && i.quantity > 0 && i.unitPrice >= 0,
      ),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
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
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("common.all")}</SelectItem>
            {Object.values(PrescriptionRequestStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {t(statusTranslationMap[status] || status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        <div className="space-y-4">
          {(data?.data || []).map((req: PrescriptionRequest) => {
            const isExpanded = expandedRequests.has(req.id);
            const hasOrders = req.orders && req.orders.length > 0;

            return (
              <Card key={req.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Header row: request number + status + assign button */}
                  <div className="flex items-center justify-between p-4 pb-0">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg">
                        {req.requestNumber}
                      </span>
                      <Badge variant={getStatusVariant(req.status)}>
                        {t(statusTranslationMap[req.status] || req.status)}
                      </Badge>
                      <Badge variant="outline">
                        {getTypeLabel(req.type, t)}
                      </Badge>
                    </div>
                    {req.status === "PENDING_REVIEW" && (
                      <Button
                        size="sm"
                        onClick={() => setAssignRequestId(req.id)}
                      >
                        <ClipboardCheck className="h-3 w-3 me-1" />
                        {t("prescription.assign")}
                      </Button>
                    )}
                  </div>

                  {/* Main details grid */}
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Patient info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-medium">
                          {t("prescription.patient")}:
                        </span>
                        <span>{req.patient?.fullName}</span>
                      </div>
                      {req.patient?.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="font-medium">
                            {t("prescription.email")}:
                          </span>
                          <span className="text-muted-foreground" dir="ltr">
                            {req.patient.email}
                          </span>
                        </div>
                      )}
                      {req.patient?.phoneNumber && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="font-medium">
                            {t("prescription.phone")}:
                          </span>
                          <span className="text-muted-foreground" dir="ltr">
                            {req.patient.phoneNumber}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">
                          {new Date(req.createdAt).toLocaleDateString(
                            locale === "ar" ? "ar-EG" : "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      </div>
                      {req.assignedAt && (
                        <div className="flex items-center gap-2 text-sm">
                          <ClipboardCheck className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="font-medium">
                            {t("prescription.assignedAt")}:
                          </span>
                          <span className="text-muted-foreground">
                            {new Date(req.assignedAt).toLocaleDateString(
                              locale === "ar" ? "ar-EG" : "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Address + financials */}
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium">
                            {t("prescription.deliveryAddress")}:
                          </span>
                          {req.deliveryAddress ? (
                            <p className="text-muted-foreground">
                              {req.deliveryAddress.label && (
                                <span className="font-medium">
                                  {req.deliveryAddress.label}
                                  {" - "}
                                </span>
                              )}
                              {req.deliveryAddress.addressLine1}
                              {req.deliveryAddress.city &&
                                `, ${req.deliveryAddress.city}`}
                            </p>
                          ) : (
                            <p className="text-muted-foreground">
                              {t("prescription.noAddress")}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-medium">
                          {t("prescription.orders")}:
                        </span>
                        <span>{req.orders?.length || 0}</span>
                        {req.totalAmount != null &&
                          Number(req.totalAmount) > 0 && (
                            <>
                              <span className="text-muted-foreground">|</span>
                              <span className="font-medium">
                                {t("prescription.total")}:
                              </span>
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                {Number(req.totalAmount).toFixed(2)}
                              </span>
                            </>
                          )}
                      </div>
                      {req.status === "CANCELLED" && req.cancelReason && (
                        <div className="flex items-start gap-2 text-sm">
                          <StickyNote className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                          <div>
                            <span className="font-medium text-destructive">
                              {t("prescription.cancelReason")}:
                            </span>
                            <p className="text-destructive/80">
                              {req.cancelReason}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Prescription text */}
                  {req.prescriptionText && (
                    <div className="px-4 pb-2">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          {t("prescription.prescriptionText")}
                        </p>
                        <p className="text-sm whitespace-pre-wrap">
                          {req.prescriptionText}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Patient notes */}
                  {req.notes && (
                    <div className="px-4 pb-2">
                      <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          {t("prescription.notes")}
                        </p>
                        <p className="text-sm whitespace-pre-wrap">
                          {req.notes}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Prescription images */}
                  {req.prescriptionImages?.length > 0 && (
                    <div className="px-4 pb-3">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        {t("prescription.prescriptionImages")} (
                        {req.prescriptionImages.length})
                      </p>
                      <div
                        className="flex gap-2 cursor-pointer flex-wrap"
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
                          .slice(0, 5)
                          .map((key: string, i: number) => (
                            <img
                              key={key}
                              src={getImageUrl(key)}
                              alt={`Rx ${i + 1}`}
                              className="h-16 w-16 object-cover rounded-lg border hover:opacity-80 transition-opacity"
                            />
                          ))}
                        {req.prescriptionImages.length > 5 && (
                          <span className="h-16 w-16 rounded-lg border flex items-center justify-center text-xs text-muted-foreground bg-muted">
                            +{req.prescriptionImages.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Expandable orders section */}
                  {hasOrders && (
                    <>
                      <Separator />
                      <button
                        type="button"
                        onClick={() => toggleExpanded(req.id)}
                        className="w-full px-4 py-2.5 flex items-center justify-between text-sm font-medium hover:bg-muted/50 transition-colors"
                      >
                        <span>
                          {t("prescription.assignedOrders")} (
                          {req.orders!.length})
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-3">
                          {req.orders!.map((order: PrescriptionOrder) => (
                            <div
                              key={order.id}
                              className="border rounded-lg p-3 space-y-2 bg-muted/20"
                            >
                              {/* Order header */}
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">
                                    {order.orderNumber}
                                  </span>
                                  <Badge
                                    variant={getStatusVariant(order.status)}
                                    className="text-xs"
                                  >
                                    {t(
                                      statusTranslationMap[order.status] ||
                                        order.status,
                                    )}
                                  </Badge>
                                  <Badge
                                    variant={getStatusVariant(
                                      order.paymentStatus,
                                    )}
                                    className="text-xs"
                                  >
                                    {t("prescription.paymentStatus")}:{" "}
                                    {t(
                                      statusTranslationMap[
                                        order.paymentStatus
                                      ] || order.paymentStatus,
                                    )}
                                  </Badge>
                                </div>
                                {order.pharmacy && (
                                  <span className="text-sm text-muted-foreground">
                                    {t("prescription.pharmacy")}:{" "}
                                    <span className="font-medium text-foreground">
                                      {order.pharmacy.name}
                                    </span>
                                  </span>
                                )}
                              </div>

                              {/* Order items table */}
                              {order.items && order.items.length > 0 && (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="border-b text-muted-foreground">
                                        <th className="text-start py-1.5 pe-2 font-medium">
                                          {t("prescription.medication")}
                                        </th>
                                        <th className="text-center py-1.5 px-2 font-medium">
                                          {t("prescription.quantity")}
                                        </th>
                                        <th className="text-end py-1.5 px-2 font-medium">
                                          {t("prescription.unitPrice")}
                                        </th>
                                        <th className="text-end py-1.5 ps-2 font-medium">
                                          {t("prescription.total")}
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {order.items.map((item) => (
                                        <tr
                                          key={item.id}
                                          className="border-b last:border-0"
                                        >
                                          <td className="py-1.5 pe-2">
                                            {item.medicationName}
                                          </td>
                                          <td className="py-1.5 px-2 text-center">
                                            {item.quantity}
                                          </td>
                                          <td className="py-1.5 px-2 text-end">
                                            {Number(item.unitPrice).toFixed(2)}
                                          </td>
                                          <td className="py-1.5 ps-2 text-end font-medium">
                                            {(
                                              item.quantity *
                                              Number(item.unitPrice)
                                            ).toFixed(2)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}

                              {/* Order totals */}
                              <div className="flex items-center gap-4 text-xs pt-1 flex-wrap">
                                <span>
                                  {t("prescription.subtotal")}:{" "}
                                  <span className="font-medium">
                                    {Number(order.subtotal).toFixed(2)}
                                  </span>
                                </span>
                                <span>
                                  {t("prescription.deliveryFee")}:{" "}
                                  <span className="font-medium">
                                    {Number(order.deliveryFee).toFixed(2)}
                                  </span>
                                </span>
                                {order.commissionAmount != null && (
                                  <span>
                                    {t("prescription.commission")}:{" "}
                                    <span className="font-medium">
                                      {Number(order.commissionAmount).toFixed(
                                        2,
                                      )}
                                    </span>
                                  </span>
                                )}
                                <span className="font-semibold">
                                  {t("prescription.total")}:{" "}
                                  <span className="text-green-600 dark:text-green-400">
                                    {Number(order.totalAmount).toFixed(2)}
                                  </span>
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
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
        <DialogContent className="max-w-full sm:max-w-2xl md:max-w-3xl max-h-[85vh] overflow-y-auto">
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
                  {/* Searchable Pharmacy Selector */}
                  <div>
                    <Label>{t("prescription.selectPharmacy")}</Label>
                    <PharmacyCombobox
                      value={assignment.pharmacyId}
                      onSelect={(id) => setPharmacyId(aIdx, id)}
                      enabled={!!assignRequestId}
                      t={t}
                    />
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
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-3">
                          <Label className="text-xs">
                            {t("prescription.medicationName")}
                          </Label>
                          <Input
                            value={item.medicationName}
                            onChange={(e) =>
                              updateItem(
                                aIdx,
                                iIdx,
                                "medicationName",
                                e.target.value,
                              )
                            }
                            placeholder={t("prescription.medicationName")}
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
                    <Plus className="h-3 w-3 me-1" />
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
              <Plus className="h-4 w-4 me-2" />
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
                <Loader2 className="h-4 w-4 animate-spin me-2" />
              ) : (
                <ClipboardCheck className="h-4 w-4 me-2" />
              )}
              {t("prescription.assignPrescription")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
