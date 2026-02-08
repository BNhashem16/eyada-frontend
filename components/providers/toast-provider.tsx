"use client";

import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider as RadixToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

const variantIcons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  default: Info,
};

export function ToastProvider() {
  const { toasts } = useToast();

  return (
    <RadixToastProvider>
      {toasts.map(function ({
        id,
        title,
        description,
        action,
        variant,
        ...props
      }) {
        const Icon = variantIcons[variant || "default"];
        const iconColors = {
          success: "text-green-600 dark:text-green-400",
          error: "text-red-600 dark:text-red-400",
          warning: "text-amber-600 dark:text-amber-400",
          default: "text-blue-600 dark:text-blue-400",
        };

        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start gap-3">
              <Icon
                className={`h-5 w-5 shrink-0 mt-0.5 ${iconColors[variant || "default"]}`}
              />
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </RadixToastProvider>
  );
}
