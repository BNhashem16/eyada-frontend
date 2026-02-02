'use client';

import Link from 'next/link';
import { Stethoscope } from 'lucide-react';
import { GuestRoute } from '@/lib/auth';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { LanguageToggle } from '@/components/common/language-toggle';
import { useTranslation } from '@/lib/i18n';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <GuestRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="absolute top-0 w-full p-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-medical">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-primary-700 dark:text-primary-400">{t('app.name')}</span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex min-h-screen items-center justify-center px-4 py-20">
          <div className="w-full max-w-md">
            {/* Card */}
            <div className="rounded-2xl bg-card p-8 shadow-xl border border-border">
              {children}
            </div>
          </div>
        </main>

        {/* Background Decoration */}
        <div className="fixed -bottom-40 -start-40 -z-10 h-96 w-96 rounded-full bg-primary-100 dark:bg-primary-900/30 opacity-50 blur-3xl" />
        <div className="fixed -top-40 -end-40 -z-10 h-96 w-96 rounded-full bg-secondary-100 dark:bg-secondary-900/30 opacity-50 blur-3xl" />
      </div>
    </GuestRoute>
  );
}
