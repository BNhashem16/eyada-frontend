'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useClinicAvailableSlots, useClinicServices, AvailableSlot } from '../hooks/use-clinics';
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
  formatTime,
} from '@/lib/utils/date';

interface BookingWidgetProps {
  clinicId: string;
}

export function BookingWidget({ clinicId }: BookingWidgetProps) {
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
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');

  // Queries
  const { data: services, isLoading: servicesLoading } = useClinicServices(clinicId);
  const {
    data: slots,
    isLoading: slotsLoading,
    isError: slotsError,
  } = useClinicAvailableSlots(
    clinicId,
    selectedDate ? formatDate(selectedDate, 'yyyy-MM-dd') : ''
  );

  // Booking mutation
  const bookingMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDate || !selectedSlot || !selectedServiceId) {
        throw new Error('يرجى اختيار جميع البيانات المطلوبة');
      }

      return apiPost(PATIENT_ENDPOINTS.APPOINTMENTS, {
        clinicId,
        serviceId: selectedServiceId,
        appointmentDate: formatDate(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedSlot.startTime,
      });
    },
    onSuccess: () => {
      toast({
        title: 'تم الحجز بنجاح',
        description: 'تم حجز موعدك بنجاح. يمكنك مراجعة مواعيدك من صفحة مواعيدي.',
        variant: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['clinic-available-slots', clinicId] });
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });
      router.push('/patient/appointments');
    },
    onError: (error: Error) => {
      toast({
        title: 'فشل الحجز',
        description: error.message || 'حدث خطأ أثناء الحجز. يرجى المحاولة مرة أخرى.',
        variant: 'destructive',
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
      setSelectedSlot(null);
    }
  };

  const goToNextWeek = () => {
    // Allow booking up to 30 days in advance
    const maxDate = addDays(new Date(), 30);
    const newStart = addDays(weekStart, 7);
    if (isBefore(newStart, maxDate)) {
      setWeekStart(newStart);
      setSelectedDate(null);
      setSelectedSlot(null);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: AvailableSlot) => {
    setSelectedSlot(slot);
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
        title: 'غير مسموح',
        description: 'يجب أن تكون مريضاً لحجز موعد',
        variant: 'destructive',
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
          <CalendarIcon className="h-5 w-5 text-primary-600" />
          اختر موعدك
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Service Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            اختر الخدمة
          </label>
          {servicesLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : services && services.length > 0 ? (
            <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع الخدمة" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.nameAr || service.nameEn} - {service.price} ج.م
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm text-gray-500">لا توجد خدمات متاحة</p>
          )}
        </div>

        {/* Date Selection */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium text-gray-700">اختر اليوم</label>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPreviousWeek}
                disabled={!canGoPrevious}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600">
                {formatDate(weekStart, 'MMM yyyy')}
              </span>
              <Button variant="ghost" size="sm" onClick={goToNextWeek}>
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
                    ${isPast ? 'opacity-40 cursor-not-allowed' : 'hover:bg-primary-50 cursor-pointer'}
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

        {/* Time Slots */}
        {selectedDate && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              اختر الوقت
            </label>

            {slotsLoading && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            )}

            {slotsError && (
              <div className="flex items-center gap-2 text-error-600 p-3 bg-error-50 rounded-lg">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">حدث خطأ أثناء تحميل المواعيد</span>
              </div>
            )}

            {!slotsLoading && !slotsError && slots && (
              <>
                {slots.filter((s) => s.isAvailable).length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {slots
                      .filter((s) => s.isAvailable)
                      .map((slot, idx) => {
                        const isSelected =
                          selectedSlot?.startTime === slot.startTime;

                        return (
                          <button
                            key={idx}
                            onClick={() => handleSlotSelect(slot)}
                            className={`
                              flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all
                              ${
                                isSelected
                                  ? 'bg-primary-500 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-primary-50 hover:text-primary-700'
                              }
                            `}
                          >
                            <Clock className="h-3.5 w-3.5" />
                            <span dir="ltr">{formatTime(slot.startTime)}</span>
                          </button>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <Clock className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">لا توجد مواعيد متاحة في هذا اليوم</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Summary & Book Button */}
        {selectedDate && selectedSlot && selectedServiceId && (
          <div className="border-t pt-4 space-y-4">
            <div className="bg-primary-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">ملخص الحجز</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">الخدمة:</span>
                  <span className="font-medium">
                    {selectedService?.nameAr || selectedService?.nameEn}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">التاريخ:</span>
                  <span className="font-medium">
                    {formatDate(selectedDate, 'EEEE, d MMMM yyyy')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الوقت:</span>
                  <span className="font-medium" dir="ltr">
                    {formatTime(selectedSlot.startTime)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-primary-100">
                  <span className="text-gray-600">السعر:</span>
                  <span className="font-bold text-primary-600">
                    {selectedService?.price} ج.م
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
                  جاري الحجز...
                </>
              ) : (
                <>
                  <Check className="h-5 w-5 ms-2" />
                  {isAuthenticated ? 'تأكيد الحجز' : 'سجل دخول للحجز'}
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
