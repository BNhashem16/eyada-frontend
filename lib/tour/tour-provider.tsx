"use client";

import {
  createContext,
  useContext,
  useCallback,
  useRef,
  useState,
  useEffect,
  useMemo,
} from "react";
import { driver, type Driver, type DriveStep, type Config } from "driver.js";
import "driver.js/dist/driver.css";
import { useTranslation } from "@/lib/i18n";
import {
  type TourStepConfig,
  isTourCompleted,
  markTourCompleted,
  resetTour,
} from "./tour-config";

interface TourContextValue {
  startTour: (tourId: string, steps: TourStepConfig[], force?: boolean) => void;
  isCompleted: (tourId: string) => boolean;
  resetTourById: (tourId: string) => void;
  isActive: boolean;
  stopTour: () => void;
}

const TourContext = createContext<TourContextValue | undefined>(undefined);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const { t, isRtl } = useTranslation();
  const driverRef = useRef<Driver | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    return () => {
      driverRef.current?.destroy();
    };
  }, []);

  const startTour = useCallback(
    (tourId: string, steps: TourStepConfig[], force = false) => {
      if (!force && isTourCompleted(tourId)) return;

      driverRef.current?.destroy();

      const driveSteps: DriveStep[] = steps
        .map((step) => {
          const el = document.querySelector(`[data-tour="${step.element}"]`);
          if (!el) return null;

          // Flip left/right for RTL
          let side = step.side || "bottom";
          if (isRtl) {
            if (side === "left") side = "right";
            else if (side === "right") side = "left";
          }

          return {
            element: `[data-tour="${step.element}"]`,
            popover: {
              title: t(step.titleKey),
              description: t(step.descriptionKey),
              side: side as "top" | "bottom" | "left" | "right",
              align: step.align || "start",
            },
          };
        })
        .filter(Boolean) as DriveStep[];

      if (driveSteps.length === 0) return;

      const driverConfig: Config = {
        showProgress: true,
        animate: true,
        allowClose: true,
        overlayClickBehavior: "close",
        stagePadding: 10,
        stageRadius: 12,
        popoverClass: `eyada-tour-popover ${isRtl ? "eyada-rtl" : "eyada-ltr"}`,
        nextBtnText: t("tour.next"),
        prevBtnText: t("tour.previous"),
        doneBtnText: t("tour.done"),
        progressText: `{{current}} ${t("common.of")} {{total}}`,
        onDestroyStarted: () => {
          markTourCompleted(tourId);
          driverRef.current?.destroy();
          setIsActive(false);
        },
        steps: driveSteps,
      };

      const driverInstance = driver(driverConfig);
      driverRef.current = driverInstance;
      setIsActive(true);

      requestAnimationFrame(() => {
        driverInstance.drive();
      });
    },
    [t, isRtl],
  );

  const isCompletedFn = useCallback(
    (tourId: string) => isTourCompleted(tourId),
    [],
  );

  const resetTourById = useCallback((tourId: string) => resetTour(tourId), []);

  const stopTour = useCallback(() => {
    driverRef.current?.destroy();
    setIsActive(false);
  }, []);

  const value = useMemo(
    () => ({
      startTour,
      isCompleted: isCompletedFn,
      resetTourById,
      isActive,
      stopTour,
    }),
    [startTour, isCompletedFn, resetTourById, isActive, stopTour],
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
}
