'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Mail,
  Phone,
  Award,
  FileText,
  Camera,
  Loader2,
  Save,
  Eye,
  EyeOff,
  MessageCircle,
  Plus,
  X,
  Stethoscope,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoctorProfile, useUpdateDoctorProfile, useCreateDoctorProfile } from '../hooks/use-doctor-portal';
import { useToast } from '@/hooks/use-toast';
import { getInitials } from '@/lib/utils';
import { apiGet } from '@/lib/api';
import { PUBLIC_ENDPOINTS } from '@/lib/api/endpoints';
import { DoctorStatus } from '@/types/enums';
import type { Specialty } from '@/types';
import { useAuthStore } from '@/lib/auth/store';
import { useTranslation } from '@/lib/i18n';

// Schema factory for creating new profile (specialty required)
const getCreateProfileSchema = (t: (key: string) => string) => z.object({
  specialtyId: z.string().min(1, t('validation.specialtyRequired')),
  licenseNumber: z.string().optional(),
  yearsOfExperience: z.coerce.number().min(0).max(70).optional(),
  qualificationsAr: z.string().optional(),
  qualificationsEn: z.string().optional(),
  bioAr: z.string().max(500, t('validation.bioMaxLength')).optional(),
  bioEn: z.string().max(500, t('validation.bioMaxLengthEn')).optional(),
  showPhoneNumber: z.boolean(),
  showWhatsappNumber: z.boolean(),
});

type ProfileFormData = z.infer<ReturnType<typeof getCreateProfileSchema>>;

const getStatusLabels = (t: (key: string) => string): Record<DoctorStatus, { label: string; variant: 'success' | 'warning' | 'error' | 'secondary' }> => ({
  [DoctorStatus.APPROVED]: { label: t('doctor.profileForm.statusApproved'), variant: 'success' },
  [DoctorStatus.PENDING]: { label: t('doctor.profileForm.statusPending'), variant: 'warning' },
  [DoctorStatus.REJECTED]: { label: t('doctor.profileForm.statusRejected'), variant: 'error' },
  [DoctorStatus.SUSPENDED]: { label: t('doctor.profileForm.statusSuspended'), variant: 'error' },
});

