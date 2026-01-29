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
        <div className="h-12 w-12 rounded-xl bg-primary-100 flex items-center justify-center">
          <Calendar className="h-6 w-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المواعيد</h1>
          <p className="text-gray-600">إدارة مواعيد المرضى وقائمة الانتظار</p>
        </div>
      </div>

      {/* Appointment Queue */}
      <AppointmentQueue />
    </div>
  );
}
