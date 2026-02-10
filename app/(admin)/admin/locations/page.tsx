import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { AdminLocationsContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.adminLocations.title"),
  description: getTranslation("meta.adminLocations.description"),
  robots: { index: false, follow: false },
};

export default function AdminLocationsPage() {
  return <AdminLocationsContent />;
}
