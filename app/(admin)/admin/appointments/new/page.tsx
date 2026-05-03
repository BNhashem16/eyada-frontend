import { Metadata } from "next";
import { AdminNewAppointmentContent } from "./page-content";
import { getTranslation } from "@/lib/i18n";

export const metadata: Metadata = {
  title: getTranslation("admin.appointments.newPageTitle"),
  robots: { index: false, follow: false },
};

export default function AdminNewAppointmentPage() {
  return <AdminNewAppointmentContent />;
}
