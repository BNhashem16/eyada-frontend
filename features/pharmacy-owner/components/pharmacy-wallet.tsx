"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Wallet,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  Loader2,
  RefreshCw as RefreshIcon,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Currency,
  KpiSkeleton,
  ListSkeleton,
  PharmacyEmptyState,
  PharmacyErrorState,
  RefreshButton,
  SettlementStatusBadge,
} from "@/components/pharmacy";
import {
  useMyPharmacies,
  usePharmacySettlements,
  useRequestSettlement,
  useWalletSummary,
  useWalletTransactions,
} from "../hooks";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { useTranslation } from "@/lib/i18n";
import { pharmacyWalletKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

const TX_TYPE_CONFIG: Record<
  string,
  { key: string; icon: typeof ArrowUpRight; tone: string }
> = {
  CREDIT: {
    key: "credit",
    icon: ArrowDownRight,
    tone: "text-success-700 dark:text-success-200",
  },
  DEBIT: {
    key: "debit",
    icon: ArrowUpRight,
    tone: "text-error-600 dark:text-error-300",
  },
  SETTLEMENT: {
    key: "settlement",
    icon: RefreshIcon,
    tone: "text-blue-600 dark:text-blue-300",
  },
  REFUND: {
    key: "refund",
    icon: RefreshIcon,
    tone: "text-warning-700 dark:text-warning-200",
  },
  COMMISSION: {
    key: "commission",
    icon: ArrowUpRight,
    tone: "text-purple-600 dark:text-purple-300",
  },
};

export function PharmacyWallet() {
  const { t, locale } = useTranslation();
  const queryClient = useQueryClient();
  const { data: pharmacies, isLoading: loadingPharmacies } = useMyPharmacies();

  const [selectedPharmacy, setSelectedPharmacy] = useState("");
  const [settlementOpen, setSettlementOpen] = useState(false);
  const [settlementAmount, setSettlementAmount] = useState("");
  const [settlementNotes, setSettlementNotes] = useState("");

  const pharmacyList = pharmacies?.data;
  const pharmacyId = selectedPharmacy || pharmacyList?.[0]?.id || "";

  // Default first pharmacy in an effect (no setState during render).
  useEffect(() => {
    if (!selectedPharmacy && pharmacyList?.length) {
      setSelectedPharmacy(pharmacyList[0].id);
    }
  }, [pharmacyList, selectedPharmacy]);

  const {
    data: walletSummary,
    isLoading: loadingWallet,
    isError: walletError,
  } = useWalletSummary(pharmacyId);
  const { data: transactions, isLoading: loadingTx } =
    useWalletTransactions(pharmacyId);
  const { data: settlements, isLoading: loadingSettlements } =
    usePharmacySettlements(pharmacyId);
  const requestSettlement = useRequestSettlement(pharmacyId);

  const handleRefresh = useMemo(
    () => async () => {
      if (!pharmacyId) return;
      await queryClient.invalidateQueries({
        queryKey: pharmacyWalletKeys.scoped(pharmacyId),
      });
    },
    [queryClient, pharmacyId],
  );

  const handleRequestSettlement = async () => {
    await requestSettlement.mutateAsync({
      amount: Number(settlementAmount),
      notes: settlementNotes || undefined,
    });
    setSettlementOpen(false);
    setSettlementAmount("");
    setSettlementNotes("");
  };

  const isLoading = loadingPharmacies || loadingWallet;
  const balance = Number(walletSummary?.balance ?? 0);

  if (walletError) {
    return <PharmacyErrorState onRetry={handleRefresh} />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {pharmacyList && pharmacyList.length > 1 ? (
          <Select value={selectedPharmacy} onValueChange={setSelectedPharmacy}>
            <SelectTrigger
              className="min-h-[44px] w-full sm:min-h-9 sm:w-64"
              aria-label={t("pharmacyOwner.selectPharmacy")}
            >
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
        ) : (
          <span className="sr-only">{t("pharmacyOwner.selectPharmacy")}</span>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <RefreshButton onRefresh={handleRefresh} />
          {balance > 0 ? (
            <Button
              onClick={() => setSettlementOpen(true)}
              className="min-h-[44px] sm:min-h-9"
            >
              <ArrowUpRight className="me-2 size-4" aria-hidden="true" />
              {t("pharmacyOwner.requestSettlement")}
            </Button>
          ) : null}
        </div>
      </div>

      {/* KPI cards */}
      {isLoading ? (
        <KpiSkeleton count={4} />
      ) : walletSummary ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          <WalletKpi
            icon={Wallet}
            tone="text-primary-600 dark:text-primary-300"
            label={t("pharmacyOwner.walletBalance")}
            amount={balance}
          />
          <WalletKpi
            icon={TrendingUp}
            tone="text-success-700 dark:text-success-200"
            label={t("pharmacyOwner.totalEarned")}
            amount={Number(walletSummary.totalEarned)}
          />
          <WalletKpi
            icon={ArrowUpRight}
            tone="text-blue-600 dark:text-blue-300"
            label={t("pharmacyOwner.totalSettled")}
            amount={Number(walletSummary.totalSettled)}
          />
          <WalletKpi
            icon={Clock}
            tone="text-warning-700 dark:text-warning-200"
            label={t("pharmacyOwner.pendingSettlement")}
            amount={Number(walletSummary.pendingSettlementAmount ?? 0)}
          />
        </div>
      ) : null}

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t("pharmacyOwner.transactionHistory")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingTx ? (
            <ListSkeleton rows={3} />
          ) : !transactions?.data?.length ? (
            <PharmacyEmptyState
              icon={Wallet}
              title={t("pharmacyOwner.noTransactions")}
            />
          ) : (
            <ul className="divide-y divide-border" role="list">
              {transactions.data.map((tx) => {
                const config = TX_TYPE_CONFIG[tx.type] ?? TX_TYPE_CONFIG.CREDIT;
                const TxIcon = config.icon;
                return (
                  <li
                    key={tx.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={cn(
                          "grid size-8 shrink-0 place-items-center rounded-full bg-muted",
                          config.tone,
                        )}
                        aria-hidden="true"
                      >
                        <TxIcon className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
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
                      className={cn(
                        "shrink-0 font-semibold",
                        tx.type === "CREDIT"
                          ? "text-success-700 dark:text-success-200"
                          : "text-error-600 dark:text-error-300",
                      )}
                    >
                      {tx.type === "CREDIT" ? "+" : "-"}
                      <Currency amount={tx.amount} />
                    </span>
                  </li>
                );
              })}
            </ul>
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
            <ListSkeleton rows={2} />
          ) : !settlements?.data?.length ? (
            <PharmacyEmptyState
              icon={RefreshIcon}
              title={t("pharmacyOwner.noSettlements")}
            />
          ) : (
            <ul className="divide-y divide-border" role="list">
              {settlements.data.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      <Currency amount={s.amount} />
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(s.createdAt).toLocaleString(
                        locale === "ar" ? "ar-EG" : "en-US",
                      )}
                    </p>
                  </div>
                  <SettlementStatusBadge status={s.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Request settlement dialog (responsive sheet on mobile) */}
      <Dialog open={settlementOpen} onOpenChange={setSettlementOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("pharmacyOwner.requestSettlement")}</DialogTitle>
            <DialogDescription>
              {t("pharmacyOwner.walletBalance")}: <Currency amount={balance} />
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="settlement-amount" required>
                {t("pharmacyOwner.settlementAmount")}
              </Label>
              <Input
                id="settlement-amount"
                type="number"
                inputMode="decimal"
                value={settlementAmount}
                onChange={(e) => setSettlementAmount(e.target.value)}
                min={1}
                max={balance}
                placeholder="0.00"
                className="min-h-[44px] sm:min-h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="settlement-notes">
                {t("pharmacyOwner.settlementNotes")}
              </Label>
              <Textarea
                id="settlement-notes"
                value={settlementNotes}
                onChange={(e) => setSettlementNotes(e.target.value)}
                placeholder={t("pharmacyOwner.settlementNotesPlaceholder")}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSettlementOpen(false)}
              className="min-h-[44px] sm:min-h-9"
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleRequestSettlement}
              disabled={
                !settlementAmount ||
                Number(settlementAmount) <= 0 ||
                Number(settlementAmount) > balance ||
                requestSettlement.isPending
              }
              className="min-h-[44px] sm:min-h-9"
            >
              {requestSettlement.isPending ? (
                <Loader2 className="me-2 size-4 animate-spin" />
              ) : null}
              {t("pharmacyOwner.requestSettlement")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface WalletKpiProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  tone: string;
  label: string;
  amount: number;
}

function WalletKpi({ icon: Icon, tone, label, amount }: WalletKpiProps) {
  return (
    <Card>
      <CardContent className="space-y-1.5 p-4">
        <div className="flex items-center gap-2">
          <Icon className={cn("size-5", tone)} aria-hidden="true" />
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        <p className="text-xl font-bold sm:text-2xl">
          <Currency
            amount={amount}
            className={cn("text-xl sm:text-2xl", tone)}
          />
        </p>
      </CardContent>
    </Card>
  );
}
