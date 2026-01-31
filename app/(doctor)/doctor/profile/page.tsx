'use client';

import { User } from 'lucide-react';
import { DoctorProfileForm } from '@/features/doctor-portal/components';

export default function DoctorProfilePage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-primary-100 flex items-center justify-center">
          <User className="h-6 w-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الملف الشخصي</h1>
          <p className="text-gray-600">تحديث بياناتك ومؤهلاتك</p>
        </div>
      </div>

      {/* Profile Form */}
      <DoctorProfileForm />
    </div>
  );
}
