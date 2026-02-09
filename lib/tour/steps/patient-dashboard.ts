import { type TourStepConfig } from "../tour-config";

export const PATIENT_DASHBOARD_TOUR_ID = "patient-dashboard";

export const patientDashboardSteps: TourStepConfig[] = [
  {
    element: "patient-welcome",
    titleKey: "tour.patient.dashboard.welcomeTitle",
    descriptionKey: "tour.patient.dashboard.welcomeDesc",
    side: "bottom",
    align: "center",
  },
  {
    element: "patient-stats",
    titleKey: "tour.patient.dashboard.statsTitle",
    descriptionKey: "tour.patient.dashboard.statsDesc",
    side: "bottom",
    align: "center",
  },
  {
    element: "patient-upcoming",
    titleKey: "tour.patient.dashboard.upcomingTitle",
    descriptionKey: "tour.patient.dashboard.upcomingDesc",
    side: "top",
    align: "center",
  },
  {
    element: "patient-quick-actions",
    titleKey: "tour.patient.dashboard.quickActionsTitle",
    descriptionKey: "tour.patient.dashboard.quickActionsDesc",
    side: "top",
    align: "center",
  },
  {
    element: "sidebar-nav",
    titleKey: "tour.patient.dashboard.sidebarTitle",
    descriptionKey: "tour.patient.dashboard.sidebarDesc",
    side: "right",
    align: "start",
  },
  {
    element: "header-book-btn",
    titleKey: "tour.patient.dashboard.bookBtnTitle",
    descriptionKey: "tour.patient.dashboard.bookBtnDesc",
    side: "bottom",
    align: "end",
  },
];
