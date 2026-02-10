import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { DoctorAppointmentsContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.doctorAppointments.title"),
  description: getTranslation("meta.doctorAppointments.description"),
  robots: { index: false, follow: false },
};

export default function DoctorAppointmentsPage() {
  return <DoctorAppointmentsContent />;
}
