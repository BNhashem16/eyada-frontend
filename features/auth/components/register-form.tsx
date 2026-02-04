'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, User, Phone, Stethoscope } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerSchemaWithConfirm, type RegisterFormData } from '../schemas';
import { useRegister } from '../hooks';
import { useTranslation } from '@/lib/i18n';

export function RegisterForm() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');
  const defaultRole = roleParam === 'doctor' ? 'DOCTOR' : 'PATIENT';

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { mutate: register, isPending } = useRegister();

  const {
    register: registerField,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchemaWithConfirm),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      role: defaultRole as 'PATIENT' | 'DOCTOR',
      agreeTerms: false,
    },
  });

  const selectedRole = watch('role');

  const onSubmit = (data: RegisterFormData) => {
    const { confirmPassword, agreeTerms, ...registerData } = data;
    register(registerData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Role Selection */}
      <div className="space-y-2">
        <Label>{t('auth.accountType')}</Label>
        <div className="grid grid-cols-2 gap-3">
          <label
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 p-3 transition-colors ${
              selectedRole === 'PATIENT'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                : 'border-border hover:border-primary-300 dark:hover:border-primary-700'
            }`}
          >
            <input
              type="radio"
              value="PATIENT"
              {...registerField('role')}
              className="sr-only"
            />
            <User className="h-5 w-5" />
            <span className="font-medium">{t('auth.patient')}</span>
          </label>
          <label
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 p-3 transition-colors ${
              selectedRole === 'DOCTOR'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                : 'border-border hover:border-primary-300 dark:hover:border-primary-700'
            }`}
          >
            <input
              type="radio"
              value="DOCTOR"
              {...registerField('role')}
              className="sr-only"
            />
            <Stethoscope className="h-5 w-5" />
            <span className="font-medium">{t('auth.doctor')}</span>
          </label>
        </div>
      </div>

      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="fullName" required>
          {t('auth.fullName')}
        </Label>
        <Input
          id="fullName"
          type="text"
          placeholder={t('auth.fullNamePlaceholder')}
          icon={<User className="h-5 w-5" />}
          iconPosition="start"
          error={!!errors.fullName}
          {...registerField('fullName')}
        />
        {errors.fullName && (
          <p className="text-sm text-error-500">{errors.fullName.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" required>
          {t('auth.email')}
        </Label>
        <Input
          id="email"
          type="email"
          placeholder={t('placeholder.email')}
          icon={<Mail className="h-5 w-5" />}
          iconPosition="start"
          error={!!errors.email}
          {...registerField('email')}
        />
        {errors.email && (
          <p className="text-sm text-error-500">{errors.email.message}</p>
        )}
      </div>

      {/* Phone Number */}
      <div className="space-y-2">
        <Label htmlFor="phoneNumber" required>
          {t('auth.phoneNumber')}
        </Label>
        <Input
          id="phoneNumber"
          type="tel"
          placeholder={t('placeholder.phone')}
          icon={<Phone className="h-5 w-5" />}
          iconPosition="start"
          error={!!errors.phoneNumber}
          {...registerField('phoneNumber')}
        />
        {errors.phoneNumber && (
          <p className="text-sm text-error-500">{errors.phoneNumber.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password" required>
          {t('auth.password')}
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder={t('placeholder.password')}
            icon={<Lock className="h-5 w-5" />}
            iconPosition="start"
            error={!!errors.password}
            className="pe-10"
            {...registerField('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-error-500">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" required>
          {t('auth.confirmPassword')}
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder={t('placeholder.password')}
            icon={<Lock className="h-5 w-5" />}
            iconPosition="start"
            error={!!errors.confirmPassword}
            className="pe-10"
            {...registerField('confirmPassword')}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-error-500">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Terms Agreement */}
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          id="agreeTerms"
          {...registerField('agreeTerms')}
          className="mt-1 h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500"
        />
        <label htmlFor="agreeTerms" className="text-sm text-muted-foreground">
          {t('auth.agreeToTerms')}{' '}
          <Link href="/terms" className="text-primary-600 dark:text-primary-400 hover:underline">
            {t('auth.termsAndConditions')}
          </Link>{' '}
          {t('common.and')}{' '}
          <Link href="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">
            {t('auth.privacyPolicy')}
          </Link>
        </label>
      </div>
      {errors.agreeTerms && (
        <p className="text-sm text-error-500">{errors.agreeTerms.message}</p>
      )}

      {/* Submit Button */}
      <Button type="submit" className="w-full" size="lg" loading={isPending}>
        {t('auth.registerButton')}
      </Button>

      {/* Login Link */}
      <p className="text-center text-muted-foreground">
        {t('auth.hasAccount')}{' '}
        <Link href="/login" className="text-primary-600 dark:text-primary-400 hover:underline">
          {t('auth.login')}
        </Link>
      </p>
    </form>
  );
}
