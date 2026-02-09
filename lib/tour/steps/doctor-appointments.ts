import { type TourStepConfig } from "../tour-config";

export const DOCTOR_APPOINTMENTS_TOUR_ID = "doctor-appointments";

export const doctorAppointmentsSteps: TourStepConfig[] = [
  {
    element: "doctor-date-nav",
    titleKey: "tour.doctor.appointments.dateNavTitle",
    descriptionKey: "tour.doctor.appointments.dateNavDesc",
    side: "bottom",
    align: "center",
  },
  {
    element: "doctor-queue-filters",
    titleKey: "tour.doctor.appointments.filtersTitle",
    descriptionKey: "tour.doctor.appointments.filtersDesc",
    side: "bottom",
    align: "center",
  },
  {
    element: "doctor-queue-list",
    titleKey: "tour.doctor.appointments.queueListTitle",
    descriptionKey: "tour.doctor.appointments.queueListDesc",
    side: "top",
    align: "center",
  },
];
