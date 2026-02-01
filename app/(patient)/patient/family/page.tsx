import { Metadata } from 'next';
import { Users } from 'lucide-react';
import { FamilyList } from '@/features/patients';

export const metadata: Metadata = {
  title: 'أفراد العائلة - المريض',
  description: 'إدارة أفراد العائلة',
};

export default function PatientFamilyPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <Users className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">أفراد العائلة</h1>
          <p className="text-muted-foreground">إضافة وإدارة أفراد عائلتك لحجز مواعيد لهم</p>
        </div>
      </div>

      {/* Family List */}
      <div className="max-w-2xl">
        <FamilyList />
      </div>
    </div>
  );
}
