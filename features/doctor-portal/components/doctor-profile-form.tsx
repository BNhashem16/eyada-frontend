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
} from 'lucide-react';
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

// Schema for creating new profile (specialty required)
const createProfileSchema = z.object({
  specialtyId: z.string().min(1, 'يجب اختيار التخصص'),
  licenseNumber: z.string().optional(),
  yearsOfExperience: z.coerce.number().min(0).max(70).optional(),
  qualificationsAr: z.string().optional(),
  qualificationsEn: z.string().optional(),
  bioAr: z.string().max(500, 'السيرة الذاتية يجب أن تكون أقل من 500 حرف').optional(),
  bioEn: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  showPhoneNumber: z.boolean(),
  showWhatsappNumber: z.boolean(),
});

// Schema for updating existing profile
const updateProfileSchema = z.object({
  licenseNumber: z.string().optional(),
  yearsOfExperience: z.coerce.number().min(0).max(70).optional(),
  qualificationsAr: z.string().optional(),
  qualificationsEn: z.string().optional(),
  bioAr: z.string().max(500, 'السيرة الذاتية يجب أن تكون أقل من 500 حرف').optional(),
  bioEn: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  showPhoneNumber: z.boolean(),
  showWhatsappNumber: z.boolean(),
});

type CreateProfileFormData = z.infer<typeof createProfileSchema>;
type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
type ProfileFormData = CreateProfileFormData;

const statusLabels: Record<DoctorStatus, { label: string; variant: 'success' | 'warning' | 'error' | 'secondary' }> = {
  [DoctorStatus.APPROVED]: { label: 'معتمد', variant: 'success' },
  [DoctorStatus.PENDING]: { label: 'قيد المراجعة', variant: 'warning' },
  [DoctorStatus.REJECTED]: { label: 'مرفوض', variant: 'error' },
  [DoctorStatus.SUSPENDED]: { label: 'موقوف', variant: 'error' },
};

export function DoctorProfileForm() {
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
          title: 'تم الإنشاء',
          description: 'تم إنشاء الملف الشخصي بنجاح',
          variant: 'success',
        });
      } else {
        // Update existing profile
        await updateMutation.mutateAsync(formData);
        toast({
          title: 'تم الحفظ',
          description: 'تم تحديث الملف الشخصي بنجاح',
          variant: 'success',
        });
      }
    } catch (err) {
      toast({
        title: 'خطأ',
        description: isNewProfile ? 'فشل في إنشاء الملف الشخصي' : 'فشل في تحديث الملف الشخصي',
        variant: 'destructive',
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
                  <Badge variant="warning">ملف جديد</Badge>
                ) : profile?.status && (
                  <Badge variant={statusLabels[profile.status].variant}>
                    {statusLabels[profile.status].label}
                  </Badge>
                )}
              </div>
              {isNewProfile ? (
                <p className="text-muted-foreground mb-1">أكمل بياناتك لإنشاء ملفك الشخصي</p>
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
                    <p className="text-xs text-muted-foreground">التقييم</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {profile?.totalRatings || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">المراجعات</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {profile?.totalAppointments || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">المواعيد</p>
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
              التخصص الطبي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="specialtyId">التخصص <span className="text-error-500">*</span></Label>
              <Select
                value={watch('specialtyId') || ''}
                onValueChange={(value) => setValue('specialtyId', value, { shouldValidate: true, shouldDirty: true })}
                disabled={loadingSpecialties}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder={loadingSpecialties ? 'جاري التحميل...' : 'اختر تخصصك الطبي'} />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty.id} value={specialty.id}>
                      {specialty.name?.ar || specialty.name?.en || (specialty as any).nameAr || (specialty as any).nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            المعلومات المهنية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* License Number */}
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">رقم الترخيص</Label>
              <Input
                id="licenseNumber"
                placeholder="أدخل رقم الترخيص"
                {...register('licenseNumber')}
              />
            </div>

            {/* Years of Experience */}
            <div className="space-y-2">
              <Label htmlFor="yearsOfExperience">سنوات الخبرة</Label>
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
            <Label htmlFor="qualificationsAr">المؤهلات (عربي)</Label>
            <textarea
              id="qualificationsAr"
              rows={2}
              placeholder="بكالوريوس الطب والجراحة، ماجستير..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none resize-none"
              {...register('qualificationsAr')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="qualificationsEn">Qualifications (English)</Label>
            <textarea
              id="qualificationsEn"
              rows={2}
              placeholder="Bachelor of Medicine, Master's..."
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
            السيرة الذاتية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bioAr">نبذة عنك (عربي)</Label>
            <textarea
              id="bioAr"
              rows={3}
              placeholder="اكتب نبذة مختصرة عن خبرتك وتخصصك..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none resize-none"
              {...register('bioAr')}
            />
            {errors.bioAr && (
              <p className="text-sm text-error-500">{errors.bioAr.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bioEn">About You (English)</Label>
            <textarea
              id="bioEn"
              rows={3}
              placeholder="Write a brief description about your experience..."
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
            التواصل والخصوصية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Phone Display Settings */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">عرض رقم الهاتف</p>
                <p className="text-sm text-muted-foreground">السماح للمرضى برؤية رقم هاتفك</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setValue('showPhoneNumber', !showPhoneNumber, { shouldDirty: true })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showPhoneNumber ? 'bg-primary-600' : 'bg-muted-foreground/30'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showPhoneNumber ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* WhatsApp Settings */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">عرض رقم الواتساب</p>
                <p className="text-sm text-muted-foreground">السماح للمرضى بالتواصل عبر واتساب</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setValue('showWhatsappNumber', !showWhatsappNumber, { shouldDirty: true })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showWhatsappNumber ? 'bg-primary-600' : 'bg-muted-foreground/30'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showWhatsappNumber ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* WhatsApp Numbers */}
          {showWhatsappNumber && (
            <div className="space-y-3 p-3 border border-border rounded-lg">
              <Label>أرقام الواتساب</Label>

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
                  placeholder="01012345678"
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
          {isNewProfile ? 'إنشاء الملف الشخصي' : 'حفظ التغييرات'}
        </Button>
      </div>
    </form>
  );
}
