"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  CreditCard,
  Loader2,
  Phone,
  Mail,
  Percent,
  DollarSign,
  FileText,
  Receipt,
  User,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useDoctorDetailedReport,
  useRecordPayment,
  DateFilterPeriod,
} from "../hooks";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { useTranslation } from "@/lib/i18n";

interface DoctorReportProps {
  doctorProfileId: string;
}

interface PaymentFormData {
  amount: string;
  paymentMethod: string;
  referenceNumber: string;
  notes: string;
}

const initialPaymentData: PaymentFormData = {
  amount: "",
  paymentMethod: "",
  referenceNumber: "",
  notes: "",
};

const periodOptions: { value: DateFilterPeriod; label: string }[] = [
  { value: "TODAY", label: "admin.collections.today" },
  { value: "THIS_WEEK", label: "admin.collections.thisWeek" },
  { value: "THIS_MONTH", label: "admin.collections.thisMonth" },
  { value: "THIS_YEAR", label: "admin.collections.thisYear" },
  { value: "CUSTOM", label: "admin.collections.custom" },
];

export function DoctorReport({ doctorProfileId }: DoctorReportProps) {
  const { t, locale } = useTranslation();
  const [period, setPeriod] = useState<DateFilterPeriod | undefined>(undefined);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filters = {
    period,
    dateFrom: period === "CUSTOM" ? dateFrom : undefined,
    dateTo: period === "CUSTOM" ? dateTo : undefined,
  };

  const {
    data: report,
    isLoading,
    isError,
  } = useDoctorDetailedReport(doctorProfileId, filters);
  const recordPayment = useRecordPayment();

  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentData, setPaymentData] =
    useState<PaymentFormData>(initialPaymentData);

  const handleOpenPayment = () => {
    setPaymentData({
      ...initialPaymentData,
      amount: report?.balance.toString() || "",
    });
    setIsPaymentDialogOpen(true);
  };

  const handleRecordPayment = () => {
    const amount = parseFloat(paymentData.amount);
    if (isNaN(amount) || amount <= 0) return;

    recordPayment.mutate(
      {
        doctorProfileId,
        amount,
        paymentMethod: paymentData.paymentMethod || undefined,
        referenceNumber: paymentData.referenceNumber || undefined,
        notes: paymentData.notes || undefined,
      },
      {
        onSuccess: () => {
          setIsPaymentDialogOpen(false);
          setPaymentData(initialPaymentData);
        },
      },
    );
  };

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString()} ${t("common.currency")}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      locale === "ar" ? "ar-EG" : "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      },
    );
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleDateString(
      locale === "ar" ? "ar-EG" : "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !report) {
    return (
      <Card className="border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-900/20">
        <CardContent className="py-10 text-center">
          <p className="text-error-600 dark:text-error-400">
            {t("errors.loadError")}
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/admin/collections">
              <ArrowRight className="h-4 w-4 me-2 rotate-180" />
              {t("common.back")}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Doctor Info Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <User className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{report.doctorName}</h2>
                <p className="text-muted-foreground">
                  {getLocalizedText(report.specialtyName, locale)}
                </p>
                <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {report.doctorPhone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {report.doctorEmail}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/admin/collections">
                  <ArrowRight className="h-4 w-4 me-2 rotate-180" />
                  {t("common.back")}
                </Link>
              </Button>
              {report.balance > 0 && (
                <Button onClick={handleOpenPayment}>
                  <CreditCard className="h-4 w-4 me-2" />
                  {t("admin.collections.recordPayment")}
                </Button>
              )}
            </div>
          </div>

          {/* Commission Settings */}
          {report.commissionSettings && (
            <div className="mt-4 pt-4 border-t">
              <span className="text-sm text-muted-foreground me-2">
                {t("admin.collections.currentCommission")}:
              </span>
              <Badge variant="outline" className="gap-1">
                {report.commissionSettings.type === "FIXED" ? (
                  <DollarSign className="h-3 w-3" />
                ) : (
                  <Percent className="h-3 w-3" />
                )}
                {report.commissionSettings.type === "FIXED"
                  ? `${report.commissionSettings.value} ${t("common.currency")}`
                  : `${report.commissionSettings.value}%`}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("admin.collections.totalCommission")}
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(report.totalCommission)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("admin.collections.totalPaid")}
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(report.totalPaid)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("admin.collections.balance")}
                </p>
                <p
                  className={`text-2xl font-bold ${report.balance > 0 ? "text-warning-600 dark:text-warning-400" : "text-green-600 dark:text-green-400"}`}
                >
                  {formatCurrency(report.balance)}
                </p>
              </div>
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  report.balance > 0
                    ? "bg-warning-100 dark:bg-warning-900/30"
                    : "bg-green-100 dark:bg-green-900/30"
                }`}
              >
                <Wallet
                  className={`h-5 w-5 ${
                    report.balance > 0
                      ? "text-warning-600 dark:text-warning-400"
                      : "text-green-600 dark:text-green-400"
                  }`}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <Label>{t("admin.collections.period")}</Label>
              <Select
                value={period || "all"}
                onValueChange={(value) =>
                  setPeriod(
                    value === "all" ? undefined : (value as DateFilterPeriod),
                  )
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t("admin.collections.allTime")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("admin.collections.allTime")}
                  </SelectItem>
                  {periodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {t(option.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {period === "CUSTOM" && (
              <>
                <div>
                  <Label>{t("admin.collections.dateFrom")}</Label>
                  <DatePickerInput
                    value={dateFrom}
                    onChange={setDateFrom}
                    placeholder={t("admin.collections.dateFrom")}
                  />
                </div>
                <div>
                  <Label>{t("admin.collections.dateTo")}</Label>
                  <DatePickerInput
                    value={dateTo}
                    onChange={setDateTo}
                    placeholder={t("admin.collections.dateTo")}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Appointments & Payments */}
      <Tabs defaultValue="appointments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="appointments" className="gap-2">
            <FileText className="h-4 w-4" />
            {t("admin.collections.appointments")} ({report.appointments.length})
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <Receipt className="h-4 w-4" />
            {t("admin.collections.payments")} ({report.payments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appointments">
          <Card>
            <CardContent className="p-6">
              {report.appointments.length === 0 ? (
                <div className="text-center py-10">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">
                    {t("admin.collections.noAppointments")}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {t("admin.collections.bookingNumber")}
                      </TableHead>
                      <TableHead>{t("admin.collections.patient")}</TableHead>
                      <TableHead>{t("admin.collections.service")}</TableHead>
                      <TableHead>{t("admin.collections.clinic")}</TableHead>
                      <TableHead>{t("admin.collections.price")}</TableHead>
                      <TableHead>{t("admin.collections.commission")}</TableHead>
                      <TableHead>{t("admin.collections.date")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.appointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell className="font-mono text-sm">
                          {appointment.bookingNumber}
                        </TableCell>
                        <TableCell>{appointment.patientName}</TableCell>
                        <TableCell>
                          {getLocalizedText(appointment.serviceName, locale)}
                        </TableCell>
                        <TableCell>
                          {getLocalizedText(appointment.clinicName, locale)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(appointment.price)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant="success" className="font-bold">
                              {formatCurrency(appointment.commissionAmount)}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              {appointment.commissionType === "FIXED"
                                ? `${t("admin.commissions.fixed")}: ${appointment.commissionValue}`
                                : `${appointment.commissionValue}%`}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {formatDate(appointment.appointmentDate)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardContent className="p-6">
              {report.payments.length === 0 ? (
                <div className="text-center py-10">
                  <Receipt className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">
                    {t("admin.collections.noPayments")}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("admin.collections.amount")}</TableHead>
                      <TableHead>
                        {t("admin.collections.paymentMethod")}
                      </TableHead>
                      <TableHead>
                        {t("admin.collections.referenceNumber")}
                      </TableHead>
                      <TableHead>{t("admin.collections.notes")}</TableHead>
                      <TableHead>
                        {t("admin.collections.paymentDate")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <Badge
                            variant="success"
                            className="font-bold text-base"
                          >
                            {formatCurrency(payment.amount)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {payment.paymentMethod
                            ? t(
                                `admin.collections.${payment.paymentMethod.toLowerCase()}`,
                              )
                            : "-"}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {payment.referenceNumber || "-"}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {payment.notes || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {formatDateTime(payment.paymentDate)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Record Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.collections.recordPayment")}</DialogTitle>
            <DialogDescription>
              {t("admin.collections.recordPaymentDesc", {
                doctor: report.doctorName,
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  {t("admin.collections.currentBalance")}
                </span>
                <span className="font-bold text-lg text-warning-600">
                  {formatCurrency(report.balance)}
                </span>
              </div>
            </div>

            <div>
              <Label>{t("admin.collections.amount")} *</Label>
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                max={report.balance}
                value={paymentData.amount}
                onChange={(e) =>
                  setPaymentData((p) => ({ ...p, amount: e.target.value }))
                }
                placeholder={t("admin.collections.amountPlaceholder")}
                dir="ltr"
              />
            </div>

            <div>
              <Label>{t("admin.collections.paymentMethod")}</Label>
              <Select
                value={paymentData.paymentMethod}
                onValueChange={(value) =>
                  setPaymentData((p) => ({ ...p, paymentMethod: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("admin.collections.selectMethod")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">
                    {t("admin.collections.cash")}
                  </SelectItem>
                  <SelectItem value="BANK_TRANSFER">
                    {t("admin.collections.bankTransfer")}
                  </SelectItem>
                  <SelectItem value="WALLET">
                    {t("admin.collections.wallet")}
                  </SelectItem>
                  <SelectItem value="OTHER">
                    {t("admin.collections.other")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t("admin.collections.referenceNumber")}</Label>
              <Input
                value={paymentData.referenceNumber}
                onChange={(e) =>
                  setPaymentData((p) => ({
                    ...p,
                    referenceNumber: e.target.value,
                  }))
                }
                placeholder={t("admin.collections.referencePlaceholder")}
                dir="ltr"
              />
            </div>

            <div>
              <Label>{t("admin.collections.notes")}</Label>
              <Textarea
                value={paymentData.notes}
                onChange={(e) =>
                  setPaymentData((p) => ({ ...p, notes: e.target.value }))
                }
                placeholder={t("admin.collections.notesPlaceholder")}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsPaymentDialogOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleRecordPayment}
              disabled={
                !paymentData.amount ||
                parseFloat(paymentData.amount) <= 0 ||
                parseFloat(paymentData.amount) > report.balance ||
                recordPayment.isPending
              }
            >
              {recordPayment.isPending && (
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
              )}
              {t("admin.collections.confirmPayment")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
