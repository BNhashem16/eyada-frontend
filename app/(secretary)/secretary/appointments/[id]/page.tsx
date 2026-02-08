import { Metadata } from "next";
import { SecretaryAppointmentDetails } from "@/features/secretary/components/appointment-details";
import { getTranslation } from "@/lib/i18n";

export const metadata: Metadata = {
  title: getTranslation("meta.secretaryAppointmentDetails.title"),
  description: getTranslation("meta.secretaryAppointmentDetails.description"),
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SecretaryAppointmentDetailsPage({
  params,
}: PageProps) {
  const { id } = await params;

  return <SecretaryAppointmentDetails appointmentId={id} />;
}
