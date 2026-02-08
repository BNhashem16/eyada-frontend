'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Clock,
  Calendar,
  Stethoscope,
  Phone,
  Video,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  useClinicServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from '../hooks/use-doctor-portal';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';
import { ServiceType } from '@/types/enums';
import { ClinicServiceType } from '@/types';

interface ServiceManagerProps {
  clinicId: string;
}

const getServiceTypeLabels = (t: (key: string) => string): Record<ServiceType, string> => ({
  [ServiceType.FIRST_VISIT]: t('services.firstVisit'),
  [ServiceType.RE_VISIT]: t('services.reVisit'),
  [ServiceType.CONSULTATION_PHONE]: t('services.phoneConsultation'),
  [ServiceType.CONSULTATION_VIDEO]: t('services.videoConsultation'),
});

const getServiceSchema = (t: (key: string) => string) => z.object({
  nameAr: z.string().min(3, t('validation.serviceNameArRequired')),
  nameEn: z.string().optional(),
  serviceType: z.nativeEnum(ServiceType),
  price: z.number().min(1, t('validation.priceRequired')),
  durationMinutes: z.number().min(5, t('validation.durationMin')),
  reVisitValidityDays: z.number().min(1).optional(),
  isActive: z.boolean(),
});

type ServiceFormData = z.infer<ReturnType<typeof getServiceSchema>>;

