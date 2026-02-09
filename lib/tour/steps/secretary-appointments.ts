import { type TourStepConfig } from "../tour-config";

export const SECRETARY_APPOINTMENTS_TOUR_ID = "secretary-appointments";

export const secretaryAppointmentsSteps: TourStepConfig[] = [
  {
    element: "secretary-book-btn",
    titleKey: "tour.secretary.appointments.bookBtnTitle",
    descriptionKey: "tour.secretary.appointments.bookBtnDesc",
    side: "bottom",
    align: "end",
  },
  {
    element: "secretary-search",
    titleKey: "tour.secretary.appointments.searchTitle",
    descriptionKey: "tour.secretary.appointments.searchDesc",
    side: "bottom",
    align: "start",
  },
  {
    element: "secretary-filters",
    titleKey: "tour.secretary.appointments.filtersTitle",
    descriptionKey: "tour.secretary.appointments.filtersDesc",
    side: "bottom",
    align: "center",
  },
  {
    element: "secretary-cards",
    titleKey: "tour.secretary.appointments.cardsTitle",
    descriptionKey: "tour.secretary.appointments.cardsDesc",
    side: "top",
    align: "center",
  },
];
