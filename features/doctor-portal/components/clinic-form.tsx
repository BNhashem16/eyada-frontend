'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, MapPin, Loader2, Navigation, Phone, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Skeleton } from '@/components/ui/skeleton';
import { useCreateClinic, useUpdateClinic, useDoctorClinic } from '../hooks/use-doctor-portal';
import { useToast } from '@/hooks/use-toast';
import { State, City } from '@/types';
import { apiGet } from '@/lib/api';
import { PUBLIC_ENDPOINTS } from '@/lib/api/endpoints';
import { useTranslation } from '@/lib/i18n';
import { getLocalizedText } from '@/lib/utils/multilingual';

// Schema matching backend CreateClinicDto
const getClinicSchema = (t: (key: string) => string) => z.object({
  nameAr: z.string().min(2, t('validation.clinicNameArRequired')).max(200),
  nameEn: z.string().min(2, t('validation.clinicNameEnRequired')).max(200),
  addressAr: z.string().min(2, t('validation.addressArRequired')).max(200),
  addressEn: z.string().min(2, t('validation.addressEnRequired')).max(200),
  stateId: z.string().min(1, t('validation.stateRequired')),
  cityId: z.string().min(1, t('validation.cityRequired')),
  phoneNumber: z.string().max(20).regex(/^01[0125][0-9]{8}$/, t('validation.phoneInvalid')).optional().or(z.literal('')),
  latitude: z.coerce.number().min(-90).max(90).optional().or(z.literal('')),
  longitude: z.coerce.number().min(-180).max(180).optional().or(z.literal('')),
  slotDurationMinutes: z.coerce.number().min(1).max(60).optional(),
  isActive: z.boolean(),
});

