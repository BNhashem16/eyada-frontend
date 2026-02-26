"use client";

import { useState } from "react";
import {
  Wallet,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useWalletSummary,
  useWalletTransactions,
  usePharmacySettlements,
  useRequestSettlement,
} from "../hooks";
import { useMyPharmacies } from "../hooks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { useTranslation } from "@/lib/i18n";
import type { WalletTransactionType } from "@/types/wallet";

const TX_TYPE_CONFIG: Record<
  string,
  { key: string; icon: typeof ArrowUpRight; color: string }
> = {
  CREDIT: { key: "credit", icon: ArrowDownRight, color: "text-green-600" },
  DEBIT: { key: "debit", icon: ArrowUpRight, color: "text-red-600" },
  SETTLEMENT: { key: "settlement", icon: RefreshCw, color: "text-blue-600" },
  REFUND: { key: "refund", icon: RefreshCw, color: "text-orange-600" },
  COMMISSION: {
    key: "commission",
    icon: ArrowUpRight,
    color: "text-purple-600",
  },
};

const SETTLEMENT_STATUS_CONFIG: Record<
  string,
  { key: string; variant: string }
> = {
  PENDING: { key: "settlementPending", variant: "warning" },
  PROCESSING: { key: "settlementProcessing", variant: "info" },
  COMPLETED: { key: "settlementCompleted", variant: "success" },
  FAILED: { key: "settlementFailed", variant: "error" },
};

export function PharmacyWallet() {
  const { t, locale } = useTranslation();
  const { data: pharmacies, isLoading: loadingPharmacies } = useMyPharmacies();

  const [selectedPharmacy, setSelectedPharmacy] = useState("");
  const [settlementOpen, setSettlementOpen] = useState(false);
  const [settlementAmount, setSettlementAmount] = useState("");
  const [settlementNotes, setSettlementNotes] = useState("");

  const pharmacyList = pharmacies?.data;
  const pharmacyId = selectedPharmacy || pharmacyList?.[0]?.id || "";

  const { data: walletSummary, isLoading: loadingWallet } =
    useWalletSummary(pharmacyId);
  const { data: transactions, isLoading: loadingTx } =
    useWalletTransactions(pharmacyId);
  const { data: settlements, isLoading: loadingSettlements } =
    usePharmacySettlements(pharmacyId);
  const requestSettlement = useRequestSettlement(pharmacyId);

  // Auto-select first pharmacy
  if (!selectedPharmacy && pharmacyList?.length) {
    setSelectedPharmacy(pharmacyList[0].id);
  }

  const handleRequestSettlement = () => {
    requestSettlement.mutate(
      {
        amount: Number(settlementAmount),
        notes: settlementNotes || undefined,
      },
      {
        onSuccess: () => {
          setSettlementOpen(false);
          setSettlementAmount("");
          setSettlementNotes("");
        },
      },
    );
  };

  const isLoading = loadingPharmacies || loadingWallet;

  return (
    <>
      {/* Pharmacy Selector */}
      {pharmacyList && pharmacyList.length > 1 && (
        <Card>
          <CardContent className="p-4">
            <Select
              value={selectedPharmacy}
              onValueChange={setSelectedPharmacy}
            >
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder={t("pharmacyOwner.selectPharmacy")} />
              </SelectTrigger>
              <SelectContent>
                {pharmacyList.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {getLocalizedText(p.name, locale)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Wallet Summary Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : walletSummary ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-5 w-5 text-primary-600" />
                <span className="text-sm text-muted-foreground">
                  {t("pharmacyOwner.walletBalance")}
                </span>
              </div>
              <p className="text-2xl font-bold">
                {Number(walletSummary.balance).toFixed(2)} {t("common.egp")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm text-muted-foreground">
                  {t("pharmacyOwner.totalEarned")}
                </span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {Number(walletSummary.totalEarned).toFixed(2)} {t("common.egp")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpRight className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-muted-foreground">
                  {t("pharmacyOwner.totalSettled")}
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {Number(walletSummary.totalSettled).toFixed(2)}{" "}
                {t("common.egp")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <span className="text-sm text-muted-foreground">
                  {t("pharmacyOwner.pendingSettlement")}
                </span>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {Number(walletSummary.pendingSettlementAmount).toFixed(2)}{" "}
                {t("common.egp")}
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Request Settlement Button */}
      {walletSummary && Number(walletSummary.balance) > 0 && (
        <div className="flex justify-end">
          <Button onClick={() => setSettlementOpen(true)}>
            <ArrowUpRight className="h-4 w-4 me-2" />
            {t("pharmacyOwner.requestSettlement")}
          </Button>
        </div>
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t("pharmacyOwner.transactionHistory")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingTx ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !transactions?.data?.length ? (
            <div className="py-8 text-center">
              <Wallet className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">
                {t("pharmacyOwner.noTransactions")}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.data.map((tx) => {
                const config = TX_TYPE_CONFIG[tx.type] || TX_TYPE_CONFIG.CREDIT;
                const TxIcon = config.icon;
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-3 border-b last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-8 w-8 rounded-full bg-muted flex items-center justify-center ${config.color}`}
                      >
                        <TxIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {t(`pharmacyOwner.${config.key}`)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleString(
                            locale === "ar" ? "ar-EG" : "en-US",
                          )}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-semibold ${tx.type === "CREDIT" ? "text-green-600" : "text-red-600"}`}
                    >
                      {tx.type === "CREDIT" ? "+" : "-"}
                      {Number(tx.amount).toFixed(2)} {t("common.egp")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settlement History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t("pharmacyOwner.settlementHistory")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingSettlements ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !settlements?.data?.length ? (
            <div className="py-8 text-center">
              <RefreshCw className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">
                {t("pharmacyOwner.noSettlements")}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {settlements.data.map((s) => {
                const statusConfig =
                  SETTLEMENT_STATUS_CONFIG[s.status] ||
                  SETTLEMENT_STATUS_CONFIG.PENDING;
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between py-3 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {Number(s.amount).toFixed(2)} {t("common.egp")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(s.createdAt).toLocaleString(
                          locale === "ar" ? "ar-EG" : "en-US",
                        )}
                      </p>
                    </div>
                    <Badge variant={statusConfig.variant as any}>
                      {t(`pharmacyOwner.${statusConfig.key}`)}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settlement Request Dialog */}
      <Dialog open={settlementOpen} onOpenChange={setSettlementOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("pharmacyOwner.requestSettlement")}</DialogTitle>
            <DialogDescription>
              {t("pharmacyOwner.walletBalance")}:{" "}
              {Number(walletSummary?.balance || 0).toFixed(2)} {t("common.egp")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label required>{t("pharmacyOwner.settlementAmount")}</Label>
              <Input
                type="number"
                value={settlementAmount}
                onChange={(e) => setSettlementAmount(e.target.value)}
                min={1}
                max={Number(walletSummary?.balance || 0)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>{t("pharmacyOwner.settlementNotes")}</Label>
              <Textarea
                value={settlementNotes}
                onChange={(e) => setSettlementNotes(e.target.value)}
                placeholder={t("pharmacyOwner.settlementNotesPlaceholder")}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettlementOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleRequestSettlement}
              disabled={
                !settlementAmount ||
                Number(settlementAmount) <= 0 ||
                requestSettlement.isPending
              }
            >
              {requestSettlement.isPending && (
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
              )}
              {t("pharmacyOwner.requestSettlement")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
