import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { AdminPharmacyOwnersContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.adminPharmacyOwners.title"),
  description: getTranslation("meta.adminPharmacyOwners.description"),
  robots: { index: false, follow: false },
};

export default function AdminPharmacyOwnersPage() {
  return <AdminPharmacyOwnersContent />;
}
