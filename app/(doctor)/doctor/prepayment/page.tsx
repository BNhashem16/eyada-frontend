import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { DoctorPrepaymentContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("prepayment.title"),
  robots: { index: false, follow: false },
};

export default function DoctorPrepaymentPage() {
  return <DoctorPrepaymentContent />;
}
