import { type TourStepConfig } from "../tour-config";

export const ADMIN_DASHBOARD_TOUR_ID = "admin-dashboard";

export const adminDashboardSteps: TourStepConfig[] = [
  {
    element: "admin-header",
    titleKey: "tour.admin.dashboard.headerTitle",
    descriptionKey: "tour.admin.dashboard.headerDesc",
    side: "bottom",
    align: "center",
  },
  {
    element: "admin-stats",
    titleKey: "tour.admin.dashboard.statsTitle",
    descriptionKey: "tour.admin.dashboard.statsDesc",
    side: "bottom",
    align: "center",
  },
  {
    element: "admin-pending",
    titleKey: "tour.admin.dashboard.pendingTitle",
    descriptionKey: "tour.admin.dashboard.pendingDesc",
    side: "top",
    align: "center",
  },
  {
    element: "sidebar-nav",
    titleKey: "tour.admin.dashboard.sidebarTitle",
    descriptionKey: "tour.admin.dashboard.sidebarDesc",
    side: "right",
    align: "start",
  },
];
