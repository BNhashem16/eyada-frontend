'use client';

import { useState } from 'react';
import { Users, Plus, Trash2, User, Calendar, Loader2, Edit, Eye } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { usePatientFamily, useAddFamilyMember, useUpdateFamilyMember, useDeleteFamilyMember } from '../hooks/use-patient';
import { useToast } from '@/hooks/use-toast';
import { Gender, RelationshipType } from '@/types/enums';
import { FamilyMember } from '@/types';
import { getInitials } from '@/lib/utils';

const relationshipLabels: Record<RelationshipType, string> = {
  [RelationshipType.SELF]: 'المريض نفسه',
  [RelationshipType.SPOUSE]: 'زوج/زوجة',
  [RelationshipType.CHILD]: 'ابن/ابنة',
  [RelationshipType.PARENT]: 'أب/أم',
  [RelationshipType.SIBLING]: 'أخ/أخت',
  [RelationshipType.OTHER]: 'آخر',
};

const genderLabels: Record<Gender, string> = {
  [Gender.MALE]: 'ذكر',
  [Gender.FEMALE]: 'أنثى',
};

// Schema matching backend AddFamilyMemberDto / UpdateFamilyMemberDto
const familyMemberSchema = z.object({
  fullName: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل').max(100),
  dateOfBirth: z.string().optional(),
  age: z.coerce.number().min(1).max(120).optional().or(z.literal('')),
  gender: z.nativeEnum(Gender).optional(),
  relationship: z.nativeEnum(RelationshipType),
  bloodType: z.string().optional(),
});

type FamilyMemberFormData = z.infer<typeof familyMemberSchema>;

type DialogMode = 'add' | 'view' | 'edit';

