"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Copy,
  Check,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DoctorPaymentAccount } from "@/types";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { useTranslation } from "@/lib/i18n";

interface PrepaymentInstructionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingNumber: string;
  price: number;
  paymentAccounts: DoctorPaymentAccount[];
  whatsappNumber?: string;
  patientName: string;
  appointmentDate: string;
  serviceName: string;
  doctorName: string;
  clinicName: string;
}

export function PrepaymentInstructions({
  open,
  onOpenChange,
  bookingNumber,
  price,
  paymentAccounts,
  whatsappNumber,
  patientName,
  appointmentDate,
  serviceName,
  doctorName,
  clinicName,
}: PrepaymentInstructionsProps) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>("");

  const handleCopyBookingNumber = async () => {
    try {
      await navigator.clipboard.writeText(bookingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = bookingNumber;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyAccount = async (accountNumber: string) => {
    try {
      await navigator.clipboard.writeText(accountNumber);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = accountNumber;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  };

  const selectedAccount = paymentAccounts.find((a) => a.id === selectedPaymentMethodId);
  const selectedPaymentMethodName = selectedAccount?.paymentMethod
    ? getLocalizedText(selectedAccount.paymentMethod.name, locale)
    : "";

  const whatsappMessage = t("prepayment.whatsappMessage")
    .replace("{bookingNumber}", bookingNumber)
    .replace("{patientName}", patientName)
    .replace("{appointmentDate}", appointmentDate)
    .replace("{clinicName}", clinicName)
    .replace("{doctorName}", doctorName)
    .replace("{serviceName}", serviceName)
    .replace("{amount}", price.toString())
    .replace("{paymentMethod}", selectedPaymentMethodName);

  const whatsappLink =
    whatsappNumber && selectedPaymentMethodId
      ? `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(whatsappMessage)}`
      : null;

  const handleDone = () => {
    onOpenChange(false);
    router.push("/patient/appointments");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary-600" />
            {t("prepayment.instructionsTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("prepayment.importantNote")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Booking Number */}
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3 sm:p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">
              {t("prepayment.bookingNumber")}
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg sm:text-2xl font-bold text-primary-600 dark:text-primary-400 font-mono break-all" dir="ltr">
                {bookingNumber}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleCopyBookingNumber}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Amount */}
          <div className="bg-warning-50 dark:bg-warning-900/20 rounded-lg p-3 sm:p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">
              {t("prepayment.amount")}
            </p>
            <span className="text-lg sm:text-2xl font-bold text-warning-600 dark:text-warning-400">
              {price} {t("common.egp")}
            </span>
          </div>

          <Separator />

          {/* Payment Accounts */}
          {paymentAccounts.length > 0 && (
            <div>
              <h4 className="font-medium text-foreground mb-3">
                {t("prepayment.paymentAccounts")}
              </h4>
              <div className="space-y-2">
                {paymentAccounts.map((account) => {
                  const isSelected = selectedPaymentMethodId === account.id;
                  return (
                    <button
                      key={account.id}
                      type="button"
                      onClick={() => setSelectedPaymentMethodId(account.id)}
                      className={`flex items-center justify-between gap-2 p-3 rounded-lg border w-full text-start transition-colors ${
                        isSelected
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-500"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground text-sm truncate">
                          {account.paymentMethod
                            ? getLocalizedText(account.paymentMethod.name, locale)
                            : ""}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground font-mono break-all" dir="ltr">
                          {account.accountNumber}
                        </p>
                        {account.accountName && (
                          <p className="text-xs text-muted-foreground">
                            {account.accountName}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {isSelected && (
                          <Check className="h-5 w-5 text-primary-600" />
                        )}
                        <span
                          role="button"
                          tabIndex={0}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent hover:text-accent-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyAccount(account.accountNumber);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              e.stopPropagation();
                              handleCopyAccount(account.accountNumber);
                            }
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              {!selectedPaymentMethodId && (
                <p className="text-xs text-warning-600 dark:text-warning-400 mt-2">
                  {t("prepayment.paymentMethodRequired")}
                </p>
              )}
            </div>
          )}

          <Separator />

          {/* Steps */}
          <div>
            <h4 className="font-medium text-foreground mb-3">
              {t("prepayment.instructions")}
            </h4>
            <div className="space-y-3">
              <Step number={1} text={t("prepayment.step1")} />
              <Step number={2} text={t("prepayment.step2")} />
              <Step number={3} text={t("prepayment.step3")} />
            </div>
          </div>

          {/* WhatsApp Button */}
          {whatsappNumber && (
            <a
              href={whatsappLink || "#"}
              target={whatsappLink ? "_blank" : undefined}
              rel="noopener noreferrer"
              onClick={(e) => {
                if (!whatsappLink) e.preventDefault();
              }}
              className={`flex items-center justify-center gap-2 w-full p-3 rounded-lg font-medium transition-colors ${
                whatsappLink
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              }`}
            >
              <MessageCircle className="h-5 w-5" />
              {whatsappLink
                ? t("prepayment.sendViaWhatsapp")
                : t("prepayment.selectPaymentMethod")}
            </a>
          )}

          {/* Done Button */}
          <Button className="w-full" variant="outline" onClick={handleDone}>
            <ArrowLeft className="h-4 w-4 me-2" />
            {t("prepayment.doneButton")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Step({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
          {number}
        </span>
      </div>
      <p className="text-sm text-foreground">{text}</p>
    </div>
  );
}
