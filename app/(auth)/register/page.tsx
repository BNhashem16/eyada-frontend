import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { RegisterPageContent } from "./register-content";

export const metadata: Metadata = {
  title: getTranslation("meta.register.title"),
  description: getTranslation("meta.register.description"),
  openGraph: {
    title: getTranslation("meta.register.title"),
    description: getTranslation("meta.register.description"),
    url: "https://clinics-eg.com/register",
  },
  alternates: {
    canonical: "https://clinics-eg.com/register",
  },
};

export default function RegisterPage() {
  return <RegisterPageContent />;
}
