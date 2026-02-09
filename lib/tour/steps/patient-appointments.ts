import { type TourStepConfig } from "../tour-config";

export const PATIENT_APPOINTMENTS_TOUR_ID = "patient-appointments";

export const patientAppointmentsSteps: TourStepConfig[] = [
  {
    element: "patient-status-filter",
    titleKey: "tour.patient.appointments.filterTitle",
    descriptionKey: "tour.patient.appointments.filterDesc",
    side: "bottom",
    align: "start",
  },
  {
    element: "patient-appointments-list",
    titleKey: "tour.patient.appointments.listTitle",
    descriptionKey: "tour.patient.appointments.listDesc",
    side: "top",
    align: "center",
  },
];
