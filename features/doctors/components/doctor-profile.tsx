'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Star,
  MapPin,
  Clock,
  GraduationCap,
  Award,
  Phone,
  Calendar,
  ChevronLeft,
  Building2,
  Stethoscope,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoctor, useDoctorRatings } from '../hooks/use-doctors';
import { ClinicCard } from '@/features/clinics/components/clinic-card';
import { RatingsList } from './ratings-list';
import { getInitials } from '@/lib/utils';

interface DoctorProfileProps {
  doctorId: string;
}

export function DoctorProfileComponent({ doctorId }: DoctorProfileProps) {
  const { data: doctor, isLoading, isError } = useDoctor(doctorId);
  const [activeTab, setActiveTab] = useState('about');

  if (isLoading) {
    return <DoctorProfileSkeleton />;
  }

  if (isError || !doctor) {
    return (
      <Card className="border-error-200 bg-error-50">
        <CardContent className="py-10 text-center">
          <p className="text-error-600">
            حدث خطأ أثناء تحميل بيانات الطبيب. يرجى المحاولة مرة أخرى.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/doctors">العودة للبحث</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const averageRating = doctor.averageRating ?? 0;
  const totalRatings = doctor.totalRatings ?? 0;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="overflow-hidden">
        <div className="relative h-32 bg-gradient-to-l from-primary-500 to-primary-700" />
        <CardContent className="relative pb-6">
          {/* Avatar */}
          <div className="absolute -top-16 start-6">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
              <AvatarImage
                src={doctor.user?.profilePicture || undefined}
                alt={doctor.user?.name}
              />
              <AvatarFallback className="text-3xl bg-primary-100 text-primary-700">
                {getInitials(doctor.user?.name || '')}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Doctor Info */}
          <div className="pt-20 sm:pt-0 sm:ps-40">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-gray-900">
                    د. {doctor.user?.name}
                  </h1>
                  {doctor.isVerified && (
                    <Badge variant="success">موثق</Badge>
                  )}
                </div>
                <p className="text-gray-600 mt-1">
                  {doctor.specialty?.nameAr || doctor.specialty?.nameEn}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.round(averageRating)
                            ? 'fill-warning-400 text-warning-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">{averageRating.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">
                    ({totalRatings} تقييم)
                  </span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-6 text-center">
                {doctor.yearsOfExperience && (
                  <div>
                    <div className="text-2xl font-bold text-primary-600">
                      {doctor.yearsOfExperience}+
                    </div>
                    <div className="text-sm text-gray-500">سنة خبرة</div>
                  </div>
                )}
                <div>
                  <div className="text-2xl font-bold text-primary-600">
                    {doctor.clinics?.length || 0}
                  </div>
                  <div className="text-sm text-gray-500">عيادة</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="about">نبذة</TabsTrigger>
          <TabsTrigger value="clinics">العيادات</TabsTrigger>
          <TabsTrigger value="ratings">التقييمات</TabsTrigger>
        </TabsList>

        {/* About Tab */}
        <TabsContent value="about" className="mt-6 space-y-6">
          {/* Bio */}
          {doctor.bio && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">نبذة عن الطبيب</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line">{doctor.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Qualifications & Certifications */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Qualifications */}
            {doctor.qualifications && doctor.qualifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary-600" />
                    المؤهلات العلمية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {doctor.qualifications.map((q: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-gray-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                        {q}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Certifications */}
            {doctor.certifications && doctor.certifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary-600" />
                    الشهادات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {doctor.certifications.map((c: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-gray-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Contact Info */}
          {doctor.user?.phone && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary-600" />
                  معلومات التواصل
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700" dir="ltr">
                  {doctor.user.phone}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Clinics Tab */}
        <TabsContent value="clinics" className="mt-6">
          {doctor.clinics && doctor.clinics.length > 0 ? (
            <div className="space-y-4">
              {doctor.clinics.map((clinic) => (
                <ClinicCard key={clinic.id} clinic={clinic} showBookButton />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-600">لا توجد عيادات مسجلة</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Ratings Tab */}
        <TabsContent value="ratings" className="mt-6">
          <RatingsList doctorId={doctorId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DoctorProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <Skeleton className="h-32" />
        <CardContent className="relative pb-6">
          <div className="absolute -top-16 start-6">
            <Skeleton className="h-32 w-32 rounded-full" />
          </div>
          <div className="pt-20 sm:pt-0 sm:ps-40 space-y-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-40" />
          </div>
        </CardContent>
      </Card>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
