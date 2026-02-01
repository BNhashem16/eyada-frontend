import { Metadata } from 'next';
import { Calendar } from 'lucide-react';
import { AppointmentQueue } from '@/features/doctor-portal';

export const metadata: Metadata = {
  title: 'المواعيد - الطبيب',
  description: 'إدارة مواعيد المرضى',
};

export default function DoctorAppointmentsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <Calendar className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">المواعيد</h1>
          <p className="text-muted-foreground">إدارة مواعيد المرضى وقائمة الانتظار</p>
        </div>
      </div>

      {/* Appointment Queue */}
      <AppointmentQueue />
    </div>
  );
}
