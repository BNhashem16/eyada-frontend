import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { SecretaryNewAppointmentContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.secretaryNewAppointment.title"),
  description: getTranslation("meta.secretaryNewAppointment.description"),
  robots: { index: false, follow: false },
};

export default function NewAppointmentPage() {
  return <SecretaryNewAppointmentContent />;
}
