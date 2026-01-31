import { Metadata } from 'next';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { LayoutDashboard } from 'lucide-react';
import { DashboardStats, AppointmentList } from '@/features/secretary';

export const metadata: Metadata = {
  title: 'لوحة التحكم - السكرتير',
  description: 'لوحة تحكم السكرتير لإدارة المواعيد',
};

export default function SecretaryDashboardPage() {
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
            <p className="text-gray-500">مرحباً بك في لوحة تحكم السكرتير</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <DashboardStats />

      {/* Today's Appointments */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">مواعيد اليوم</h2>
        <AppointmentList />
      </div>
    </div>
  );
}