export function FamilyList() {
  const { toast } = useToast();
  const [dialogMode, setDialogMode] = useState<DialogMode | null>(null);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: family, isLoading } = usePatientFamily();
  const addMutation = useAddFamilyMember();
  const updateMutation = useUpdateFamilyMember();
  const deleteMutation = useDeleteFamilyMember();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FamilyMemberFormData>({
    resolver: zodResolver(familyMemberSchema),
    defaultValues: {
      fullName: '',
      gender: Gender.MALE,
      relationship: RelationshipType.CHILD,
    },
  });

  const openAddDialog = () => {
    setSelectedMember(null);
    reset({
      fullName: '',
      dateOfBirth: '',
      age: '',
      gender: Gender.MALE,
      relationship: RelationshipType.CHILD,
      bloodType: '',
    });
    setDialogMode('add');
  };

  const openViewDialog = (member: FamilyMember) => {
    setSelectedMember(member);
    setDialogMode('view');
  };

  const openEditDialog = (member: FamilyMember) => {
    setSelectedMember(member);
    reset({
      fullName: member.fullName,
      dateOfBirth: member.dateOfBirth ? member.dateOfBirth.split('T')[0] : '',
      age: member.age || '',
      gender: member.gender,
      relationship: member.relationship,
      bloodType: member.bloodType || '',
    });
    setDialogMode('edit');
  };

  const closeDialog = () => {
    setDialogMode(null);
    setSelectedMember(null);
    reset();
  };

  const onSubmit = async (data: FamilyMemberFormData) => {
    try {
      const payload = {
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth || undefined,
        age: data.age ? Number(data.age) : undefined,
        gender: data.gender,
        relationship: data.relationship,
        bloodType: data.bloodType || undefined,
      };

      if (dialogMode === 'add') {
        await addMutation.mutateAsync(payload);
        toast({
          title: 'تمت الإضافة',
          description: 'تم إضافة فرد العائلة بنجاح',
          variant: 'success',
        });
      } else if (dialogMode === 'edit' && selectedMember) {
        await updateMutation.mutateAsync({
          memberId: selectedMember.id,
          data: payload,
        });
        toast({
          title: 'تم التحديث',
          description: 'تم تحديث بيانات فرد العائلة بنجاح',
          variant: 'success',
        });
      }
      closeDialog();
    } catch (error) {
      toast({
        title: dialogMode === 'add' ? 'فشلت الإضافة' : 'فشل التحديث',
        description: 'حدث خطأ، يرجى المحاولة مرة أخرى',
        variant: 'error',
      });
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: 'تم الحذف',
        description: 'تم حذف فرد العائلة بنجاح',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'فشل الحذف',
        description: 'حدث خطأ أثناء حذف فرد العائلة',
        variant: 'error',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const isPending = addMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
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
            <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            أفراد العائلة
          </CardTitle>
          <Button className="text-xs" onClick={openAddDialog}>
            <Plus className="h-4 w-4 ms-2" />
            إضافة فرد
          </Button>
        </CardHeader>
        <CardContent>
          {family && family.length > 0 ? (
            <div className="space-y-3">
              {family.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-4 p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
                  onClick={() => openViewDialog(member)}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{getInitials(member.fullName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{member.fullName}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {relationshipLabels[member.relationship]}
                      </Badge>
                      {member.gender && (
                        <span className="text-sm text-muted-foreground">
                          {genderLabels[member.gender]}
                        </span>
                      )}
                      {member.age && (
                        <span className="text-sm text-muted-foreground">
                          {member.age} سنة
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditDialog(member);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-error-600 hover:text-error-700 hover:bg-error-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(member.id);
                      }}
                      disabled={deletingId === member.id}
                    >
                      {deletingId === member.id ? (
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
              <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">لم تقم بإضافة أفراد عائلة بعد</p>
              <p className="text-sm text-muted-foreground mt-1">
                يمكنك إضافة أفراد عائلتك لحجز مواعيد لهم
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Member Dialog */}
      <Dialog open={dialogMode === 'view'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>بيانات فرد العائلة</DialogTitle>
          </DialogHeader>

          {selectedMember && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">{getInitials(selectedMember.fullName)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedMember.fullName}</h3>
                  <Badge variant="secondary">{relationshipLabels[selectedMember.relationship]}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">الجنس</Label>
                  <p className="font-medium">{selectedMember.gender ? genderLabels[selectedMember.gender] : 'غير محدد'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">العمر</Label>
                  <p className="font-medium">{selectedMember.age ? `${selectedMember.age} سنة` : 'غير محدد'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">تاريخ الميلاد</Label>
                  <p className="font-medium">
                    {selectedMember.dateOfBirth
                      ? new Date(selectedMember.dateOfBirth).toLocaleDateString('ar-EG')
                      : 'غير محدد'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">فصيلة الدم</Label>
                  <p className="font-medium">{selectedMember.bloodType || 'غير محدد'}</p>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={closeDialog}>
                  إغلاق
                </Button>
                <Button onClick={() => openEditDialog(selectedMember)}>
                  <Edit className="h-4 w-4 ms-2" />
                  تعديل
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Family Member Dialog */}
      <Dialog open={dialogMode === 'add' || dialogMode === 'edit'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'add' ? 'إضافة فرد عائلة' : 'تعديل بيانات فرد العائلة'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="member-name" required>الاسم</Label>
              <Input
                id="member-name"
                {...register('fullName')}
                icon={<User className="h-5 w-5" />}
                iconPosition="start"
                error={!!errors.fullName}
              />
              {errors.fullName && (
                <p className="text-sm text-error-600">{errors.fullName.message}</p>
              )}
            </div>

            {/* Relationship */}
            <div className="space-y-2">
              <Label required>صلة القرابة</Label>
              <Select
                value={watch('relationship')}
                onValueChange={(value) => setValue('relationship', value as RelationshipType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(relationshipLabels)
                    .filter(([key]) => key !== RelationshipType.SELF)
                    .map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label>الجنس</Label>
              <Select
                value={watch('gender') || undefined}
                onValueChange={(value) => setValue('gender', value as Gender)}
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

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="member-dob">تاريخ الميلاد</Label>
              <Input
                id="member-dob"
                type="date"
                {...register('dateOfBirth')}
                icon={<Calendar className="h-5 w-5" />}
                iconPosition="start"
              />
            </div>

            {/* Age */}
            <div className="space-y-2">
              <Label htmlFor="member-age">العمر</Label>
              <Input
                id="member-age"
                type="number"
                {...register('age')}
                placeholder="30"
                min={1}
                max={120}
              />
            </div>

            {/* Blood Type */}
            <div className="space-y-2">
              <Label>فصيلة الدم</Label>
              <Select
                value={watch('bloodType') || undefined}
                onValueChange={(value) => setValue('bloodType', value)}
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

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={closeDialog}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin ms-2" />
                    {dialogMode === 'add' ? 'جاري الإضافة...' : 'جاري الحفظ...'}
                  </>
                ) : dialogMode === 'add' ? (
                  'إضافة'
                ) : (
                  'حفظ التغييرات'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
