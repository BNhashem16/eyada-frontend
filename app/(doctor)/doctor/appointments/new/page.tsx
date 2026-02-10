import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { DoctorNewAppointmentContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.doctorNewAppointment.title"),
  description: getTranslation("meta.doctorNewAppointment.description"),
  robots: { index: false, follow: false },
};

export default function DoctorNewAppointmentPage() {
  return <DoctorNewAppointmentContent />;
}
