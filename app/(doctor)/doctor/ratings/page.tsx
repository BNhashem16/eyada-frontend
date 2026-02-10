import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { DoctorRatingsContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.doctorRatings.title"),
  description: getTranslation("meta.doctorRatings.description"),
  robots: { index: false, follow: false },
};

export default function DoctorRatingsPage() {
  return <DoctorRatingsContent />;
}
