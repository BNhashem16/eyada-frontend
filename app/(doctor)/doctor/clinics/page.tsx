import { Metadata } from 'next';
import { Building2 } from 'lucide-react';
import { ClinicManagement } from '@/features/doctor-portal';

export const metadata: Metadata = {
  title: 'العيادات - الطبيب',
  description: 'إدارة العيادات',
};

export default function DoctorClinicsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <Building2 className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">العيادات</h1>
          <p className="text-muted-foreground">إدارة العيادات والمواعيد والخدمات</p>
        </div>
      </div>

      {/* Clinic Management */}
      <ClinicManagement />
    </div>
  );
}
