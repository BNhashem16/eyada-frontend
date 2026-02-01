'use client';

import { LoginForm } from '@/features/auth/components';
import { useTranslation } from '@/lib/i18n';

export default function LoginPage() {
  const { t } = useTranslation();

  return (
    <>
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-foreground">
          {t('auth.loginTitle')}
        </h1>
        <p className="text-muted-foreground">
          {t('auth.loginSubtitle')}
        </p>
      </div>

      {/* Form */}
      <LoginForm />
    </>
  );
}
