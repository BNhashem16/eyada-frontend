import { Metadata } from 'next';
import { Users } from 'lucide-react';
import { AdminDoctorsList } from '@/features/admin';

export const metadata: Metadata = {
  title: 'إدارة الأطباء - الإدارة',
  description: 'إدارة جميع الأطباء في المنصة',
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
            <p className="text-muted-foreground">عرض وإدارة جميع الأطباء المسجلين في المنصة</p>
          </div>
        </div>
      </div>

      {/* All Doctors List with Filters */}
      <AdminDoctorsList />
    </div>
  );
}
