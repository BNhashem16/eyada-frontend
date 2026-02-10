import { Metadata } from "next";
import { ClinicForm } from "@/features/doctor-portal";
import { getTranslation } from "@/lib/i18n";

export const metadata: Metadata = {
  title: getTranslation("meta.doctorNewClinic.title"),
  description: getTranslation("meta.doctorNewClinic.description"),
  robots: { index: false, follow: false },
};

export default function NewClinicPage() {
  return (
    <div className="max-w-2xl">
      <ClinicForm />
    </div>
  );
}
