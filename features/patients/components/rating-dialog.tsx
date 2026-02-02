'use client';

import { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Appointment } from '@/types';
import { useSubmitRating } from '../hooks/use-patient';
import { useToast } from '@/hooks/use-toast';
import { getInitials } from '@/lib/utils';
import { getLocalizedText } from '@/lib/utils/multilingual';
import { useTranslation } from '@/lib/i18n';

interface RatingDialogProps {
  appointment: Appointment | null;
  onClose: () => void;
}

export function RatingDialog({ appointment, onClose }: RatingDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  const submitMutation = useSubmitRating();

  const handleSubmit = async () => {
    if (!appointment || rating === 0) return;

    try {
      await submitMutation.mutateAsync({
        appointmentId: appointment.id,
        rating,
        review: comment.trim() || undefined,
      });
      toast({
        title: t('common.success'),
        description: t('toast.success'),
        variant: 'success',
      });
      handleClose();
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('errors.somethingWentWrong'),
        variant: 'error',
      });
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoveredRating(0);
    setComment('');
    onClose();
  };

  const doctorName = appointment?.clinic?.doctorProfile?.user?.fullName || '';

  return (
    <Dialog open={!!appointment} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">{t('rating.title')}</DialogTitle>
          <DialogDescription className="text-center">
            {t('rating.subtitle')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Doctor Info */}
          {appointment?.clinic?.doctorProfile && (
            <div className="flex items-center justify-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={appointment.clinic.doctorProfile.user?.profilePicture || undefined}
                />
                <AvatarFallback>
                  {getInitials(doctorName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">{t('auth.doctor')}. {doctorName}</p>
                <p className="text-sm text-muted-foreground">
                  {getLocalizedText(appointment.clinic.doctorProfile.specialty?.name, 'ar')}
                </p>
              </div>
            </div>
          )}

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
              >
                <Star
                  className={`h-10 w-10 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? 'fill-warning-400 text-warning-400'
                      : 'text-muted-foreground/30'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Rating Label */}
          <p className="text-center text-sm text-muted-foreground">
            {rating === 0 && t('rating.selectRating')}
            {rating === 1 && t('rating.veryBad')}
            {rating === 2 && t('rating.bad')}
            {rating === 3 && t('rating.okay')}
            {rating === 4 && t('rating.good')}
            {rating === 5 && t('rating.excellent')}
          </p>

          {/* Comment */}
          <div>
            <label
              htmlFor="comment"
              className="block text-sm font-medium text-foreground mb-2"
            >
              {t('rating.commentOptional')}
            </label>
            <textarea
              id="comment"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('rating.commentPlaceholder')}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={submitMutation.isPending}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || submitMutation.isPending}
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin ms-2" />
                {t('common.submitting')}
              </>
            ) : (
              t('rating.submitRating')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
