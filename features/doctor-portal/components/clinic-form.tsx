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
import { useTranslation } from '@/lib/i18n';

// Schema will be created dynamically with translations
const createClinicSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(3, t('validation.clinicNameMinLength')),
    phone: z
      .string()
      .regex(/^01[0125][0-9]{8}$/, t('validation.phoneInvalid'))
      .optional()
      .or(z.literal('')),
    addressLine1: z.string().min(5, t('validation.addressRequired')),
    addressLine2: z.string().optional(),
    stateId: z.string().min(1, t('validation.stateRequired')),
    cityId: z.string().min(1, t('validation.cityRequired')),
    googleMapsUrl: z.string().url(t('validation.invalidUrl')).optional().or(z.literal('')),
    isActive: z.boolean().default(true),
  });

interface ClinicFormProps {
  clinicId?: string;
}

export function ClinicForm({ clinicId }: ClinicFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = !!clinicId;

  const clinicSchema = createClinicSchema(t);
  type ClinicFormData = z.infer<typeof clinicSchema>;

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
          title: t('toast.updated'),
          description: t('doctor.clinicUpdated'),
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
          title: t('toast.added'),
          description: t('doctor.clinicAdded'),
          variant: 'success',
        });
      }
      router.push('/doctor/clinics');
    } catch (error) {
      toast({
        title: t('toast.error'),
        description: t('doctor.clinicSaveFailed'),
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
            <Building2 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            {isEditing ? t('doctor.editClinic') : t('doctor.addNewClinic')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" required>
              {t('doctor.clinicName')}
            </Label>
            <Input
              id="name"
              {...register('name')}
              icon={<Building2 className="h-5 w-5" />}
              iconPosition="start"
              placeholder={t('doctor.clinicName')}
              error={errors.name?.message}
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">{t('clinics.phone')}</Label>
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
              <Label required>{t('clinics.state')}</Label>
              <Select
                value={watch('stateId') || ''}
                onValueChange={(value) => {
                  setValue('stateId', value, { shouldDirty: true });
                  setValue('cityId', '', { shouldDirty: true });
                }}
                disabled={loadingLocations}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('clinics.selectState')} />
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
                <p className="text-sm text-error-600 dark:text-error-400">{errors.stateId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label required>{t('clinics.city')}</Label>
              <Select
                value={watch('cityId') || ''}
                onValueChange={(value) => setValue('cityId', value, { shouldDirty: true })}
                disabled={!selectedStateId || cities.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('clinics.selectCity')} />
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
                <p className="text-sm text-error-600 dark:text-error-400">{errors.cityId.message}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="addressLine1" required>
              {t('clinics.detailedAddress')}
            </Label>
            <Input
              id="addressLine1"
              {...register('addressLine1')}
              icon={<MapPin className="h-5 w-5" />}
              iconPosition="start"
              placeholder={t('clinics.address')}
              error={errors.addressLine1?.message}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine2">{t('clinics.additionalInfo')}</Label>
            <Input
              id="addressLine2"
              {...register('addressLine2')}
              placeholder={t('clinics.buildingInfo')}
            />
          </div>

          {/* Google Maps URL */}
          <div className="space-y-2">
            <Label htmlFor="googleMapsUrl">{t('clinics.googleMapsLink')}</Label>
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
              className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500"
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              {t('clinics.clinicActive')}
            </Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
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
        </CardContent>
      </Card>
    </form>
  );
}
