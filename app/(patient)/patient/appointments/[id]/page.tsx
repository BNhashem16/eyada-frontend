import { Metadata } from "next";
import { AppointmentDetails } from "@/features/patients/components/appointment-details";
import { getTranslation } from "@/lib/i18n";

export const metadata: Metadata = {
  title: getTranslation("meta.patientAppointmentDetails.title"),
  description: getTranslation("meta.patientAppointmentDetails.description"),
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientAppointmentDetailsPage({
  params,
}: PageProps) {
  const { id } = await params;

  return <AppointmentDetails appointmentId={id} />;
}
