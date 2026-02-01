'use client';

import { useState, useEffect } from 'react';
import { Clock, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useClinicSchedules,
  useCreateSchedule,
  useUpdateSchedule,
} from '../hooks/use-doctor-portal';
import { useToast } from '@/hooks/use-toast';
import { DayOfWeek } from '@/types/enums';
import { ClinicSchedule } from '@/types';

interface ScheduleManagerProps {
  clinicId: string;
}

const dayOrder: DayOfWeek[] = [
  DayOfWeek.SATURDAY,
  DayOfWeek.SUNDAY,
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
];

const dayNames: Record<DayOfWeek, string> = {
  [DayOfWeek.SUNDAY]: 'الأحد',
  [DayOfWeek.MONDAY]: 'الاثنين',
  [DayOfWeek.TUESDAY]: 'الثلاثاء',
  [DayOfWeek.WEDNESDAY]: 'الأربعاء',
  [DayOfWeek.THURSDAY]: 'الخميس',
  [DayOfWeek.FRIDAY]: 'الجمعة',
  [DayOfWeek.SATURDAY]: 'السبت',
};

interface DaySchedule {
  dayOfWeek: DayOfWeek;
  isActive: boolean;
  startTime: string;
  endTime: string;
  slotDuration: number;
  id?: string;
}

export function ScheduleManager({ clinicId }: ScheduleManagerProps) {
  const { toast } = useToast();
  const { data: schedules, isLoading } = useClinicSchedules(clinicId);
  const createMutation = useCreateSchedule();
  const updateMutation = useUpdateSchedule();

  const [localSchedules, setLocalSchedules] = useState<DaySchedule[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize local schedules from API data
  useEffect(() => {
    if (schedules) {
      const scheduleMap = new Map(schedules.map((s) => [s.dayOfWeek, s]));
      const initialSchedules = dayOrder.map((day) => {
        const existing = scheduleMap.get(day);
        // Get first shift's times (backend stores in shifts array)
        const firstShift = existing?.shifts?.[0];
        return {
          dayOfWeek: day,
          isActive: existing?.isActive ?? false,
          startTime: firstShift?.startTime ?? '09:00',
          endTime: firstShift?.endTime ?? '17:00',
          slotDuration: existing?.slotDuration ?? 30,
          id: existing?.id,
        };
      });
      setLocalSchedules(initialSchedules);
    }
  }, [schedules]);

  const handleToggleDay = (dayIndex: number) => {
    setLocalSchedules((prev) => {
      const updated = [...prev];
      updated[dayIndex] = {
        ...updated[dayIndex],
        isActive: !updated[dayIndex].isActive,
      };
      return updated;
    });
    setHasChanges(true);
  };

  const handleTimeChange = (
    dayIndex: number,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    setLocalSchedules((prev) => {
      const updated = [...prev];
      updated[dayIndex] = {
        ...updated[dayIndex],
        [field]: value,
      };
      return updated;
    });
    setHasChanges(true);
  };

  const handleSlotDurationChange = (dayIndex: number, value: number) => {
    setLocalSchedules((prev) => {
      const updated = [...prev];
      updated[dayIndex] = {
        ...updated[dayIndex],
        slotDuration: value,
      };
      return updated;
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      const promises = localSchedules.map(async (schedule) => {
        if (schedule.id) {
          // Update existing schedule
          return updateMutation.mutateAsync({
            clinicId,
            scheduleId: schedule.id,
            data: {
              isActive: schedule.isActive,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
              slotDuration: schedule.slotDuration,
            },
          });
        } else {
          // Create new schedule
          return createMutation.mutateAsync({
            clinicId,
            data: {
              dayOfWeek: schedule.dayOfWeek,
              isActive: schedule.isActive,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
              slotDuration: schedule.slotDuration,
            },
          });
        }
      });

      await Promise.all(promises);

      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ جدول المواعيد بنجاح',
        variant: 'success',
      });
      setHasChanges(false);
    } catch (error) {
      toast({
        title: 'حدث خطأ',
        description: 'فشل في حفظ جدول المواعيد',
        variant: 'error',
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          جدول مواعيد العمل
        </CardTitle>
        {hasChanges && (
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin ms-2" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 ms-2" />
                حفظ التغييرات
              </>
            )}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {localSchedules.map((schedule, index) => (
            <div
              key={schedule.dayOfWeek}
              className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg transition-colors ${
                schedule.isActive ? 'bg-muted' : 'bg-muted/50'
              }`}
            >
              {/* Day Toggle */}
              <div className="flex items-center gap-3 sm:w-32">
                <input
                  type="checkbox"
                  id={`day-${schedule.dayOfWeek}`}
                  checked={schedule.isActive}
                  onChange={() => handleToggleDay(index)}
                  className="h-5 w-5 rounded border-border text-primary-600 focus:ring-primary-500"
                />
                <Label
                  htmlFor={`day-${schedule.dayOfWeek}`}
                  className={`cursor-pointer font-medium ${
                    schedule.isActive ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {dayNames[schedule.dayOfWeek]}
                </Label>
              </div>

              {/* Time Inputs */}
              {schedule.isActive && (
                <div className="flex flex-wrap items-center gap-4 flex-1">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-muted-foreground whitespace-nowrap">من</Label>
                    <Input
                      type="time"
                      value={schedule.startTime}
                      onChange={(e) =>
                        handleTimeChange(index, 'startTime', e.target.value)
                      }
                      className="w-32"
                      dir="ltr"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-muted-foreground whitespace-nowrap">إلى</Label>
                    <Input
                      type="time"
                      value={schedule.endTime}
                      onChange={(e) =>
                        handleTimeChange(index, 'endTime', e.target.value)
                      }
                      className="w-32"
                      dir="ltr"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-muted-foreground whitespace-nowrap">
                      مدة الموعد
                    </Label>
                    <select
                      value={schedule.slotDuration}
                      onChange={(e) =>
                        handleSlotDurationChange(index, Number(e.target.value))
                      }
                      className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                    >
                      <option value={15}>15 دقيقة</option>
                      <option value={20}>20 دقيقة</option>
                      <option value={30}>30 دقيقة</option>
                      <option value={45}>45 دقيقة</option>
                      <option value={60}>60 دقيقة</option>
                    </select>
                  </div>
                </div>
              )}

              {!schedule.isActive && (
                <span className="text-sm text-muted-foreground">مغلق</span>
              )}
            </div>
          ))}
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          * يمكنك تفعيل أو تعطيل أيام العمل وتحديد أوقات البداية والنهاية ومدة كل موعد
        </p>
      </CardContent>
    </Card>
  );
}
