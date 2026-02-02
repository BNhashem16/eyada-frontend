'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Phone, Mail, Calendar, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { usePatientProfile, useUpdatePatientProfile, useCreatePatientProfile } from '../hooks/use-patient';
import { useAuthStore } from '@/lib/auth/store';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';
import { Gender } from '@/types/enums';

const getProfileSchema = (t: (key: string) => string) => z.object({
  name: z.string().min(3, t('validation.fullNameMinLength')),
  phone: z
    .string()
    .regex(/^01[0125][0-9]{8}$/, t('validation.phoneInvalid')),
  dateOfBirth: z.string().optional(),
  gender: z.nativeEnum(Gender).optional(),
  whatsappNumber: z.string().optional(),
  bloodType: z.string().optional(),
});

type ProfileFormData = z.infer<ReturnType<typeof getProfileSchema>>;

export function PatientProfileForm() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { data: profile, isLoading, error } = usePatientProfile();
  const updateMutation = useUpdatePatientProfile();
  const createMutation = useCreatePatientProfile();
  const user = useAuthStore((state) => state.user);

  const profileSchema = getProfileSchema(t);

  // Determine if this is a new profile (profile doesn't exist)
  const isNewProfile = !isLoading && (!profile || error);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.fullName || user?.name || '',
      phone: user?.phoneNumber || '',
    },
  });

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      reset({
        name: profile.user?.fullName || profile.user?.name || user?.fullName || user?.name || '',
        phone: profile.user?.phoneNumber || user?.phoneNumber || '',
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
        gender: profile.gender,
        whatsappNumber: profile.whatsappNumber || '',
        bloodType: profile.bloodType || '',
      });
    } else if (user) {
      // Set defaults from user data for new profile
      reset({
        name: user.fullName || user.name || '',
        phone: user.phoneNumber || '',
        dateOfBirth: '',
        gender: undefined,
        whatsappNumber: '',
        bloodType: '',
      });
    }
  }, [profile, user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Only send fields that the backend expects
      const payload = {
        dateOfBirth: data.dateOfBirth || undefined,
        gender: data.gender,
        whatsappNumber: data.whatsappNumber || undefined,
        bloodType: data.bloodType || undefined,
      };

      if (isNewProfile) {
        // Create new profile
        await createMutation.mutateAsync(payload);
        toast({
          title: t('toast.created'),
          description: t('patient.createdSuccess'),
          variant: 'success',
        });
      } else {
        // Update existing profile
        await updateMutation.mutateAsync(payload as any);
        toast({
          title: t('toast.saved'),
          description: t('patient.updatedSuccess'),
          variant: 'success',
        });
      }
    } catch (error) {
      toast({
        title: t('toast.saveFailed'),
        description: t('patient.saveError'),
        variant: 'error',
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {isNewProfile && (
        <div className="mb-4 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
          <p className="text-primary-700 dark:text-primary-300 font-medium">
            {t('patient.completeDataMessage')}
          </p>
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            {t('patient.personalData')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" required>{t('patient.fullName')}</Label>
            <Input
              id="name"
              {...register('name')}
              icon={<User className="h-5 w-5" />}
              iconPosition="start"
              error={!!errors.name}
            />
            {errors.name?.message && (
              <p className="text-sm text-error-600">{errors.name.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" required>{t('patient.phoneNumber')}</Label>
            <Input
              id="phone"
              type="tel"
              dir="ltr"
              {...register('phone')}
              icon={<Phone className="h-5 w-5" />}
              iconPosition="start"
              placeholder="01xxxxxxxxx"
              error={!!errors.phone}
            />
            {errors.phone?.message && (
              <p className="text-sm text-error-600">{errors.phone.message}</p>
            )}
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">{t('patient.email')}</Label>
            <Input
              id="email"
              type="email"
              value={profile?.user?.email || ''}
              disabled
              icon={<Mail className="h-5 w-5" />}
              iconPosition="start"
            />
            <p className="text-xs text-muted-foreground">{t('patient.emailCannotChange')}</p>
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">{t('patient.dateOfBirth')}</Label>
            <Input
              id="dateOfBirth"
              type="date"
              {...register('dateOfBirth')}
              icon={<Calendar className="h-5 w-5" />}
              iconPosition="start"
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label>{t('patient.gender')}</Label>
            <Select
              value={watch('gender') || ''}
              onValueChange={(value) => setValue('gender', value as Gender, { shouldDirty: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('patient.selectGender')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Gender.MALE}>{t('patient.male')}</SelectItem>
                <SelectItem value={Gender.FEMALE}>{t('patient.female')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* WhatsApp Number */}
          <div className="space-y-2">
            <Label htmlFor="whatsappNumber">{t('patient.whatsappNumber')}</Label>
            <Input
              id="whatsappNumber"
              type="tel"
              dir="ltr"
              {...register('whatsappNumber')}
              icon={<Phone className="h-5 w-5" />}
              iconPosition="start"
              placeholder="01xxxxxxxxx"
            />
          </div>

          {/* Blood Type */}
          <div className="space-y-2">
            <Label>{t('patient.bloodType')}</Label>
            <Select
              value={watch('bloodType') || ''}
              onValueChange={(value) => setValue('bloodType', value, { shouldDirty: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('patient.selectBloodType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={(!isDirty && !isNewProfile) || isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ms-2" />
                  {t('common.saving')}
                </>
              ) : isNewProfile ? (
                t('patient.createProfile')
              ) : (
                t('common.saveChanges')
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