type ClinicFormData = z.infer<ReturnType<typeof getClinicSchema>>;

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

  const clinicSchema = getClinicSchema(t);

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
      phoneNumber: '',
      slotDurationMinutes: 15,
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
    const populateForm = async () => {
      if (clinic && isEditing) {
        // Get state ID from city
        const stateId = clinic.city?.state?.id || clinic.city?.stateId || '';

        // Fetch cities for this state first if we have a stateId
        if (stateId) {
          try {
            const citiesData = await apiGet<City[]>(
              `${PUBLIC_ENDPOINTS.CITIES}?stateId=${stateId}`
            );
            setCities(citiesData);
          } catch (error) {
            console.error('Failed to fetch cities:', error);
          }
        }

        // Now reset the form with all values including cityId
        reset({
          nameAr: clinic.name?.ar || '',
          nameEn: clinic.name?.en || '',
          addressAr: clinic.address?.ar || '',
          addressEn: clinic.address?.en || '',
          stateId: stateId,
          cityId: clinic.cityId || '',
          phoneNumber: (clinic as any).phoneNumber || '',
          latitude: clinic.latitude || '',
          longitude: clinic.longitude || '',
          slotDurationMinutes: (clinic as any).slotDurationMinutes || 15,
          isActive: clinic.isActive ?? true,
        });
      }
    };

    populateForm();
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
        phoneNumber: data.phoneNumber || undefined,
        latitude: data.latitude ? Number(data.latitude) : undefined,
        longitude: data.longitude ? Number(data.longitude) : undefined,
        slotDurationMinutes: data.slotDurationMinutes || undefined,
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
        variant: 'error',
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
              {t('clinics.nameAr')}
            </Label>
            <Input
              id="nameAr"
              {...register('nameAr')}
              placeholder={t('clinics.nameArPlaceholder')}
              className="bg-background text-foreground"
            />
            {errors.nameAr && (
              <p className="text-sm text-error-600 dark:text-error-400">{errors.nameAr.message}</p>
            )}
          </div>

          {/* Name English */}
          <div className="space-y-2">
            <Label htmlFor="nameEn" required>
              {t('clinics.nameEn')}
            </Label>
            <Input
              id="nameEn"
              {...register('nameEn')}
              placeholder={t('clinics.nameEnPlaceholder')}
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
            {t('clinics.locationAndAddress')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* State & City */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label required>{t('clinics.state')}</Label>
              <SearchableSelect
                options={states.map((state) => ({
                  value: state.id,
                  label: state.name?.ar || state.name?.en || '',
                  icon: <MapPin className="h-4 w-4" />,
                }))}
                value={watch('stateId') || ''}
                onValueChange={(value) => {
                  setValue('stateId', value, { shouldDirty: true, shouldValidate: true });
                  setValue('cityId', '', { shouldDirty: true });
                }}
                placeholder={t('clinics.selectState')}
                searchPlaceholder={t('common.search')}
                emptyMessage={t('common.noResults')}
                disabled={loadingLocations}
                loading={loadingLocations}
                clearable={false}
                className="bg-background text-foreground"
              />
              {errors.stateId && (
                <p className="text-sm text-error-600 dark:text-error-400">{errors.stateId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label required>{t('clinics.city')}</Label>
              <SearchableSelect
                options={cities.map((city) => ({
                  value: city.id,
                  label: city.name?.ar || city.name?.en || '',
                  icon: <Building2 className="h-4 w-4" />,
                }))}
                value={watch('cityId') || ''}
                onValueChange={(value) => setValue('cityId', value, { shouldDirty: true, shouldValidate: true })}
                placeholder={!selectedStateId ? t('clinics.selectStateFirst') : t('clinics.selectCity')}
                searchPlaceholder={t('common.search')}
                emptyMessage={t('common.noResults')}
                disabled={!selectedStateId || cities.length === 0}
                clearable={false}
                className="bg-background text-foreground"
              />
              {errors.cityId && (
                <p className="text-sm text-error-600 dark:text-error-400">{errors.cityId.message}</p>
              )}
            </div>
          </div>

          {/* Address Arabic */}
          <div className="space-y-2">
            <Label htmlFor="addressAr" required>
              {t('clinics.detailedAddressAr')}
            </Label>
            <Input
              id="addressAr"
              {...register('addressAr')}
              placeholder={t('clinics.detailedAddressArPlaceholder')}
              className="bg-background text-foreground"
            />
            {errors.addressAr && (
              <p className="text-sm text-error-600 dark:text-error-400">{errors.addressAr.message}</p>
            )}
          </div>

          {/* Address English */}
          <div className="space-y-2">
            <Label htmlFor="addressEn" required>
              {t('clinics.detailedAddressEn')}
            </Label>
            <Input
              id="addressEn"
              {...register('addressEn')}
              placeholder={t('clinics.detailedAddressEnPlaceholder')}
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
                  {t('clinics.latitude')}
                </span>
              </Label>
              <Input
                id="latitude"
                type="number"
                inputMode="decimal"
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
                  {t('clinics.longitude')}
                </span>
              </Label>
              <Input
                id="longitude"
                type="number"
                inputMode="decimal"
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

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">
              <span className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {t('clinics.clinicPhone')}
              </span>
            </Label>
            <Input
              id="phoneNumber"
              {...register('phoneNumber')}
              placeholder={t('clinics.phonePlaceholder')}
              maxLength={11}
              dir="ltr"
              className="bg-background text-foreground"
            />
            {errors.phoneNumber && (
              <p className="text-sm text-error-600 dark:text-error-400">{errors.phoneNumber.message}</p>
            )}
          </div>

          {/* Slot Duration */}
          <div className="space-y-2">
            <Label htmlFor="slotDurationMinutes">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {t('clinics.defaultSlotDuration')}
              </span>
            </Label>
            <select
              id="slotDurationMinutes"
              {...register('slotDurationMinutes', { valueAsNumber: true })}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            >
              <option value={10}>{t('common.duration10')}</option>
              <option value={15}>{t('common.duration15')}</option>
              <option value={20}>{t('common.duration20')}</option>
              <option value={30}>{t('common.duration30')}</option>
              <option value={45}>{t('common.duration45')}</option>
              <option value={60}>{t('common.duration60')}</option>
            </select>
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
              {t('clinics.clinicActiveSearch')}
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
