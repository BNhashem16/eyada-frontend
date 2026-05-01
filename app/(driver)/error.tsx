"use client";

import { RoleError } from "@/components/common/role-error";

export default function DriverError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RoleError {...props} dashboardPath="/driver/dashboard" />;
}
