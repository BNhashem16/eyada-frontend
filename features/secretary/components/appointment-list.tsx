'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Frown,
  Calendar as CalendarIcon,
  Plus,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { AppointmentCard } from './appointment-card';
import { BookAppointmentDialog } from './book-appointment-dialog';
import { useSecretaryAppointments, useSecretaryClinics } from '../hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { AppointmentStatus, PaymentStatus } from '@/types/enums';
import { getLocalizedText } from '@/lib/utils/multilingual';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface AppointmentListProps {
  showBookButton?: boolean;
}

export function AppointmentList({ showBookButton = true }: AppointmentListProps) {
  const { t } = useTranslation();
  const [selectedClinic, setSelectedClinic] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [bookDialogOpen, setBookDialogOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { data: clinics, isLoading: clinicsLoading } = useSecretaryClinics();
  const { data, isLoading, isError, error } = useSecretaryAppointments({
    clinicId: selectedClinic === 'all' ? undefined : selectedClinic,
    date: format(selectedDate, 'yyyy-MM-dd'),
    status: selectedStatus === 'all' ? undefined : selectedStatus as AppointmentStatus,
    paymentStatus: selectedPaymentStatus === 'all' ? undefined : selectedPaymentStatus as PaymentStatus,
    search: searchQuery.trim() || undefined,
    page,
    limit: 20,
  });

  const appointments = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;
  const totalItems = data?.meta?.total ?? 0;

  const statusOptions = [
    { value: 'all', label: t('secretary.allStatuses') },
    { value: AppointmentStatus.PENDING, label: t('secretary.waiting') },
    { value: AppointmentStatus.CONFIRMED, label: t('secretary.confirmed') },
    { value: AppointmentStatus.CHECKED_IN, label: t('secretary.attended') },
    { value: AppointmentStatus.IN_PROGRESS, label: t('secretary.inProgress') },
    { value: AppointmentStatus.COMPLETED, label: t('secretary.completed') },
    { value: AppointmentStatus.CANCELLED, label: t('secretary.cancelled') },
    { value: AppointmentStatus.NO_SHOW, label: t('secretary.noShow') },
  ];

  const paymentStatusOptions = [
    { value: 'all', label: t('secretary.allPaymentStatuses') },
    { value: PaymentStatus.PENDING, label: t('secretary.unpaid') },
    { value: PaymentStatus.PAID, label: t('secretary.paid') },
    { value: PaymentStatus.REFUNDED, label: t('secretary.refunded') },
  ];

  return (
    <div className="space-y-4">
      {/* Header with Book Button */}
      {showBookButton && (
        <div className="flex justify-between items-center">
          <div className="flex-1" />
          <Button onClick={() => setBookDialogOpen(true)}>
            <Plus className="h-4 w-4 me-2" />
            {t('secretary.bookAppointment')}
          </Button>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Primary Filters */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-4">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('secretary.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-9"
                />
              </div>

              {/* Clinic Filter */}
              <Select value={selectedClinic} onValueChange={setSelectedClinic}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder={t('secretary.selectClinic')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('secretary.allClinics')}</SelectItem>
                  {clinics?.map((clinic) => (
                    <SelectItem key={clinic.id} value={clinic.id}>
                      {getLocalizedText(clinic.name, 'ar')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-full sm:w-[200px] justify-start')}>
                    <CalendarIcon className="me-2 h-4 w-4" />
                    {format(selectedDate, 'dd MMMM yyyy', { locale: ar })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* Advanced Filters Toggle */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={cn(showAdvancedFilters && 'bg-primary-100 dark:bg-primary-900/30')}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>

            {/* Advanced Filters */}
            <Collapsible open={showAdvancedFilters}>
              <CollapsibleContent className="pt-4 border-t">
                <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                  {/* Status Filter */}
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder={t('secretary.appointmentStatus')} />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Payment Status Filter */}
                  <Select value={selectedPaymentStatus} onValueChange={setSelectedPaymentStatus}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder={t('secretary.paymentStatusFilter')} />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      {!isLoading && !isError && (
        <div className="text-sm text-muted-foreground">
          {t('secretary.appointmentsCount')
            .replace('{count}', String(totalItems))
            .replace('{date}', format(selectedDate, 'dd MMMM yyyy', { locale: ar }))}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <Card className="border-error-200 dark:border-error-800 bg-error-50 dark:bg-error-900/20">
          <CardContent className="py-10 text-center">
            <p className="text-error-600 dark:text-error-400">
              {t('secretary.loadError')}
            </p>
            <p className="text-sm text-error-500 dark:text-error-400 mt-2">
              {error instanceof Error ? error.message : t('common.error')}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !isError && appointments.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Frown className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t('secretary.noAppointments')}
            </h3>
            <p className="text-muted-foreground">
              {t('secretary.noAppointmentsOnDay')}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Appointments List */}
      {!isLoading && !isError && appointments.length > 0 && (
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !isError && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            className="text-xs"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronRight className="h-4 w-4" />
            {t('common.previous')}
          </Button>

          <span className="text-sm text-muted-foreground">
            {t('secretary.pageOf').replace('{page}', String(page)).replace('{total}', String(totalPages))}
          </span>

          <Button
            variant="outline"
            className="text-xs"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            {t('common.next')}
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Book Appointment Dialog */}
      <BookAppointmentDialog
        open={bookDialogOpen}
        onOpenChange={setBookDialogOpen}
      />
    </div>
  );
}
