'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, UserCog, Building2, Phone, Mail, MoreVertical, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useDoctorSecretaries, useUpdateSecretaryAssignment, useRemoveSecretaryFromClinic } from '@/features/doctor-portal/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useToast } from '@/hooks/use-toast';
import { getLocalizedText } from '@/lib/utils/multilingual';

export default function DoctorSecretariesPage() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const { toast } = useToast();

  const { data: secretaries, isLoading, error } = useDoctorSecretaries();
  const updateAssignment = useUpdateSecretaryAssignment();
  const removeFromClinic = useRemoveSecretaryFromClinic();

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    assignmentId: string;
    secretaryName: string;
    clinicName: string;
  }>({ open: false, assignmentId: '', secretaryName: '', clinicName: '' });

  const handleToggleAssignment = async (assignmentId: string, currentStatus: boolean) => {
    try {
      await updateAssignment.mutateAsync({
        assignmentId,
        isActive: !currentStatus,
      });
      toast({
        title: t('toast.success'),
        description: t('secretary.assignmentUpdated'),
      });
    } catch {
      toast({
        title: t('toast.error'),
        description: t('toast.updateFailed'),
        variant: 'error',
      });
    }
  };

  const handleRemoveFromClinic = async () => {
    try {
      await removeFromClinic.mutateAsync(deleteDialog.assignmentId);
      toast({
        title: t('toast.success'),
        description: t('secretary.removedFromClinic'),
      });
      setDeleteDialog({ open: false, assignmentId: '', secretaryName: '', clinicName: '' });
    } catch {
      toast({
        title: t('toast.error'),
        description: t('toast.deleteFailed'),
        variant: 'error',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-destructive">{t('secretary.loadError')}</p>
        <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
          {t('common.tryAgain')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('secretary.management.title')}</h1>
          <p className="text-muted-foreground">{t('secretary.management.subtitle')}</p>
        </div>
        <Button onClick={() => router.push('/doctor/secretaries/new')}>
          <Plus className="h-4 w-4 me-2" />
          {t('secretary.management.addSecretary')}
        </Button>
      </div>

      {/* Empty State */}
      {(!secretaries || secretaries.length === 0) && (
        <Card className="p-12 text-center">
          <UserCog className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('secretary.management.noSecretaries')}</h3>
          <p className="text-muted-foreground mb-4">{t('secretary.management.noSecretariesDesc')}</p>
          <Button onClick={() => router.push('/doctor/secretaries/new')}>
            <Plus className="h-4 w-4 me-2" />
            {t('secretary.management.addFirstSecretary')}
          </Button>
        </Card>
      )}

      {/* Secretaries List */}
      {secretaries && secretaries.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {secretaries.map((secretary) => (
            <Card key={secretary.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserCog className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{secretary.fullName}</CardTitle>
                      <Badge variant={secretary.isActive ? 'default' : 'secondary'} className="mt-1">
                        {secretary.isActive ? t('common.active') : t('common.inactive')}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/doctor/secretaries/${secretary.id}/edit`)}>
                        {t('common.edit')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Contact Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{secretary.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span dir="ltr">{secretary.phoneNumber}</span>
                  </div>
                </div>

                {/* Assigned Clinics */}
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium mb-2">{t('secretary.management.assignedClinics')}</p>
                  <div className="space-y-2">
                    {secretary.clinics.map((clinic) => (
                      <div
                        key={clinic.assignmentId}
                        className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{getLocalizedText(clinic.name, locale)}</span>
                          {!clinic.isActive && (
                            <Badge variant="outline" className="text-xs">
                              {t('common.inactive')}
                            </Badge>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleToggleAssignment(clinic.assignmentId, clinic.isActive)}
                            >
                              {clinic.isActive ? (
                                <>
                                  <ToggleLeft className="h-4 w-4 me-2" />
                                  {t('secretary.management.deactivate')}
                                </>
                              ) : (
                                <>
                                  <ToggleRight className="h-4 w-4 me-2" />
                                  {t('secretary.management.activate')}
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() =>
                                setDeleteDialog({
                                  open: true,
                                  assignmentId: clinic.assignmentId,
                                  secretaryName: secretary.fullName,
                                  clinicName: getLocalizedText(clinic.name, locale),
                                })
                              }
                            >
                              <Trash2 className="h-4 w-4 me-2" />
                              {t('secretary.management.removeFromClinic')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ ...deleteDialog, open: false })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('secretary.management.confirmRemove')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('secretary.management.confirmRemoveDesc', {
                secretary: deleteDialog.secretaryName,
                clinic: deleteDialog.clinicName,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveFromClinic} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
