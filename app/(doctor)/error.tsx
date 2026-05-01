"use client";

import { RoleError } from "@/components/common/role-error";

export default function DoctorError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RoleError {...props} dashboardPath="/doctor/dashboard" />;
}
