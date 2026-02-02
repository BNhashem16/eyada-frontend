'use client';

import { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Award,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Ban,
  UserCheck,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
  useAdminDoctors,
  useApproveDoctor,
  useRejectDoctor,
  useSuspendDoctor,
  useAdminSpecialties,
  AdminDoctorsFilters,
} from '../hooks';
import { getLocalizedText } from '@/lib/utils/multilingual';
import { getInitials } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { DoctorStatus } from '@/types/enums';

const getStatusConfig = (t: (key: string) => string): Record<DoctorStatus, { label: string; variant: 'warning' | 'success' | 'error' | 'secondary'; icon: typeof Clock }> => ({
  [DoctorStatus.PENDING]: { label: t('admin.doctors.underReview'), variant: 'warning', icon: Clock },
  [DoctorStatus.APPROVED]: { label: t('admin.doctors.approved'), variant: 'success', icon: UserCheck },
  [DoctorStatus.REJECTED]: { label: t('admin.doctors.rejected'), variant: 'error', icon: XCircle },
  [DoctorStatus.SUSPENDED]: { label: t('admin.doctors.suspended'), variant: 'error', icon: Ban },
});

export function AdminDoctorsList() {
  const { t } = useTranslation();
  const statusConfig = getStatusConfig(t);

  // Filters state
  const [filters, setFilters] = useState<AdminDoctorsFilters>({
    page: 1,
    limit: 30,
  });
  const [searchInput, setSearchInput] = useState('');

  // Queries
  const { data, isLoading, isError, error } = useAdminDoctors(filters);
  const { data: specialtiesData } = useAdminSpecialties();
  const specialties = specialtiesData?.data || [];

  // Mutations
  const approveDoctor = useApproveDoctor();
  const rejectDoctor = useRejectDoctor();
  const suspendDoctor = useSuspendDoctor();

  // Dialog state
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [action, setAction] = useState<'approve' | 'reject' | 'suspend' | null>(null);

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
  };

  const handleFilterChange = (key: keyof AdminDoctorsFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
      page: 1
    }));
  };

  const handleAction = () => {
    if (!selectedDoctor || !action) return;

    const callbacks = {
      onSuccess: () => {
        setSelectedDoctor(null);
        setAction(null);
      },
    };

    switch (action) {
      case 'approve':
        approveDoctor.mutate(selectedDoctor, callbacks);
        break;
      case 'reject':
        rejectDoctor.mutate(selectedDoctor, callbacks);
        break;
      case 'suspend':
        suspendDoctor.mutate(selectedDoctor, callbacks);
        break;
    }
  };

  const isPending = approveDoctor.isPending || rejectDoctor.isPending || suspendDoctor.isPending;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-40" />
            </div>
          </CardContent>
        </Card>
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-9 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-900/20">
        <CardContent className="py-10 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-error-500 mb-4" />
          <p className="text-error-600 dark:text-error-400">{t('admin.loadError')}</p>
          <p className="text-sm text-error-500 mt-2">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const doctors = data?.data || [];
  const meta = data?.meta;

  return (
    <>
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 flex gap-2">
              <Input
                placeholder={t('admin.doctors.searchPlaceholder')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Status Filter */}
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('appointments.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.doctors.allStatuses')}</SelectItem>
                <SelectItem value={DoctorStatus.PENDING}>{t('admin.doctors.underReview')}</SelectItem>
                <SelectItem value={DoctorStatus.APPROVED}>{t('admin.doctors.approved')}</SelectItem>
                <SelectItem value={DoctorStatus.REJECTED}>{t('admin.doctors.rejected')}</SelectItem>
                <SelectItem value={DoctorStatus.SUSPENDED}>{t('admin.doctors.suspended')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Specialty Filter */}
            <Select
              value={filters.specialtyId || 'all'}
              onValueChange={(value) => handleFilterChange('specialtyId', value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('doctors.filterBySpecialty')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('doctors.allSpecialties')}</SelectItem>
                {specialties?.map((specialty) => (
                  <SelectItem key={specialty.id} value={specialty.id}>
                    {getLocalizedText(specialty.name, 'ar')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      {meta && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {t('admin.doctors.totalResults')} <span className="font-semibold">{meta.total}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            {t('admin.doctors.pageOf').replace('{current}', String(meta.page)).replace('{total}', String(meta.totalPages))}
          </p>
        </div>
      )}

      {/* Doctors List */}
      {doctors.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <User className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">{t('admin.doctors.noDoctorsFound')}</h3>
            <p className="text-muted-foreground">{t('admin.doctors.noDoctorsMatchFilters')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {doctors.map((doctor) => {
            const statusInfo = statusConfig[doctor.status];
            const StatusIcon = statusInfo.icon;

            return (
              <Card key={doctor.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Avatar */}
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={doctor.profileImage || undefined} />
                      <AvatarFallback className="text-lg">
                        {getInitials(doctor.user?.fullName || '')}
                      </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-foreground">
                          د. {doctor.user?.fullName}
                        </h3>
                        <Badge variant={statusInfo.variant}>
                          <StatusIcon className="h-3 w-3 me-1" />
                          {statusInfo.label}
                        </Badge>
                        {doctor.specialty && (
                          <Badge variant="outline">
                            {getLocalizedText(doctor.specialty.name, 'ar')}
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {doctor.user?.email}
                        </span>
                        <span className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {doctor.user?.phoneNumber}
                        </span>
                        {doctor.licenseNumber && (
                          <span className="flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            {t('admin.doctors.license')} {doctor.licenseNumber}
                          </span>
                        )}
                        {doctor.yearsOfExperience !== undefined && (
                          <span className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {doctor.yearsOfExperience} {t('doctors.yearsExp')}
                          </span>
                        )}
                      </div>

                      {doctor.bio && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {getLocalizedText(doctor.bio, 'ar')}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      {doctor.status === DoctorStatus.PENDING && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedDoctor(doctor.id);
                              setAction('approve');
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 me-1" />
                            {t('admin.approve')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedDoctor(doctor.id);
                              setAction('reject');
                            }}
                            className="text-error-600 border-error-300 hover:bg-error-50"
                          >
                            <XCircle className="h-4 w-4 me-1" />
                            {t('admin.reject')}
                          </Button>
                        </>
                      )}
                      {doctor.status === DoctorStatus.APPROVED && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedDoctor(doctor.id);
                            setAction('suspend');
                          }}
                          className="text-warning-600 border-warning-300 hover:bg-warning-50"
                        >
                          <Ban className="h-4 w-4 me-1" />
                          {t('admin.suspend')}
                        </Button>
                      )}
                      {(doctor.status === DoctorStatus.REJECTED || doctor.status === DoctorStatus.SUSPENDED) && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedDoctor(doctor.id);
                            setAction('approve');
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 me-1" />
                          {t('admin.doctors.reactivate')}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            className="text-xs"
            disabled={!meta.hasPreviousPage}
            onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
          >
            <ChevronRight className="h-4 w-4" />
            {t('common.previous')}
          </Button>
          <span className="px-4 text-sm text-muted-foreground">
            {meta.page} / {meta.totalPages}
          </span>
          <Button
            variant="outline"
            className="text-xs"
            disabled={!meta.hasNextPage}
            onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
          >
            {t('common.next')}
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog
        open={!!selectedDoctor && !!action}
        onOpenChange={() => {
          setSelectedDoctor(null);
          setAction(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action === 'approve' && t('admin.confirmApprove')}
              {action === 'reject' && t('admin.confirmReject')}
              {action === 'suspend' && t('admin.doctors.confirmSuspend')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action === 'approve' && t('admin.doctors.approveMessage')}
              {action === 'reject' && t('admin.doctors.rejectConfirmMessage')}
              {action === 'suspend' && t('admin.doctors.suspendMessage')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              className={
                action === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : action === 'suspend'
                  ? 'bg-warning-600 hover:bg-warning-700'
                  : 'bg-error-600 hover:bg-error-700'
              }
              disabled={isPending}
            >
              {isPending && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
              {action === 'approve' && t('admin.approve')}
              {action === 'reject' && t('admin.reject')}
              {action === 'suspend' && t('admin.suspend')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
