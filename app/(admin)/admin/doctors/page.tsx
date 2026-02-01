import { Metadata } from 'next';
import { Users } from 'lucide-react';
import { PendingDoctorsList } from '@/features/admin';

export const metadata: Metadata = {
  title: 'إدارة الأطباء - الإدارة',
  description: 'مراجعة طلبات تسجيل الأطباء',
};

export default function AdminDoctorsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Users className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">إدارة الأطباء</h1>
            <p className="text-muted-foreground">مراجعة طلبات التسجيل والموافقة عليها</p>
          </div>
        </div>
      </div>

      {/* Pending Doctors List */}
      <PendingDoctorsList />
    </div>
  );
}
