import { Metadata } from 'next';
import { LoginForm } from '@/features/auth/components';

export const metadata: Metadata = {
  title: 'تسجيل الدخول',
  description: 'سجل دخولك إلى حسابك في عيادة',
};

export default function LoginPage() {
  return (
    <>
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          تسجيل الدخول
        </h1>
        <p className="text-gray-600">
          أدخل بياناتك للوصول إلى حسابك
        </p>
      </div>

      {/* Form */}
      <LoginForm />
    </>
  );
}
