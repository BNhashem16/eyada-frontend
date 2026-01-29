'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, MapPin, Phone, Loader2, Globe } from 'lucide-react';
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
import { useCreateClinic, useUpdateClinic, useDoctorClinic } from '../hooks/use-doctor-portal';
import { useToast } from '@/hooks/use-toast';
import { State, City } from '@/types';
import { apiGet } from '@/lib/api';
import { PUBLIC_ENDPOINTS } from '@/lib/api/endpoints';

const clinicSchema = z.object({
  name: z.string().min(3, 'اسم العيادة يجب أن يكون 3 أحرف على الأقل'),
  phone: z
    .string()
    .regex(/^01[0125][0-9]{8}$/, 'رقم الهاتف غير صحيح')
    .optional()
    .or(z.literal('')),
  addressLine1: z.string().min(5, 'العنوان مطلوب'),
  addressLine2: z.string().optional(),
  stateId: z.string().min(1, 'المحافظة مطلوبة'),
  cityId: z.string().min(1, 'المدينة مطلوبة'),
  googleMapsUrl: z.string().url('رابط غير صحيح').optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

type ClinicFormData = z.infer<typeof clinicSchema>;

interface ClinicFormProps {
  clinicId?: string;
}

export function ClinicForm({ clinicId }: ClinicFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = !!clinicId;

  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);

  const { data: clinic, isLoading: clinicLoading } = useDoctorClinic(clinicId || '');
  const createMutation = useCreateClinic();
  const updateMutation = useUpdateClinic();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<ClinicFormData>({
    resolver: zodResolver(clinicSchema),
    defaultValues: {
      isActive: true,
    },
  });

  const selectedStateId = watch('stateId');

  // Fetch states on mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const statesData = await apiGet<State[]>(PUBLIC_ENDPOINTS.STATES);
        setStates(statesData);
      } catch (error) {
        console.error('Failed to fetch states:', error);
      } finally {
        setLoadingLocations(false);
      }
    };
    fetchStates();
  }, []);

  // Fetch cities when state changes
  useEffect(() => {
    if (selectedStateId) {
      const fetchCities = async () => {
        try {
          const citiesData = await apiGet<City[]>(
            `${PUBLIC_ENDPOINTS.CITIES}?stateId=${selectedStateId}`
          );
          setCities(citiesData);
        } catch (error) {
          console.error('Failed to fetch cities:', error);
        }
      };
      fetchCities();
    } else {
      setCities([]);
    }
  }, [selectedStateId]);

  // Populate form when clinic data loads
  useEffect(() => {
    if (clinic && isEditing) {
      reset({
        name: clinic.name,
        phone: clinic.phone || '',
        addressLine1: clinic.addressLine1,
        addressLine2: clinic.addressLine2 || '',
        stateId: clinic.stateId,
        cityId: clinic.cityId,
        googleMapsUrl: clinic.googleMapsUrl || '',
        isActive: clinic.isActive,
      });
    }
  }, [clinic, isEditing, reset]);

  const onSubmit = async (data: ClinicFormData) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          clinicId: clinicId!,
          data: {
            name: data.name,
            phone: data.phone || undefined,
            addressLine1: data.addressLine1,
            addressLine2: data.addressLine2 || undefined,
            stateId: data.stateId,
            cityId: data.cityId,
            googleMapsUrl: data.googleMapsUrl || undefined,
            isActive: data.isActive,
          },
        });
        toast({
          title: 'تم التحديث',
          description: 'تم تحديث بيانات العيادة بنجاح',
          variant: 'success',
        });
      } else {
        await createMutation.mutateAsync({
          name: data.name,
          phone: data.phone || undefined,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2 || undefined,
          stateId: data.stateId,
          cityId: data.cityId,
          googleMapsUrl: data.googleMapsUrl || undefined,
          isActive: data.isActive,
        });
        toast({
          title: 'تمت الإضافة',
          description: 'تم إضافة العيادة بنجاح',
          variant: 'success',
        });
      }
      router.push('/doctor/clinics');
    } catch (error) {
      toast({
        title: 'حدث خطأ',
        description: 'فشل في حفظ بيانات العيادة',
        variant: 'destructive',
      });
    }
  };

  if (isEditing && clinicLoading) {
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

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary-600" />
            {isEditing ? 'تعديل العيادة' : 'إضافة عيادة جديدة'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" required>
              اسم العيادة
            </Label>
            <Input
              id="name"
              {...register('name')}
              icon={<Building2 className="h-5 w-5" />}
              iconPosition="start"
              placeholder="مثال: عيادة الدكتور أحمد"
              error={errors.name?.message}
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">رقم الهاتف</Label>
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

          {/* State & City */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label required>المحافظة</Label>
              <Select
                value={watch('stateId') || ''}
                onValueChange={(value) => {
                  setValue('stateId', value, { shouldDirty: true });
                  setValue('cityId', '', { shouldDirty: true });
                }}
                disabled={loadingLocations}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المحافظة" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state.id} value={state.id}>
                      {state.nameAr || state.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.stateId && (
                <p className="text-sm text-error-600">{errors.stateId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label required>المدينة</Label>
              <Select
                value={watch('cityId') || ''}
                onValueChange={(value) => setValue('cityId', value, { shouldDirty: true })}
                disabled={!selectedStateId || cities.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المدينة" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.nameAr || city.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.cityId && (
                <p className="text-sm text-error-600">{errors.cityId.message}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="addressLine1" required>
              العنوان التفصيلي
            </Label>
            <Input
              id="addressLine1"
              {...register('addressLine1')}
              icon={<MapPin className="h-5 w-5" />}
              iconPosition="start"
              placeholder="الشارع / المنطقة"
              error={errors.addressLine1?.message}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine2">معلومات إضافية</Label>
            <Input
              id="addressLine2"
              {...register('addressLine2')}
              placeholder="رقم المبنى / الدور / رقم العيادة"
            />
          </div>

          {/* Google Maps URL */}
          <div className="space-y-2">
            <Label htmlFor="googleMapsUrl">رابط خرائط جوجل</Label>
            <Input
              id="googleMapsUrl"
              {...register('googleMapsUrl')}
              icon={<Globe className="h-5 w-5" />}
              iconPosition="start"
              placeholder="https://maps.google.com/..."
              dir="ltr"
              error={errors.googleMapsUrl?.message}
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="isActive"
              {...register('isActive')}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              العيادة نشطة (متاحة للحجز)
            </Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/doctor/clinics')}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isPending || (!isDirty && isEditing)}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ms-2" />
                  جاري الحفظ...
                </>
              ) : isEditing ? (
                'حفظ التغييرات'
              ) : (
                'إضافة العيادة'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
