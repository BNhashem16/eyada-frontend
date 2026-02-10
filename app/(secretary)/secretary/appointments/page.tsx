import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { SecretaryAppointmentsContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.secretaryAppointments.title"),
  description: getTranslation("meta.secretaryAppointments.description"),
  robots: { index: false, follow: false },
};

export default function SecretaryAppointmentsPage() {
  return <SecretaryAppointmentsContent />;
}
