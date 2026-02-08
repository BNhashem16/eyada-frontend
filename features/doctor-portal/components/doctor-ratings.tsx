"use client";

import { useState } from "react";
import { Star, MessageSquare, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useDoctorOwnRatings } from "../hooks/use-doctor-portal";
import { Rating } from "@/types";
import { formatRelativeDate, getInitials } from "@/lib/utils";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useTranslation } from "@/lib/i18n";

// Rating distribution bar component
function RatingBar({
  rating,
  count,
  total,
}: {
  rating: number;
  count: number;
  total: number;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground w-3">{rating}</span>
      <Star className="h-3.5 w-3.5 fill-warning-400 text-warning-400" />
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-warning-400 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm text-muted-foreground w-8 text-end">
        {count}
      </span>
    </div>
  );
}

export function DoctorRatings() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data, isLoading, isError } = useDoctorOwnRatings({ page, limit });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-error-200 dark:border-error-800 bg-error-50 dark:bg-error-900/20">
        <CardContent className="py-6 text-center text-error-600 dark:text-error-400">
          {t("doctors.ratingsLoadError")}
        </CardContent>
      </Card>
    );
  }

  const ratings = data?.data ?? [];
  const meta = data?.meta;
  const statistics = data?.statistics ?? {
    averageRating: 0,
    totalRatings: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Average Rating */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
                <Star className="h-6 w-6 text-warning-600 dark:text-warning-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {statistics.averageRating.toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("doctor.averageRating")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Ratings */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {statistics.totalRatings}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("doctor.totalRatings")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-success-600 dark:text-success-400" />
              </div>
              <p className="text-sm font-medium text-foreground">
                {t("doctor.ratingDistribution")}
              </p>
            </div>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <RatingBar
                  key={rating}
                  rating={rating}
                  count={
                    statistics.ratingDistribution[
                      rating as keyof typeof statistics.ratingDistribution
                    ]
                  }
                  total={statistics.totalRatings}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ratings List */}
      <Card>
        <CardHeader>
          <CardTitle>{t("doctor.patientReviews")}</CardTitle>
        </CardHeader>
        <CardContent>
          {ratings.length === 0 ? (
            <div className="py-10 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">
                {t("doctors.noRatingsYet")}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {ratings.map((rating: Rating) => (
                <div
                  key={rating.id}
                  className="flex gap-4 p-4 rounded-lg border border-border"
                >
                  <Avatar>
                    <AvatarImage
                      src={
                        rating.patientProfile?.user?.profilePicture || undefined
                      }
                      alt={rating.patientProfile?.user?.fullName}
                    />
                    <AvatarFallback>
                      {getInitials(
                        rating.patientProfile?.user?.fullName ||
                          t("doctors.patientFallback"),
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-foreground">
                          {rating.patientProfile?.user?.fullName ||
                            t("doctors.patientFallback")}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < rating.rating
                                    ? "fill-warning-400 text-warning-400"
                                    : "text-muted-foreground/30"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatRelativeDate(rating.createdAt)}
                      </span>
                    </div>

                    {rating.review && (
                      <p className="mt-3 text-foreground">{rating.review}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <PaginationControls
            meta={meta}
            page={page}
            onPageChange={setPage}
            limit={limit}
            onLimitChange={(v) => {
              setLimit(v);
              setPage(1);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
