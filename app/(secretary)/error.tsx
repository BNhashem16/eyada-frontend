"use client";

import { RoleError } from "@/components/common/role-error";

export default function SecretaryError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RoleError {...props} dashboardPath="/secretary/dashboard" />;
}
