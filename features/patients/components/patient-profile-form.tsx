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
import { Gender } from '@/types/enums';

const profileSchema = z.object({
  name: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  phone: z
    .string()
    .regex(/^01[0125][0-9]{8}$/, 'رقم الهاتف غير صحيح'),
  dateOfBirth: z.string().optional(),
  gender: z.nativeEnum(Gender).optional(),
  whatsappNumber: z.string().optional(),
  bloodType: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function PatientProfileForm() {
  const { toast } = useToast();
  const { data: profile, isLoading, error } = usePatientProfile();
  const updateMutation = useUpdatePatientProfile();
  const createMutation = useCreatePatientProfile();
  const user = useAuthStore((state) => state.user);

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
      phone: user?.phone || '',
    },
  });

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      reset({
        name: profile.user?.fullName || profile.user?.name || user?.fullName || user?.name || '',
        phone: profile.user?.phone || user?.phone || '',
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
        gender: profile.gender,
        whatsappNumber: profile.whatsappNumber || '',
        bloodType: profile.bloodType || '',
      });
    } else if (user) {
      // Set defaults from user data for new profile
      reset({
        name: user.fullName || user.name || '',
        phone: user.phone || '',
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
          title: 'تم الإنشاء',
          description: 'تم إنشاء ملفك الشخصي بنجاح',
          variant: 'success',
        });
      } else {
        // Update existing profile
        await updateMutation.mutateAsync(payload as any);
        toast({
          title: 'تم الحفظ',
          description: 'تم تحديث بياناتك بنجاح',
          variant: 'success',
        });
      }
    } catch (error) {
      toast({
        title: 'فشل الحفظ',
        description: 'حدث خطأ أثناء حفظ البيانات',
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
            مرحباً! أكمل بياناتك الشخصية للاستفادة من جميع خدمات المنصة.
          </p>
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            البيانات الشخصية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" required>الاسم الكامل</Label>
            <Input
              id="name"
              {...register('name')}
              icon={<User className="h-5 w-5" />}
              iconPosition="start"
              error={errors.name?.message}
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" required>رقم الهاتف</Label>
            <Input
              id="phone"
              type="tel"
              dir="ltr"
              {...register('phone')}
              icon={<Phone className="h-5 w-5" />}
              iconPosition="start"
              placeholder="01xxxxxxxxx"
              error={errors.phone?.message}
            />
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              value={profile?.user?.email || ''}
              disabled
              icon={<Mail className="h-5 w-5" />}
              iconPosition="start"
            />
            <p className="text-xs text-muted-foreground">لا يمكن تغيير البريد الإلكتروني</p>
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">تاريخ الميلاد</Label>
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
            <Label>الجنس</Label>
            <Select
              value={watch('gender') || ''}
              onValueChange={(value) => setValue('gender', value as Gender, { shouldDirty: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الجنس" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Gender.MALE}>ذكر</SelectItem>
                <SelectItem value={Gender.FEMALE}>أنثى</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* WhatsApp Number */}
          <div className="space-y-2">
            <Label htmlFor="whatsappNumber">رقم الواتساب</Label>
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
            <Label>فصيلة الدم</Label>
            <Select
              value={watch('bloodType') || ''}
              onValueChange={(value) => setValue('bloodType', value, { shouldDirty: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر فصيلة الدم" />
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
                  جاري الحفظ...
                </>
              ) : isNewProfile ? (
                'إنشاء الملف الشخصي'
              ) : (
                'حفظ التغييرات'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
