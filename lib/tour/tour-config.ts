export interface TourStepConfig {
  /** Matches the data-tour="xxx" attribute on the target element */
  element: string;
  /** i18n key for the step title */
  titleKey: string;
  /** i18n key for the step description */
  descriptionKey: string;
  /** Which side to show the popover */
  side?: "top" | "bottom" | "left" | "right";
  /** Alignment of the popover */
  align?: "start" | "center" | "end";
}

const TOUR_PREFIX = "eyada-tour";

function getStorageKey(tourId: string): string {
  return `${TOUR_PREFIX}-${tourId}`;
}

export function isTourCompleted(tourId: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(getStorageKey(tourId)) === "completed";
}

export function markTourCompleted(tourId: string): void {
  localStorage.setItem(getStorageKey(tourId), "completed");
}

export function resetTour(tourId: string): void {
  localStorage.removeItem(getStorageKey(tourId));
}
