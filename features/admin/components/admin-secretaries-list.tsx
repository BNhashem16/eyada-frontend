'use client';

import { useState } from 'react';
import {
  Search,
  Frown,
  Loader2,
  Eye,
  User,
  Phone,
  Mail,
  Building,
  Trash2,
  Plus,
  UserPlus,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useAdminSecretaries,
  useCreateAdminSecretary,
  useUpdateAdminSecretary,
  useRemoveSecretaryAssignment,
  AdminSecretary,
  SecretaryAssignment,
} from '../hooks';
import { useAdminClinics } from '../hooks/use-admin-clinics';
import { getLocalizedText } from '@/lib/utils/multilingual';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { useTranslation } from '@/lib/i18n';

export function AdminSecretariesList() {
  const { t, locale } = useTranslation();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [clinicId, setClinicId] = useState<string | undefined>(undefined);
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const filters = {
    page,
    limit,
    search,
    clinicId,
    isActive,
  };

  const { data: secretariesResponse, isLoading, isError } = useAdminSecretaries(filters);
  const secretaries = secretariesResponse?.data || [];
  const meta = secretariesResponse?.meta;

  const { data: clinicsResponse } = useAdminClinics({ limit: 100 });
  const clinics = clinicsResponse?.data || [];

  const createSecretary = useCreateAdminSecretary();
  const updateSecretary = useUpdateAdminSecretary();
  const removeAssignment = useRemoveSecretaryAssignment();

  const [selectedSecretary, setSelectedSecretary] = useState<AdminSecretary | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<SecretaryAssignment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    clinicId: '',
  });

  const handleSearch = () => {
    setSearch(searchInput || undefined);
    setPage(1);
  };

  const handleViewDetails = (secretary: AdminSecretary) => {
    setSelectedSecretary(secretary);
    setIsDetailsOpen(true);
  };

  const handleOpenCreate = () => {
    setFormData({
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      clinicId: '',
    });
    setIsCreateOpen(true);
  };

  const handleOpenRemove = (assignment: SecretaryAssignment) => {
    setSelectedAssignment(assignment);
    setIsRemoveDialogOpen(true);
  };

  const handleCreateSecretary = () => {
    createSecretary.mutate(formData, {
      onSuccess: () => {
        setIsCreateOpen(false);
        setFormData({
          fullName: '',
          email: '',
          phoneNumber: '',
          password: '',
          clinicId: '',
        });
      },
    });
  };

  const handleToggleActive = (secretary: AdminSecretary) => {
    updateSecretary.mutate({
      id: secretary.id,
      isActive: !secretary.isActive,
    });
  };

  const handleRemoveAssignment = () => {
    if (!selectedAssignment) return;

    removeAssignment.mutate(selectedAssignment.id, {
      onSuccess: () => {
        setIsRemoveDialogOpen(false);
        setSelectedAssignment(null);
      },
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
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
      {/* Filters & Actions */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex gap-2 flex-wrap flex-1">
              <div className="flex gap-2 flex-1">
                <Input
                  placeholder={t('admin.secretaries.searchPlaceholder')}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="max-w-sm"
                />
                <Button variant="outline" size="icon" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              <Select
                value={clinicId || 'all'}
                onValueChange={(value) => { setClinicId(value === 'all' ? undefined : value); setPage(1); }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t('admin.secretaries.filterByClinic')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('admin.secretaries.allClinics')}</SelectItem>
                  {clinics.map((clinic) => (
                    <SelectItem key={clinic.id} value={clinic.id}>
                      {getLocalizedText(clinic.name, locale)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={isActive === undefined ? 'all' : isActive.toString()}
                onValueChange={(value) => {
                  setIsActive(value === 'all' ? undefined : value === 'true');
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder={t('admin.secretaries.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  <SelectItem value="true">{t('admin.secretaries.activeOnly')}</SelectItem>
                  <SelectItem value="false">{t('admin.secretaries.inactiveOnly')}</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchInput('');
                  setSearch(undefined);
                  setClinicId(undefined);
                  setIsActive(undefined);
                  setPage(1);
                }}
              >
                {t('common.clearFilters')}
              </Button>
            </div>

            <Button onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 me-2" />
              {t('admin.secretaries.add')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Secretaries Table */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {t('admin.secretaries.list')} ({meta?.total || 0})
          </h3>

          {secretaries.length === 0 ? (
            <div className="text-center py-10">
              <Frown className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">{t('admin.secretaries.noSecretaries')}</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.secretaries.name')}</TableHead>
                    <TableHead>{t('admin.secretaries.email')}</TableHead>
                    <TableHead>{t('admin.secretaries.phone')}</TableHead>
                    <TableHead>{t('admin.secretaries.clinics')}</TableHead>
                    <TableHead>{t('admin.secretaries.status')}</TableHead>
                    <TableHead>{t('table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {secretaries.map((secretary) => (
                    <TableRow key={secretary.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary-600" />
                          </div>
                          <p className="font-medium">{secretary.fullName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          {secretary.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {secretary.phoneNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        {secretary.assignments?.length ? (
                          <div className="flex flex-wrap gap-1">
                            {secretary.assignments.slice(0, 2).map((assignment) => (
                              <Badge key={assignment.id} variant="outline" className="text-xs">
                                {getLocalizedText(assignment.clinic.name, locale)}
                              </Badge>
                            ))}
                            {secretary.assignments.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{secretary.assignments.length - 2}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={secretary.isActive}
                            onCheckedChange={() => handleToggleActive(secretary)}
                            disabled={updateSecretary.isPending}
                          />
                          <Badge variant={secretary.isActive ? 'success' : 'secondary'}>
                            {secretary.isActive ? t('common.active') : t('common.inactive')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(secretary)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <PaginationControls meta={meta} page={page} onPageChange={setPage} limit={limit} onLimitChange={(v) => { setLimit(v); setPage(1); }} />
            </>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('admin.secretaries.details')}</DialogTitle>
            <DialogDescription>
              {selectedSecretary?.fullName}
            </DialogDescription>
          </DialogHeader>

          {selectedSecretary && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t('admin.secretaries.name')}</p>
                  <p className="font-medium">{selectedSecretary.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('admin.secretaries.email')}</p>
                  <p className="font-medium">{selectedSecretary.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('admin.secretaries.phone')}</p>
                  <p className="font-medium">{selectedSecretary.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('admin.secretaries.status')}</p>
                  <Badge variant={selectedSecretary.isActive ? 'success' : 'secondary'}>
                    {selectedSecretary.isActive ? t('common.active') : t('common.inactive')}
                  </Badge>
                </div>
              </div>

              {selectedSecretary.assignments && selectedSecretary.assignments.length > 0 && (
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {t('admin.secretaries.assignedClinics')} ({selectedSecretary.assignments.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedSecretary.assignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {getLocalizedText(assignment.clinic.name, locale)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {assignment.clinic.doctorProfile?.user.fullName}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={assignment.isActive ? 'success' : 'secondary'}>
                            {assignment.isActive ? t('common.active') : t('common.inactive')}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-error-600"
                            onClick={() => handleOpenRemove(assignment)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              {t('common.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Secretary Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.secretaries.addNew')}</DialogTitle>
            <DialogDescription>
              {t('admin.secretaries.addDesc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>{t('admin.secretaries.name')}</Label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder={t('admin.secretaries.namePlaceholder')}
              />
            </div>
            <div>
              <Label>{t('admin.secretaries.email')}</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t('admin.secretaries.emailPlaceholder')}
              />
            </div>
            <div>
              <Label>{t('admin.secretaries.phone')}</Label>
              <Input
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder={t('admin.secretaries.phonePlaceholder')}
              />
            </div>
            <div>
              <Label>{t('admin.secretaries.password')}</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={t('admin.secretaries.passwordPlaceholder')}
              />
            </div>
            <div>
              <Label>{t('admin.secretaries.clinic')}</Label>
              <Select
                value={formData.clinicId}
                onValueChange={(value) => setFormData({ ...formData, clinicId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('admin.secretaries.selectClinic')} />
                </SelectTrigger>
                <SelectContent>
                  {clinics.map((clinic) => (
                    <SelectItem key={clinic.id} value={clinic.id}>
                      {getLocalizedText(clinic.name, locale)} - {clinic.doctorProfile?.user.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleCreateSecretary}
              disabled={createSecretary.isPending || !formData.fullName || !formData.email || !formData.password || !formData.clinicId}
            >
              {createSecretary.isPending && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
              {t('common.add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Assignment Dialog */}
      <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.secretaries.removeTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.secretaries.removeConfirm', {
                clinic: selectedAssignment ? getLocalizedText(selectedAssignment.clinic.name, locale) : '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveAssignment}
              className="bg-error-600 hover:bg-error-700"
              disabled={removeAssignment.isPending}
            >
              {removeAssignment.isPending && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
