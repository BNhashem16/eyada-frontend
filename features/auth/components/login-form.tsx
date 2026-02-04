'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginSchema, type LoginFormData } from '../schemas';
import { useLogin } from '../hooks';
import { useTranslation } from '@/lib/i18n';

export function LoginForm() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Email Field */}
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
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-error-500">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" required>
            {t('auth.password')}
          </Label>
          <Link
            href="/forgot-password"
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
          >
            {t('auth.forgotPassword')}
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder={t('placeholder.password')}
            icon={<Lock className="h-5 w-5" />}
            iconPosition="start"
            error={!!errors.password}
            className="pe-10"
            {...register('password')}
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

      {/* Submit Button */}
      <Button type="submit" className="w-full" size="lg" loading={isPending}>
        {t('auth.loginButton')}
      </Button>

      {/* Register Link */}
      <p className="text-center text-muted-foreground">
        {t('auth.noAccount')}{' '}
        <Link href="/register" className="text-primary-600 dark:text-primary-400 hover:underline">
          {t('auth.createNewAccount')}
        </Link>
      </p>
    </form>
  );
}
