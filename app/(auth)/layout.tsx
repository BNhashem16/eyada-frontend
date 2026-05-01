import { privateRouteMetadata } from "@/lib/seo/private-route-metadata";
import { AuthLayoutClient } from "./layout-client";

export const metadata = privateRouteMetadata;

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayoutClient>{children}</AuthLayoutClient>;
}