export function ServiceManager({ clinicId }: ServiceManagerProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [editingService, setEditingService] = useState<ClinicServiceType | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: services, isLoading } = useClinicServices(clinicId);
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();

  const serviceTypeLabels = getServiceTypeLabels(t);
  const serviceSchema = getServiceSchema(t);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      serviceType: ServiceType.FIRST_VISIT,
      durationMinutes: 30,
      isActive: true,
    },
  });

  const openAddDialog = () => {
    setEditingService(null);
    reset({
      nameAr: '',
      nameEn: '',
      serviceType: ServiceType.FIRST_VISIT,
      price: 0,
      durationMinutes: 30,
      reVisitValidityDays: undefined,
      isActive: true,
    });
    setShowDialog(true);
  };

  const openEditDialog = (service: ClinicServiceType) => {
    setEditingService(service);
    reset({
      nameAr: service.name?.ar || '',
      nameEn: service.name?.en || '',
      serviceType: service.serviceType,
      price: typeof service.price === 'string' ? parseFloat(service.price) : service.price,
      durationMinutes: service.duration,
      reVisitValidityDays: service.reVisitValidityDays || undefined,
      isActive: service.isActive,
    });
    setShowDialog(true);
  };

  const onSubmit = async (data: ServiceFormData) => {
    try {
      // Transform form data to match backend DTO
      const payload = {
        name: {
          ar: data.nameAr,
          en: data.nameEn || data.nameAr,
        },
        serviceType: data.serviceType,
        price: data.price,
        duration: data.durationMinutes,
        reVisitValidityDays: data.reVisitValidityDays || undefined,
        isActive: data.isActive,
      };

      if (editingService) {
        await updateMutation.mutateAsync({
          clinicId,
          serviceId: editingService.id,
          data: payload,
        });
        toast({
          title: t('toast.updated'),
          description: t('services.serviceUpdated'),
          variant: 'success',
        });
      } else {
        await createMutation.mutateAsync({ clinicId, data: payload });
        toast({
          title: t('toast.added'),
          description: t('services.serviceAdded'),
          variant: 'success',
        });
      }
      setShowDialog(false);
      reset();
    } catch (error) {
      toast({
        title: t('toast.error'),
        description: t('services.serviceSaveFailed'),
        variant: 'error',
      });
    }
  };

  const handleDelete = async (serviceId: string) => {
    setDeletingId(serviceId);
    try {
      await deleteMutation.mutateAsync({ clinicId, serviceId });
      toast({
        title: t('toast.deleted'),
        description: t('services.serviceDeleted'),
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: t('toast.error'),
        description: t('services.serviceDeleteFailed'),
        variant: 'error',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            {t('services.title')}
          </CardTitle>
          <Button className="text-xs" onClick={openAddDialog}>
            <Plus className="h-4 w-4 ms-2" />
            {t('services.addService')}
          </Button>
        </CardHeader>
        <CardContent>
          {services && services.length > 0 ? (
            <div className="space-y-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-lg ${
                    service.isActive ? 'bg-muted' : 'bg-muted/50 opacity-60'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground truncate">
                        {service.name?.ar || service.name?.en || service.serviceType}
                      </h4>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {serviceTypeLabels[service.serviceType]}
                      </Badge>
                      {!service.isActive && (
                        <Badge variant="outline" className="text-xs shrink-0">
                          {t('common.inactive')}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {service.duration} {t('services.minute')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <p className="text-lg font-bold text-primary-600 dark:text-primary-400 whitespace-nowrap">
                      {service.price} {t('common.currency')}
                    </p>
                    <div className="flex gap-1 sm:gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(service)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-error-600 hover:bg-error-50 dark:hover:bg-error-900/30"
                        onClick={() => handleDelete(service.id)}
                        disabled={deletingId === service.id}
                      >
                        {deletingId === service.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">{t('services.noServices')}</p>
              <Button className="mt-4" onClick={openAddDialog}>
                <Plus className="h-4 w-4 ms-2" />
                {t('services.addFirstService')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Service Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingService ? t('services.editService') : t('services.addNewService')}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Arabic */}
            <div className="space-y-2">
              <Label htmlFor="nameAr" required>
                {t('services.serviceNameAr')}
              </Label>
              <Input
                id="nameAr"
                {...register('nameAr')}
                placeholder={t('services.serviceNameArPlaceholder')}
                error={!!errors.nameAr}
              />
            </div>

            {/* Name English */}
            <div className="space-y-2">
              <Label htmlFor="nameEn">{t('services.serviceNameEn')}</Label>
              <Input
                id="nameEn"
                {...register('nameEn')}
                placeholder={t('services.serviceNameEnPlaceholder')}
                dir="ltr"
              />
            </div>

            {/* Service Type */}
            <div className="space-y-2">
              <Label required>{t('services.serviceType')}</Label>
              <SearchableSelect
                options={[
                  { value: ServiceType.FIRST_VISIT, label: serviceTypeLabels[ServiceType.FIRST_VISIT], icon: <Stethoscope className="h-4 w-4" /> },
                  { value: ServiceType.RE_VISIT, label: serviceTypeLabels[ServiceType.RE_VISIT], icon: <RefreshCw className="h-4 w-4" /> },
                  { value: ServiceType.CONSULTATION_PHONE, label: serviceTypeLabels[ServiceType.CONSULTATION_PHONE], icon: <Phone className="h-4 w-4" /> },
                  { value: ServiceType.CONSULTATION_VIDEO, label: serviceTypeLabels[ServiceType.CONSULTATION_VIDEO], icon: <Video className="h-4 w-4" /> },
                ]}
                value={watch('serviceType')}
                onValueChange={(value) =>
                  setValue('serviceType', value as ServiceType)
                }
                showSearch={false}
                clearable={false}
              />
            </div>

            {/* Price & Duration */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price" required>
                  {t('services.servicePrice')}
                </Label>
                <Input
                  id="price"
                  type="number"
                  inputMode="decimal"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="0"
                  error={!!errors.price}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="durationMinutes" required>
                  {t('services.serviceDuration')}
                </Label>
                <Input
                  id="durationMinutes"
                  type="number"
                  inputMode="numeric"
                  {...register('durationMinutes', { valueAsNumber: true })}
                  placeholder="30"
                  error={!!errors.durationMinutes}
                />
              </div>
            </div>

            {/* Re-visit validity - only show for RE_VISIT type */}
            {watch('serviceType') === ServiceType.RE_VISIT && (
              <div className="space-y-2">
                <Label htmlFor="reVisitValidityDays">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {t('services.reVisitValidity')}
                  </span>
                </Label>
                <Input
                  id="reVisitValidityDays"
                  type="number"
                  inputMode="numeric"
                  {...register('reVisitValidityDays', { valueAsNumber: true })}
                  placeholder="14"
                />
                <p className="text-xs text-muted-foreground">
                  {t('services.reVisitValidityHint')}
                </p>
              </div>
            )}

            {/* Active Status */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                {...register('isActive')}
                className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500"
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                {t('services.serviceActive')}
              </Label>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin ms-2" />
                    {t('common.saving')}
                  </>
                ) : editingService ? (
                  t('common.saveChanges')
                ) : (
                  t('services.addService')
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
