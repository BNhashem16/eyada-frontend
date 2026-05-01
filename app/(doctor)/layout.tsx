import { privateRouteMetadata } from "@/lib/seo/private-route-metadata";
import { DoctorLayoutClient } from "./layout-client";

export const metadata = privateRouteMetadata;

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DoctorLayoutClient>{children}</DoctorLayoutClient>;
}
