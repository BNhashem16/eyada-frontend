import { Metadata } from 'next';
import { User } from 'lucide-react';

export const metadata: Metadata = {
  title: 'الملف الشخصي - الطبيب',
  description: 'تعديل الملف الشخصي للطبيب',
};

export default function DoctorProfilePage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-primary-100 flex items-center justify-center">
          <User className="h-6 w-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الملف الشخصي</h1>
          <p className="text-gray-600">تحديث بياناتك ومؤهلاتك</p>
        </div>
      </div>

      {/* TODO: Add doctor profile form */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
        صفحة الملف الشخصي للطبيب - قيد التطوير
      </div>
    </div>
  );
}
