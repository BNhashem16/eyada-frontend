'use client';

import Link from 'next/link';
import { MapPin, Clock, Phone, Calendar, ChevronLeft, Stethoscope } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clinic } from '@/types';
import { DayOfWeek } from '@/types/enums';
import { useTranslation } from '@/lib/i18n';

interface ClinicCardProps {
  clinic: Clinic;
  showBookButton?: boolean;
}

export function ClinicCard({ clinic, showBookButton = false }: ClinicCardProps) {
  const { t, locale } = useTranslation();

  const dayNames: Record<DayOfWeek, string> = {
    [DayOfWeek.SUNDAY]: t('days.sunday'),
    [DayOfWeek.MONDAY]: t('days.monday'),
    [DayOfWeek.TUESDAY]: t('days.tuesday'),
    [DayOfWeek.WEDNESDAY]: t('days.wednesday'),
    [DayOfWeek.THURSDAY]: t('days.thursday'),
    [DayOfWeek.FRIDAY]: t('days.friday'),
    [DayOfWeek.SATURDAY]: t('days.saturday'),
  };
  // Get working days from schedules
  const workingDays = clinic.schedules
    ?.filter((s) => s.isActive)
    .map((s) => dayNames[s.dayOfWeek])
    .slice(0, 3);

  // Get price from first active service or FIRST_VISIT
  const consultationPrice = clinic.serviceTypes?.find(
    (s) => s.isActive
  )?.price;

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Clinic Icon */}
          <div className="flex-shrink-0 h-20 w-20 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center">
            <Stethoscope className="h-10 w-10 text-primary-600 dark:text-primary-400" />
          </div>

          {/* Clinic Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Link
                  href={`/clinics/${clinic.id}`}
                  className="text-lg font-bold text-foreground hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {clinic.name?.ar || clinic.name?.en}
                </Link>
                {clinic.isActive && (
                  <Badge variant="success" className="ms-2 text-xs">
                    {t('clinics.available')}
                  </Badge>
                )}
              </div>
              {consultationPrice && (
                <div className="text-end">
                  <span className="text-sm text-muted-foreground">{t('clinics.consultation')}</span>
                  <div className="font-bold text-primary-600 dark:text-primary-400">{consultationPrice} {t('common.currency')}</div>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {clinic.address?.ar || clinic.address?.en}
                {clinic.city && `, ${clinic.city.name?.ar || clinic.city.name?.en}`}
                {clinic.city?.state && `, ${clinic.city.state.name?.ar || clinic.city.state.name?.en}`}
              </span>
            </div>

            {/* Working Hours */}
            {workingDays && workingDays.length > 0 && (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {workingDays.join(locale === 'ar' ? '، ' : ', ')}
                  {clinic.schedules && clinic.schedules.length > 3 && '...'}
                </span>
              </div>
            )}

            {/* Phone */}
            {clinic.phoneNumbers && clinic.phoneNumbers.length > 0 && (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span dir="ltr">{clinic.phoneNumbers[0]}</span>
              </div>
            )}

            {/* Services */}
            {clinic.serviceTypes && clinic.serviceTypes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {clinic.serviceTypes.slice(0, 4).map((service) => (
                  <Badge key={service.id} variant="secondary" className="text-xs">
                    {service.name?.ar || service.name?.en || service.serviceType}
                  </Badge>
                ))}
                {clinic.serviceTypes.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{clinic.serviceTypes.length - 4}
                  </Badge>
                )}
              </div>
            )}

            {/* Book Button */}
            {showBookButton && (
              <div className="mt-4 pt-4 border-t border-border">
                <Button asChild size="sm" className="gap-1">
                  <Link href={`/clinics/${clinic.id}`}>
                    <Calendar className="h-4 w-4" />
                    {t('doctors.bookAppointment')}
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
