import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { PatientAppointmentsContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.patientAppointments.title"),
  description: getTranslation("meta.patientAppointments.description"),
  robots: { index: false, follow: false },
};

export default function PatientAppointmentsPage() {
  return <PatientAppointmentsContent />;
}
