'use client';

import Link from 'next/link';
import { Star, MapPin, Clock, Calendar, ChevronLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DoctorProfile } from '@/types';
import { getInitials } from '@/lib/utils';

interface DoctorCardProps {
  doctor: DoctorProfile;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  const averageRating = doctor.averageRating ?? 0;
  const totalRatings = doctor.totalRatings ?? 0;

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary-200">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Doctor Image */}
          <div className="relative h-48 w-full sm:h-auto sm:w-48 flex-shrink-0 bg-gradient-to-br from-primary-50 to-primary-100">
            <Avatar className="h-full w-full rounded-none">
              <AvatarImage
                src={doctor.user?.profilePicture || undefined}
                alt={doctor.user?.name}
                className="object-cover"
              />
              <AvatarFallback className="rounded-none text-4xl bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700">
                {getInitials(doctor.user?.name || '')}
              </AvatarFallback>
            </Avatar>
            {doctor.isVerified && (
              <Badge
                variant="success"
                className="absolute top-3 start-3 shadow-md"
              >
                موثق
              </Badge>
            )}
          </div>

          {/* Doctor Info */}
          <div className="flex-1 p-4 sm:p-5">
            <div className="mb-3">
              <Link
                href={`/doctors/${doctor.id}`}
                className="inline-block text-lg font-bold text-gray-900 hover:text-primary-600 transition-colors"
              >
                د. {doctor.user?.name}
              </Link>
              <p className="text-sm text-gray-600 mt-0.5">
                {doctor.specialty?.nameAr || doctor.specialty?.nameEn}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-warning-400 text-warning-400" />
                <span className="font-semibold text-gray-900">
                  {averageRating.toFixed(1)}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                ({totalRatings} تقييم)
              </span>
            </div>

            {/* Location & Experience */}
            <div className="space-y-2 mb-4">
              {doctor.clinics && doctor.clinics.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>
                    {doctor.clinics[0].city?.nameAr}, {doctor.clinics[0].state?.nameAr}
                  </span>
                </div>
              )}
              {doctor.yearsOfExperience && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>{doctor.yearsOfExperience} سنة خبرة</span>
                </div>
              )}
            </div>

            {/* Price & Book Button */}
            <div className="flex items-center justify-between gap-4 pt-3 border-t border-gray-100">
              <div>
                {doctor.clinics && doctor.clinics[0]?.services?.[0]?.price && (
                  <div className="text-sm">
                    <span className="text-gray-500">الكشف: </span>
                    <span className="font-bold text-primary-600">
                      {doctor.clinics[0].services[0].price} ج.م
                    </span>
                  </div>
                )}
              </div>
              <Button asChild size="sm" className="gap-1 group-hover:gap-2 transition-all">
                <Link href={`/doctors/${doctor.id}`}>
                  <Calendar className="h-4 w-4" />
                  احجز الآن
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
