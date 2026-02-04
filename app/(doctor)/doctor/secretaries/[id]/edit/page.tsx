'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, UserCog, Save } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useDoctorSecretaries, useUpdateSecretary } from '@/features/doctor-portal/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const updateSecretarySchema = z.object({
  fullName: z.string().min(2).max(100),
  phoneNumber: z.string().regex(/^01[0125][0-9]{8}$/),
  isActive: z.boolean(),
});

type UpdateSecretaryFormData = z.infer<typeof updateSecretarySchema>;

export default function EditSecretaryPage() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const secretaryUserId = params.id as string;

  const { data: secretaries, isLoading } = useDoctorSecretaries();
  const updateSecretary = useUpdateSecretary();

  const secretary = secretaries?.find((s) => s.id === secretaryUserId);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateSecretaryFormData>({
    resolver: zodResolver(updateSecretarySchema),
  });

  const isActive = watch('isActive');

  useEffect(() => {
    if (secretary) {
      reset({
        fullName: secretary.fullName,
        phoneNumber: secretary.phoneNumber,
        isActive: secretary.isActive,
      });
    }
  }, [secretary, reset]);

  const onSubmit = async (data: UpdateSecretaryFormData) => {
    try {
      await updateSecretary.mutateAsync({
        secretaryUserId,
        ...data,
      });
      toast({
        title: t('toast.success'),
        description: t('secretary.management.secretaryUpdated'),
      });
      router.push('/doctor/secretaries');
    } catch (error: any) {
      const message = error?.response?.data?.message;
      toast({
        title: t('toast.error'),
        description: typeof message === 'object' ? message[locale] || message.en : t('toast.saveFailed'),
        variant: 'error',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-96 max-w-2xl" />
      </div>
    );
  }

  if (!secretary) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-destructive">{t('errors.notFound')}</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          {t('common.back')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t('common.edit')}</h1>
          <p className="text-muted-foreground">{secretary.fullName}</p>
        </div>
      </div>

      {/* Form */}
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            {t('secretary.management.secretaryInfo')}
          </CardTitle>
          <CardDescription>{t('secretary.management.secretaryInfoDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label>{t('auth.email')}</Label>
              <Input value={secretary.email} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">{t('patient.emailCannotChange')}</p>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">{t('auth.fullName')} *</Label>
              <Input
                id="fullName"
                placeholder={t('auth.fullNamePlaceholder')}
                {...register('fullName')}
                className={errors.fullName ? 'border-destructive' : ''}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{t('validation.fullNameRequired')}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">{t('auth.phoneNumber')} *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                dir="ltr"
                placeholder={t('placeholder.phone')}
                {...register('phoneNumber')}
                className={errors.phoneNumber ? 'border-destructive' : ''}
              />
              {errors.phoneNumber && (
                <p className="text-sm text-destructive">{t('validation.phoneInvalid')}</p>
              )}
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>{t('common.active')}</Label>
                <p className="text-sm text-muted-foreground">
                  {isActive ? t('common.active') : t('common.inactive')}
                </p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={(checked) => setValue('isActive', checked)}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting || updateSecretary.isPending}>
                <Save className="h-4 w-4 me-2" />
                {isSubmitting || updateSecretary.isPending ? t('common.saving') : t('common.save')}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
