import { privateRouteMetadata } from "@/lib/seo/private-route-metadata";
import { AdminLayoutClient } from "./layout-client";

export const metadata = privateRouteMetadata;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
