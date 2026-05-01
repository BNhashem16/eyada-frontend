import { privateRouteMetadata } from "@/lib/seo/private-route-metadata";
import { PatientLayoutClient } from "./layout-client";

export const metadata = privateRouteMetadata;

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PatientLayoutClient>{children}</PatientLayoutClient>;
}
