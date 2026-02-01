'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';

interface CancelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function CancelDialog({ open, onOpenChange, onConfirm, isLoading }: CancelDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="mx-auto h-14 w-14 rounded-full bg-error-100 flex items-center justify-center mb-4">
            <AlertTriangle className="h-7 w-7 text-error-600" />
          </div>
          <DialogTitle className="text-center">{t('appointments.cancel')}</DialogTitle>
          <DialogDescription className="text-center">
            {t('appointments.confirmCancel')}
            <br />
            {t('appointments.confirmCancelDesc')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {t('common.back')}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin ms-2" />
                {t('appointments.cancelling')}
              </>
            ) : (
              t('appointments.yesCancel')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
