"use client";

import { RoleError } from "@/components/common/role-error";

export default function PharmacyOwnerError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RoleError {...props} dashboardPath="/pharmacy-owner/dashboard" />;
}
