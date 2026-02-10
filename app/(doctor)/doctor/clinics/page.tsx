import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { DoctorClinicsContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.doctorClinics.title"),
  description: getTranslation("meta.doctorClinics.description"),
  robots: { index: false, follow: false },
};

export default function DoctorClinicsPage() {
  return <DoctorClinicsContent />;
}
