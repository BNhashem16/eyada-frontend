'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Frown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppointmentCard } from './appointment-card';
import { RatingDialog } from './rating-dialog';
import { CancelDialog } from './cancel-dialog';
import { usePatientAppointments, useCancelAppointment } from '../hooks/use-patient';
import { Appointment } from '@/types';
import { AppointmentStatus } from '@/types/enums';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

type FilterTab = 'all' | 'upcoming' | 'completed' | 'cancelled';

export function AppointmentList() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [page, setPage] = useState(1);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [ratingAppointment, setRatingAppointment] = useState<Appointment | null>(null);

  // Get status filter based on tab
  const getStatusFilter = (): AppointmentStatus | undefined => {
    switch (activeTab) {
      case 'upcoming':
        return AppointmentStatus.CONFIRMED;
      case 'completed':
        return AppointmentStatus.COMPLETED;
      case 'cancelled':
        return AppointmentStatus.CANCELLED;
      default:
        return undefined;
    }
  };

  const { data, isLoading, isError } = usePatientAppointments({
    status: getStatusFilter(),
    page,
    limit: 10,
  });

  const cancelMutation = useCancelAppointment();

  const appointments = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as FilterTab);
    setPage(1);
  };

  const handleCancel = (id: string) => {
    setCancelingId(id);
  };

  const confirmCancel = async () => {
    if (!cancelingId) return;

    try {
      await cancelMutation.mutateAsync(cancelingId);
      toast({
        title: 'تم إلغاء الموعد',
        description: 'تم إلغاء موعدك بنجاح',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'فشل إلغاء الموعد',
        description: 'حدث خطأ أثناء إلغاء الموعد. يرجى المحاولة مرة أخرى.',
        variant: 'destructive',
      });
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="all">الكل</TabsTrigger>
          <TabsTrigger value="upcoming">القادمة</TabsTrigger>
          <TabsTrigger value="completed">المكتملة</TabsTrigger>
          <TabsTrigger value="cancelled">الملغاة</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-0">
                <div className="flex">
                  <Skeleton className="w-32 h-32" />
                  <div className="flex-1 p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <Card className="border-error-200 bg-error-50">
          <CardContent className="py-10 text-center">
            <p className="text-error-600">
              حدث خطأ أثناء تحميل المواعيد. يرجى المحاولة مرة أخرى.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !isError && appointments.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              لا توجد مواعيد
            </h3>
            <p className="text-gray-600 mb-4">
              {activeTab === 'all'
                ? 'لم تقم بحجز أي مواعيد بعد'
                : `لا توجد مواعيد ${
                    activeTab === 'upcoming'
                      ? 'قادمة'
                      : activeTab === 'completed'
                      ? 'مكتملة'
                      : 'ملغاة'
                  }`}
            </p>
            <Button asChild>
              <Link href="/doctors">احجز موعد الآن</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Appointments List */}
      {!isLoading && !isError && appointments.length > 0 && (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onCancel={handleCancel}
              onRate={setRatingAppointment}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !isError && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronRight className="h-4 w-4" />
            السابق
          </Button>
          <span className="text-sm text-gray-600">
            صفحة {page} من {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            التالي
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Cancel Dialog */}
      <CancelDialog
        open={!!cancelingId}
        onOpenChange={(open) => !open && setCancelingId(null)}
        onConfirm={confirmCancel}
        isLoading={cancelMutation.isPending}
      />

      {/* Rating Dialog */}
      <RatingDialog
        appointment={ratingAppointment}
        onClose={() => setRatingAppointment(null)}
      />
    </div>
  );
}
