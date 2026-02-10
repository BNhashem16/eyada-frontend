import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { LoginPageContent } from "./login-content";

export const metadata: Metadata = {
  title: getTranslation("meta.login.title"),
  description: getTranslation("meta.login.description"),
  openGraph: {
    title: getTranslation("meta.login.title"),
    description: getTranslation("meta.login.description"),
    url: "https://clinics-eg.com/login",
  },
  alternates: {
    canonical: "https://clinics-eg.com/login",
  },
};

export default function LoginPage() {
  return <LoginPageContent />;
}
