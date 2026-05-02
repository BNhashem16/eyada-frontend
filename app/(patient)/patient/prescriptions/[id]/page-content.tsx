"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

const PrescriptionRequestDetail = dynamic(
  () =>
    import("@/features/patient-pharmacy/components/prescription-request-detail").then(
      (mod) => ({ default: mod.PrescriptionRequestDetail }),
    ),
  { loading: () => <Skeleton className="h-96 w-full" /> },
);

export function PrescriptionDetailPageContent() {
  const params = useParams();
  const requestId = params.id as string;

  return <PrescriptionRequestDetail requestId={requestId} />;
}
