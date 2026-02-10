import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { EditSecretaryContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.doctorEditSecretary.title"),
  description: getTranslation("meta.doctorEditSecretary.description"),
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSecretaryPage({ params }: PageProps) {
  const { id } = await params;

  return <EditSecretaryContent secretaryId={id} />;
}
