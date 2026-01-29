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

interface RatingDialogProps {
  appointment: Appointment | null;
  onClose: () => void;
}

export function RatingDialog({ appointment, onClose }: RatingDialogProps) {
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
        comment: comment.trim() || undefined,
      });
      toast({
        title: 'شكراً لك',
        description: 'تم إرسال تقييمك بنجاح',
        variant: 'success',
      });
      handleClose();
    } catch (error) {
      toast({
        title: 'فشل إرسال التقييم',
        description: 'حدث خطأ أثناء إرسال التقييم. يرجى المحاولة مرة أخرى.',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoveredRating(0);
    setComment('');
    onClose();
  };

  const doctorName = appointment?.clinic?.doctor?.user?.name || '';

  return (
    <Dialog open={!!appointment} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">قيّم تجربتك</DialogTitle>
          <DialogDescription className="text-center">
            كيف كانت تجربتك مع الطبيب؟
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Doctor Info */}
          {appointment?.clinic?.doctor && (
            <div className="flex items-center justify-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={appointment.clinic.doctor.user?.profilePicture || undefined}
                />
                <AvatarFallback>
                  {getInitials(doctorName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-900">د. {doctorName}</p>
                <p className="text-sm text-gray-500">
                  {appointment.clinic.doctor.specialty?.nameAr}
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
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Rating Label */}
          <p className="text-center text-sm text-gray-600">
            {rating === 0 && 'اختر تقييمك'}
            {rating === 1 && 'سيء جداً'}
            {rating === 2 && 'سيء'}
            {rating === 3 && 'مقبول'}
            {rating === 4 && 'جيد'}
            {rating === 5 && 'ممتاز'}
          </p>

          {/* Comment */}
          <div>
            <label
              htmlFor="comment"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              تعليق (اختياري)
            </label>
            <textarea
              id="comment"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="شاركنا تجربتك مع الطبيب..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={submitMutation.isPending}>
            إلغاء
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || submitMutation.isPending}
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin ms-2" />
                جاري الإرسال...
              </>
            ) : (
              'إرسال التقييم'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
