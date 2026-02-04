'use client';

import { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Frown,
  Loader2,
  Check,
  X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useAdminSpecialties,
  useCreateSpecialty,
  useUpdateSpecialty,
  useDeleteSpecialty,
} from '../hooks';
import { Specialty, Multilingual } from '@/types';
import { getLocalizedText } from '@/lib/utils/multilingual';
import { useTranslation } from '@/lib/i18n';

interface SpecialtyFormData {
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string;
}

const initialFormData: SpecialtyFormData = {
  nameAr: '',
  nameEn: '',
  descriptionAr: '',
  descriptionEn: '',
  icon: '',
};

export function SpecialtiesManagement() {
  const { t } = useTranslation();
  const { data: specialtiesResponse, isLoading, isError, error } = useAdminSpecialties();
  const specialties = specialtiesResponse?.data;
  const createSpecialty = useCreateSpecialty();
  const updateSpecialty = useUpdateSpecialty();
  const deleteSpecialty = useDeleteSpecialty();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SpecialtyFormData>(initialFormData);

  const handleOpenCreate = () => {
    setEditingSpecialty(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (specialty: Specialty) => {
    setEditingSpecialty(specialty);
    setFormData({
      nameAr: specialty.name.ar,
      nameEn: specialty.name.en,
      descriptionAr: specialty.description?.ar || '',
      descriptionEn: specialty.description?.en || '',
      icon: specialty.icon || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    const name: Multilingual = { ar: formData.nameAr, en: formData.nameEn };
    const description: Multilingual = {
      ar: formData.descriptionAr,
      en: formData.descriptionEn,
    };

    if (editingSpecialty) {
      updateSpecialty.mutate(
        {
          id: editingSpecialty.id,
          name,
          description: formData.descriptionAr ? description : undefined,
          icon: formData.icon || undefined,
        },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            setEditingSpecialty(null);
            setFormData(initialFormData);
          },
        }
      );
    } else {
      createSpecialty.mutate(
        {
          name,
          description: formData.descriptionAr ? description : undefined,
          icon: formData.icon || undefined,
        },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            setFormData(initialFormData);
          },
        }
      );
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteSpecialty.mutate(deleteId, {
      onSuccess: () => setDeleteId(null),
    });
  };

  const handleToggleActive = (specialty: Specialty) => {
    updateSpecialty.mutate({
      id: specialty.id,
      isActive: !specialty.isActive,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-900/20">
        <CardContent className="py-10 text-center">
          <p className="text-error-600 dark:text-error-400">{t('errors.loadError')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">{t('admin.specialties')} ({specialties?.length || 0})</h3>
            <Button onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 me-2" />
              {t('admin.addSpecialty')}
            </Button>
          </div>

          {!specialties || specialties.length === 0 ? (
            <div className="text-center py-10">
              <Frown className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">{t('admin.noSpecialties')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.nameAr')}</TableHead>
                  <TableHead>{t('table.nameEn')}</TableHead>
                  <TableHead>{t('table.icon')}</TableHead>
                  <TableHead>{t('table.status')}</TableHead>
                  <TableHead>{t('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {specialties
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((specialty) => (
                    <TableRow
                      key={specialty.id}
                      className={!specialty.isActive ? 'opacity-60 bg-muted/30' : ''}
                    >
                      <TableCell className="font-medium">{specialty.name.ar}</TableCell>
                      <TableCell>{specialty.name.en}</TableCell>
                      <TableCell>{specialty.icon || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={specialty.isActive}
                            onCheckedChange={() => handleToggleActive(specialty)}
                            disabled={updateSpecialty.isPending}
                          />
                          <Badge
                            variant={specialty.isActive ? 'success' : 'secondary'}
                            className="text-xs"
                          >
                            {specialty.isActive ? t('common.active') : t('common.inactive')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(specialty)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-error-600"
                            onClick={() => setDeleteId(specialty.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSpecialty ? t('admin.editSpecialty') : t('admin.addNewSpecialty')}
            </DialogTitle>
            <DialogDescription>
              {t('admin.specialtyFormDesc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nameAr">{t('admin.nameAr')} *</Label>
                <Input
                  id="nameAr"
                  value={formData.nameAr}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, nameAr: e.target.value }))
                  }
                  placeholder={t('admin.nameArPlaceholder')}
                />
              </div>
              <div>
                <Label htmlFor="nameEn">{t('admin.nameEn')} *</Label>
                <Input
                  id="nameEn"
                  value={formData.nameEn}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, nameEn: e.target.value }))
                  }
                  placeholder="Dentistry"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="descriptionAr">{t('admin.descriptionAr')}</Label>
                <Input
                  id="descriptionAr"
                  value={formData.descriptionAr}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, descriptionAr: e.target.value }))
                  }
                  placeholder={t('admin.descriptionArPlaceholder')}
                />
              </div>
              <div>
                <Label htmlFor="descriptionEn">{t('admin.descriptionEn')}</Label>
                <Input
                  id="descriptionEn"
                  value={formData.descriptionEn}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, descriptionEn: e.target.value }))
                  }
                  placeholder="Dental specialty"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="icon">{t('admin.icon')}</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, icon: e.target.value }))
                }
                placeholder="tooth"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t('admin.iconHint')}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !formData.nameAr ||
                !formData.nameEn ||
                createSpecialty.isPending ||
                updateSpecialty.isPending
              }
            >
              {(createSpecialty.isPending || updateSpecialty.isPending) && (
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
              )}
              {editingSpecialty ? t('common.update') : t('common.add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.deleteSpecialty')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.deleteSpecialtyConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-error-600 hover:bg-error-700"
              disabled={deleteSpecialty.isPending}
            >
              {deleteSpecialty.isPending && (
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
              )}
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
