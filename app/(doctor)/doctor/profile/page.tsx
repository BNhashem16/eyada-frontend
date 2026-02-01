'use client';

import { User } from 'lucide-react';
import { DoctorProfileForm } from '@/features/doctor-portal/components';

export default function DoctorProfilePage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <User className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">الملف الشخصي</h1>
          <p className="text-muted-foreground">تحديث بياناتك ومؤهلاتك</p>
        </div>
      </div>

      {/* Profile Form */}
      <DoctorProfileForm />
    </div>
  );
}
