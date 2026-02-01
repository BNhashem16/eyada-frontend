'use client';

import Link from 'next/link';
import {
  Calendar,
  Search,
  UserCheck,
  Clock,
  Star,
  Shield,
  Stethoscope,
  Heart,
  Brain,
  Eye,
  Bone,
  Baby,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { LanguageToggle } from '@/components/common/language-toggle';
import { useTranslation } from '@/lib/i18n';

const specialtyIcons = [
  { key: 'internalMedicine', icon: Heart, color: 'text-red-500' },
  { key: 'pediatrics', icon: Baby, color: 'text-pink-500' },
  { key: 'ophthalmology', icon: Eye, color: 'text-blue-500' },
  { key: 'orthopedics', icon: Bone, color: 'text-amber-500' },
  { key: 'neurology', icon: Brain, color: 'text-purple-500' },
  { key: 'generalMedicine', icon: Stethoscope, color: 'text-teal-500' },
];

export default function HomePage() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Search,
      title: t('home.step1Title'),
      description: t('home.step1Desc'),
    },
    {
      icon: Calendar,
      title: t('home.step2Title'),
      description: t('home.step2Desc'),
    },
    {
      icon: UserCheck,
      title: t('home.step3Title'),
      description: t('home.step3Desc'),
    },
  ];

  const stats = [
    { value: '500+', label: t('home.stats.doctors') },
    { value: '50+', label: t('home.stats.specialties') },
    { value: '10,000+', label: t('home.stats.appointments') },
    { value: '4.8', label: t('home.stats.rating') },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-medical">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-primary-700 dark:text-primary-400">{t('app.name')}</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/doctors" className="text-muted-foreground hover:text-primary-600 dark:hover:text-primary-400">
              {t('nav.doctors')}
            </Link>
            <Link href="/clinics" className="text-muted-foreground hover:text-primary-600 dark:hover:text-primary-400">
              {t('nav.clinics')}
            </Link>
            <Link href="/specialties" className="text-muted-foreground hover:text-primary-600 dark:hover:text-primary-400">
              {t('nav.specialties')}
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost">{t('nav.login')}</Button>
            </Link>
            <Link href="/register">
              <Button>{t('nav.register')}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-background dark:from-primary-950/50 dark:to-background py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
              {t('home.heroTitle')}
              <span className="text-primary-600 dark:text-primary-400"> {t('home.heroTitleHighlight')}</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              {t('home.heroSubtitle')}
            </p>

            {/* Search Box */}
            <div className="mx-auto max-w-2xl">
              <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 shadow-xl md:flex-row">
                <div className="flex flex-1 items-center gap-2 rounded-xl border border-border px-4 py-3">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={t('home.searchPlaceholder')}
                    className="w-full border-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <Button size="lg" className="md:px-8">
                  {t('home.searchButton')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-20 -start-20 h-64 w-64 rounded-full bg-primary-100 dark:bg-primary-900/30 opacity-50 blur-3xl" />
        <div className="absolute -top-20 -end-20 h-64 w-64 rounded-full bg-secondary-100 dark:bg-secondary-900/30 opacity-50 blur-3xl" />
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 md:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">{t('home.popularSpecialties')}</h2>
            <p className="text-muted-foreground">{t('home.selectSpecialty')}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {specialtyIcons.map((specialty, index) => (
              <Card key={index} hover className="text-center">
                <CardContent className="p-6">
                  <div
                    className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-muted ${specialty.color}`}
                  >
                    <specialty.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-medium text-foreground">{t(`specialties.${specialty.key}`)}</h3>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/specialties">
              <Button variant="outline" size="lg">
                {t('home.viewAllSpecialties')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">{t('home.howItWorks')}</h2>
            <p className="text-muted-foreground">{t('home.howItWorksSubtitle')}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="relative text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-900/30">
                  <feature.icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="absolute -top-2 start-1/2 -ms-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                  {index + 1}
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-foreground">
                {t('home.whyChooseUs')}
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30">
                    <Star className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-foreground">{t('home.feature1Title')}</h3>
                    <p className="text-muted-foreground">
                      {t('home.feature1Desc')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30">
                    <Clock className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-foreground">{t('home.feature2Title')}</h3>
                    <p className="text-muted-foreground">
                      {t('home.feature2Desc')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30">
                    <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-foreground">{t('home.feature3Title')}</h3>
                    <p className="text-muted-foreground">
                      {t('home.feature3Desc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 p-8">
                <div className="flex h-full items-center justify-center">
                  <Stethoscope className="h-32 w-32 text-primary-300 dark:text-primary-700" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-medical py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">{t('home.doctorCta')}</h2>
          <p className="mb-8 text-lg text-white/90">
            {t('home.doctorCtaDesc')}
          </p>
          <Link href="/register?role=doctor">
            <Button
              size="lg"
              className="bg-white text-primary-600 hover:bg-white/90"
            >
              {t('home.registerAsDoctor')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-medical">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-primary-700 dark:text-primary-400">{t('app.name')}</span>
              </div>
              <p className="text-muted-foreground">
                {t('app.footerText')}
              </p>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-foreground">{t('nav.quickLinks')}</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/doctors" className="hover:text-primary-600 dark:hover:text-primary-400">
                    {t('nav.findDoctor')}
                  </Link>
                </li>
                <li>
                  <Link href="/clinics" className="hover:text-primary-600 dark:hover:text-primary-400">
                    {t('nav.clinics')}
                  </Link>
                </li>
                <li>
                  <Link href="/specialties" className="hover:text-primary-600 dark:hover:text-primary-400">
                    {t('nav.specialties')}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-foreground">{t('nav.forDoctors')}</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/register?role=doctor" className="hover:text-primary-600 dark:hover:text-primary-400">
                    {t('nav.joinAsDoctor')}
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-primary-600 dark:hover:text-primary-400">
                    {t('nav.doctorLogin')}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-foreground">{t('nav.contactUs')}</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>{t('nav.email')}: support@eyada.com</li>
                <li>{t('nav.phone')}: 01000000000</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-8 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} {t('app.name')}. {t('app.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
