'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Phone, Mail, MapPin, Calendar, Loader2 } from 'lucide-react';
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
import { usePatientProfile, useUpdatePatientProfile } from '../hooks/use-patient';
import { useToast } from '@/hooks/use-toast';
import { Gender } from '@/types/enums';

const profileSchema = z.object({
  name: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  phone: z
    .string()
    .regex(/^01[0125][0-9]{8}$/, 'رقم الهاتف غير صحيح'),
  dateOfBirth: z.string().optional(),
  gender: z.nativeEnum(Gender).optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function PatientProfileForm() {
  const { toast } = useToast();
  const { data: profile, isLoading } = usePatientProfile();
  const updateMutation = useUpdatePatientProfile();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      reset({
        name: profile.user?.name || '',
        phone: profile.user?.phone || '',
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
        gender: profile.gender,
        addressLine1: profile.addressLine1 || '',
        addressLine2: profile.addressLine2 || '',
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateMutation.mutateAsync({
        user: {
          name: data.name,
          phone: data.phone,
        },
        dateOfBirth: data.dateOfBirth || undefined,
        gender: data.gender,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
      } as any);

      toast({
        title: 'تم الحفظ',
        description: 'تم تحديث بياناتك بنجاح',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'فشل الحفظ',
        description: 'حدث خطأ أثناء حفظ البيانات',
        variant: 'destructive',
      });
    }
  };

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

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="addressLine1">العنوان</Label>
            <Input
              id="addressLine1"
              {...register('addressLine1')}
              icon={<MapPin className="h-5 w-5" />}
              iconPosition="start"
              placeholder="الشارع / المنطقة"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine2">تفاصيل إضافية</Label>
            <Input
              id="addressLine2"
              {...register('addressLine2')}
              placeholder="رقم المبنى / الشقة"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={!isDirty || updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ms-2" />
                  جاري الحفظ...
                </>
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
