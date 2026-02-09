"use client";

import { useState, useEffect } from "react";
import { Star, Loader2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Appointment } from "@/types";
import {
  useSubmitRating,
  useUpdateRating,
  useDeleteRating,
  PatientRating,
} from "../hooks/use-patient";
import { useToast } from "@/hooks/use-toast";
import { getInitials } from "@/lib/utils";
import { getLocalizedText } from "@/lib/utils/multilingual";
import { useTranslation } from "@/lib/i18n";

interface RatingDialogProps {
  appointment: Appointment | null;
  existingRating?: PatientRating | null;
  onClose: () => void;
}

export function RatingDialog({
  appointment,
  existingRating,
  onClose,
}: RatingDialogProps) {
  const { t, locale } = useTranslation();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  const submitMutation = useSubmitRating();
  const updateMutation = useUpdateRating();
  const deleteMutation = useDeleteRating();

  const isEditMode = !!existingRating;

  // Initialize form with existing rating data
  useEffect(() => {
    if (existingRating) {
      setRating(existingRating.rating);
      setComment(existingRating.review || "");
    } else {
      setRating(0);
      setComment("");
    }
  }, [existingRating]);

  const handleSubmit = async () => {
    if (rating === 0) return;

    try {
      if (isEditMode && existingRating) {
        await updateMutation.mutateAsync({
          ratingId: existingRating.id,
          data: {
            rating,
            review: comment.trim() || undefined,
          },
        });
        toast({
          title: t("common.success"),
          description: t("rating.updateSuccess"),
          variant: "success",
        });
      } else if (appointment) {
        await submitMutation.mutateAsync({
          appointmentId: appointment.id,
          rating,
          review: comment.trim() || undefined,
        });
        toast({
          title: t("common.success"),
          description: t("toast.success"),
          variant: "success",
        });
      }
      handleClose();
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("errors.somethingWentWrong"),
        variant: "error",
      });
    }
  };

  const handleDelete = async () => {
    if (!existingRating) return;

    try {
      await deleteMutation.mutateAsync(existingRating.id);
      toast({
        title: t("common.success"),
        description: t("rating.deleteSuccess"),
        variant: "success",
      });
      handleClose();
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("errors.somethingWentWrong"),
        variant: "error",
      });
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoveredRating(0);
    setComment("");
    onClose();
  };

  const doctorName = isEditMode
    ? existingRating?.doctorProfile?.user?.fullName || ""
    : appointment?.clinic?.doctorProfile?.user?.fullName || "";

  const isOpen = isEditMode ? !!existingRating : !!appointment;
  const isPending =
    submitMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const doctorProfilePicture = isEditMode
    ? undefined
    : appointment?.clinic?.doctorProfile?.user?.profilePicture;

  const specialtyName = isEditMode
    ? existingRating?.doctorProfile?.specialty?.name
    : appointment?.clinic?.doctorProfile?.specialty?.name;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">
            {isEditMode ? t("rating.editTitle") : t("rating.title")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isEditMode ? t("rating.editSubtitle") : t("rating.subtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Doctor Info */}
          <div className="flex items-center justify-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={doctorProfilePicture || undefined} />
              <AvatarFallback>{getInitials(doctorName)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">
                {t("doctors.doctorPrefix")} {doctorName}
              </p>
              {specialtyName && (
                <p className="text-sm text-muted-foreground">
                  {getLocalizedText(specialtyName, locale)}
                </p>
              )}
            </div>
          </div>

          {/* Star Rating */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110"
                disabled={isPending}
              >
                <Star
                  className={`h-10 w-10 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? "fill-warning-400 text-warning-400"
                      : "text-muted-foreground/30"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Rating Label */}
          <p className="text-center text-sm text-muted-foreground">
            {rating === 0 && t("rating.selectRating")}
            {rating === 1 && t("rating.veryBad")}
            {rating === 2 && t("rating.bad")}
            {rating === 3 && t("rating.okay")}
            {rating === 4 && t("rating.good")}
            {rating === 5 && t("rating.excellent")}
          </p>

          {/* Comment */}
          <div>
            <label
              htmlFor="comment"
              className="block text-sm font-medium text-foreground mb-2"
            >
              {t("rating.commentOptional")}
            </label>
            <textarea
              id="comment"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              placeholder={t("rating.commentPlaceholder")}
              disabled={isPending}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none resize-none disabled:opacity-50"
            />
            <p className="text-xs text-muted-foreground text-end mt-1">
              {comment.length}/1000
            </p>
          </div>

          {/* Pending approval notice for edit mode */}
          {isEditMode && (
            <p className="text-center text-xs text-muted-foreground bg-warning-50 dark:bg-warning-900/20 p-2 rounded-lg">
              {t("rating.pendingApprovalNotice")}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {isEditMode && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  className="me-auto"
                  disabled={isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t("rating.deleteConfirmTitle")}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("rating.deleteConfirmDescription")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      t("common.delete")
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={rating === 0 || isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin ms-2" />
                {t("common.submitting")}
              </>
            ) : isEditMode ? (
              t("rating.updateRating")
            ) : (
              t("rating.submitRating")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
