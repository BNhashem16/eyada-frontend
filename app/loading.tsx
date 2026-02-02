'use client';

import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/lib/i18n';

export default function Loading() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" className="mx-auto mb-4" />
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    </div>
  );
}
