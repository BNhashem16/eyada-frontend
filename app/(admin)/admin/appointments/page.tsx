import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { AdminAppointmentsContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.adminAppointments.title"),
  description: getTranslation("meta.adminAppointments.description"),
  robots: { index: false, follow: false },
};

export default function AdminAppointmentsPage() {
  return <AdminAppointmentsContent />;
}
