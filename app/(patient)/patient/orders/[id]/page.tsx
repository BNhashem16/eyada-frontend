import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { PatientOrderDetail } from "@/features/patient-pharmacy/components/patient-order-detail";

export const metadata: Metadata = {
  title: getTranslation("pharmacyOwner.orderDetails"),
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;

  return <PatientOrderDetail orderId={id} />;
}
