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
  FileText,
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
import { ServiceType } from '@/types/enums';
import { ClinicServiceType } from '@/types';

interface ServiceManagerProps {
  clinicId: string;
}

const serviceTypeLabels: Record<ServiceType, string> = {
  [ServiceType.CONSULTATION]: 'كشف',
  [ServiceType.FOLLOW_UP]: 'متابعة',
  [ServiceType.PROCEDURE]: 'إجراء',
  [ServiceType.OTHER]: 'أخرى',
};

const serviceSchema = z.object({
  nameAr: z.string().min(3, 'اسم الخدمة بالعربية مطلوب'),
  nameEn: z.string().optional(),
  description: z.string().optional(),
  serviceType: z.nativeEnum(ServiceType),
  price: z.number().min(1, 'السعر مطلوب'),
  durationMinutes: z.number().min(5, 'المدة يجب أن تكون 5 دقائق على الأقل'),
  isActive: z.boolean().default(true),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

export function ServiceManager({ clinicId }: ServiceManagerProps) {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [editingService, setEditingService] = useState<ClinicServiceType | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: services, isLoading } = useClinicServices(clinicId);
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();

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
      serviceType: ServiceType.CONSULTATION,
      durationMinutes: 30,
      isActive: true,
    },
  });

  const openAddDialog = () => {
    setEditingService(null);
    reset({
      nameAr: '',
      nameEn: '',
      description: '',
      serviceType: ServiceType.CONSULTATION,
      price: 0,
      durationMinutes: 30,
      isActive: true,
    });
    setShowDialog(true);
  };

  const openEditDialog = (service: ClinicServiceType) => {
    setEditingService(service);
    reset({
      nameAr: service.nameAr,
      nameEn: service.nameEn || '',
      description: service.description || '',
      serviceType: service.serviceType,
      price: service.price,
      durationMinutes: service.durationMinutes,
      isActive: service.isActive,
    });
    setShowDialog(true);
  };

  const onSubmit = async (data: ServiceFormData) => {
    try {
      if (editingService) {
        await updateMutation.mutateAsync({
          clinicId,
          serviceId: editingService.id,
          data,
        });
        toast({
          title: 'تم التحديث',
          description: 'تم تحديث الخدمة بنجاح',
          variant: 'success',
        });
      } else {
        await createMutation.mutateAsync({ clinicId, data });
        toast({
          title: 'تمت الإضافة',
          description: 'تم إضافة الخدمة بنجاح',
          variant: 'success',
        });
      }
      setShowDialog(false);
      reset();
    } catch (error) {
      toast({
        title: 'حدث خطأ',
        description: 'فشل في حفظ الخدمة',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (serviceId: string) => {
    setDeletingId(serviceId);
    try {
      await deleteMutation.mutateAsync({ clinicId, serviceId });
      toast({
        title: 'تم الحذف',
        description: 'تم حذف الخدمة بنجاح',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'حدث خطأ',
        description: 'فشل في حذف الخدمة',
        variant: 'destructive',
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
            الخدمات والأسعار
          </CardTitle>
          <Button size="sm" onClick={openAddDialog}>
            <Plus className="h-4 w-4 ms-2" />
            إضافة خدمة
          </Button>
        </CardHeader>
        <CardContent>
          {services && services.length > 0 ? (
            <div className="space-y-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className={`flex items-center gap-4 p-4 rounded-lg ${
                    service.isActive ? 'bg-muted' : 'bg-muted/50 opacity-60'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground">
                        {service.nameAr}
                      </h4>
                      <Badge variant="secondary" size="sm">
                        {serviceTypeLabels[service.serviceType]}
                      </Badge>
                      {!service.isActive && (
                        <Badge variant="outline" size="sm">
                          غير نشطة
                        </Badge>
                      )}
                    </div>
                    {service.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {service.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {service.durationMinutes} دقيقة
                      </span>
                    </div>
                  </div>
                  <div className="text-end">
                    <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                      {service.price} ج.م
                    </p>
                  </div>
                  <div className="flex gap-2">
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
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">لم تقم بإضافة خدمات بعد</p>
              <Button className="mt-4" onClick={openAddDialog}>
                <Plus className="h-4 w-4 ms-2" />
                إضافة أول خدمة
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
              {editingService ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Arabic */}
            <div className="space-y-2">
              <Label htmlFor="nameAr" required>
                اسم الخدمة (عربي)
              </Label>
              <Input
                id="nameAr"
                {...register('nameAr')}
                placeholder="مثال: كشف طبي"
                error={errors.nameAr?.message}
              />
            </div>

            {/* Name English */}
            <div className="space-y-2">
              <Label htmlFor="nameEn">اسم الخدمة (إنجليزي)</Label>
              <Input
                id="nameEn"
                {...register('nameEn')}
                placeholder="e.g. Medical Consultation"
                dir="ltr"
              />
            </div>

            {/* Service Type */}
            <div className="space-y-2">
              <Label required>نوع الخدمة</Label>
              <Select
                value={watch('serviceType')}
                onValueChange={(value) =>
                  setValue('serviceType', value as ServiceType)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(serviceTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price & Duration */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price" required>
                  السعر (ج.م)
                </Label>
                <Input
                  id="price"
                  type="number"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="0"
                  error={errors.price?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="durationMinutes" required>
                  المدة (دقيقة)
                </Label>
                <Input
                  id="durationMinutes"
                  type="number"
                  {...register('durationMinutes', { valueAsNumber: true })}
                  placeholder="30"
                  error={errors.durationMinutes?.message}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">وصف الخدمة</Label>
              <textarea
                id="description"
                {...register('description')}
                rows={2}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none resize-none"
                placeholder="وصف مختصر للخدمة..."
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                {...register('isActive')}
                className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500"
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                الخدمة نشطة (متاحة للحجز)
              </Label>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin ms-2" />
                    جاري الحفظ...
                  </>
                ) : editingService ? (
                  'حفظ التغييرات'
                ) : (
                  'إضافة الخدمة'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
