import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { ForgotPasswordContent } from "./forgot-password-content";

export const metadata: Metadata = {
  title: getTranslation("meta.forgotPassword.title"),
  description: getTranslation("meta.forgotPassword.description"),
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordContent />;
}
