'use client';

import { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Award,
  CheckCircle,
  XCircle,
  Frown,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { usePendingDoctors, useApproveDoctor, useRejectDoctor } from '../hooks';
import { getLocalizedText } from '@/lib/utils/multilingual';
import { getInitials } from '@/lib/utils';

export function PendingDoctorsList() {
  const { data: doctors, isLoading, isError, error } = usePendingDoctors();
  const approveDoctor = useApproveDoctor();
  const rejectDoctor = useRejectDoctor();

  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  const handleAction = () => {
    if (!selectedDoctor || !action) return;

    if (action === 'approve') {
      approveDoctor.mutate(selectedDoctor, {
        onSuccess: () => {
          setSelectedDoctor(null);
          setAction(null);
        },
      });
    } else {
      rejectDoctor.mutate(selectedDoctor, {
        onSuccess: () => {
          setSelectedDoctor(null);
          setAction(null);
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-error-200 bg-error-50">
        <CardContent className="py-10 text-center">
          <p className="text-error-600">
            حدث خطأ أثناء تحميل البيانات
          </p>
          <p className="text-sm text-error-500 mt-2">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!doctors || doctors.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <CheckCircle className="h-16 w-16 mx-auto text-green-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            لا يوجد طلبات معلقة
          </h3>
          <p className="text-gray-600">
            تم مراجعة جميع طلبات التسجيل
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {doctors.map((doctor) => (
          <Card key={doctor.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {/* Avatar */}
                <Avatar className="h-16 w-16">
                  <AvatarImage src={doctor.profileImage || undefined} />
                  <AvatarFallback className="text-lg">
                    {getInitials(doctor.user.fullName)}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      د. {doctor.user.fullName}
                    </h3>
                    <Badge variant="outline">
                      {getLocalizedText(doctor.specialty.name, 'ar')}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <span className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {doctor.user.email}
                    </span>
                    <span className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {doctor.user.phoneNumber}
                    </span>
                    {doctor.licenseNumber && (
                      <span className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        رقم الترخيص: {doctor.licenseNumber}
                      </span>
                    )}
                    {doctor.yearsOfExperience && (
                      <span className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {doctor.yearsOfExperience} سنة خبرة
                      </span>
                    )}
                  </div>

                  {doctor.bio && (
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                      {getLocalizedText(doctor.bio, 'ar')}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 md:flex-col">
                  <Button
                    onClick={() => {
                      setSelectedDoctor(doctor.id);
                      setAction('approve');
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 me-2" />
                    قبول
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedDoctor(doctor.id);
                      setAction('reject');
                    }}
                    className="text-error-600 border-error-300 hover:bg-error-50"
                  >
                    <XCircle className="h-4 w-4 me-2" />
                    رفض
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
              {action === 'approve' ? 'تأكيد قبول الطبيب' : 'تأكيد رفض الطبيب'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action === 'approve'
                ? 'هل أنت متأكد من قبول هذا الطبيب؟ سيتمكن من إنشاء عيادات واستقبال مواعيد.'
                : 'هل أنت متأكد من رفض هذا الطبيب؟ لن يتمكن من استخدام المنصة.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              className={action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-error-600 hover:bg-error-700'}
              disabled={approveDoctor.isPending || rejectDoctor.isPending}
            >
              {(approveDoctor.isPending || rejectDoctor.isPending) && (
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
              )}
              {action === 'approve' ? 'قبول' : 'رفض'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
