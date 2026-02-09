"use client";

import { useState } from "react";
import { Star, MessageSquare, Clock, CheckCircle, Edit2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatientRatings, PatientRating } from "../hooks/use-patient";
import { RatingDialog } from "./rating-dialog";
import { formatRelativeDate, getInitials } from "@/lib/utils";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useTranslation } from "@/lib/i18n";

export function MyRatings() {
  const { t, locale } = useTranslation();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const {
    data: ratingsResponse,
    isLoading,
    isError,
  } = usePatientRatings({ page, limit });
  const ratings = ratingsResponse?.data || [];
  const meta = ratingsResponse?.meta;
  const [editingRating, setEditingRating] = useState<PatientRating | null>(
    null,
  );

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
          {t("errors.somethingWentWrong")}
        </CardContent>
      </Card>
    );
  }

  if (ratings.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">{t("rating.noRatingsYet")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("rating.myRatings")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ratings.map((rating) => (
              <div
                key={rating.id}
                className="border border-border rounded-lg p-4 space-y-3"
              >
                {/* Doctor Info & Status */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {getInitials(rating.doctorProfile.user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">
                        {t("doctors.doctorPrefix")} {rating.doctorProfile.user.fullName}
                      </p>
                      {rating.doctorProfile.specialty && (
                        <p className="text-sm text-muted-foreground">
                          {getLocalizedText(
                            rating.doctorProfile.specialty.name,
                            locale,
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  {rating.isVisible ? (
                    <Badge
                      variant="outline"
                      className="bg-success-50 text-success-700 border-success-200 dark:bg-success-900/20 dark:text-success-400 dark:border-success-800"
                    >
                      <CheckCircle className="h-3 w-3 me-1" />
                      {t("rating.approved")}
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-warning-50 text-warning-700 border-warning-200 dark:bg-warning-900/20 dark:text-warning-400 dark:border-warning-800"
                    >
                      <Clock className="h-3 w-3 me-1" />
                      {t("rating.pendingApproval")}
                    </Badge>
                  )}
                </div>

                {/* Star Rating */}
                <div className="flex items-center gap-2">
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
                  <span className="text-sm text-muted-foreground">
                    {formatRelativeDate(rating.createdAt)}
                  </span>
                </div>

                {/* Review Text */}
                {rating.review && (
                  <p className="text-sm text-foreground">{rating.review}</p>
                )}

                {/* Appointment Info */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="text-xs text-muted-foreground">
                    <span>
                      {getLocalizedText(rating.appointment.clinic.name, locale)}
                    </span>
                    <span className="mx-2">•</span>
                    <span>
                      {new Date(
                        rating.appointment.appointmentDate,
                      ).toLocaleDateString("ar-EG")}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingRating(rating)}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <Edit2 className="h-4 w-4 me-1" />
                    {t("rating.edit")}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

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
      </div>

      {/* Edit Rating Dialog */}
      <RatingDialog
        appointment={null}
        existingRating={editingRating}
        onClose={() => setEditingRating(null)}
      />
    </>
  );
}
