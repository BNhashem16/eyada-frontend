'use client';

import { Star, MessageSquare, TrendingUp } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useSecretaryRatings } from '@/features/secretary/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

export default function SecretaryRatingsPage() {
  const { t, locale } = useTranslation();
  const { data, isLoading, error } = useSecretaryRatings();

  const dateLocale = locale === 'ar' ? ar : enUS;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-destructive">{t('doctors.ratingsLoadError')}</p>
        <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
          {t('common.tryAgain')}
        </Button>
      </div>
    );
  }

  const { ratings, statistics } = data || { ratings: [], statistics: { averageRating: 0, totalRatings: 0 } };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('secretary.ratingsPage.title')}</h1>
        <p className="text-muted-foreground">{t('secretary.ratingsPage.subtitle')}</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('doctor.averageRating')}</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              {t('common.from')} 5 {t('common.stars')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('doctor.totalRatings')}</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalRatings}</div>
            <p className="text-xs text-muted-foreground">{t('doctors.reviews')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('secretary.ratingsPage.performance')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.averageRating >= 4
                ? t('secretary.ratingsPage.excellent')
                : statistics.averageRating >= 3
                ? t('secretary.ratingsPage.good')
                : t('secretary.ratingsPage.needsImprovement')}
            </div>
            <p className="text-xs text-muted-foreground">{t('secretary.ratingsPage.basedOnRatings')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Ratings List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('doctor.patientReviews')}</CardTitle>
          <CardDescription>{t('secretary.ratingsPage.reviewsDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {ratings.length === 0 ? (
            <div className="text-center py-8">
              <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('doctors.noRatingsYet')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ratings.map((rating) => (
                <div key={rating.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {rating.patientProfile?.user?.fullName || t('doctors.patientFallback')}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {rating.appointment?.bookingNumber}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= rating.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm text-muted-foreground ms-2">
                          {format(new Date(rating.createdAt), 'PPP', { locale: dateLocale })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {rating.review && <p className="mt-2 text-sm text-muted-foreground">{rating.review}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
