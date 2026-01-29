'use client';

import { use } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ClinicForm } from '@/features/doctor-portal';
import { useDoctorClinic } from '@/features/doctor-portal/hooks/use-doctor-portal';
import { Skeleton } from '@/components/ui/skeleton';

interface EditClinicPageProps {
  params: Promise<{ id: string }>;
}

export default function EditClinicPage({ params }: EditClinicPageProps) {
  const { id } = use(params);
  const { data: clinic, isLoading } = useDoctorClinic(id);

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/doctor/clinics" className="hover:text-primary-600">
          العيادات
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/doctor/clinics/${id}`} className="hover:text-primary-600">
          {clinic?.name}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900">تعديل</span>
      </nav>

      <ClinicForm clinicId={id} />
    </div>
  );
}
