import { privateRouteMetadata } from "@/lib/seo/private-route-metadata";
import { DriverLayoutClient } from "./layout-client";

export const metadata = privateRouteMetadata;

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DriverLayoutClient>{children}</DriverLayoutClient>;
}
