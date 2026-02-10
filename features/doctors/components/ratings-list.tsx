"use client";

import { useState } from "react";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Filter,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDoctorRatings } from "../hooks/use-doctors";
import { Rating } from "@/types";
import { formatRelativeDate, getInitials } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface RatingsListProps {
  doctorId: string;
}

export function RatingsList({ doctorId }: RatingsListProps) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(
    undefined,
  );
  const limit = 10;
  const offset = (page - 1) * limit;
  const { data, isLoading, isError } = useDoctorRatings(
    doctorId,
    limit,
    offset,
    ratingFilter,
  );

  const handleFilterChange = (value: string) => {
    setRatingFilter(value === "all" ? undefined : parseInt(value));
    setPage(1); // Reset to first page when filter changes
  };

  // Extract from PublicDoctorRatingsResponse
  const ratings: Rating[] = data?.ratings ?? [];
  const totalRatings = data?.totalRatings ?? 0;
  const averageRating = data?.averageRating ?? 0;
  const hasMore = offset + ratings.length < totalRatings;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-16 w-full" />
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
      <Card className="border-error-200 dark:border-error-800 bg-error-50 dark:bg-error-900/20">
        <CardContent className="py-6 text-center text-error-600 dark:text-error-400">
          {t("doctors.ratingsLoadError")}
        </CardContent>
      </Card>
    );
  }

  if (ratings.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">{t("doctors.noRatingsYet")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary with average rating and filter */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            {t("doctors.ratingsCountLabel").replace(
              "{count}",
              String(totalRatings),
            )}
          </p>
          {averageRating > 0 && (
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-warning-400 text-warning-400" />
              <span className="font-medium text-foreground">
                {averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Star Filter */}
        <Select
          value={ratingFilter?.toString() || "all"}
          onValueChange={handleFilterChange}
        >
          <SelectTrigger className="w-[160px] h-9">
            <Filter className="h-4 w-4 me-2 text-muted-foreground" />
            <SelectValue placeholder={t("rating.filterByStars")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("rating.allRatings")}</SelectItem>
            <SelectItem value="5">
              <span className="flex items-center gap-1">
                5 <Star className="h-3 w-3 fill-warning-400 text-warning-400" />
              </span>
            </SelectItem>
            <SelectItem value="4">
              <span className="flex items-center gap-1">
                4 <Star className="h-3 w-3 fill-warning-400 text-warning-400" />
              </span>
            </SelectItem>
            <SelectItem value="3">
              <span className="flex items-center gap-1">
                3 <Star className="h-3 w-3 fill-warning-400 text-warning-400" />
              </span>
            </SelectItem>
            <SelectItem value="2">
              <span className="flex items-center gap-1">
                2 <Star className="h-3 w-3 fill-warning-400 text-warning-400" />
              </span>
            </SelectItem>
            <SelectItem value="1">
              <span className="flex items-center gap-1">
                1 <Star className="h-3 w-3 fill-warning-400 text-warning-400" />
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Ratings */}
      {ratings.map((rating) => (
        <Card key={rating.id}>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <Avatar>
                <AvatarImage
                  src={rating.patientProfile?.user?.profilePicture || undefined}
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
                                : "text-gray-300 dark:text-gray-500"
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
          </CardContent>
        </Card>
      ))}

      {/* Pagination */}
      {(hasMore || page > 1) && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            variant="outline"
            className="text-xs"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronRight className="h-4 w-4" />
            {t("common.previous")}
          </Button>
          <span className="text-sm text-muted-foreground">
            {t("doctors.pageLabel").replace("{page}", String(page))}
          </span>
          <Button
            variant="outline"
            className="text-xs"
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasMore}
          >
            {t("common.next")}
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
