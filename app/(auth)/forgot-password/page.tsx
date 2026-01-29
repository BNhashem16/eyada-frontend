import { Metadata } from 'next';
import Link from 'next/link';
import { Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const metadata: Metadata = {
  title: 'نسيت كلمة المرور',
  description: 'استعادة كلمة المرور',
};

export default function ForgotPasswordPage() {
  return (
    <>
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          نسيت كلمة المرور؟
        </h1>
        <p className="text-gray-600">
          أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور
        </p>
      </div>

      {/* Form */}
      <form className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" required>
            البريد الإلكتروني
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="example@email.com"
            icon={<Mail className="h-5 w-5" />}
            iconPosition="start"
          />
        </div>

        <Button type="submit" className="w-full" size="lg">
          إرسال رابط إعادة التعيين
        </Button>

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-primary-600 hover:underline"
        >
          <ArrowRight className="h-4 w-4" />
          العودة لتسجيل الدخول
        </Link>
      </form>
    </>
  );
}
