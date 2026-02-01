import { Metadata } from 'next';
import { Grid3X3 } from 'lucide-react';
import { SpecialtiesManagement } from '@/features/admin';

export const metadata: Metadata = {
  title: 'إدارة التخصصات - الإدارة',
  description: 'إضافة وتعديل التخصصات الطبية',
};

export default function AdminSpecialtiesPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Grid3X3 className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">إدارة التخصصات</h1>
            <p className="text-muted-foreground">إضافة وتعديل وحذف التخصصات الطبية</p>
          </div>
        </div>
      </div>

      {/* Specialties Management */}
      <SpecialtiesManagement />
    </div>
  );
}
