import { privateRouteMetadata } from "@/lib/seo/private-route-metadata";
import { PharmacyOwnerLayoutClient } from "./layout-client";

export const metadata = privateRouteMetadata;

export default function PharmacyOwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PharmacyOwnerLayoutClient>{children}</PharmacyOwnerLayoutClient>;
}
