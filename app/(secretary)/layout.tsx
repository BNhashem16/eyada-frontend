import { privateRouteMetadata } from "@/lib/seo/private-route-metadata";
import { SecretaryLayoutClient } from "./layout-client";

export const metadata = privateRouteMetadata;

export default function SecretaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SecretaryLayoutClient>{children}</SecretaryLayoutClient>;
}