export function DoctorProfileForm() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { data: profile, isLoading, error } = useDoctorProfile();
  const updateMutation = useUpdateDoctorProfile();
  const createMutation = useCreateDoctorProfile();
  const user = useAuthStore((state) => state.user);

  const [whatsappNumbers, setWhatsappNumbers] = useState<string[]>([]);
  const [newWhatsappNumber, setNewWhatsappNumber] = useState('');
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);

  // Determine if this is a new profile (profile is null/undefined or error occurred)
  // The backend returns null when profile doesn't exist, not a 404 error
  const isNewProfile = !isLoading && (!profile || error);

  const statusLabels = getStatusLabels(t);
  const createProfileSchema = getCreateProfileSchema(t);
  const updateProfileSchema = createProfileSchema;

  // Use appropriate schema based on mode
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(isNewProfile ? createProfileSchema : updateProfileSchema),
    defaultValues: {
      specialtyId: '',
      showPhoneNumber: true,
      showWhatsappNumber: true,
    },
  });

  // Fetch specialties for new profile creation
  useEffect(() => {
    if (isNewProfile) {
      const fetchSpecialties = async () => {
        setLoadingSpecialties(true);
        try {
          const response = await apiGet<{ data: Specialty[] } | Specialty[]>(PUBLIC_ENDPOINTS.SPECIALTIES);
          const specialtiesList = Array.isArray(response) ? response : response.data || [];
          setSpecialties(specialtiesList);
        } catch (err) {
          console.error('Failed to fetch specialties:', err);
        } finally {
          setLoadingSpecialties(false);
        }
      };
      fetchSpecialties();
    }
  }, [isNewProfile]);

  // Reset form when profile data loads
  useEffect(() => {
    if (profile) {
      reset({
        specialtyId: profile.specialtyId || '',
        licenseNumber: profile.licenseNumber || '',
        yearsOfExperience: profile.yearsOfExperience || 0,
        qualificationsAr: profile.qualifications?.ar || '',
        qualificationsEn: profile.qualifications?.en || '',
        bioAr: profile.bio?.ar || '',
        bioEn: profile.bio?.en || '',
        showPhoneNumber: profile.showPhoneNumber,
        showWhatsappNumber: profile.showWhatsappNumber,
      });
      setWhatsappNumbers(profile.whatsappNumbers || []);
    }
  }, [profile, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const formData = {
        licenseNumber: data.licenseNumber,
        yearsOfExperience: data.yearsOfExperience,
        qualifications: {
          ar: data.qualificationsAr || '',
          en: data.qualificationsEn || '',
        },
        bio: {
          ar: data.bioAr || '',
          en: data.bioEn || '',
        },
        showPhoneNumber: data.showPhoneNumber,
        showWhatsappNumber: data.showWhatsappNumber,
        whatsappNumbers,
      };

      if (isNewProfile) {
        // Create new profile
        await createMutation.mutateAsync({
          ...formData,
          specialtyId: data.specialtyId,
        });
        toast({
          title: 'تم إنشاء الملف الطبي بنجاح',
          description: 'ملفك الطبي الآن قيد المراجعة من قبل الإدارة. سيتم إشعارك عند الموافقة.',
          variant: 'success',
          duration: 8000,
        });
      } else {
        // Update existing profile
        await updateMutation.mutateAsync(formData);
        toast({
          title: t('doctor.profileForm.savedTitle'),
          description: t('doctor.profileForm.savedDescription'),
          variant: 'success',
        });
      }
    } catch (err) {
      toast({
        title: t('doctor.profileForm.errorTitle'),
        description: isNewProfile ? t('doctor.profileForm.createError') : t('doctor.profileForm.updateError'),
        variant: 'error',
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const addWhatsappNumber = () => {
    if (newWhatsappNumber && !whatsappNumbers.includes(newWhatsappNumber)) {
      setWhatsappNumbers([...whatsappNumbers, newWhatsappNumber]);
      setNewWhatsappNumber('');
    }
  };

  const removeWhatsappNumber = (number: string) => {
    setWhatsappNumbers(whatsappNumbers.filter((n) => n !== number));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Don't show error for new profile - this is expected when profile doesn't exist yet
  // The form will switch to create mode automatically

  const showPhoneNumber = watch('showPhoneNumber');
  const showWhatsappNumber = watch('showWhatsappNumber');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Pending Approval Alert */}
      {!isNewProfile && profile?.status === DoctorStatus.PENDING && (
        <Card className="border-warning-300 bg-warning-50 dark:border-warning-700 dark:bg-warning-900/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-warning-100 dark:bg-warning-800 flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 text-warning-600 dark:text-warning-400" />
              </div>
              <div>
                <h3 className="font-semibold text-warning-800 dark:text-warning-200">حسابك قيد المراجعة</h3>
                <p className="text-sm text-warning-700 dark:text-warning-300">
                  تم استلام طلبك وهو الآن قيد المراجعة من قبل فريق الإدارة. سيتم إشعارك فور الموافقة على حسابك.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-24 w-24 text-2xl">
                <AvatarImage src={profile?.profileImage || undefined} />
                <AvatarFallback>
                  {getInitials(profile?.user?.fullName || user?.fullName || '')}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                className="absolute bottom-0 end-0 h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-lg hover:bg-primary-700 transition-colors"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-start">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <h2 className="text-xl font-bold text-foreground">
                  د. {profile?.user?.fullName || user?.fullName}
                </h2>
                {isNewProfile ? (
                  <Badge variant="warning">{t('doctor.profileForm.newProfile')}</Badge>
                ) : profile?.status && (
                  <Badge variant={statusLabels[profile.status].variant}>
                    {statusLabels[profile.status].label}
                  </Badge>
                )}
              </div>
              {isNewProfile ? (
                <p className="text-muted-foreground mb-1">{t('doctor.profileForm.completeProfileMessage')}</p>
              ) : (
                <p className="text-muted-foreground mb-1">
                  {profile?.specialty?.name?.ar || profile?.specialty?.name?.en}
                </p>
              )}
              <p className="text-sm text-muted-foreground">{profile?.user?.email || user?.email}</p>

              {/* Stats - only show for existing profiles */}
              {!isNewProfile && (
                <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {profile?.averageRating?.toFixed(1) || '0.0'}
                    </p>
                    <p className="text-xs text-muted-foreground">{t('doctor.profileForm.ratingLabel')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {profile?.totalRatings || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">{t('doctor.profileForm.reviewsLabel')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {profile?.totalAppointments || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">{t('doctor.profileForm.appointmentsLabel')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Specialty Selection - only for new profiles */}
      {isNewProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Stethoscope className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              {t('doctor.profileForm.medicalSpecialty')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="specialtyId">{t('doctor.profileForm.specialty')} <span className="text-error-500">*</span></Label>
              <SearchableSelect
                options={specialties.map((specialty) => ({
                  value: specialty.id,
                  label: specialty.name?.ar || specialty.name?.en || (specialty as any).nameAr || (specialty as any).nameEn || '',
                  icon: <Stethoscope className="h-4 w-4" />,
                }))}
                value={watch('specialtyId') || ''}
                onValueChange={(value) => setValue('specialtyId', value, { shouldValidate: true, shouldDirty: true })}
                placeholder={t('doctor.profileForm.selectSpecialty')}
                searchPlaceholder={t('common.search')}
                emptyMessage={t('common.noResults')}
                disabled={loadingSpecialties}
                loading={loadingSpecialties}
                className="bg-background"
              />
              {errors.specialtyId && (
                <p className="text-sm text-error-500">{errors.specialtyId.message}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Professional Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            {t('doctor.profileForm.professionalInfo')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* License Number */}
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">{t('doctor.profileForm.licenseNumber')}</Label>
              <Input
                id="licenseNumber"
                placeholder={t('doctor.profileForm.licenseNumberPlaceholder')}
                {...register('licenseNumber')}
              />
            </div>

            {/* Years of Experience */}
            <div className="space-y-2">
              <Label htmlFor="yearsOfExperience">{t('doctor.profileForm.yearsOfExperience')}</Label>
              <Input
                id="yearsOfExperience"
                type="number"
                min={0}
                max={70}
                placeholder="0"
                {...register('yearsOfExperience')}
              />
              {errors.yearsOfExperience && (
                <p className="text-sm text-error-500">{errors.yearsOfExperience.message}</p>
              )}
            </div>
          </div>

          {/* Qualifications */}
          <div className="space-y-2">
            <Label htmlFor="qualificationsAr">{t('doctor.profileForm.qualificationsAr')}</Label>
            <textarea
              id="qualificationsAr"
              rows={2}
              placeholder={t('doctor.profileForm.qualificationsArPlaceholder')}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none resize-none"
              {...register('qualificationsAr')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="qualificationsEn">{t('doctor.profileForm.qualificationsEn')}</Label>
            <textarea
              id="qualificationsEn"
              rows={2}
              placeholder={t('doctor.profileForm.qualificationsEnPlaceholder')}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none resize-none"
              {...register('qualificationsEn')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Bio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            {t('doctor.profileForm.bioSection')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bioAr">{t('doctor.profileForm.bioAr')}</Label>
            <textarea
              id="bioAr"
              rows={3}
              placeholder={t('doctor.profileForm.bioArPlaceholder')}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none resize-none"
              {...register('bioAr')}
            />
            {errors.bioAr && (
              <p className="text-sm text-error-500">{errors.bioAr.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bioEn">{t('doctor.profileForm.bioEn')}</Label>
            <textarea
              id="bioEn"
              rows={3}
              placeholder={t('doctor.profileForm.bioEnPlaceholder')}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none resize-none"
              {...register('bioEn')}
            />
            {errors.bioEn && (
              <p className="text-sm text-error-500">{errors.bioEn.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Phone className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            {t('doctor.profileForm.contactAndPrivacy')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Phone Display Settings */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">{t('doctor.profileForm.showPhoneNumber')}</p>
                <p className="text-sm text-muted-foreground">{t('doctor.profileForm.showPhoneNumberDesc')}</p>
              </div>
            </div>
            <Switch
              checked={showPhoneNumber}
              onCheckedChange={(checked) => setValue('showPhoneNumber', checked, { shouldDirty: true })}
            />
          </div>

          {/* WhatsApp Settings */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">{t('doctor.profileForm.showWhatsappNumber')}</p>
                <p className="text-sm text-muted-foreground">{t('doctor.profileForm.showWhatsappNumberDesc')}</p>
              </div>
            </div>
            <Switch
              checked={showWhatsappNumber}
              onCheckedChange={(checked) => setValue('showWhatsappNumber', checked, { shouldDirty: true })}
            />
          </div>

          {/* WhatsApp Numbers */}
          {showWhatsappNumber && (
            <div className="space-y-3 p-3 border border-border rounded-lg">
              <Label>{t('doctor.profileForm.whatsappNumbers')}</Label>

              {/* Existing Numbers */}
              {whatsappNumbers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {whatsappNumbers.map((number) => (
                    <Badge key={number} variant="secondary" className="gap-1 ps-3">
                      {number}
                      <button
                        type="button"
                        onClick={() => removeWhatsappNumber(number)}
                        className="ms-1 hover:text-error-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Add New Number */}
              <div className="flex gap-2">
                <Input
                  type="tel"
                  placeholder={t('placeholder.phone')}
                  value={newWhatsappNumber}
                  onChange={(e) => setNewWhatsappNumber(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addWhatsappNumber}
                  disabled={!newWhatsappNumber}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          loading={isPending}
          disabled={!isNewProfile && !isDirty && whatsappNumbers.length === (profile?.whatsappNumbers?.length || 0)}
        >
          <Save className="h-4 w-4 ms-2" />
          {isNewProfile ? t('doctor.profileForm.createProfile') : t('common.saveChanges')}
        </Button>
      </div>
    </form>
  );
}
