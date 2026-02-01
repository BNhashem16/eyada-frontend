'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, MapPin, Loader2, Navigation } from 'lucide-react';
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
import { useTranslation } from '@/lib/i18n';
import { getLocalizedText } from '@/lib/utils/multilingual';

// Schema matching backend CreateClinicDto
const clinicSchema = z.object({
  nameAr: z.string().min(2, 'اسم العيادة بالعربي مطلوب (٢ حروف على الأقل)').max(200),
  nameEn: z.string().min(2, 'Clinic name in English is required (min 2 characters)').max(200),
  addressAr: z.string().min(2, 'العنوان بالعربي مطلوب').max(200),
  addressEn: z.string().min(2, 'Address in English is required').max(200),
  stateId: z.string().min(1, 'يجب اختيار المحافظة'),
  cityId: z.string().min(1, 'يجب اختيار المدينة'),
  latitude: z.coerce.number().min(-90).max(90).optional().or(z.literal('')),
  longitude: z.coerce.number().min(-180).max(180).optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

type ClinicFormData = z.infer<typeof clinicSchema>;

interface ClinicFormProps {
  clinicId?: string;
}

export function ClinicForm({ clinicId }: ClinicFormProps) {
  const { t } = useTranslation();
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
      nameAr: '',
      nameEn: '',
      addressAr: '',
      addressEn: '',
      stateId: '',
      cityId: '',
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
      // Get state ID from city
      const stateId = clinic.city?.state?.id || clinic.city?.stateId || '';

      reset({
        nameAr: clinic.name?.ar || '',
        nameEn: clinic.name?.en || '',
        addressAr: clinic.address?.ar || '',
        addressEn: clinic.address?.en || '',
        stateId: stateId,
        cityId: clinic.cityId || '',
        latitude: clinic.latitude || '',
        longitude: clinic.longitude || '',
        isActive: clinic.isActive ?? true,
      });
    }
  }, [clinic, isEditing, reset]);

  const onSubmit = async (data: ClinicFormData) => {
    try {
      // Build the payload matching backend DTO
      const payload = {
        name: {
          ar: data.nameAr,
          en: data.nameEn,
        },
        address: {
          ar: data.addressAr,
          en: data.addressEn,
        },
        cityId: data.cityId,
        latitude: data.latitude ? Number(data.latitude) : undefined,
        longitude: data.longitude ? Number(data.longitude) : undefined,
        isActive: data.isActive,
      };

      if (isEditing) {
        await updateMutation.mutateAsync({
          clinicId: clinicId!,
          data: payload,
        });
        toast({
          title: t('toast.updated'),
          description: t('doctor.clinicUpdated'),
          variant: 'success',
        });
      } else {
        await createMutation.mutateAsync(payload);
        toast({
          title: t('toast.added'),
          description: t('doctor.clinicAdded'),
          variant: 'success',
        });
      }
      router.push('/doctor/clinics');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message;
      toast({
        title: t('toast.error'),
        description: typeof errorMessage === 'object'
          ? (errorMessage.ar || errorMessage.en || t('doctor.clinicSaveFailed'))
          : (errorMessage || t('doctor.clinicSaveFailed')),
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Clinic Name Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            {isEditing ? t('doctor.editClinic') : t('doctor.addNewClinic')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name Arabic */}
          <div className="space-y-2">
            <Label htmlFor="nameAr" required>
              اسم العيادة (عربي)
            </Label>
            <Input
              id="nameAr"
              {...register('nameAr')}
              placeholder="مثال: عيادة الشفاء"
              className="bg-background text-foreground"
            />
            {errors.nameAr && (
              <p className="text-sm text-error-600 dark:text-error-400">{errors.nameAr.message}</p>
            )}
          </div>

          {/* Name English */}
          <div className="space-y-2">
            <Label htmlFor="nameEn" required>
              Clinic Name (English)
            </Label>
            <Input
              id="nameEn"
              {...register('nameEn')}
              placeholder="e.g., Al-Shifa Clinic"
              dir="ltr"
              className="bg-background text-foreground"
            />
            {errors.nameEn && (
              <p className="text-sm text-error-600 dark:text-error-400">{errors.nameEn.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            الموقع والعنوان
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* State & City */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label required>المحافظة</Label>
              <Select
                value={watch('stateId') || ''}
                onValueChange={(value) => {
                  setValue('stateId', value, { shouldDirty: true, shouldValidate: true });
                  setValue('cityId', '', { shouldDirty: true });
                }}
                disabled={loadingLocations}
              >
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue placeholder="اختر المحافظة" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state.id} value={state.id}>
                      {state.name?.ar || state.nameAr || state.name?.en || state.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.stateId && (
                <p className="text-sm text-error-600 dark:text-error-400">{errors.stateId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label required>المدينة</Label>
              <Select
                value={watch('cityId') || ''}
                onValueChange={(value) => setValue('cityId', value, { shouldDirty: true, shouldValidate: true })}
                disabled={!selectedStateId || cities.length === 0}
              >
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue placeholder={!selectedStateId ? 'اختر المحافظة أولاً' : 'اختر المدينة'} />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name?.ar || city.nameAr || city.name?.en || city.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.cityId && (
                <p className="text-sm text-error-600 dark:text-error-400">{errors.cityId.message}</p>
              )}
            </div>
          </div>

          {/* Address Arabic */}
          <div className="space-y-2">
            <Label htmlFor="addressAr" required>
              العنوان التفصيلي (عربي)
            </Label>
            <Input
              id="addressAr"
              {...register('addressAr')}
              placeholder="مثال: شارع التحرير، برج النيل، الدور الخامس"
              className="bg-background text-foreground"
            />
            {errors.addressAr && (
              <p className="text-sm text-error-600 dark:text-error-400">{errors.addressAr.message}</p>
            )}
          </div>

          {/* Address English */}
          <div className="space-y-2">
            <Label htmlFor="addressEn" required>
              Detailed Address (English)
            </Label>
            <Input
              id="addressEn"
              {...register('addressEn')}
              placeholder="e.g., Tahrir St., Nile Tower, 5th Floor"
              dir="ltr"
              className="bg-background text-foreground"
            />
            {errors.addressEn && (
              <p className="text-sm text-error-600 dark:text-error-400">{errors.addressEn.message}</p>
            )}
          </div>

          {/* Coordinates */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="latitude">
                <span className="flex items-center gap-1">
                  <Navigation className="h-4 w-4" />
                  خط العرض (Latitude)
                </span>
              </Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                {...register('latitude')}
                placeholder="30.0444"
                dir="ltr"
                className="bg-background text-foreground"
              />
              {errors.latitude && (
                <p className="text-sm text-error-600 dark:text-error-400">{errors.latitude.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">
                <span className="flex items-center gap-1">
                  <Navigation className="h-4 w-4" />
                  خط الطول (Longitude)
                </span>
              </Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                {...register('longitude')}
                placeholder="31.2357"
                dir="ltr"
                className="bg-background text-foreground"
              />
              {errors.longitude && (
                <p className="text-sm text-error-600 dark:text-error-400">{errors.longitude.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Card */}
      <Card>
        <CardContent className="pt-6">
          {/* Active Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              {...register('isActive')}
              className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500 bg-background"
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              العيادة نشطة (تظهر في نتائج البحث)
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/doctor/clinics')}
        >
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={isPending || (!isDirty && isEditing)}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin ms-2" />
              {t('common.saving')}
            </>
          ) : isEditing ? (
            t('common.saveChanges')
          ) : (
            t('doctor.addClinic')
          )}
        </Button>
      </div>
    </form>
  );
}
