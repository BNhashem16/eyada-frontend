'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Stethoscope,
  Building2,
  Grid3X3,
  Menu,
  X,
  LogIn,
} from 'lucide-react';
import { Header } from './header';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore, useIsHydrated } from '@/lib/auth/store';
import { LucideIcon } from 'lucide-react';

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const isHydrated = useIsHydrated();

  const navLinks: NavLink[] = [
    { href: '/specialties', label: t('nav.specialties'), icon: Grid3X3 },
    { href: '/doctors', label: t('nav.doctors'), icon: Stethoscope },
    { href: '/clinics', label: t('nav.clinics'), icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header
        variant="public"
        onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      {/* Desktop Nav */}
      <div className="hidden md:block sticky top-16 z-30 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-6 h-12">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-muted-foreground hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <nav className="container mx-auto px-4 py-4 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-muted-foreground hover:bg-accent'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
            {isHydrated && !isAuthenticated && (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-accent"
              >
                <LogIn className="h-5 w-5" />
                {t('nav.login')}
              </Link>
            )}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary-500 flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">{t('app.name')}</span>
            </div>
            <p className="text-gray-400 dark:text-gray-500 max-w-md">
              {t('app.footerText')}. {t('app.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">{t('nav.quickLinks')}</h4>
            <ul className="space-y-2 text-gray-400 dark:text-gray-500">
              <li>
                <Link href="/doctors" className="hover:text-white transition-colors">
                  {t('nav.findDoctor')}
                </Link>
              </li>
              <li>
                <Link href="/clinics" className="hover:text-white transition-colors">
                  {t('nav.findClinic')}
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  {t('nav.joinAsDoctor')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">{t('nav.contactUs')}</h4>
            <ul className="space-y-2 text-gray-400 dark:text-gray-500">
              <li dir="ltr">+20 123 456 7890</li>
              <li>support@eyada.com</li>
              <li>{t('app.location')}</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} {t('app.name')}. {t('app.copyright')}.</p>
        </div>
      </div>
    </footer>
  );
}
