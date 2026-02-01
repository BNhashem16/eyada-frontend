import { Metadata } from 'next';
import { User } from 'lucide-react';
import { PatientProfileForm } from '@/features/patients';

export const metadata: Metadata = {
  title: 'الملف الشخصي - المريض',
  description: 'تعديل الملف الشخصي للمريض',
};

export default function PatientProfilePage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <User className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">الملف الشخصي</h1>
          <p className="text-muted-foreground">تحديث بياناتك الشخصية</p>
        </div>
      </div>

      {/* Profile Form */}
      <div className="max-w-2xl">
        <PatientProfileForm />
      </div>
    </div>
  );
}
