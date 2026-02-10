import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { AdminDoctorDetailsContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.adminDoctorDetails.title"),
  description: getTranslation("meta.adminDoctorDetails.description"),
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminDoctorDetailsPage({ params }: PageProps) {
  const { id } = await params;
  return <AdminDoctorDetailsContent doctorId={id} />;
}
