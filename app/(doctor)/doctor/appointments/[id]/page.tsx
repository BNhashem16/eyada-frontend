import { Metadata } from "next";
import { DoctorAppointmentDetails } from "@/features/doctor-portal/components/appointment-details";
import { getTranslation } from "@/lib/i18n";

export const metadata: Metadata = {
  title: getTranslation("meta.doctorAppointmentDetails.title"),
  description: getTranslation("meta.doctorAppointmentDetails.description"),
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DoctorAppointmentDetailsPage({
  params,
}: PageProps) {
  const { id } = await params;

  return <DoctorAppointmentDetails appointmentId={id} />;
}
