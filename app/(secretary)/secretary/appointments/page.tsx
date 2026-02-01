import { Metadata } from 'next';
import { Calendar } from 'lucide-react';
import { AppointmentList } from '@/features/secretary';

export const metadata: Metadata = {
  title: 'إدارة المواعيد - السكرتير',
  description: 'إدارة مواعيد العيادة',
};

export default function SecretaryAppointmentsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Calendar className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">إدارة المواعيد</h1>
            <p className="text-muted-foreground">عرض وإدارة جميع مواعيد العيادة</p>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <AppointmentList />
    </div>
  );
}
