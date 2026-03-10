"use client";

import { useState } from "react";
import { CreditCard, Loader2, Plus, Trash2, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PhoneInputWithCode } from "@/components/ui/phone-input-with-code";
import {
  useDoctorProfile,
  useUpdateDoctorProfile,
  useDoctorPaymentAccounts,
  useUpsertPaymentAccount,
  useDeletePaymentAccount,
} from "../hooks";
import { usePaymentMethods } from "@/hooks/use-payment-methods";
import { useTranslation } from "@/lib/i18n";
import { getLocalizedText } from "@/lib/utils";

export function PrepaymentSettings() {
  const { t, locale } = useTranslation();
  const { data: profile, isLoading: profileLoading } = useDoctorProfile();
  const updateProfile = useUpdateDoctorProfile();
  const { data: accounts, isLoading: accountsLoading } =
    useDoctorPaymentAccounts();
  const upsertAccount = useUpsertPaymentAccount();
  const deleteAccount = useDeletePaymentAccount();
  const { data: paymentMethods } = usePaymentMethods();

  const [whatsapp, setWhatsapp] = useState("");
  const [whatsappInitialized, setWhatsappInitialized] = useState(false);
  const [newMethodId, setNewMethodId] = useState("");
  const [newAccountNumber, setNewAccountNumber] = useState("");
  const [newAccountName, setNewAccountName] = useState("");

  // Initialize whatsapp from profile once loaded
  if (profile && !whatsappInitialized) {
    setWhatsapp(profile.prepaymentWhatsapp || "");
    setWhatsappInitialized(true);
  }

  const handleTogglePrepayment = () => {
    if (!profile) return;
    updateProfile.mutate({
      requirePrepayment: !profile.requirePrepayment,
      prepaymentWhatsapp: whatsapp || undefined,
    } as never);
  };

  const handleSaveWhatsapp = () => {
    if (!profile) return;
    updateProfile.mutate({
      requirePrepayment: profile.requirePrepayment,
      prepaymentWhatsapp: whatsapp || undefined,
    } as never);
  };

  const handleAddAccount = () => {
    if (!newMethodId || !newAccountNumber) return;
    upsertAccount.mutate(
      {
        paymentMethodId: newMethodId,
        accountNumber: newAccountNumber,
        accountName: newAccountName || undefined,
      },
      {
        onSuccess: () => {
          setNewMethodId("");
          setNewAccountNumber("");
          setNewAccountName("");
        },
      },
    );
  };

  const handleRemoveAccount = (accountId: string) => {
    deleteAccount.mutate(accountId);
  };

  // Filter out methods that already have accounts
  const usedMethodIds = new Set(accounts?.map((a) => a.paymentMethodId) || []);
  const availableMethods =
    paymentMethods?.filter((m) => !usedMethodIds.has(m.id) && m.isActive) || [];

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-60" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <CreditCard className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {t("prepayment.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("prepayment.manageSubtitle")}
          </p>
        </div>
      </div>

      {/* Toggle Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("prepayment.enable")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {profile.requirePrepayment
                  ? t("prepayment.enabled")
                  : t("prepayment.disabled")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {updateProfile.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Switch
                  checked={profile.requirePrepayment}
                  onCheckedChange={handleTogglePrepayment}
                />
              )}
              <Badge
                variant={profile.requirePrepayment ? "success" : "secondary"}
              >
                {profile.requirePrepayment
                  ? t("prepayment.required")
                  : t("prepayment.notRequired")}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-green-600" />
              {t("prepayment.whatsappNumber")}
            </Label>
            <div className="flex gap-2 items-start">
              <div className="flex-1">
                <PhoneInputWithCode
                  value={whatsapp}
                  onChange={setWhatsapp}
                  disabled={updateProfile.isPending}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t("prepayment.whatsappHint")}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSaveWhatsapp}
                disabled={updateProfile.isPending}
                className="mt-0"
              >
                {updateProfile.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("common.save")
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Accounts Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t("prepayment.paymentAccounts")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {accountsLoading ? (
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : accounts && accounts.length > 0 ? (
            <div className="space-y-2">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {account.paymentMethod
                        ? getLocalizedText(account.paymentMethod.name, locale)
                        : account.paymentMethodId}
                    </p>
                    <p className="text-sm text-muted-foreground" dir="ltr">
                      {account.accountNumber}
                      {account.accountName && ` - ${account.accountName}`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-error-600"
                    onClick={() => handleRemoveAccount(account.id)}
                    disabled={deleteAccount.isPending}
                  >
                    {deleteAccount.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">
              {t("prepayment.noAccounts")}
            </p>
          )}

          {/* Add Account Form */}
          {availableMethods.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">
                  {t("prepayment.addAccount")}
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Select value={newMethodId} onValueChange={setNewMethodId}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("prepayment.selectMethod")} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id}>
                          {getLocalizedText(method.name, locale)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={newAccountNumber}
                    onChange={(e) => setNewAccountNumber(e.target.value)}
                    placeholder={t("prepayment.accountNumber")}
                    dir="ltr"
                  />
                  <Input
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    placeholder={t("prepayment.accountName")}
                  />
                </div>
                <Button
                  size="sm"
                  onClick={handleAddAccount}
                  disabled={
                    !newMethodId || !newAccountNumber || upsertAccount.isPending
                  }
                >
                  {upsertAccount.isPending ? (
                    <Loader2 className="h-4 w-4 me-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 me-2" />
                  )}
                  {t("common.add")}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
