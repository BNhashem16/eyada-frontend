'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useClinicServices } from '../hooks/use-clinics';
import { useAuthStore } from '@/lib/auth/store';
import { apiPost } from '@/lib/api';
import { PATIENT_ENDPOINTS } from '@/lib/api/endpoints';
import { useToast } from '@/hooks/use-toast';
import {
  formatDate,
  getWeekDays,
  addDays,
  isSameDay,
  isToday,
  isBefore,
} from '@/lib/utils/date';
import { useTranslation } from '@/lib/i18n';

interface BookingWidgetProps {
  clinicId: string;
}

export function BookingWidget({ clinicId }: BookingWidgetProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();

  // State
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    // Start from Saturday
    const diff = day === 6 ? 0 : day + 1;
    const saturday = new Date(today);
    saturday.setDate(today.getDate() - diff);
    return saturday;
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');

  // Queries
  const { data: services, isLoading: servicesLoading } = useClinicServices(clinicId);

  // Booking mutation - per Swagger CreateAppointmentDto
  const bookingMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDate || !selectedServiceId) {
        throw new Error(t('booking.selectAllRequired'));
      }

      // Per Swagger: appointmentDate is YYYY-MM-DD format only
      return apiPost(PATIENT_ENDPOINTS.APPOINTMENTS, {
        clinicId,
        serviceTypeId: selectedServiceId,
        appointmentDate: formatDate(selectedDate, 'yyyy-MM-dd'),
      });
    },
    onSuccess: () => {
      toast({
        title: t('booking.bookingSuccessTitle'),
        description: t('booking.bookingSuccessDesc'),
        variant: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });
      router.push('/patient/appointments');
    },
    onError: (error: Error) => {
      toast({
        title: t('booking.bookingFailedTitle'),
        description: error.message || t('booking.bookingFailedDesc'),
        variant: 'error',
      });
    },
  });

  // Week days
  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);

  // Navigation
  const goToPreviousWeek = () => {
    const newStart = addDays(weekStart, -7);
    if (!isBefore(newStart, addDays(new Date(), -1))) {
      setWeekStart(newStart);
      setSelectedDate(null);
    }
  };

  const goToNextWeek = () => {
    // Allow booking up to 30 days in advance
    const maxDate = addDays(new Date(), 30);
    const newStart = addDays(weekStart, 7);
    if (isBefore(newStart, maxDate)) {
      setWeekStart(newStart);
      setSelectedDate(null);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleBooking = () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(window.location.pathname);
      router.push(`/login?returnUrl=${returnUrl}`);
      return;
    }

    if (user?.role !== 'PATIENT') {
      toast({
        title: t('booking.notAllowed'),
        description: t('booking.patientRequired'),
        variant: 'error',
      });
      return;
    }

    bookingMutation.mutate();
  };

  // Check if can go to previous week
  const canGoPrevious = !isBefore(addDays(weekStart, -7), addDays(new Date(), -1));

  // Selected service details
  const selectedService = services?.find((s) => s.id === selectedServiceId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          {t('booking.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Service Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {t('booking.selectService')}
          </label>
          {servicesLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : services && services.length > 0 ? (
            <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
              <SelectTrigger>
                <SelectValue placeholder={t('booking.selectServiceType')} />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name?.ar || service.name?.en || service.serviceType} - {service.price} {t('common.egp')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm text-muted-foreground">{t('booking.noServicesAvailable')}</p>
          )}
        </div>

        {/* Date Selection */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium text-foreground">{t('booking.selectDay')}</label>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="text-xs"
                onClick={goToPreviousWeek}
                disabled={!canGoPrevious}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {formatDate(weekStart, 'MMM yyyy')}
              </span>
              <Button variant="ghost" className="text-xs" onClick={goToNextWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((date) => {
              const isPast = isBefore(date, new Date()) && !isToday(date);
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const today = isToday(date);

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => !isPast && handleDateSelect(date)}
                  disabled={isPast}
                  className={`
                    flex flex-col items-center justify-center p-2 rounded-lg text-center transition-all
                    ${isPast ? 'opacity-40 cursor-not-allowed' : 'hover:bg-primary-50 dark:hover:bg-primary-900/20 cursor-pointer'}
                    ${isSelected ? 'bg-primary-500 text-white hover:bg-primary-600' : ''}
                    ${today && !isSelected ? 'border-2 border-primary-500' : ''}
                  `}
                >
                  <span className="text-xs font-medium">
                    {formatDate(date, 'EEE')}
                  </span>
                  <span className="text-lg font-bold">
                    {formatDate(date, 'd')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary & Book Button */}
        {selectedDate && selectedServiceId && (
          <div className="border-t pt-4 space-y-4">
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">{t('booking.summary')}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('booking.serviceLabel')}</span>
                  <span className="font-medium">
                    {selectedService?.name?.ar || selectedService?.name?.en || selectedService?.serviceType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('booking.dateLabel')}</span>
                  <span className="font-medium">
                    {formatDate(selectedDate, 'EEEE, d MMMM yyyy')}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-primary-100 dark:border-primary-800">
                  <span className="text-muted-foreground">{t('booking.priceLabel')}</span>
                  <span className="font-bold text-primary-600 dark:text-primary-400">
                    {selectedService?.price} {t('common.egp')}
                  </span>
                </div>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleBooking}
              disabled={bookingMutation.isPending}
            >
              {bookingMutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin ms-2" />
                  {t('booking.bookingInProgress')}
                </>
              ) : (
                <>
                  <Check className="h-5 w-5 ms-2" />
                  {isAuthenticated ? t('booking.confirmBooking') : t('booking.loginToBook')}
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
