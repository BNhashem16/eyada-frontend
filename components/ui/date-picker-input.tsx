"use client";

import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const locales = { ar, en: enUS };

interface DatePickerInputProps {
  /** Date value in yyyy-MM-dd string format */
  value?: string;
  /** Callback with yyyy-MM-dd string */
  onChange?: (value: string) => void;
  /** Placeholder text when no date is selected */
  placeholder?: string;
  /** Additional class names for the trigger button */
  className?: string;
  /** Disable the picker */
  disabled?: boolean;
  /** Locale for display formatting */
  locale?: "ar" | "en";
  /** Disable dates before this date */
  disableBefore?: Date;
  /** Disable dates after this date */
  disableAfter?: Date;
  /** Custom disabled date matcher */
  disabledDates?: (date: Date) => boolean;
  /** Show clear button */
  clearable?: boolean;
}

function DatePickerInput({
  value,
  onChange,
  placeholder,
  className,
  disabled = false,
  locale = "ar",
  disableBefore,
  disableAfter,
  disabledDates,
  clearable = true,
}: DatePickerInputProps) {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);

  const dateValue = React.useMemo(() => {
    if (!value) return undefined;
    const parsed = parse(value, "yyyy-MM-dd", new Date());
    return isValid(parsed) ? parsed : undefined;
  }, [value]);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange?.(format(date, "yyyy-MM-dd"));
    }
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.("");
  };

  const displayText = dateValue
    ? format(dateValue, "d MMMM yyyy", { locale: locales[locale] })
    : null;

  const disabledMatcher = React.useMemo(() => {
    const matchers: Array<(date: Date) => boolean> = [];
    if (disableBefore) {
      const before = disableBefore;
      matchers.push((date: Date) => date < before);
    }
    if (disableAfter) {
      const after = disableAfter;
      matchers.push((date: Date) => date > after);
    }
    if (disabledDates) {
      matchers.push(disabledDates);
    }
    if (matchers.length === 0) return undefined;
    return (date: Date) => matchers.some((m) => m(date));
  }, [disableBefore, disableAfter, disabledDates]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-start font-normal h-10",
            !dateValue && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0 opacity-60" />
          <span className="flex-1 truncate">
            {displayText || placeholder || t("common.selectDate")}
          </span>
          {clearable && dateValue && !disabled && (
            <X
              className="h-3.5 w-3.5 shrink-0 opacity-50 hover:opacity-100 transition-opacity"
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleSelect}
          defaultMonth={dateValue}
          disabled={disabledMatcher}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

DatePickerInput.displayName = "DatePickerInput";

export { DatePickerInput };
export type { DatePickerInputProps };
