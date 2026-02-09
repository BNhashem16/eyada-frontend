import { type TourStepConfig } from "../tour-config";

export const SECRETARY_DASHBOARD_TOUR_ID = "secretary-dashboard";

export const secretaryDashboardSteps: TourStepConfig[] = [
  {
    element: "secretary-header",
    titleKey: "tour.secretary.dashboard.headerTitle",
    descriptionKey: "tour.secretary.dashboard.headerDesc",
    side: "bottom",
    align: "center",
  },
  {
    element: "secretary-stats",
    titleKey: "tour.secretary.dashboard.statsTitle",
    descriptionKey: "tour.secretary.dashboard.statsDesc",
    side: "bottom",
    align: "center",
  },
  {
    element: "secretary-clinics",
    titleKey: "tour.secretary.dashboard.clinicsTitle",
    descriptionKey: "tour.secretary.dashboard.clinicsDesc",
    side: "bottom",
    align: "start",
  },
  {
    element: "secretary-quick-actions",
    titleKey: "tour.secretary.dashboard.quickActionsTitle",
    descriptionKey: "tour.secretary.dashboard.quickActionsDesc",
    side: "top",
    align: "center",
  },
  {
    element: "secretary-today",
    titleKey: "tour.secretary.dashboard.todayTitle",
    descriptionKey: "tour.secretary.dashboard.todayDesc",
    side: "top",
    align: "center",
  },
];
