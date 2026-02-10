import { Metadata } from "next";
import { DoctorDashboard } from "@/features/doctor-portal";
import { getTranslation } from "@/lib/i18n";

export const metadata: Metadata = {
  title: getTranslation("meta.doctorDashboard.title"),
  description: getTranslation("meta.doctorDashboard.description"),
  robots: { index: false, follow: false },
};

export default function DoctorDashboardPage() {
  return <DoctorDashboard />;
}
