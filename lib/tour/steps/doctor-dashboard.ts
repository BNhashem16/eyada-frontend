import { type TourStepConfig } from "../tour-config";

export const DOCTOR_DASHBOARD_TOUR_ID = "doctor-dashboard";

export const doctorDashboardSteps: TourStepConfig[] = [
  {
    element: "doctor-welcome",
    titleKey: "tour.doctor.dashboard.welcomeTitle",
    descriptionKey: "tour.doctor.dashboard.welcomeDesc",
    side: "bottom",
    align: "center",
  },
  {
    element: "doctor-stats",
    titleKey: "tour.doctor.dashboard.statsTitle",
    descriptionKey: "tour.doctor.dashboard.statsDesc",
    side: "bottom",
    align: "center",
  },
  {
    element: "doctor-queue",
    titleKey: "tour.doctor.dashboard.queueTitle",
    descriptionKey: "tour.doctor.dashboard.queueDesc",
    side: "top",
    align: "center",
  },
  {
    element: "doctor-quick-actions",
    titleKey: "tour.doctor.dashboard.quickActionsTitle",
    descriptionKey: "tour.doctor.dashboard.quickActionsDesc",
    side: "top",
    align: "center",
  },
  {
    element: "sidebar-nav",
    titleKey: "tour.doctor.dashboard.sidebarTitle",
    descriptionKey: "tour.doctor.dashboard.sidebarDesc",
    side: "right",
    align: "start",
  },
];
