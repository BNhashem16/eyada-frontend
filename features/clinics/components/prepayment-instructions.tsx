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
}

export function PrepaymentInstructions({
  open,
  onOpenChange,
  bookingNumber,
  price,
  paymentAccounts,
  whatsappNumber,
}: PrepaymentInstructionsProps) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

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

  const whatsappMessage = t("prepayment.whatsappMessage")
    .replace("{bookingNumber}", bookingNumber)
    .replace("{amount}", price.toString());

  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(whatsappMessage)}`
    : null;

  const handleDone = () => {
    onOpenChange(false);
    router.push("/patient/appointments");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">
              {t("prepayment.bookingNumber")}
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400 font-mono" dir="ltr">
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
          <div className="bg-warning-50 dark:bg-warning-900/20 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">
              {t("prepayment.amount")}
            </p>
            <span className="text-2xl font-bold text-warning-600 dark:text-warning-400">
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
                {paymentAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {account.paymentMethod
                          ? getLocalizedText(account.paymentMethod.name, locale)
                          : ""}
                      </p>
                      <p className="text-sm text-muted-foreground font-mono" dir="ltr">
                        {account.accountNumber}
                      </p>
                      {account.accountName && (
                        <p className="text-xs text-muted-foreground">
                          {account.accountName}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleCopyAccount(account.accountNumber)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
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
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full p-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              {t("prepayment.sendViaWhatsapp")}
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
