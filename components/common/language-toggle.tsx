'use client';

import { Languages, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/components/providers/language-provider';
import { localeNames, type Locale, useTranslation } from '@/lib/i18n';

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage();
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Globe className="h-5 w-5" />
          <span className="sr-only">{t('app.toggleLanguage')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLocale('ar')}>
          <span className="me-2">🇪🇬</span>
          العربية
          {locale === 'ar' && <span className="ms-auto text-primary-500">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale('en')}>
          <span className="me-2">🇺🇸</span>
          English
          {locale === 'en' && <span className="ms-auto text-primary-500">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Simple toggle button (for compact spaces)
export function LanguageToggleSimple() {
  const { locale, toggleLocale } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLocale}
      className="gap-2 font-medium"
    >
      <Globe className="h-4 w-4" />
      <span>{locale === 'ar' ? 'EN' : 'ع'}</span>
    </Button>
  );
}

// Badge-style toggle (shows current language prominently)
export function LanguageToggleBadge() {
  const { locale, toggleLocale } = useLanguage();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLocale}
      className="gap-2 min-w-[80px]"
    >
      {locale === 'ar' ? (
        <>
          <span>🇪🇬</span>
          <span>ع</span>
        </>
      ) : (
        <>
          <span>🇺🇸</span>
          <span>EN</span>
        </>
      )}
    </Button>
  );
}
