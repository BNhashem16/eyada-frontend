'use client';

import { useState, useEffect } from 'react';
import { Clock, Save, Loader2, Users } from 'lucide-react';
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
import { useTranslation } from '@/lib/i18n';
import { DayOfWeek } from '@/types/enums';
import { ClinicSchedule } from '@/types';

interface ScheduleManagerProps {
  clinicId: string;
  schedulesHook?: (clinicId: string) => ReturnType<typeof useClinicSchedules>;
  createHook?: () => ReturnType<typeof useCreateSchedule>;
  updateHook?: () => ReturnType<typeof useUpdateSchedule>;
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

const getDayNames = (t: (key: string) => string): Record<DayOfWeek, string> => ({
  [DayOfWeek.SUNDAY]: t('days.sunday'),
  [DayOfWeek.MONDAY]: t('days.monday'),
  [DayOfWeek.TUESDAY]: t('days.tuesday'),
  [DayOfWeek.WEDNESDAY]: t('days.wednesday'),
  [DayOfWeek.THURSDAY]: t('days.thursday'),
  [DayOfWeek.FRIDAY]: t('days.friday'),
  [DayOfWeek.SATURDAY]: t('days.saturday'),
});

interface DaySchedule {
  dayOfWeek: DayOfWeek;
  isActive: boolean;
  startTime: string;
  endTime: string;
  breakTime?: string;
  slotDuration: number;
  maxPatients?: number;
  id?: string;
}

export function ScheduleManager({
  clinicId,
  schedulesHook,
  createHook,
  updateHook,
}: ScheduleManagerProps) {
  const { t } = useTranslation();
  const { toast } = useToast();

  // Use provided hooks or default to doctor hooks
  const useSchedules = schedulesHook || useClinicSchedules;
  const useCreate = createHook || useCreateSchedule;
  const useUpdate = updateHook || useUpdateSchedule;

  const { data: schedules, isLoading } = useSchedules(clinicId);
  const createMutation = useCreate();
  const updateMutation = useUpdate();

  const dayNames = getDayNames(t);
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
          breakTime: firstShift?.breakTime,
          slotDuration: existing?.slotDuration ?? 30,
          maxPatients: existing?.maxPatients ?? undefined,
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
    field: 'startTime' | 'endTime' | 'breakTime',
    value: string
  ) => {
    setLocalSchedules((prev) => {
      const updated = [...prev];
      updated[dayIndex] = {
        ...updated[dayIndex],
        [field]: value || undefined,
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

  const handleMaxPatientsChange = (dayIndex: number, value: string) => {
    setLocalSchedules((prev) => {
      const updated = [...prev];
      updated[dayIndex] = {
        ...updated[dayIndex],
        maxPatients: value === '' ? undefined : Number(value),
      };
      return updated;
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      const promises = localSchedules.map(async (schedule) => {
        // Convert to shifts array format (matching backend ShiftDto)
        const shifts = [{
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          breakTime: schedule.breakTime || undefined,
        }];

        if (schedule.id) {
          // Update existing schedule
          return updateMutation.mutateAsync({
            clinicId,
            scheduleId: schedule.id,
            data: {
              isActive: schedule.isActive,
              shifts,
              slotDuration: schedule.slotDuration,
              maxPatients: schedule.maxPatients,
            },
          });
        } else {
          // Create new schedule
          return createMutation.mutateAsync({
            clinicId,
            data: {
              dayOfWeek: schedule.dayOfWeek,
              isActive: schedule.isActive,
              shifts,
              slotDuration: schedule.slotDuration,
              maxPatients: schedule.maxPatients,
            },
          });
        }
      });

      await Promise.all(promises);

      toast({
        title: t('toast.updated'),
        description: t('clinics.scheduleSaved'),
        variant: 'success',
      });
      setHasChanges(false);
    } catch (error) {
      toast({
        title: t('toast.error'),
        description: t('clinics.scheduleSaveFailed'),
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
          {t('clinics.scheduleTitle')}
        </CardTitle>
        {hasChanges && (
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin ms-2" />
                {t('common.saving')}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 ms-2" />
                {t('common.saveChanges')}
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
                    <Label className="text-sm text-muted-foreground whitespace-nowrap">{t('common.from')}</Label>
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
                    <Label className="text-sm text-muted-foreground whitespace-nowrap">{t('common.to')}</Label>
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
                    <Label className="text-sm text-muted-foreground whitespace-nowrap">{t('common.break')}</Label>
                    <Input
                      type="time"
                      value={schedule.breakTime || ''}
                      onChange={(e) =>
                        handleTimeChange(index, 'breakTime', e.target.value)
                      }
                      className="w-32"
                      dir="ltr"
                      placeholder="--:--"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-muted-foreground whitespace-nowrap">
                      {t('clinics.slotDuration')}
                    </Label>
                    <select
                      value={schedule.slotDuration}
                      onChange={(e) =>
                        handleSlotDurationChange(index, Number(e.target.value))
                      }
                      className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                    >
                      <option value={15}>{t('common.duration15')}</option>
                      <option value={20}>{t('common.duration20')}</option>
                      <option value={30}>{t('common.duration30')}</option>
                      <option value={45}>{t('common.duration45')}</option>
                      <option value={60}>{t('common.duration60')}</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-muted-foreground whitespace-nowrap flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {t('clinics.maxPatients')}
                    </Label>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={schedule.maxPatients ?? ''}
                      onChange={(e) => handleMaxPatientsChange(index, e.target.value)}
                      className="w-24"
                      placeholder={t('clinics.maxPatientsPlaceholder')}
                      dir="ltr"
                    />
                  </div>
                </div>
              )}

              {!schedule.isActive && (
                <span className="text-sm text-muted-foreground">{t('common.closed')}</span>
              )}
            </div>
          ))}
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          * {t('clinics.scheduleHint')}
        </p>
      </CardContent>
    </Card>
  );
}
