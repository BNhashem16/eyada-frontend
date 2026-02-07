'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { useTranslation } from '@/lib/i18n';

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface PaginationControlsProps {
  meta: PaginationMeta | undefined;
  page: number;
  onPageChange: (page: number) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
  limitOptions?: number[];
}

const DEFAULT_LIMIT_OPTIONS = [10, 20, 30, 50];

export function PaginationControls({
  meta,
  page,
  onPageChange,
  limit,
  onLimitChange,
  limitOptions = DEFAULT_LIMIT_OPTIONS,
}: PaginationControlsProps) {
  const { t } = useTranslation();

  if (!meta || meta.total === 0) return null;

  return (
    <div className="flex items-center justify-between gap-4 mt-4 flex-wrap">
      {/* Rows per page */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {t('common.rowsPerPage')}
        </span>
        <Select
          value={limit.toString()}
          onValueChange={(value) => onLimitChange(Number(value))}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {limitOptions.map((opt) => (
              <SelectItem key={opt} value={opt.toString()}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Page info + navigation */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {t('common.page')} {meta.page} {t('common.of')} {meta.totalPages}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={!meta.hasPreviousPage}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={!meta.hasNextPage}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
