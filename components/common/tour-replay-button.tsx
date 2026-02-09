"use client";

import { HelpCircle } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useTour } from "@/lib/tour";
import { type TourStepConfig } from "@/lib/tour/tour-config";

interface TourReplayButtonProps {
  tourId: string;
  steps: TourStepConfig[];
  variant?: "light" | "dark";
}

export function TourReplayButton({
  tourId,
  steps,
  variant = "light",
}: TourReplayButtonProps) {
  const { t } = useTranslation();
  const { startTour, resetTourById } = useTour();

  const handleReplay = () => {
    resetTourById(tourId);
    startTour(tourId, steps, true);
  };

  return (
    <button
      onClick={handleReplay}
      className={
        variant === "dark"
          ? "p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
          : "p-2 rounded-lg text-muted-foreground hover:text-primary-600 dark:hover:text-primary-400 hover:bg-accent transition-colors"
      }
      title={t("tour.replayTour")}
    >
      <HelpCircle className="h-5 w-5" />
    </button>
  );
}
