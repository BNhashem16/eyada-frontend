import { Metadata } from 'next';
import { LayoutDashboard } from 'lucide-react';
import { AdminDashboardStats, PendingDoctorsList } from '@/features/admin';

export const metadata: Metadata = {
  title: 'لوحة التحكم - الإدارة',
  description: 'لوحة تحكم مدير النظام',
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-primary-100 flex items-center justify-center">
            <LayoutDashboard className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
            <p className="text-gray-500">مرحباً بك في لوحة إدارة النظام</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <AdminDashboardStats />

      {/* Pending Doctors */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          طلبات التسجيل المعلقة
        </h2>
        <PendingDoctorsList />
      </div>
    </div>
  );
}
