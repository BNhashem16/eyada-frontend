import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { ContactPageContent } from "@/features/contact";

export const metadata: Metadata = {
  title: getTranslation("meta.contact.title"),
  description: getTranslation("meta.contact.description"),
  openGraph: {
    title: getTranslation("meta.contact.title"),
    description: getTranslation("meta.contact.description"),
    url: "https://clinics-eg.com/contact",
  },
  alternates: {
    canonical: "https://clinics-eg.com/contact",
  },
};

export default function ContactPage() {
  return <ContactPageContent />;
}
