'use client';

import Link from 'next/link';
import { MapPin, Clock, Phone, Calendar, ChevronLeft, Stethoscope } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clinic } from '@/types';
import { DayOfWeek } from '@/types/enums';

interface ClinicCardProps {
  clinic: Clinic;
  showBookButton?: boolean;
}

const dayNames: Record<DayOfWeek, string> = {
  [DayOfWeek.SUNDAY]: 'الأحد',
  [DayOfWeek.MONDAY]: 'الاثنين',
  [DayOfWeek.TUESDAY]: 'الثلاثاء',
  [DayOfWeek.WEDNESDAY]: 'الأربعاء',
  [DayOfWeek.THURSDAY]: 'الخميس',
  [DayOfWeek.FRIDAY]: 'الجمعة',
  [DayOfWeek.SATURDAY]: 'السبت',
};

export function ClinicCard({ clinic, showBookButton = false }: ClinicCardProps) {
  // Get working days from schedules
  const workingDays = clinic.schedules
    ?.filter((s) => s.isAvailable)
    .map((s) => dayNames[s.dayOfWeek])
    .slice(0, 3);

  // Get price from first service
  const consultationPrice = clinic.services?.find(
    (s) => s.serviceType === 'CONSULTATION'
  )?.price;

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary-200">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Clinic Icon */}
          <div className="flex-shrink-0 h-20 w-20 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
            <Stethoscope className="h-10 w-10 text-primary-600" />
          </div>

          {/* Clinic Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Link
                  href={`/clinics/${clinic.id}`}
                  className="text-lg font-bold text-gray-900 hover:text-primary-600 transition-colors"
                >
                  {clinic.name}
                </Link>
                {clinic.isActive && (
                  <Badge variant="success" size="sm" className="ms-2">
                    متاحة
                  </Badge>
                )}
              </div>
              {consultationPrice && (
                <div className="text-end">
                  <span className="text-sm text-gray-500">الكشف</span>
                  <div className="font-bold text-primary-600">{consultationPrice} ج.م</div>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>
                {clinic.addressLine1}
                {clinic.city && `, ${clinic.city.nameAr}`}
                {clinic.state && `, ${clinic.state.nameAr}`}
              </span>
            </div>

            {/* Working Hours */}
            {workingDays && workingDays.length > 0 && (
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>
                  {workingDays.join('، ')}
                  {clinic.schedules && clinic.schedules.length > 3 && '...'}
                </span>
              </div>
            )}

            {/* Phone */}
            {clinic.phone && (
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                <Phone className="h-4 w-4 text-gray-400" />
                <span dir="ltr">{clinic.phone}</span>
              </div>
            )}

            {/* Services */}
            {clinic.services && clinic.services.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {clinic.services.slice(0, 4).map((service) => (
                  <Badge key={service.id} variant="secondary" size="sm">
                    {service.nameAr || service.nameEn}
                  </Badge>
                ))}
                {clinic.services.length > 4 && (
                  <Badge variant="outline" size="sm">
                    +{clinic.services.length - 4}
                  </Badge>
                )}
              </div>
            )}

            {/* Book Button */}
            {showBookButton && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Button asChild size="sm" className="gap-1">
                  <Link href={`/clinics/${clinic.id}`}>
                    <Calendar className="h-4 w-4" />
                    احجز موعد
                    <ChevronLeft className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
