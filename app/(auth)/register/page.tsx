import { Metadata } from 'next';
import { Suspense } from 'react';
import { RegisterForm } from '@/features/auth/components';
import { Spinner } from '@/components/ui/spinner';

export const metadata: Metadata = {
  title: 'إنشاء حساب',
  description: 'أنشئ حسابك الجديد في عيادة',
};

export default function RegisterPage() {
  return (
    <>
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          إنشاء حساب جديد
        </h1>
        <p className="text-gray-600">
          انضم إلينا واحجز مواعيدك بسهولة
        </p>
      </div>

      {/* Form - Wrapped in Suspense for useSearchParams */}
      <Suspense fallback={<div className="flex justify-center py-8"><Spinner /></div>}>
        <RegisterForm />
      </Suspense>
    </>
  );
}
